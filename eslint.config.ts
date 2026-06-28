import { defineConfig } from 'eslint/config';

import { createConfig } from '@freehour/eslint-rules';


export default defineConfig(
    await createConfig({
        stylistic: true,
        imports: true,
    }),
    {
        files: ['lib/**/*.ts'],
        ignores: ['vite.config.ts'],
    },
);
