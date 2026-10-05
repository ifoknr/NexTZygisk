# NextZygisk: project rules

## Fonts (owner's choice, keep for all work)

- English / Latin: **Roboto**
- Arabic: **Noto Kufi Arabic**

This applies to the WebUI and to anything else made for the project: banners, screenshots, images and docs.

The WebUI bundles both fonts as local variable woff2 files in `webroot/fonts/` (`header.css` + `OFL.txt`), with the stack `'Roboto', 'Noto Kufi Arabic', sans-serif` in `webroot/css/index.css`. Keep them local: the WebUI runs offline inside the root manager.
