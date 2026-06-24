# PoB Trade Evaluator — Setup Guide

Evaluates items on the Path of Exile 2 trade site against your active Path of Building build, showing stat deltas inline on the page.

## Requirements

- [Path of Building (PoE2 fork)](https://github.com/MattBanksSmith/PathOfBuilding-PoE2) — this repository
- Google Chrome (or any Chromium-based browser)

---

## 1. Run Path of Building

Launch **`runtime/Path of Building-PoE2.exe`** and open a build. The HTTP server starts automatically on `http://localhost:10600` — no extra steps needed. You can confirm it's running by visiting that URL in your browser; you should see a 404 JSON response.

The build you have open is the one items will be evaluated against, so make sure your character's gear and skill tree are configured before using the extension.

---

## 2. Install the Chrome Extension

The extension is unpacked (not on the Chrome Web Store), so it needs to be loaded manually.

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repository

The **PoB Trade Evaluator** extension will appear in your extensions list. The icon in the toolbar shows the current connection status when clicked.

---

## 3. Use It

1. Go to the [PoE2 trade site](https://www.pathofexile.com/trade2) and run a search
2. Each result row will have two new buttons on the left:
   - **PoB** — immediately evaluates the item against your build and shows stat changes inline
   - **Edit** — extracts the item text into an editable text area so you can modify it (e.g. change values, remove mods) before evaluating
3. A **PoB All** button appears fixed to the bottom-right of the page — click it to evaluate every visible result in one go

Results appear directly in the item row. Positive changes are shown in green, negative in red.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| "PoB not running" error | Make sure Path of Building is open with a build loaded |
| "Item popup not found" | Try refreshing the trade page after the extension loads |
| No PoB/Edit buttons appear | Check the extension is enabled at `chrome://extensions` |
| Result shows "No stat changes detected" | The item may not fit any slot in your current build setup |
