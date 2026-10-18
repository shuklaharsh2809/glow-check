# GlowCheck

GlowCheck is a mobile-first appearance and glow-up experiment. It detects facial landmarks and expression blendshapes with MediaPipe in the browser, describes visible facial geometry, and provides deterministic hairstyle, grooming, expression, wardrobe, and styling suggestions.

## Features

- In-memory first name and age flow; age does not affect analysis
- Guided front-camera capture with preview and retake controls
- Lazy, local MediaPipe Face Landmarker inference, including no-face and multiple-face errors
- Apparent face-shape, facial-symmetry, feature-spacing, and expression measurements
- Experimental Appearance Impression Score with a documented weighted formula
- Two included recommendations and three recommendations behind a simulated ₹5 unlock
- Web Share with copy fallback, optional consent-gated analytics, and complete session reset
- Responsive UI, keyboard focus states, reduced-motion support, and accessible status/error messages

The landing-page model portrait is an original AI-generated project asset stored at `public/images/glowcheck-editorial-model.jpg`. It is labeled as an illustrative AI-generated example in the interface and does not depict a GlowCheck user or a real analysis result. No third-party stock photograph is used.

## Requirements and commands

Node.js 20.19 or later (or Node.js 22.12 or later) is required by the pinned Vite toolchain.

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

The production output is in `dist/`.

## How analysis works

The app lazily downloads the MediaPipe Tasks Vision WASM runtime and the version-1 float16 Face Landmarker task, then runs inference against the browser image element. It requests up to two faces so it can reject group images. Selected documented landmark positions estimate the apparent face outline, side-to-side facial balance, and broad feature-spacing ranges. MediaPipe blendshapes provide the visible expression signal. No raw landmarks or blendshape arrays are retained in app state.

The Appearance Impression Score weights apparent symmetry 42%, broad feature balance 43%, and visible expression 15%. A score is omitted when the face is too turned for a reliable 2D balance reading. Canvas brightness and edge-detail checks remain available as internal photo-quality signals, but they do not determine the visible appearance score or recommendations. The score is a subjective product heuristic rather than a scientific measurement of attractiveness.

The default model and WASM files come from version-pinned Google Storage and jsDelivr URLs. Override the model with `VITE_MEDIAPIPE_MODEL_URL`. A network failure produces a retryable error and never generates substitute results. For maximum operational control, self-host the matching WASM folder and model and change the URLs in `faceLandmarker.ts` and `.env`.

## Privacy and analytics

Photos are held via temporary object URLs and are never uploaded by application code. Names, ages, results, and landmarks are never sent to analytics or placed in browser persistence. Camera tracks stop after capture, cancellation, unmount, or reset. Reset revokes the current image URL and clears all React state.

Analytics is disabled by default. To enable optional PostHog events, copy `.env.example` to `.env`, set `VITE_ENABLE_ANALYTICS=true`, and provide a public project key and host. Events are still sent only after the visitor opts in. Autocapture, pageview capture, session replay, persistent storage, and person profiles are disabled. The event property allowlist contains only `source`, `outcome`, `method`, and `error_code`. Do not add names, ages, image information, measurements, recommendation content, or identifiers. Provider quotas and terms can change; review the current PostHog plan before enabling it.

## Camera and model troubleshooting

Camera access requires HTTPS in production (localhost is the usual development exception). If access is denied, restore the site permission in browser settings and retry. GlowCheck intentionally does not offer camera-roll upload. iOS browsers may pause the stream when the tab backgrounds; reopen the camera if needed. Content blockers, CSP rules, firewalls, or offline use can prevent CDN model downloads. Confirm that the model and WASM hosts are allowed, then retry.

## Deployment

Vercel: this repository is connected to the `glow-check` Vercel project. Pushes to `main` can produce production deployments using the detected Vite settings. To deploy manually from an authenticated machine, run `vercel --prod`. The production site is available at [glow-check-mu.vercel.app](https://glow-check-mu.vercel.app). Local `.vercel` project metadata is intentionally ignored.

Cloudflare Pages: connect the repository, use `npm run build` as the build command, and `dist` as the output directory. Add optional Vite environment variables only if analytics or a custom model location is needed.

GitHub Pages: set `VITE_BASE_PATH=/repository-name/` in the build environment for a project site, run `npm run build`, and publish `dist/` with a Pages workflow. For a root user site, keep `/`. The app is a single screen with state-based navigation, so no rewrite rule is required.

No backend, database, authentication, payment provider, or paid AI service is needed. The ₹5 flow is a UI demonstration and cannot collect money or provide a secure entitlement.

## Limitations and extensions

Results depend on browser support, model availability, image quality, head angle, expression, and landmark confidence. The Appearance Impression Score is experimental and not scientifically validated. It describes visible 2D geometry in one portrait; it does not objectively define a person's attractiveness, body, health, personality, demographic identity, or worth. Face-shape categories are approximate, natural asymmetry is normal, and the app cannot see actual hair texture, clothing colour, or grooming detail. Suggestions outside measured geometry are clearly labeled as general.

Natural extensions include self-hosting model assets, calibrated 3D pose estimation with documented camera assumptions, user-selected style preferences, additional accessibility testing, and Playwright coverage against a locally served build. Any future analytics should preserve the current property allowlist and consent boundary.
