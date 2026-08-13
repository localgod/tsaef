# Contributing to tsaef

## Setup

```bash
git clone https://github.com/localgod/tsaef.git
cd tsaef
npm install
npm test
```

## Scripts

| Command | Description |
|---|---|
| `npm run build` | Compile to `dist/` |
| `npm run dev` | Watch mode |
| `npm test` | Run tests |
| `npm run test:run` | Single test run |
| `npm run test:coverage` | Coverage report |

## Project structure

```
src/
  TsAEF.mts          # Facade — file I/O
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
