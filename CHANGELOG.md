# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.4.0] - 2026-10-30

### ⚠️ Breaking changes

- **`TsAEF` moved to `tsaef/node`.** The root `tsaef` export is now browser-safe and imports nothing from Node. Change `import { TsAEF } from "tsaef"` to `import { TsAEF } from "tsaef/node"`. (#80)
- **`Connection.relationshipRef` is optional** (`string | undefined`), because `Line` connections have none. Code that reads it as a plain `string` needs a check. (#75)
- **Nodes need a position and size.** `Validator.validate()` now reports nodes without `x`/`y`/`w`/`h`, and out-of-range style and position values, all of which the XSD already rejected. (#79)
- **Node.js 22 or later** (`engines.node` is now `>=22.0.0`). (#81)

### Added

- feat!: browser-safe root export; move TsAEF to tsaef/node (#80)
- feat: validate view style and position values against XSD ranges (#79)
- feat: style on nodes and connections, and connection bendpoints (#77)
- feat: warn about relationships that connect to themselves or form a cycle (#74)
- feat: relationship accessType, modifier and isDirected; relationships and connections as endpoints (#71)
- feat: documentation on views, organization items, nodes and connections; model-level properties (#68)

### Fixed

- fix: support Line connections and default connection types valid against the XSD (#75)
- fix: keep every language of repeated name/documentation/label/value (#70)

### Changed

- chore: migrate tooling to Vite+ 1.3.0 (#81)

### Dependencies

- chore(deps-dev): bump oxlint from 1.88.0 to 1.89.0 (#61)
- chore(deps-dev): bump oxfmt from 0.73.0 to 0.74.0 (#62)
- chore(deps-dev): bump oxfmt from 0.72.0 to 0.73.0 (#59)
- chore(deps-dev): bump @vitest/coverage-v8 from 5.0.3 to 5.0.5 (#58)
- chore(deps-dev): bump vitest from 5.0.3 to 5.0.5 (#57)
- fix(deps): bump zod from 4.6.6 to 4.6.7 (#56)
- chore(deps-dev): bump oxlint from 1.87.0 to 1.88.0 (#60)
- chore(deps-dev): bump vite from 8.3.2 to 8.3.5 (#55)
- chore(deps-dev): bump oxfmt from 0.71.0 to 0.72.0 (#53)
- fix(deps): bump release-drafter/release-drafter from 7.9.0 to 7.10.0 (#50)
- fix(deps): bump actions/setup-node from 7.0.0 to 7.1.0 (#51)
- chore(deps-dev): bump @types/node from 26.6.4 to 26.6.5 (#52)
- fix(deps): bump zod from 4.6.5 to 4.6.6 (#54)
- chore(deps-dev): bump source-map-js from 1.2.1 to 1.2.2 (#49)
- chore(deps-dev): bump oxlint from 1.85.0 to 1.87.0 (#44)
- fix(deps): bump fast-xml-parser from 5.11.1 to 5.11.2 (#43)
- fix(deps): bump release-drafter/release-drafter from 7.7.0 to 7.9.0 (#42)
- chore(deps-dev): bump vitest from 5.0.2 to 5.0.3 (#45)
- chore(deps-dev): bump @types/node from 26.6.3 to 26.6.4 (#47)
- chore(deps-dev): bump oxfmt from 0.70.0 to 0.71.0 (#48)
- chore(deps-dev): bump vitest from 5.0.1 to 5.0.3 (#38)
- chore(deps-dev): bump oxfmt from 0.68.0 to 0.70.0 (#39)
- chore(deps-dev): bump oxlint from 1.83.0 to 1.85.0 (#40)
- chore(deps-dev): bump @types/node from 26.6.2 to 26.6.3 (#41)
- chore(deps-dev): bump oxfmt from 0.67.0 to 0.68.0 (#33)
- chore(deps-dev): bump oxlint from 1.82.0 to 1.83.0 (#32)
- chore(deps-dev): bump @vitest/coverage-v8 from 5.0.0 to 5.0.1 (#34)
- chore(deps-dev): bump vitest from 5.0.0 to 5.0.1 (#35)
- chore(deps-dev): bump @types/node from 26.5.1 to 26.6.2 (#36)
- fix(deps): bump zod from 4.6.2 to 4.6.5 (#30)
- chore(deps-dev): bump oxfmt from 0.66.0 to 0.67.0 (#31)

## [0.3.0] - 2026-09-12

## What's Changed

- chore(deps-dev): bump oxfmt from 0.62.0 to 0.63.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/15
- fix(deps): bump fast-xml-parser from 5.10.1 to 5.11.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/14
- chore(deps-dev): bump vitest from 4.1.10 to 4.1.11 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/19
- chore(deps-dev): bump oxlint from 1.78.0 to 1.79.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/18
- chore(deps-dev): bump oxfmt from 0.63.0 to 0.64.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/17
- chore(deps-dev): bump @vitest/coverage-v8 from 4.1.10 to 4.1.11 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/16
- fix(deps): bump zod from 4.4.3 to 4.5.4 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/24
- chore(deps-dev): bump @types/node from 26.2.0 to 26.4.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/23
- fix(deps): bump fast-xml-parser from 5.11.0 to 5.11.1 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/22
- chore(deps-dev): bump oxlint from 1.79.0 to 1.80.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/21
- chore(deps-dev): bump oxfmt from 0.64.0 to 0.65.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/20
- chore(deps-dev): bump vitest from 4.1.11 to 5.0.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/29
- chore(deps-dev): bump @types/node from 26.4.0 to 26.4.1 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/28
- chore(deps-dev): bump oxlint from 1.80.0 to 1.81.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/27
- chore(deps-dev): bump oxfmt from 0.65.0 to 0.66.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/26
- chore(deps-dev): bump @vitest/coverage-v8 from 4.1.11 to 5.0.0 by @dependabot[bot] in https://github.com/localgod/tsaef/pull/25

**Full Changelog**: https://github.com/localgod/tsaef/compare/0.2.0...0.3.0

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
