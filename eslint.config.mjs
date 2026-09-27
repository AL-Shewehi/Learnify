import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  // ========== الإعدادات العامة ==========
  {
    ignores: ["dist/**", "node_modules/**"],
  },

  // ========== قواعد JavaScript الموصى بها ==========
  js.configs.recommended,

  // ========== قواعد TypeScript الموصى بها ==========
  ...tseslint.configs.recommended,

  // ========== إعدادات مخصصة لمشروعنا ==========
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // ========== القواعد الأساسية ==========
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      eqeqeq: ["error", "always"],
      "no-throw-literal": "error",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },

  // ========== ✅ قواعد خاصة بملفات الـ startup ==========
  {
    files: ["src/server.ts", "src/app.ts"],
    rules: {
      "no-console": "off", // ✅ السماح بـ console في الملفات دي
    },
  },
);