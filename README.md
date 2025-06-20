# Shraddha Portal - Frontend

**Shraddha Portal** is a modern frontend application built with Vue 3 and Vite. It uses **PrimeVue** for UI components, **Pinia** for state management, and **TypeScript** for type safety. This document outlines the project structure, setup, tooling, and configurations.

---

## Tech Stack

- **Framework**: Vue 3
- **Bundler**: Vite
- **Routing**: Vue Router
- **State Management**: Pinia
- **UI Library**: PrimeVue
- **Type Checking**: TypeScript (`vue-tsc`)
- **Testing**:
  - Unit: Vitest
  - E2E: Playwright
- **Linting**: ESLint + Oxlint + Unused Imports Plugin
- **Pre-commit Hooking**: Husky + lint-staged
- **Formatting**: Prettier

---

## Project Structure

```
shraddha-portal/
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Vue components
│   ├── composables/       # Reusable logic
│   ├── router/            # Vue Router setup
│   ├── store/             # Pinia stores
│   ├── views/             # Route-based views
│   ├── App.vue            # Root component
│   └── main.ts            # App entry point
├── tests/
│   ├── unit/              # Unit tests (Vitest)
│   └── e2e/               # E2E tests (Playwright)
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project metadata and scripts
```

---

## Setup

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Linting & Formatting

### Lint All

```bash
npm run lint
```

### ESLint (Fix Issues)

```bash
npm run lint:eslint
```

### Oxlint (Fix Issues)

```bash
npm run lint:oxlint
```

### Format Code

```bash
npm run format
```

---

## Type Checking

Check for TypeScript errors:

```bash
npm run type-check
```

---

## Testing

### Unit Tests (Vitest)

```bash
npm run test:unit
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

---

## Pre-commit Hooks (Husky + lint-staged)

### Setup Git Hooks

```bash
npm run prepare
```

### What Runs on Commit

`lint-staged` runs checks on staged files:

```json
{
  "*.{ts,js,vue}": [
    "prettier --check",
    "eslint --fix",
    "vue-tsc --noEmit",
    "vitest related --passWithNoTests"
  ],
  "*.{json,css,scss,md}": ["prettier --check"]
}
```

This ensures linting, formatting, type-checking, and tests pass before each commit.

---

## Configuration Details

### Vite

Configured in `vite.config.ts` with Vue plugin and optional dev tools via `vite-plugin-vue-devtools`.

### TypeScript

- Base config: `@tsconfig/node22`
- Vue-specific config: `@vue/tsconfig`

### ESLint

Plugins and configs used:

- `eslint-plugin-vue`
- `@vue/eslint-config-typescript`
- `eslint-plugin-oxlint`
- `eslint-plugin-playwright`
- `eslint-plugin-unused-imports`

### Prettier

Configured to format all code in `src/` and integrated with lint-staged.

---

## UI with PrimeVue

PrimeVue and `@primeuix/themes` are used throughout the application. Ensure setup is correctly initialized in `main.ts`.

---

## Continuous Integration (Recommended)

Automate the following steps:

```bash
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

---

## License

This project is **private** and not licensed for public use.

---

## Feedback & Contributions

Internal use only. Contact the core development team for feedback or to contribute changes.
