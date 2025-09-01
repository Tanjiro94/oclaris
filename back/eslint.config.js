import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [

    { ignores: ["dist/**", "build/**", "node_modules/**", "generated/**"] },

    js.configs.recommended,
    ...tseslint.configs.recommended,

    {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        globals: globals.node,

        parser: tseslint.parser,
        parserOptions: { project: true, tsconfigRootDir: import.meta.dirname }
    },
    rules: {}
    }
];