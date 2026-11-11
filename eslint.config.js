import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Base settings for all files
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: globals.browser
    }
  },

  // Specific settings for JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module'
    }
  },

  // Apply ESLint's base recommended rules
  pluginJs.configs.recommended,

  // TypeScript rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser, // Use TypeScript parser
      globals: {
        ...globals.browser, // Enable browser globals here inside languageOptions
        node: true // Enable Node.js globals in TypeScript files
      }
    },
    rules: {
      ...tseslint.configs.recommended.rules, // Include TypeScript rules
      'no-unused-vars': 'off'
    }
  },

  // React-specific rules
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react: pluginReact },
    rules: {
      ...pluginReact.configs.flat.recommended.rules, // Include React rules
      'react/react-in-jsx-scope': 'off', // Disable if using React 17+ with the new JSX transform
      'react/prop-types': 'off' // Optional: Disable prop-types if you're using TypeScript
    }
  }
];
