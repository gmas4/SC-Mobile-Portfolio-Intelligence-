# SC Mobile Protection Portfolio Intelligence Prototype

This is a local-first, static interactive demonstrator. It runs entirely in the browser and contains synthetic customer data.

## Run locally

Open [index.html](index.html) in a modern desktop browser. Each route begins with a generic iPhone lock-screen push notification; tap it to open the SC Mobile home experience. Use the persona links in the top demo bar or open a direct route:

- `index.html?persona=simon`
- `index.html?persona=alex`
- `index.html?persona=sarah`

For presentation, use browser full-screen mode. The application intentionally keeps a portrait phone frame on desktop displays.

## Versioning and commits

The current release number is recorded in [VERSION](VERSION). Releases use semantic version tags in the form `vMAJOR.MINOR.PATCH`: increase MAJOR for incompatible changes, MINOR for new capabilities, and PATCH for fixes. Update `VERSION` and add a dated summary to [CHANGELOG.md](CHANGELOG.md) with each release. Tag the release commit with an annotated `v...` tag and push the branch and tag to GitHub.

Commit subjects must describe the actual change. Use a clear prefix such as `feat:`, `fix:`, `docs:`, or `chore:` followed by a concise summary; avoid vague subjects such as “updates” or “changes.”

## Hosting later

The prototype has no build step or server dependency. Upload the root files (`index.html`, `styles.css`, and `app.js`) to any static host after local acceptance. Recheck all externally sourced product information immediately before sharing outside the project team.

## Important

All customer data, calculations, matching statements, and adviser-request outcomes are illustrative. Product names are current official SC Singapore references only; no actual quote, application, underwriting, or recommendation is performed. The locally stored SC visual assets are official reference material and should be reviewed for usage approval before external distribution.
