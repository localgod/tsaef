# Contributing to tsaef

## Setup

Requires Node.js `^22.18.0`, `^24.11.0` or `>=26.0.0` for development (the tooling is
[Vite+](https://viteplus.dev/)).

```bash
git clone https://github.com/localgod/tsaef.git
cd tsaef
npm install
npm test
```

## Scripts

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm run build`         | Compile to `dist/`                         |
| `npm run dev`           | Watch mode                                 |
| `npm run check`         | Format check, lint and type-check together |
| `npm run lint`          | Lint                                       |
| `npm run format`        | Format check (`formatfix` to apply)        |
| `npm test`              | Run tests                                  |
| `npm run test:watch`    | Run tests in watch mode                    |
| `npm run test:coverage` | Coverage report                            |

Tool configuration (lint, format, test) lives in `vite.config.ts`.

## Project structure

```
src/
  node/TsAEF.mts     # Facade — file I/O (Node only, exported as tsaef/node)
  Archimate.mts       # Core domain class
  Parser.mts          # AEF XML → Archimate (fast-xml-parser)
  Serializer.mts      # Archimate → AEF XML
  Validator.mts       # Schema + reference validation
  interfaces/         # Clean TypeScript interfaces
  constants/          # ArchiMate type enums
  utils/              # PropertyFormatter, StringUtils, DateUtils
tests/
  *.test.mts
  fixtures/           # Sample AEF XML files
```

## Guidelines

- `.mts` extension for all TypeScript source files
- No `any` without an explanatory comment
- No comments unless the WHY is non-obvious
- New public API needs a test
- Roundtrip tests (`parse → serialize → parse`) for any Parser/Serializer changes

## Adding a fixture

Place AEF XML files in `tests/fixtures/` and add roundtrip coverage in `tests/RoundtripFixtures.test.mts`.

## Commit messages

Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
