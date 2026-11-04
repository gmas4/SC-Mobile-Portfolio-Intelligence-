# SC Mobile Protection Portfolio Intelligence Prototype

## Stable prototype versions

- `versions/v1.0/` — frozen baseline
- `versions/v1.1/` — Insurance Portfolio View
- `versions/v1.2/` — Holistic Portfolio Outlook (current)

The root URL redirects to the latest stable release while preserving query parameters such as `?persona=sarah`. The presenter-level selector reads its labels, paths, and release status from `versions.json` and preserves the active persona when switching versions.

Each release is a static snapshot. Product changes must be made in a new version directory rather than by modifying an existing stable snapshot.

### v1.2 holistic portfolio presentation

The v1.2 client story connects mortgage and household commitments, savings and investments, and known insurance protection into one explainable outlook. The HTML deck is available from the prototype footer using **Present the proposition**. Its first increment is a narrow, source-labelled portfolio snapshot with a data-quality baseline and customer-comprehension measures; access, policy matching, and data quality must be validated before a live pilot.

### v1.1 external-policy demonstration

The v1.1 snapshot supports a session-only, synthetic journey for adding externally held insurance. PDF, JPG and PNG selection is accepted by the UI, while the displayed extraction uses clearly labelled synthetic fixtures; no document is uploaded, retained or parsed by a production service. Policy records keep source, provenance, consent, customer-confirmation status and an illustrative timestamp so a future governed integration can replace the fixture layer without coupling the UI to one provider.

International interpretations use cautious states—likely included, unclear/check required, not identified and review required—and never determine claim outcomes. Future integrations may include SGFinDex, insurer APIs, partner feeds, Customer 360 or governed insurance data products, subject to consent and appropriate controls.

This is a local-first, static interactive demonstrator. It runs entirely in the browser and contains synthetic customer data.

## Run locally

Open [index.html](index.html) in a modern browser. When opened as a local file, the launcher opens the latest stable version directly. Each customer route begins with its illustrative entry experience; follow the on-screen prompt to open the SC Mobile journey. Use the persona links in the presenter bar or open a direct route:

- `index.html?persona=simon`
- `index.html?persona=alex`
- `index.html?persona=sarah`

For presentation, use browser full-screen mode. The application intentionally keeps a portrait phone frame on desktop displays.

The latest presenter footer links to [presentation.html](versions/v1.2/presentation.html), a self-contained HTML deck with slide navigation, presenter cues, and direct links into each persona journey. Use the arrow keys or controls at the bottom to move through the story.

## Versioning and commits

The current release number is recorded in [VERSION](VERSION). Releases use semantic version tags in the form `vMAJOR.MINOR.PATCH`: increase MAJOR for incompatible changes, MINOR for new capabilities, and PATCH for fixes. Update `VERSION` and add a dated summary to [CHANGELOG.md](CHANGELOG.md) with each release. Tag the release commit with an annotated `v...` tag and push the branch and tag to GitHub.

Commit subjects must describe the actual change. Use a clear prefix such as `feat:`, `fix:`, `docs:`, or `chore:` followed by a concise summary; avoid vague subjects such as “updates” or “changes.”

## Hosting later

The prototype has no build step or server dependency. Upload the root files (`index.html`, `styles.css`, and `app.js`) to any static host after local acceptance. Recheck all externally sourced product information immediately before sharing outside the project team.

## Important

All customer data, calculations, matching statements, and adviser-request outcomes are illustrative. Product names are current official SC Singapore references only; no actual quote, application, underwriting, or recommendation is performed. The locally stored SC visual assets are official reference material and should be reviewed for usage approval before external distribution.
