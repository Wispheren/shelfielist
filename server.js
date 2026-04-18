const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const { DatabaseSync } = require("node:sqlite");

const PORT = Number(process.env.PORT || 3434);
const HOST = process.env.HOST || "0.0.0.0";
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "shelfielist.db");

fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pcs',
    barcode TEXT NOT NULL DEFAULT '',
    low_stock_threshold REAL NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.exec("ALTER TABLE inventory_items ADD COLUMN barcode TEXT NOT NULL DEFAULT '';");
} catch (error) {
  if (!String(error.message).includes("duplicate column name")) {
    throw error;
  }
}

const countRow = db.prepare("SELECT COUNT(*) AS count FROM inventory_items").get();
if (countRow.count === 0) {
  const seedItems = [
    ["Toiletpapir", "Badevaerelse", 12, "ruller", 4, "Oeverste hylde"],
    ["Ketchup", "Forraad", 1, "flasker", 1, "Aaben flaske i koeleseabet"],
    ["Rundstykker", "Fryser", 8, "stk", 4, "Bages efter behov"],
    ["Opvaskemiddel", "Rengoering", 2, "flasker", 1, ""]
  ];
  const insertSeed = db.prepare(`
    INSERT INTO inventory_items
      (name, category, quantity, unit, low_stock_threshold, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  for (const item of seedItems) {
    insertSeed.run(...item);
  }
}

const sampleTranslations = [
  ["Toiletpapir", "Badevaerelse", "ruller", "Oeverste hylde", "Toilet Paper"],
  ["Ketchup", "Forraad", "flasker", "Aaben flaske i koeleseabet", "Ketchup"],
  ["Rundstykker", "Fryser", "stk", "Bages efter behov", "Bread Rolls"],
  ["Opvaskemiddel", "Rengoering", "flasker", "", "Dish Soap"]
];

const translateSampleStmt = db.prepare(`
  UPDATE inventory_items
  SET
    name = ?,
    category = ?,
    unit = ?,
    notes = ?
  WHERE name = ?
`);

for (const translation of sampleTranslations) {
  translateSampleStmt.run(...translation);
}

const listItemsStmt = db.prepare(`
  SELECT
    id,
    name,
    category,
    quantity,
    unit,
    barcode,
    low_stock_threshold AS lowStockThreshold,
    notes,
    updated_at AS updatedAt
  FROM inventory_items
  ORDER BY LOWER(category), LOWER(name)
`);

const insertItemStmt = db.prepare(`
  INSERT INTO inventory_items
    (name, category, quantity, unit, barcode, low_stock_threshold, notes, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  RETURNING
    id,
    name,
    category,
    quantity,
    unit,
    barcode,
    low_stock_threshold AS lowStockThreshold,
    notes,
    updated_at AS updatedAt
`);

const updateItemStmt = db.prepare(`
  UPDATE inventory_items
  SET
    name = ?,
    category = ?,
    quantity = ?,
    unit = ?,
    barcode = ?,
    low_stock_threshold = ?,
    notes = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
  RETURNING
    id,
    name,
    category,
    quantity,
    unit,
    barcode,
    low_stock_threshold AS lowStockThreshold,
    notes,
    updated_at AS updatedAt
`);

const patchQuantityStmt = db.prepare(`
  UPDATE inventory_items
  SET
    quantity = MAX(quantity + ?, 0),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
  RETURNING
    id,
    name,
    category,
    quantity,
    unit,
    barcode,
    low_stock_threshold AS lowStockThreshold,
    notes,
    updated_at AS updatedAt
`);

const deleteItemStmt = db.prepare("DELETE FROM inventory_items WHERE id = ?");

const selectItemStmt = db.prepare(`
  SELECT
    id,
    name,
    category,
    quantity,
    unit,
    barcode,
    low_stock_threshold AS lowStockThreshold,
    notes,
    updated_at AS updatedAt
  FROM inventory_items
  WHERE id = ?
`);

function normalizeItemInput(input) {
  const name = String(input.name || "").trim();
  const category = String(input.category || "Ukategoriseret").trim() || "Ukategoriseret";
  const quantity = Number(input.quantity);
  const unit = String(input.unit || "stk").trim() || "stk";
  const barcode = String(input.barcode || "").trim();
  const lowStockThreshold = Number(input.lowStockThreshold ?? 0);
  const notes = String(input.notes || "").trim();

  if (!name) {
    const error = new Error("Item name is required");
    error.code = "ITEM_NAME_REQUIRED";
    throw error;
  }

  if (!Number.isFinite(quantity) || quantity < 0) {
    const error = new Error("Quantity must be a number equal to or above 0");
    error.code = "QUANTITY_INVALID";
    throw error;
  }

  if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
    const error = new Error("Low-stock threshold must be a number equal to or above 0");
    error.code = "LOW_STOCK_THRESHOLD_INVALID";
    throw error;
  }

  return {
    name,
    category,
    quantity,
    unit,
    barcode,
    lowStockThreshold,
    notes
  };
}

function getInventoryResponse() {
  const items = listItemsStmt.all();
  const summary = items.reduce(
    (acc, item) => {
      acc.totalItems += 1;
      acc.totalUnits += item.quantity;
      if (item.quantity <= item.lowStockThreshold) {
        acc.lowStockCount += 1;
      }
      return acc;
    },
    { totalItems: 0, totalUnits: 0, lowStockCount: 0 }
  );

  return { items, summary };
}

function getErrorResponse(error) {
  return {
    error: error.message,
    errorKey: error.code || "UNKNOWN_ERROR"
  };
}

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/items", (req, res) => {
  res.json(getInventoryResponse());
});

app.post("/api/items", (req, res) => {
  try {
    const input = normalizeItemInput(req.body);
    const item = insertItemStmt.get(
      input.name,
      input.category,
      input.quantity,
      input.unit,
      input.barcode,
      input.lowStockThreshold,
      input.notes
    );
    res.status(201).json({ item });
  } catch (error) {
    res.status(400).json(getErrorResponse(error));
  }
});

app.put("/api/items/:id", (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const input = normalizeItemInput(req.body);
    const item = updateItemStmt.get(
      input.name,
      input.category,
      input.quantity,
      input.unit,
      input.barcode,
      input.lowStockThreshold,
      input.notes,
      itemId
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found", errorKey: "ITEM_NOT_FOUND" });
    }

    res.json({ item });
  } catch (error) {
    res.status(400).json(getErrorResponse(error));
  }
});

app.delete("/api/items/:id", (req, res) => {
  const itemId = Number(req.params.id);
  const existing = selectItemStmt.get(itemId);
  if (!existing) {
    return res.status(404).json({ error: "Item not found", errorKey: "ITEM_NOT_FOUND" });
  }

  deleteItemStmt.run(itemId);
  res.json({ ok: true });
});

app.patch("/api/items/:id/quantity", (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const delta = Number(req.body.delta);
    if (!Number.isFinite(delta)) {
      const error = new Error("Quantity change must be numeric");
      error.code = "QUANTITY_CHANGE_INVALID";
      throw error;
    }

    const item = patchQuantityStmt.get(delta, itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found", errorKey: "ITEM_NOT_FOUND" });
    }

    res.json({ item });
  } catch (error) {
    res.status(400).json(getErrorResponse(error));
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Shelfielist running on http://${HOST}:${PORT}`);
});
