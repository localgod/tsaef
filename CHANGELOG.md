# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
