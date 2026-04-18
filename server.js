const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const { DatabaseSync } = require("node:sqlite");

const PORT = Number(process.env.PORT || 3434);
const HOST = process.env.HOST || "0.0.0.0";
const publicDir = path.join(__dirname, "public");
const vendorDir = path.join(__dirname, "public", "vendor");
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

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, body) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        const error = new Error("Request body too large");
        error.code = "REQUEST_BODY_TOO_LARGE";
        reject(error);
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        const error = new Error("Invalid JSON");
        error.code = "INVALID_JSON";
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

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

function serveStaticFile(req, res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(res, 404, "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mimeType });
    res.end(data);
  });
}

function serveVendorFile(res, pathname) {
  const requestedPath = pathname.replace(/^\/vendor/, "");
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(vendorDir, safePath);

  if (!filePath.startsWith(vendorDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendText(res, 404, "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mimeType });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (pathname === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname.startsWith("/vendor/") && req.method === "GET") {
    serveVendorFile(res, pathname);
    return;
  }

  if (pathname === "/api/items" && req.method === "GET") {
    sendJson(res, 200, getInventoryResponse());
    return;
  }

  if (pathname === "/api/items" && req.method === "POST") {
    try {
      const input = normalizeItemInput(await parseBody(req));
      const item = insertItemStmt.get(
        input.name,
        input.category,
        input.quantity,
        input.unit,
        input.barcode,
        input.lowStockThreshold,
        input.notes
      );
      sendJson(res, 201, { item });
    } catch (error) {
      sendJson(res, 400, getErrorResponse(error));
    }
    return;
  }

  const itemMatch = pathname.match(/^\/api\/items\/(\d+)$/);
  if (itemMatch && req.method === "PUT") {
    try {
      const itemId = Number(itemMatch[1]);
      const input = normalizeItemInput(await parseBody(req));
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
        sendJson(res, 404, { error: "Item not found", errorKey: "ITEM_NOT_FOUND" });
        return;
      }

      sendJson(res, 200, { item });
    } catch (error) {
      sendJson(res, 400, getErrorResponse(error));
    }
    return;
  }

  if (itemMatch && req.method === "DELETE") {
    const itemId = Number(itemMatch[1]);
    const existing = selectItemStmt.get(itemId);
    if (!existing) {
      sendJson(res, 404, { error: "Item not found", errorKey: "ITEM_NOT_FOUND" });
      return;
    }

    deleteItemStmt.run(itemId);
    sendJson(res, 200, { ok: true });
    return;
  }

  const quantityMatch = pathname.match(/^\/api\/items\/(\d+)\/quantity$/);
  if (quantityMatch && req.method === "PATCH") {
    try {
      const itemId = Number(quantityMatch[1]);
      const body = await parseBody(req);
      const delta = Number(body.delta);
      if (!Number.isFinite(delta)) {
        const error = new Error("Quantity change must be numeric");
        error.code = "QUANTITY_CHANGE_INVALID";
        throw error;
      }

      const item = patchQuantityStmt.get(delta, itemId);
      if (!item) {
        sendJson(res, 404, { error: "Item not found", errorKey: "ITEM_NOT_FOUND" });
        return;
      }

      sendJson(res, 200, { item });
    } catch (error) {
      sendJson(res, 400, getErrorResponse(error));
    }
    return;
  }

  if (req.method === "GET") {
    serveStaticFile(req, res, pathname);
    return;
  }

  sendText(res, 405, "Method not allowed");
});

server.listen(PORT, HOST, () => {
  console.log(`Shelfielist running on http://${HOST}:${PORT}`);
});
