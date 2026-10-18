/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_MEDIAPIPE_MODEL_URL?: string;
}
