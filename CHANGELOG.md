# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.0] - 2026-08-13

## What's Changed

- fix(deps): bump vite, @vitest/coverage-v8 and vitest by @dependabot[bot] in https://github.com/localgod/tsaef/pull/13
- fix(deps): bump zod from 3.25.76 to 4.4.3 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/11
- fix(deps): bump esbuild, @vitest/coverage-v8 and vitest by @dependabot[bot] in https://github.com/localgod/tsaef/pull/8
- fix(deps): bump fast-xml-parser from 4.5.7 to 5.10.1 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/6
- chore(deps-dev): bump typescript from 5.9.3 to 7.0.2 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/7
- fix(deps): bump actions/checkout from 4 to 7 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/1
- fix(deps): bump release-drafter/release-drafter from 6 to 7 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/2
- chore(deps-dev): bump @types/node from 24.13.3 to 26.2.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/12
- fix(deps): bump actions/setup-node from 4 to 7 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/3

## New Contributors

- @dependabot[bot] made their first contribution in https://github.com/localgod/tsaef/pull/13

**Full Changelog**: https://github.com/localgod/tsaef/commits/0.1.0

## [0.2.0] - 2026-08-13

## What's Changed

- fix(deps): bump vite, @vitest/coverage-v8 and vitest by @dependabot[bot] in https://github.com/localgod/tsaef/pull/13
- fix(deps): bump zod from 3.25.76 to 4.4.3 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/11
- fix(deps): bump esbuild, @vitest/coverage-v8 and vitest by @dependabot[bot] in https://github.com/localgod/tsaef/pull/8
- fix(deps): bump fast-xml-parser from 4.5.7 to 5.10.1 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/6
- chore(deps-dev): bump typescript from 5.9.3 to 7.0.2 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/7
- fix(deps): bump actions/checkout from 4 to 7 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/1
- fix(deps): bump release-drafter/release-drafter from 6 to 7 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/2
- chore(deps-dev): bump @types/node from 24.13.3 to 26.2.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/12
- fix(deps): bump actions/setup-node from 4 to 7 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/3

## New Contributors

- @dependabot[bot] made their first contribution in https://github.com/localgod/tsaef/pull/13

**Full Changelog**: https://github.com/localgod/tsaef/commits/0.1.0

## [0.1.0] - 2026-08-13

### Added

- Initial release as `tsaef` — TypeScript library for the ArchiMate Exchange Format (AEF)
- `TsAEF` facade for loading and saving AEF XML files
- `Archimate` domain class with CRUD for elements, relationships, properties, and views
- `Parser` — AEF XML → `Archimate` using fast-xml-parser
- `Serializer` — `Archimate` → valid AEF XML
- `Validator` — Zod-based schema validation, reference integrity, and namespace checks
- `PropertyFormatter` plugin system with built-in string, date, boolean, and number formatters
- ArchiMate 3.1 element and relationship type constants and TypeScript types
- Clean TypeScript interfaces with no xml2js artifacts
