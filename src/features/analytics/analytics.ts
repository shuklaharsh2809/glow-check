export type AnalyticsEvent =
  | 'landing_page_view' | 'analysis_started' | 'camera_permission_granted' | 'camera_permission_denied'
  | 'photo_selected' | 'analysis_completed' | 'analysis_failed' | 'report_viewed'
  | 'premium_clicked' | 'demo_unlock_confirmed' | 'report_shared' | 'session_reset';

let consent = false;
let client: typeof import('posthog-js').default | null = null;
const allowedPropertyKeys = new Set(['source', 'outcome', 'method', 'error_code']);

export async function setAnalyticsConsent(value: boolean) {
  consent = value;
  if (!value) { client?.opt_out_capturing(); return; }
  if (import.meta.env.VITE_ENABLE_ANALYTICS !== 'true' || !import.meta.env.VITE_POSTHOG_KEY) return;
  const posthog = (await import('posthog-js')).default;
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: 'memory',
    person_profiles: 'never',
  });
  client = posthog;
}

export function trackEvent(event: AnalyticsEvent, properties: Record<string, string | boolean> = {}) {
  if (!consent) return;
  const safe = Object.fromEntries(Object.entries(properties).filter(([key]) => allowedPropertyKeys.has(key)));
  if (import.meta.env.DEV) console.info(`[analytics] ${event}`, safe);
  client?.capture(event, safe);
}

export function resetAnalyticsSession() { client?.reset(); }
