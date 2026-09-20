import posthog from 'posthog-js';

const allowedHost = typeof window !== 'undefined' && ['fliccs.com', 'www.fliccs.com'].includes(window.location.hostname);
const enabled = allowedHost && import.meta.env.VITE_POSTHOG_ENABLED === 'true' && Boolean(import.meta.env.VITE_POSTHOG_TOKEN);

export function initAnalytics() {
    if (!enabled) return;
    posthog.init(import.meta.env.VITE_POSTHOG_TOKEN, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
        ui_host: 'https://us.posthog.com',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_feature_flags: true,
        save_campaign_params: false,
        save_referrer: false,
        respect_dnt: true,
        person_profiles: 'identified_only',
        before_send(event) {
            if (!event) return event;
            delete event.properties.$current_url;
            delete event.properties.$referrer;
            delete event.properties.$initial_referrer;
            return event;
        },
    });
    posthog.register({ site: 'fliccs', schema_version: 1 });
    const referrerDomain = (() => { try { return new URL(document.referrer).hostname; } catch { return ''; } })();
    const source = new URLSearchParams(window.location.search).get('utm_source') || '';
    const firstTouch = {};
    if (/^[a-z0-9._-]{1,64}$/i.test(referrerDomain)) firstTouch.first_referrer_domain = referrerDomain;
    if (/^[a-z0-9._-]{1,64}$/i.test(source)) firstTouch.first_utm_source = source;
    posthog.register_once(firstTouch);
}

export function capture(event, properties = {}) {
    if (enabled) posthog.capture(event, properties);
}

export function capturePageview(pathname) {
    if (!enabled || !['/', '/watch', '/pricing', '/privacy', '/refund', '/terms-and-conditions'].includes(pathname)) return;
    capture('$pageview', { $pathname: pathname });
}
