import { useEffect } from 'react';

// Per-page <title>/meta description as a stopgap — there's no real router or
// static-generation step yet (that's Phase 1 of scc-site-update-brief.md),
// so this is the only per-view SEO hook available today.
export function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    const prevContent = meta ? meta.content : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
    return () => {
      document.title = prevTitle;
      if (created) meta.remove();
      else if (prevContent != null) meta.content = prevContent;
    };
  }, [title, description]);
}
