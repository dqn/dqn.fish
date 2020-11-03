export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export function pageview(url: string) {
  if (!GA_TRACKING_ID) {
    return;
  }

  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export function event({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label: string;
  value: string;
}) {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}
