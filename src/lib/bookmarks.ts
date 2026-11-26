export type Bookmark = {
  url: string;
  slug: string;
};

const slugPattern = /^mona-[A-Za-z0-9]{4}$/;

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Enter a URL to bookmark.');
  }

  const withProtocol = trimmed.startsWith('//')
    ? `https:${trimmed}`
    : /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
  const parsed = new URL(withProtocol);

  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error('Enter a valid HTTP or HTTPS URL.');
  }

  const path = parsed.pathname === '/' ? '' : parsed.pathname;
  return `${parsed.origin}${path}${parsed.search}${parsed.hash}`;
}

export function parseStoredBookmarks(value: string | null | undefined): Bookmark[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const entries: unknown[] = parsed;
    return entries.flatMap((entry): Bookmark[] => {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        Array.isArray(entry)
      ) {
        return [];
      }

      const candidate = entry as { url?: unknown; slug?: unknown };
      if (
        typeof candidate.url !== 'string' ||
        typeof candidate.slug !== 'string' ||
        !slugPattern.test(candidate.slug)
      ) {
        return [];
      }

      try {
        return [{ url: normalizeUrl(candidate.url), slug: candidate.slug }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function encodeSlug(value: number): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const base = alphabet.length;
  let remaining = value % base ** 4;
  let slug = '';

  for (let index = 0; index < 4; index += 1) {
    slug = alphabet[remaining % base] + slug;
    remaining = Math.floor(remaining / base);
  }

  return `mona-${slug}`;
}
