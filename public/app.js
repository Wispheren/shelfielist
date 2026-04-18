const state = {
  items: [],
  summary: null,
  editingId: null,
  search: "",
  stockFilter: "all",
  locale: localStorage.getItem("shelfielist-locale") || "da",
  status: null,
  scanner: {
    active: false,
    lastCode: "",
    lastScanAt: 0,
    zxingReader: null,
    zxingControls: null
  }
};

const translations = {
  da: {
    languageName: "Dansk",
    title: "Shelfielist",
    metaDescription: "Et delt husholdningslager til at holde styr på det, I har derhjemme.",
    heroTitle: "Jeres delte overblik over hjemmets lager.",
    heroText:
      "Hold styr på badeværelsesvarer, kolonial, fryserlager og alt det andet, der altid slipper op på det værst tænkelige tidspunkt.",
    localeLabel: "Sprog",
    formEyebrow: "Administrer varer",
    addItemTitle: "Tilføj en ny vare",
    editItemTitle: "Rediger {name}",
    cancelEdit: "Annuller redigering",
    nameLabel: "Navn",
    namePlaceholder: "Toiletpapir",
    categoryLabel: "Kategori",
    categoryPlaceholder: "Badeværelse",
    quantityLabel: "Antal",
    unitLabel: "Enhed",
    unitPlaceholder: "ruller",
    defaultUnit: "stk",
    barcodeLabel: "Stregkode",
    barcodePlaceholder: "Valgfri stregkode",
    lowStockThresholdLabel: "Lav beholdning ved",
    notesLabel: "Noter",
    notesPlaceholder: "Øverste hylde",
    saveItem: "Gem vare",
    updateItem: "Opdater vare",
    overviewEyebrow: "Overblik",
    overviewTitle: "Det I har derhjemme",
    searchPlaceholder: "Søg efter varer eller kategorier",
    stockFilterAll: "Alle varer",
    stockFilterLow: "Kun lav beholdning",
    summaryTrackedItems: "Varer i oversigten",
    summaryTotalQuantity: "Samlet antal",
    summaryLowStock: "Lav beholdning",
    emptyTitle: "Ingen varer matcher lige nu",
    emptyText: "Prøv en anden søgning, skift filter eller tilføj en ny vare.",
    badgeLow: "Lav beholdning",
    badgeOk: "På lager",
    alertAt: "Varsel ved {value} {unit}",
    edit: "Rediger",
    delete: "Slet",
    loadingInventory: "Indlæser lager...",
    inventoryReady: "Lager klar.",
    itemAdded: "Vare tilføjet.",
    itemUpdated: "Vare opdateret.",
    itemDeleted: "Vare slettet.",
    scannerOpen: "Scan stregkode",
    scannerEyebrow: "Stregkodescanner",
    scannerTitle: "Scan en vare med dit kamera",
    scannerClose: "Luk",
    scannerHelp:
      "Peg kameraet mod en stregkode. Hvis varen allerede findes, kan du hurtigt lægge til eller trække fra.",
    scannerManualPlaceholder: "Skriv stregkode manuelt",
    scannerManualButton: "Brug kode",
    scannerPhotoButton: "Tag billede af stregkode",
    scannerPermissionError:
      "Kameraet kunne ikke åbnes. Du kan stadig skrive stregkoden manuelt herunder.",
    scannerPermissionDetailed: "Kamerafejl: {reason}",
    scannerInsecureContext:
      "Live kamera kræver en sikker forbindelse på telefonen. Åbn Shelfielist via HTTPS, eller brug billed-knappen herunder.",
    scannerUnsupported:
      "Denne telefon understøtter ikke automatisk scanning i browseren endnu. Brug manuel indtastning eller en nyere browser.",
    scannerPhotoUnsupported:
      "Denne browser kan ikke aflæse stregkoder fra billeder endnu. Brug manuel indtastning i stedet.",
    scannerPhotoProcessing: "Behandler billede...",
    scannerPhotoNoCode: "Der blev ikke fundet en stregkode på billedet.",
    scannerFallbackLoading: "Indlæser alternativ scanner...",
    scannerFallbackCamera: "Prøver alternativ kamerascanner...",
    scannerSearching: "Scanner efter stregkode...",
    scannerFoundKnown: "Fundet i lageret",
    scannerFoundUnknown: "Ny stregkode",
    scannerAdjustPrompt: "Varen findes allerede. Vil du lægge til eller trække fra lageret?",
    scannerCreatePrompt: "Denne stregkode er ikke kendt endnu. Opret varen med koden udfyldt.",
    scannerAddOne: "+1",
    scannerSubtractOne: "-1",
    scannerEditItem: "Rediger vare",
    scannerCreateItem: "Opret vare",
    scannerCodeLabel: "Stregkode: {barcode}",
    scannerLinkedCode: "Stregkode gemt på varen.",
    scannerCodeUsed: "Stregkode valgt.",
    scannerNoCode: "Indtast eller scan en stregkode først.",
    scannerAlreadyLinked: "Denne stregkode er allerede koblet til en anden vare.",
    scannerCameraLive: "Kamera aktivt",
    deleteConfirm: "Slet {name}?",
    errorLoadInventory: "Kunne ikke indlæse lageret: {message}",
    errors: {
      UNKNOWN_ERROR: "Noget gik galt.",
      ITEM_NAME_REQUIRED: "Varen skal have et navn.",
      QUANTITY_INVALID: "Antallet skal være et tal, der er 0 eller højere.",
      LOW_STOCK_THRESHOLD_INVALID:
        "Grænsen for lav beholdning skal være et tal, der er 0 eller højere.",
      REQUEST_BODY_TOO_LARGE: "Forespørgslen er for stor.",
      INVALID_JSON: "Ugyldige data sendt til serveren.",
      ITEM_NOT_FOUND: "Varen blev ikke fundet.",
      QUANTITY_CHANGE_INVALID: "Ændringen i antal skal være et tal."
    }
  },
  en: {
    languageName: "English",
    title: "Shelfielist",
    metaDescription: "A shared household inventory app for keeping track of what is at home.",
    heroTitle: "Your shared home inventory, without the chaos.",
    heroText:
      "Keep track of bathroom staples, pantry items, freezer stock, and everything else that tends to disappear at the worst possible time.",
    localeLabel: "Language",
    formEyebrow: "Manage items",
    addItemTitle: "Add a new household item",
    editItemTitle: "Edit {name}",
    cancelEdit: "Cancel edit",
    nameLabel: "Name",
    namePlaceholder: "Toilet paper",
    categoryLabel: "Category",
    categoryPlaceholder: "Bathroom",
    quantityLabel: "Quantity",
    unitLabel: "Unit",
    unitPlaceholder: "rolls",
    defaultUnit: "pcs",
    barcodeLabel: "Barcode",
    barcodePlaceholder: "Optional barcode",
    lowStockThresholdLabel: "Low-stock alert at",
    notesLabel: "Notes",
    notesPlaceholder: "Top shelf",
    saveItem: "Save item",
    updateItem: "Update item",
    overviewEyebrow: "Overview",
    overviewTitle: "Inventory at home",
    searchPlaceholder: "Search items or categories",
    stockFilterAll: "All items",
    stockFilterLow: "Low stock only",
    summaryTrackedItems: "Tracked items",
    summaryTotalQuantity: "Total quantity",
    summaryLowStock: "Low stock",
    emptyTitle: "No items match right now",
    emptyText: "Try another search, switch the filter, or add a new household item.",
    badgeLow: "Low stock",
    badgeOk: "In stock",
    alertAt: "Alert at {value} {unit}",
    edit: "Edit",
    delete: "Delete",
    loadingInventory: "Loading inventory...",
    inventoryReady: "Inventory ready.",
    itemAdded: "Item added.",
    itemUpdated: "Item updated.",
    itemDeleted: "Item deleted.",
    scannerOpen: "Scan barcode",
    scannerEyebrow: "Barcode scanner",
    scannerTitle: "Scan an item with your camera",
    scannerClose: "Close",
    scannerHelp:
      "Point the camera at a barcode. If the item already exists, you can quickly add or subtract from inventory.",
    scannerManualPlaceholder: "Type barcode manually",
    scannerManualButton: "Use code",
    scannerPhotoButton: "Take barcode photo",
    scannerPermissionError:
      "The camera could not be opened. You can still type the barcode manually below.",
    scannerPermissionDetailed: "Camera error: {reason}",
    scannerInsecureContext:
      "Live camera access requires a secure connection on phones. Open Shelfielist over HTTPS, or use the photo button below.",
    scannerUnsupported:
      "This phone does not support automatic barcode scanning in the browser yet. Use manual entry or a newer browser.",
    scannerPhotoUnsupported:
      "This browser cannot read barcodes from photos yet. Use manual entry instead.",
    scannerPhotoProcessing: "Processing photo...",
    scannerPhotoNoCode: "No barcode was found in the photo.",
    scannerFallbackLoading: "Loading fallback scanner...",
    scannerFallbackCamera: "Trying fallback live camera scanner...",
    scannerSearching: "Looking for a barcode...",
    scannerFoundKnown: "Found in inventory",
    scannerFoundUnknown: "New barcode",
    scannerAdjustPrompt: "This item already exists. Do you want to add or subtract from inventory?",
    scannerCreatePrompt: "This barcode is not known yet. Create the item with the code prefilled.",
    scannerAddOne: "+1",
    scannerSubtractOne: "-1",
    scannerEditItem: "Edit item",
    scannerCreateItem: "Create item",
    scannerCodeLabel: "Barcode: {barcode}",
    scannerLinkedCode: "Barcode saved on the item.",
    scannerCodeUsed: "Barcode selected.",
    scannerNoCode: "Enter or scan a barcode first.",
    scannerAlreadyLinked: "This barcode is already linked to another item.",
    scannerCameraLive: "Camera live",
    deleteConfirm: "Delete {name}?",
    errorLoadInventory: "Could not load inventory: {message}",
    errors: {
      UNKNOWN_ERROR: "Something went wrong.",
      ITEM_NAME_REQUIRED: "Item name is required.",
      QUANTITY_INVALID: "Quantity must be a number equal to or above 0.",
      LOW_STOCK_THRESHOLD_INVALID:
        "Low-stock threshold must be a number equal to or above 0.",
      REQUEST_BODY_TOO_LARGE: "The request was too large.",
      INVALID_JSON: "Invalid data was sent to the server.",
      ITEM_NOT_FOUND: "Item not found.",
      QUANTITY_CHANGE_INVALID: "Quantity change must be numeric."
    }
  }
};

const elements = {
  barcodeInput: document.querySelector("#barcode"),
  barcodeLabel: document.querySelector("#barcodeLabel"),
  barcodePhotoButton: document.querySelector("#barcodePhotoButton"),
  barcodePhotoInput: document.querySelector("#barcodePhotoInput"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  categoryInput: document.querySelector("#category"),
  categoryLabel: document.querySelector("#categoryLabel"),
  closeScannerButton: document.querySelector("#closeScannerButton"),
  form: document.querySelector("#itemForm"),
  formEyebrow: document.querySelector("#formEyebrow"),
  formTitle: document.querySelector("#formTitle"),
  heroText: document.querySelector("#heroText"),
  heroTitle: document.querySelector("#heroTitle"),
  inventoryList: document.querySelector("#inventoryList"),
  itemCardTemplate: document.querySelector("#itemCardTemplate"),
  localeLabel: document.querySelector("#localeLabel"),
  localeSelect: document.querySelector("#localeSelect"),
  lowStockThresholdLabel: document.querySelector("#lowStockThresholdLabel"),
  manualBarcodeButton: document.querySelector("#manualBarcodeButton"),
  manualBarcodeInput: document.querySelector("#manualBarcodeInput"),
  metaDescription: document.querySelector("#metaDescription"),
  nameInput: document.querySelector("#name"),
  nameLabel: document.querySelector("#nameLabel"),
  notesInput: document.querySelector("#notes"),
  notesLabel: document.querySelector("#notesLabel"),
  openScannerButton: document.querySelector("#openScannerButton"),
  overviewEyebrow: document.querySelector("#overviewEyebrow"),
  overviewTitle: document.querySelector("#overviewTitle"),
  quantityLabel: document.querySelector("#quantityLabel"),
  scannerEyebrow: document.querySelector("#scannerEyebrow"),
  scannerHelp: document.querySelector("#scannerHelp"),
  scannerResult: document.querySelector("#scannerResult"),
  scannerSheet: document.querySelector("#scannerSheet"),
  scannerStatus: document.querySelector("#scannerStatus"),
  scannerTitle: document.querySelector("#scannerTitle"),
  scannerVideo: document.querySelector("#scannerVideo"),
  searchInput: document.querySelector("#searchInput"),
  statusMessage: document.querySelector("#statusMessage"),
  stockFilter: document.querySelector("#stockFilter"),
  submitButton: document.querySelector("#submitButton"),
  summaryCards: document.querySelector("#summaryCards"),
  unitInput: document.querySelector("#unit"),
  unitLabel: document.querySelector("#unitLabel")
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong");
    error.code = data.errorKey || "UNKNOWN_ERROR";
    throw error;
  }

  return data;
}

function getTranslations() {
  return translations[state.locale] || translations.da;
}

function t(key, variables = {}) {
  const parts = key.split(".");
  let value = getTranslations();

  for (const part of parts) {
    value = value?.[part];
  }

  if (typeof value !== "string") {
    return key;
  }

  return value.replace(/\{(\w+)\}/g, (_, token) => String(variables[token] ?? ""));
}

function formatNumber(value) {
  const formatter = new Intl.NumberFormat(state.locale === "da" ? "da-DK" : "en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1
  });
  return formatter.format(value);
}

function showStatus(message, tone = "neutral") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.dataset.tone = tone;
  if (elements.scannerStatus) {
    elements.scannerStatus.textContent = message;
    elements.scannerStatus.dataset.tone = tone;
  }
}

function describeScannerError(error) {
  if (!error) {
    return "unknown";
  }

  return error.name || error.message || String(error);
}

function showStatusKey(key, tone = "neutral", variables = {}) {
  state.status = { key, tone, variables };
  showStatus(t(key, variables), tone);
}

function refreshStatusText() {
  if (!state.status) {
    return;
  }

  showStatus(t(state.status.key, state.status.variables), state.status.tone);
}

function findItemByBarcode(barcode) {
  const normalized = String(barcode || "").trim();
  if (!normalized) {
    return null;
  }

  return state.items.find((item) => String(item.barcode || "").trim() === normalized) || null;
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.form.querySelector("#quantity").value = "1";
  elements.form.querySelector("#unit").value = t("defaultUnit");
  elements.form.querySelector("#barcode").value = "";
  elements.form.querySelector("#lowStockThreshold").value = "0";
  elements.form.querySelector("#itemId").value = "";
  elements.formTitle.textContent = t("addItemTitle");
  elements.submitButton.textContent = t("saveItem");
  elements.cancelEditButton.classList.add("hidden");
}

function fillForm(item) {
  state.editingId = item.id;
  elements.form.querySelector("#itemId").value = String(item.id);
  elements.form.querySelector("#name").value = item.name;
  elements.form.querySelector("#category").value = item.category;
  elements.form.querySelector("#quantity").value = String(item.quantity);
  elements.form.querySelector("#unit").value = item.unit;
  elements.form.querySelector("#barcode").value = item.barcode || "";
  elements.form.querySelector("#lowStockThreshold").value = String(item.lowStockThreshold);
  elements.form.querySelector("#notes").value = item.notes || "";
  elements.formTitle.textContent = t("editItemTitle", { name: item.name });
  elements.submitButton.textContent = t("updateItem");
  elements.cancelEditButton.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getFilteredItems() {
  return state.items.filter((item) => {
    const matchesSearch =
      !state.search ||
      item.name.toLocaleLowerCase().includes(state.search) ||
      item.category.toLocaleLowerCase().includes(state.search) ||
      item.notes.toLocaleLowerCase().includes(state.search) ||
      String(item.barcode || "").toLocaleLowerCase().includes(state.search);
    const matchesStock =
      state.stockFilter === "all" || item.quantity <= item.lowStockThreshold;
    return matchesSearch && matchesStock;
  });
}

function renderSummary() {
  const summary = state.summary || { totalItems: 0, totalUnits: 0, lowStockCount: 0 };
  const cards = [
    {
      label: t("summaryTrackedItems"),
      value: formatNumber(summary.totalItems)
    },
    {
      label: t("summaryTotalQuantity"),
      value: formatNumber(summary.totalUnits)
    },
    {
      label: t("summaryLowStock"),
      value: formatNumber(summary.lowStockCount)
    }
  ];

  elements.summaryCards.innerHTML = cards
    .map(
      (card) => `
        <div class="summary-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
        </div>
      `
    )
    .join("");
}

function renderItems() {
  const items = getFilteredItems();
  elements.inventoryList.innerHTML = "";

  if (items.length === 0) {
    elements.inventoryList.innerHTML = `
      <div class="empty-state">
        <h3>${t("emptyTitle")}</h3>
        <p>${t("emptyText")}</p>
      </div>
    `;
    return;
  }

  for (const item of items) {
    const fragment = elements.itemCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".item-card");
    const isLowStock = item.quantity <= item.lowStockThreshold;
    const barcodeText = item.barcode ? ` • ${t("scannerCodeLabel", { barcode: item.barcode })}` : "";

    card.dataset.id = String(item.id);
    fragment.querySelector(".item-card__category").textContent = item.category;
    fragment.querySelector(".item-card__name").textContent = item.name;
    fragment.querySelector(".item-card__badge").textContent = isLowStock ? t("badgeLow") : t("badgeOk");
    fragment.querySelector(".item-card__badge").dataset.state = isLowStock ? "low" : "ok";
    fragment.querySelector(
      ".item-card__quantity"
    ).textContent = `${formatNumber(item.quantity)} ${item.unit}`;
    fragment.querySelector(".item-card__meta").textContent = item.notes
      ? `${item.notes} • ${t("alertAt", {
          value: formatNumber(item.lowStockThreshold),
          unit: item.unit
        })}${barcodeText}`
      : `${t("alertAt", {
          value: formatNumber(item.lowStockThreshold),
          unit: item.unit
        })}${barcodeText}`;
    fragment.querySelector('[data-action="edit"]').textContent = t("edit");
    fragment.querySelector('[data-action="delete"]').textContent = t("delete");

    elements.inventoryList.appendChild(fragment);
  }
}

function applyStaticTranslations() {
  document.documentElement.lang = state.locale;
  document.title = t("title");
  elements.metaDescription.setAttribute("content", t("metaDescription"));
  elements.heroTitle.textContent = t("heroTitle");
  elements.heroText.textContent = t("heroText");
  elements.localeLabel.textContent = t("localeLabel");
  elements.formEyebrow.textContent = t("formEyebrow");
  elements.overviewEyebrow.textContent = t("overviewEyebrow");
  elements.overviewTitle.textContent = t("overviewTitle");
  elements.nameLabel.textContent = t("nameLabel");
  elements.categoryLabel.textContent = t("categoryLabel");
  elements.quantityLabel.textContent = t("quantityLabel");
  elements.unitLabel.textContent = t("unitLabel");
  elements.barcodeLabel.textContent = t("barcodeLabel");
  elements.lowStockThresholdLabel.textContent = t("lowStockThresholdLabel");
  elements.notesLabel.textContent = t("notesLabel");
  elements.cancelEditButton.textContent = t("cancelEdit");
  elements.openScannerButton.textContent = t("scannerOpen");
  elements.scannerEyebrow.textContent = t("scannerEyebrow");
  elements.scannerTitle.textContent = t("scannerTitle");
  elements.closeScannerButton.textContent = t("scannerClose");
  elements.scannerHelp.textContent = t("scannerHelp");
  elements.nameInput.placeholder = t("namePlaceholder");
  elements.categoryInput.placeholder = t("categoryPlaceholder");
  elements.unitInput.placeholder = t("unitPlaceholder");
  elements.barcodeInput.placeholder = t("barcodePlaceholder");
  elements.notesInput.placeholder = t("notesPlaceholder");
  elements.searchInput.placeholder = t("searchPlaceholder");
  elements.manualBarcodeInput.placeholder = t("scannerManualPlaceholder");
  elements.manualBarcodeButton.textContent = t("scannerManualButton");
  elements.barcodePhotoButton.textContent = t("scannerPhotoButton");
  elements.stockFilter.querySelector('[value="all"]').textContent = t("stockFilterAll");
  elements.stockFilter.querySelector('[value="low"]').textContent = t("stockFilterLow");
  elements.localeSelect.value = state.locale;

  if (state.editingId) {
    const item = state.items.find((entry) => entry.id === state.editingId);
    if (item) {
      elements.formTitle.textContent = t("editItemTitle", { name: item.name });
      elements.submitButton.textContent = t("updateItem");
    }
  } else {
    elements.formTitle.textContent = t("addItemTitle");
    elements.submitButton.textContent = t("saveItem");
  }
}

function setLocale(locale) {
  state.locale = locale in translations ? locale : "da";
  localStorage.setItem("shelfielist-locale", state.locale);
  applyStaticTranslations();
  renderSummary();
  renderItems();
  refreshStatusText();
}

function translateError(error) {
  return t(`errors.${error.code || "UNKNOWN_ERROR"}`);
}

function setScannerResult(content) {
  elements.scannerResult.innerHTML = content;
  elements.scannerResult.classList.remove("hidden");
}

function clearScannerResult() {
  elements.scannerResult.innerHTML = "";
  elements.scannerResult.classList.add("hidden");
}

function closeScanner() {
  state.scanner.active = false;
  state.scanner.lastCode = "";
  state.scanner.lastScanAt = 0;

  if (state.scanner.zxingControls) {
    state.scanner.zxingControls.stop();
    state.scanner.zxingControls = null;
  }

  elements.scannerVideo.srcObject = null;
  elements.scannerSheet.classList.add("hidden");
  elements.scannerSheet.setAttribute("aria-hidden", "true");
}

function prefillFormForBarcode(barcode) {
  resetForm();
  elements.barcodeInput.value = barcode;
  elements.nameInput.focus();
  showStatusKey("scannerLinkedCode", "success");
}

async function handleScannedBarcode(barcode) {
  const normalized = String(barcode || "").trim();
  const now = Date.now();
  if (
    !normalized ||
    (normalized === state.scanner.lastCode && now - state.scanner.lastScanAt < 1500)
  ) {
    return;
  }

  state.scanner.lastCode = normalized;
  state.scanner.lastScanAt = now;
  elements.manualBarcodeInput.value = normalized;

  const item = findItemByBarcode(normalized);
  if (item) {
    setScannerResult(`
      <div class="scanner-result__header">
        <span class="scanner-result__badge">${t("scannerFoundKnown")}</span>
        <strong>${item.name}</strong>
      </div>
      <p>${t("scannerCodeLabel", { barcode: normalized })}</p>
      <p>${t("scannerAdjustPrompt")}</p>
      <div class="scanner-result__actions">
        <button class="primary-button" data-scanner-action="increase" data-item-id="${item.id}" type="button">${t("scannerAddOne")}</button>
        <button class="ghost-button" data-scanner-action="decrease" data-item-id="${item.id}" type="button">${t("scannerSubtractOne")}</button>
        <button class="ghost-button" data-scanner-action="edit" data-item-id="${item.id}" type="button">${t("scannerEditItem")}</button>
      </div>
    `);
    return;
  }

  setScannerResult(`
    <div class="scanner-result__header">
      <span class="scanner-result__badge scanner-result__badge--new">${t("scannerFoundUnknown")}</span>
      <strong>${t("scannerCodeLabel", { barcode: normalized })}</strong>
    </div>
    <p>${t("scannerCreatePrompt")}</p>
    <div class="scanner-result__actions">
      <button class="primary-button" data-scanner-action="create" data-barcode="${normalized}" type="button">${t("scannerCreateItem")}</button>
    </div>
  `);
}

async function processBarcodeImage(file) {
  try {
    showStatus(t("scannerPhotoProcessing"));

    const ZXingBrowser = window.ZXingBrowser;
    if (!ZXingBrowser?.BrowserMultiFormatReader) {
      showStatus(t("scannerPhotoUnsupported"), "error");
      return;
    }

    state.scanner.zxingReader =
      state.scanner.zxingReader || new ZXingBrowser.BrowserMultiFormatReader();
    const imageUrl = URL.createObjectURL(file);
    try {
      const result = await state.scanner.zxingReader.decodeFromImageUrl(imageUrl);
      const text = result?.getText?.() || result?.text || "";
      if (!text) {
        showStatus(t("scannerPhotoNoCode"), "error");
        return;
      }

      await handleScannedBarcode(text);
      showStatusKey("scannerCodeUsed", "success");
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  } catch (error) {
    console.error("Barcode image processing failed", error);
    showStatus(t("scannerPhotoNoCode"), "error");
  }
}

async function openScanner() {
  state.scanner.lastCode = "";
  clearScannerResult();
  elements.manualBarcodeInput.value = "";
  elements.scannerSheet.classList.remove("hidden");
  elements.scannerSheet.setAttribute("aria-hidden", "false");
  showStatus(t("scannerSearching"));

  if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
    showStatus(t("scannerInsecureContext"), "error");
    return;
  }

  if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia) {
    showStatus(t("scannerPermissionError"), "error");
    return;
  }

  const ZXingBrowser = window.ZXingBrowser;
  if (!ZXingBrowser?.BrowserMultiFormatReader) {
    showStatus(t("scannerUnsupported"), "error");
    return;
  }

  try {
    state.scanner.zxingReader =
      state.scanner.zxingReader ||
      new ZXingBrowser.BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 250
      });

    state.scanner.zxingControls = await state.scanner.zxingReader.decodeFromVideoDevice(
      undefined,
      elements.scannerVideo,
      async (result) => {
        const text = result?.getText?.() || result?.text || "";
        if (text) {
          await handleScannedBarcode(text);
        }
      }
    );
    state.scanner.active = true;
    showStatus(t("scannerCameraLive"), "success");
  } catch (error) {
    console.error("Scanner startup failed", error);
    showStatus(t("scannerPermissionDetailed", { reason: describeScannerError(error) }), "error");
  }
}

function handleManualBarcode() {
  const barcode = elements.manualBarcodeInput.value.trim();
  if (!barcode) {
    showStatus(t("scannerNoCode"), "error");
    return;
  }

  state.scanner.lastCode = "";
  showStatusKey("scannerCodeUsed", "success");
  handleScannedBarcode(barcode);
}

async function handleScannerResultAction(event) {
  const button = event.target.closest("[data-scanner-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.scannerAction;
  if (action === "create") {
    prefillFormForBarcode(button.dataset.barcode);
    closeScanner();
    return;
  }

  const itemId = Number(button.dataset.itemId);
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  if (action === "edit") {
    fillForm(item);
    closeScanner();
    return;
  }

  if (action === "increase") {
    await adjustQuantity(itemId, 1);
    state.scanner.lastCode = "";
    await handleScannedBarcode(item.barcode);
    return;
  }

  if (action === "decrease") {
    await adjustQuantity(itemId, -1);
    state.scanner.lastCode = "";
    await handleScannedBarcode(item.barcode);
  }
}

async function loadItems() {
  const data = await request("/api/items");
  state.items = data.items;
  state.summary = data.summary;
  renderSummary();
  renderItems();
}

async function saveItem(event) {
  event.preventDefault();
  const formData = new FormData(elements.form);
  const payload = {
    name: formData.get("name"),
    category: formData.get("category"),
    quantity: Number(formData.get("quantity")),
    unit: formData.get("unit"),
    barcode: formData.get("barcode"),
    lowStockThreshold: Number(formData.get("lowStockThreshold")),
    notes: formData.get("notes")
  };

  try {
    const barcodeOwner = findItemByBarcode(payload.barcode);
    if (payload.barcode && barcodeOwner && (!state.editingId || barcodeOwner.id !== state.editingId)) {
      showStatus(t("scannerAlreadyLinked"), "error");
      return;
    }

    if (state.editingId) {
      await request(`/api/items/${state.editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      showStatusKey("itemUpdated", "success");
    } else {
      await request("/api/items", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      showStatusKey("itemAdded", "success");
    }

    resetForm();
    await loadItems();
  } catch (error) {
    showStatus(translateError(error), "error");
  }
}

async function adjustQuantity(itemId, delta) {
  try {
    await request(`/api/items/${itemId}/quantity`, {
      method: "PATCH",
      body: JSON.stringify({ delta })
    });
    await loadItems();
  } catch (error) {
    showStatus(translateError(error), "error");
  }
}

async function deleteItem(itemId) {
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  const confirmed = window.confirm(t("deleteConfirm", { name: item.name }));
  if (!confirmed) {
    return;
  }

  try {
    await request(`/api/items/${itemId}`, { method: "DELETE" });
    if (state.editingId === itemId) {
      resetForm();
    }
    showStatusKey("itemDeleted", "success");
    await loadItems();
  } catch (error) {
    showStatus(translateError(error), "error");
  }
}

function handleCardAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const card = event.target.closest(".item-card");
  const itemId = Number(card.dataset.id);
  const item = state.items.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  const action = button.dataset.action;
  if (action === "increase") {
    adjustQuantity(itemId, 1);
    return;
  }

  if (action === "decrease") {
    adjustQuantity(itemId, -1);
    return;
  }

  if (action === "edit") {
    fillForm(item);
    return;
  }

  if (action === "delete") {
    deleteItem(itemId);
  }
}

function attachEvents() {
  elements.form.addEventListener("submit", saveItem);
  elements.cancelEditButton.addEventListener("click", resetForm);
  elements.inventoryList.addEventListener("click", handleCardAction);
  elements.openScannerButton.addEventListener("click", openScanner);
  elements.closeScannerButton.addEventListener("click", closeScanner);
  elements.manualBarcodeButton.addEventListener("click", handleManualBarcode);
  elements.barcodePhotoButton.addEventListener("click", () => {
    elements.barcodePhotoInput.click();
  });
  elements.barcodePhotoInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      return;
    }

    await processBarcodeImage(file);
    event.target.value = "";
  });
  elements.manualBarcodeInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleManualBarcode();
    }
  });
  elements.scannerSheet.addEventListener("click", (event) => {
    if (event.target.dataset.closeScanner === "true") {
      closeScanner();
    }
  });
  elements.scannerResult.addEventListener("click", handleScannerResultAction);
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLocaleLowerCase();
    renderItems();
  });
  elements.stockFilter.addEventListener("change", (event) => {
    state.stockFilter = event.target.value;
    renderItems();
  });
  elements.localeSelect.addEventListener("change", (event) => {
    setLocale(event.target.value);
  });
  window.addEventListener("beforeunload", closeScanner);
}

async function init() {
  attachEvents();
  applyStaticTranslations();
  resetForm();
  showStatusKey("loadingInventory");

  try {
    await loadItems();
    showStatusKey("inventoryReady");
  } catch (error) {
    showStatus(t("errorLoadInventory", { message: translateError(error) }), "error");
  }
}

init();
