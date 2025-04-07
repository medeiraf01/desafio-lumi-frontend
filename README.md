# ⚛️ React + TypeScript + Vite – Frontend Application

This is the frontend portion of the Full Stack Challenge developed with **React**, **TypeScript**, and **Vite**. It is structured to deliver a fast, scalable, and developer-friendly experience using modern tooling and conventions.

---

## 🚀 Project Structure

- **React** – UI library for building declarative interfaces
- **TypeScript** – Type-safe development
- **Vite** – Blazing fast dev server and bundler
- **ESLint** – Linting with customizable rules
- **Vite Preview** – For testing production builds locally

---

## 🚀 Required access 

  "email": "user@example.com",
  "password": "password123"

--

## 📦 Available Scripts

In the project directory, you can run:

```bash
# Start development server
npm run dev

# Build the project for production
npm run build

# Run ESLint for code quality checks
npm run lint

# Preview the production build locally
npm run preview
```

---

## 🛠️ Development Setup

1. Install dependencies:

```bash
npm install
```

2. Create an `.env` file at the root of the project and configure the API URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

> You can change this URL depending on where your backend is hosted.

---

## ✅ ESLint & Code Quality

This project uses an extensible ESLint configuration tailored for TypeScript + React. It is ready for both personal and production usage.

You can expand the ESLint configuration for better type-aware linting:

```ts
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

### 🔍 Optional React-Specific Plugins

Consider installing `eslint-plugin-react-x` and `eslint-plugin-react-dom` for extended React linting support:

```ts
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
---

## 👨‍💻 Author

Developed by **Rafael Medeiros** as part of the Lumi Full Stack Challenge.

---
