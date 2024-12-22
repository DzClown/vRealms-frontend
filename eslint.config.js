import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'prettier/prettier': 'error', // Menambahkan aturan Prettier
    },
  },

  {
    // Konfigurasi untuk mengabaikan konflik ESLint dan Prettier
    extends: ['prettier'],
  },
];
