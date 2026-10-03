import js from '@eslint/js';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores(['app/**', 'index.js']),
    {
        files: ['bin/**/*.mjs'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['**/*.ts'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommendedTypeChecked,
        ],
        languageOptions: {
            parserOptions: { projectService: true },
        },
    },
    {
        files: ['**/*.{ts,mjs}'],
        rules: {
            // メトリクスに関するルール
            complexity: ['error', { max: 10 }],
            'max-depth': ['error', { max: 4 }],
            'max-lines': [
                'error',
                { max: 300, skipBlankLines: true, skipComments: true },
            ],
            'max-lines-per-function': [
                'error',
                { max: 50, skipBlankLines: true, skipComments: true },
            ],
            'max-nested-callbacks': ['error', { max: 3 }],
            'max-params': ['error', { max: 4 }],
            'max-statements': ['error', { max: 10 }],
            // 未使用変数
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'no-var': 'error',
            'prefer-const': 'error',
            eqeqeq: ['error', 'always'],
            'no-console': 'warn',
            // debugger禁止
            'no-debugger': 'error',
            // switchのfallthrough検出
            'no-fallthrough': 'error',
            // ネストしたifを減らす
            curly: ['error', 'all'],
            // 同じimport重複
            'no-duplicate-imports': 'error',
        },
    },
    {
        files: ['**/*.ts'],
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
    {
        files: ['__tests__/**/*.ts'],
        rules: {
            'no-console': 'off',
            'max-lines-per-function': 'off',
            'max-nested-callbacks': 'off',
        },
    },
    {
        files: ['src/**/*.ts', '__tests__/ui-components/**/*.ts'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['__tests__/unit/**/*.ts', 'eslint.config.ts'],
        languageOptions: { globals: globals.node },
    },
]);
