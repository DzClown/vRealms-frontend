// src/@core/composable/useCookie.js
import { parse, serialize } from 'cookie-es';
import { destr } from 'destr';
import { ref, watch } from 'vue'; // Tambahkan import ini

const CookieDefaults = {
  path: '/',
  watch: true,
  decode: (val) => destr(decodeURIComponent(val)),
  encode: (val) => encodeURIComponent(typeof val === 'string' ? val : JSON.stringify(val)),
  maxCookieSize: 3180, // 3.18KB for safety margin
};

export const useCookie = (name, _opts) => {
  const opts = { ...CookieDefaults, ..._opts || {} };
  const cookies = parse(document.cookie, opts);
  const cookie = ref(getMergedCookie(name, cookies, opts));

  watch(cookie, () => {
    setCookie(name, cookie.value, opts);
  });

  return cookie;
};

function getMergedCookie(name, cookies, opts) {
  if (cookies[name]) {
    return opts.decode(cookies[name]);
  }

  const parts = [];
  for (let i = 0; ; i++) {
    const partKey = `${name}.${i}`;
    if (!cookies[partKey]) break;
    parts.push(cookies[partKey]);
  }

  return parts.length > 0 ? opts.decode(parts.join('')) : opts.default?.();
}

function setCookie(name, value, opts) {
  const chunks = createChunks(name, opts.encode(value), opts.maxCookieSize);

  deleteExistingParts(name, opts);

  chunks.forEach((chunk) => {
    document.cookie = serializeCookie(chunk.name, chunk.value, opts);
  });
}

function createChunks(key, value, chunkSize) {
  let encodedValue = encodeURIComponent(value);

  if (encodedValue.length <= chunkSize) {
    return [{ name: key, value }];
  }

  const chunks = [];

  while (encodedValue.length > 0) {
    let encodedChunkHead = encodedValue.slice(0, chunkSize);

    const lastEscapePos = encodedChunkHead.lastIndexOf('%');

    if (lastEscapePos > chunkSize - 3) {
      encodedChunkHead = encodedChunkHead.slice(0, lastEscapePos);
    }

    let valueHead = '';

    while (encodedChunkHead.length > 0) {
      try {
        valueHead = decodeURIComponent(encodedChunkHead);
        break;
      } catch (error) {
        if (
          error instanceof URIError &&
          encodedChunkHead.at(-3) === '%' &&
          encodedChunkHead.length > 3
        ) {
          encodedChunkHead = encodedChunkHead.slice(0, encodedChunkHead.length - 3);
        } else {
          throw error;
        }
      }
    }

    chunks.push(valueHead);
    encodedValue = encodedValue.slice(encodedChunkHead.length);
  }

  return chunks.map((value, i) => ({ name: `${key}.${i}`, value }));
}

function deleteExistingParts(name, opts) {
  const cookies = parse(document.cookie, opts);

  if (cookies[name]) {
    document.cookie = serializeCookie(name, '', { ...opts, maxAge: -1 });
  }

  for (let i = 0; ; i++) {
    const partKey = `${name}.${i}`;
    if (!cookies[partKey]) break;
    document.cookie = serializeCookie(partKey, '', { ...opts, maxAge: -1 });
  }
}

function serializeCookie(name, value, opts = {}) {
  if (value === null || value === undefined) {
    return serialize(name, value, { ...opts, maxAge: -1 });
  }

  return serialize(name, value, opts);
}
