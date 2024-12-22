// src/composables/useLocalStorage.js
import { ref, watch } from 'vue';

const MAX_CHUNK_SIZE = 5000000; // 5MB per chunk (approx.)

export const useLocalStorage = (key, defaultValue = null) => {
  const storedValue = ref(getMergedLocalStorage(key) || defaultValue);

  // Watch for changes in `storedValue` and update localStorage
  watch(
    storedValue,
    () => {
      setLocalStorage(key, storedValue.value);
    },
    { deep: true }
  );

  return storedValue;
};

function getMergedLocalStorage(key) {
  // Check if value exists as a single key
  const value = localStorage.getItem(key);

  if (value) {
    return JSON.parse(value);
  }

  // If no single value, look for chunked keys
  const parts = [];
  for (let i = 0; ; i++) {
    const partKey = `${key}.${i}`;
    const chunk = localStorage.getItem(partKey);
    if (!chunk) break;
    parts.push(chunk);
  }

  return parts.length > 0 ? JSON.parse(parts.join('')) : null;
}

function setLocalStorage(key, value) {
  const stringifiedValue = JSON.stringify(value);
  const chunks = createChunks(key, stringifiedValue, MAX_CHUNK_SIZE);

  // Remove existing chunks before saving
  deleteExistingParts(key);

  // Save the chunks back to localStorage
  if (chunks.length === 1) {
    localStorage.setItem(key, chunks[0].value);
  } else {
    chunks.forEach((chunk) => {
      localStorage.setItem(chunk.name, chunk.value);
    });
  }
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

function deleteExistingParts(key) {
  // Remove main key if exists
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
  }

  // Remove chunked keys
  for (let i = 0; ; i++) {
    const partKey = `${key}.${i}`;
    if (!localStorage.getItem(partKey)) break;
    localStorage.removeItem(partKey);
  }
}
