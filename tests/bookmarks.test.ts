import assert from 'node:assert/strict';
import test from 'node:test';
import {
  encodeSlug,
  formatBookmark,
  normalizeUrl,
  parseStoredBookmarks,
} from '../src/lib/bookmarks.ts';

test('normalizes URLs with and without https to the same saved value', () => {
  assert.equal(normalizeUrl('https://www.example.com'), 'https://www.example.com');
  assert.equal(normalizeUrl('  www.example.com  '), 'https://www.example.com');
});

test('recovers gracefully from empty, corrupted, legacy, and non-array storage values', () => {
  for (const value of [null, '', '{broken json', '"legacy value"', '{"url":"https://example.com"}']) {
    assert.deepEqual(parseStoredBookmarks(value), []);
  }

  assert.deepEqual(
    parseStoredBookmarks(
      JSON.stringify([
        { url: 'https://example.com', slug: 'mona-7fk2' },
        { url: 'javascript:alert(1)', slug: 'mona-7fk3' },
        { url: 'https://example.org', slug: 'legacy-slug' },
        null,
      ]),
    ),
    [{ url: 'https://example.com', slug: 'mona-7fk2' }],
  );
});

test('formats a saved bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});

test('encodes a short base62 slug with the mona prefix', () => {
  assert.equal(encodeSlug(62 ** 3 + 62 ** 2 + 62 + 11), 'mona-111b');
});
