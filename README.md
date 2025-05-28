# Shraddha Portal - Frontend

Shraddha Portal is a modern frontend application built with Vue 3 and Vite. It uses Vuetify for UI components, Pinia for state management, and TypeScript for type safety. This document provides a comprehensive overview of the setup, development, and tooling.

---

## 🚀 Tech Stack

- **Framework**: Vue 3
- **Bundler**: Vite
- **Routing**: Vue Router
- **State Management**: Pinia
- **UI Library**: Vuetify
- **Type Checking**: TypeScript (`vue-tsc`)
- **Testing**:

  - Unit Testing: Vitest
  - E2E Testing: Playwright

- **Linting**:

  - ESLint + Oxlint

- **Formatting**: Prettier

---

## 📁 Project Structure

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
│   ├── unit/              # Unit tests
│   └── e2e/               # End-to-end tests
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

---

## 🛠️ Setup

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

## ✅ Linting & Formatting

### Lint All

```bash
npm run lint
```

### Fix Lint Issues

```bash
npm run lint:eslint
npm run lint:oxlint
```

### Format Code

```bash
npm run format
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm run test:unit
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

---

## 🧾 Type Checking

Check for TypeScript errors:

```bash
npm run type-check
```

---

## 🔧 Configuration

### Vite

Configured in `vite.config.ts` with Vue and optional dev tools.

### TypeScript

Inherits from `@tsconfig/node22` and `@vue/tsconfig`.

### ESLint

Includes:

- `eslint-plugin-vue`
- `@vue/eslint-config-typescript`
- `eslint-plugin-oxlint`
- `eslint-plugin-playwright`

### Prettier

Prettier is configured to format all source files.

---

## 🎨 UI with Vuetify

Vuetify components are used across the app. Ensure Vuetify is properly initialized in `main.ts`.

---

## 🔁 Continuous Integration (Recommended)

Add CI steps to run:

- `npm run lint`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

---

## 📄 License

This project is private and not licensed for public use.

---

## 📬 Feedback & Contributions
