# ZIMQORA Website

A bilingual English and Arabic website for ZIMQORA. The site presents the studio's services, introduces its interactive 3D mascot Vyqo, and helps visitors prepare a project brief.

## Run locally

From the repository root, run the following command with Python 3 installed:

```sh
python -m http.server 8080 --directory dist
```

Open http://localhost:8080. Serve the files over HTTP so the browser can load the JavaScript modules and 3D model. The website needs no API keys or build step.

## How it works

- The Arabic interface uses a right-to-left layout.
- Vyqo uses Three.js and a local GLB model. Motion can be paused, and a poster is available when WebGL is unavailable.
- The guided assistant runs in the browser and helps visitors draft a brief. Visitors choose whether to email it using their mail client.
- `dist/` contains the HTML, CSS, JavaScript, and assets to serve on a static host.

## Third-party notices

The vendored Three.js components are distributed under the [MIT license](dist/assets/vendor/THREE-LICENSE.txt). The source and brand assets for this site have no separate open-source license in this repository.
