# GlowCheck

GlowCheck is a mobile-first photo-presentation experiment. It detects facial landmarks with MediaPipe in the browser and combines face framing with local Canvas brightness and edge-detail measurements. It then gives deterministic, practical photo and style suggestions. It does not judge attractiveness.

## Features

- In-memory first name and age flow; age does not affect analysis
- Guided front-camera capture with preview and retake controls
- Lazy, local MediaPipe Face Landmarker inference, including no-face and multiple-face errors
- Local brightness, sharpness, face position, occupancy, and framing measurements
- Experimental Photo Presentation Score with a documented weighted formula
- Two included recommendations and three recommendations behind a simulated ₹5 unlock
- Web Share with copy fallback, optional consent-gated analytics, and complete session reset
- Responsive UI, keyboard focus states, reduced-motion support, and accessible status/error messages

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

The app lazily downloads the MediaPipe Tasks Vision WASM runtime and the version-1 float16 Face Landmarker task, then runs inference against the browser image element. It requests up to two faces so it can reject group images. Landmark extrema form a normalized face box; face size and centre produce framing quality. No raw landmarks are retained in app state.

Canvas downsizes the image to at most 360 pixels on its longest side for quality sampling. Luminance uses Rec. 709 coefficients. Sharpness uses normalized adjacent-pixel luminance gradients. This is a lightweight heuristic, not a calibrated camera-quality result. The score weights framing 40%, lighting 30%, and sharpness 30%; lighting is best in a conservative middle range. A score is shown only when all three measurements exist. Head angle is intentionally not estimated because the MVP does not implement calibrated pose solving.

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

Results depend on browser support, model availability, image quality, and landmark confidence. The score is experimental and not scientifically validated. Brightness is global rather than face-region exposure, sharpness can be affected by texture, and no 3D pose, hairstyle, clothing, skin, health, personality, demographic, or attractiveness inference is performed. General style cards are labeled as general suggestions.

Natural extensions include self-hosting model assets, calibrated pose estimation with documented camera assumptions, face-region light sampling, additional accessibility testing, and Playwright coverage against a locally served build. Any future analytics should preserve the current property allowlist and consent boundary.
