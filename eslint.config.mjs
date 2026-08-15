import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
    },
    {
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
        },
    },
    {
        ignores: ['learn/sample_project/sample000/**'],
        rules: {
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
        files: ['**/__tests__/**/*.{js,mjs,cjs}'],
        rules: {
            'no-console': 'off',
        },
    },
]);
