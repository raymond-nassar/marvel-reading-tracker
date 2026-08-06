// Lint and format configuration.
//
// The rules here were chosen by measuring the code that already exists rather than by
// taking a house style off the shelf: 2-space indent, single quotes, trailing commas on
// multi-line literals, and arrow parameters always parenthesised (206 occurrences of
// `(x) =>` and none of `x =>`). Anything that would have reflowed working code was left
// out. In particular there is no max-len: the 99th percentile line is 115 characters and
// the longest is 362, almost all of them deliberate single-line data or comment prose,
// and wrapping them would bury the actual history under a formatting commit.
//
// `npm run lint` reports; `npm run lint:fix` applies the fixable subset.

import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

const stylisticRules = {
  '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
  '@stylistic/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' }],
  '@stylistic/semi': ['error', 'always'],
  '@stylistic/comma-dangle': ['error', 'always-multiline'],
  '@stylistic/arrow-parens': ['error', 'always'],
  '@stylistic/no-trailing-spaces': 'error',
  '@stylistic/eol-last': ['error', 'always'],
  '@stylistic/space-before-blocks': 'error',
  '@stylistic/keyword-spacing': 'error',
  '@stylistic/comma-spacing': 'error',
  '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
};

const correctnessRules = {
  // The app stores reading progress, so an accidental global or a dropped promise is a
  // data-loss risk rather than a style opinion.
  'no-implicit-globals': 'error',
  'no-var': 'error',
  'prefer-const': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
  'no-console': 'off',
  // Deliberately not enabling no-await-in-loop. Sequential awaits are the point in this
  // codebase: the rate limiter and the vendor scripts pace requests to the metadata
  // service on purpose, and turning it on required 23 suppressions for correct code.
};

export default [
  {
    ignores: [
      'node_modules/**',
      'docs/ux-artifacts/**',
      '.copilot-tracking/**',
      'src/data/**',
      'src/vendor/**',
      // Generated from src/data/hickman_full.json and consumed only by the static design
      // mockups. It is embedded JSON, so normalising its quotes would be undone the next
      // time it is regenerated.
      'design/mockups/mock-data.js',
    ],
  },
  js.configs.recommended,
  {
    plugins: { '@stylistic': stylistic },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: { ...stylisticRules, ...correctnessRules },
  },
  {
    // Everything served out of src/ runs in the browser.
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    // The server, the build scripts and the tests run in Node.
    files: ['server.mjs', 'scripts/**/*.mjs', 'test/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['design/**/*.js'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
];
