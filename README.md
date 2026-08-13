# tsaef

[![npm version](https://img.shields.io/npm/v/tsaef)](https://www.npmjs.com/package/tsaef)
[![npm downloads](https://img.shields.io/npm/dm/tsaef)](https://www.npmjs.com/package/tsaef)

TypeScript library for reading, writing, and manipulating **ArchiMate Exchange Format** (AEF) models.

The [ArchiMate Exchange Format](https://www.opengroup.org/xsd/archimate/) is the Open Group's standard XML interchange format, supported by all major ArchiMate tools (Archi, BiZZdesign, Sparx EA, etc.). This is distinct from Archi's proprietary `.archimate` format — for that, see [tsarchi](https://github.com/localgod/tsarchi).

## Install

```bash
npm install tsaef
```

## Quick start

```typescript
import { TsAEF, Archimate, Serializer } from "tsaef";

// Load an existing AEF model from disk
const tsaef = new TsAEF();
const model = await tsaef.load("model.xml");

// Read elements
console.log(model.getElements());

// Add an element
const app = model.upsertElement(
  "Order Service",
  "ApplicationComponent",
  "Handles order processing",
);

// Add a property
model.addProperty(app, "vendor", "Acme Corp");

// Add a relationship
const cap = model.upsertElement("Order Management", "Capability");
model.upsertRelationship(app.identifier, cap.identifier, "Realization");

// Save back to disk
await tsaef.save("model-updated.xml", model);
```

## Create a model from scratch

```typescript
import { Archimate, Serializer } from "tsaef";

const model = Archimate.create("My Architecture");
const app = model.upsertElement("Payments Service", "ApplicationComponent");
model.addProperty(app, "status", "Active");

const xml = Serializer.serialize(model);
```

## Validate a model

```typescript
import { Validator } from "tsaef";

const validator = new Validator();
const result = validator.validate(model, {
  checkReferences: true,
  validateNamespaces: true,
  strict: false,
});

if (!result.success) {
  console.error(result.errors);
}
```

## API

### `TsAEF`

Facade for file I/O.

| Method              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `load(path)`        | Parse an AEF XML file and return an `Archimate` instance |
| `save(path, model)` | Serialize and write an `Archimate` instance to disk      |

### `Archimate`

Core domain class. All mutations happen directly on the returned objects.

**Static**

- `Archimate.create(name, identifier?)` — create an empty model

**Model metadata**

- `getId()`, `getName()`

**Elements**

- `getElements()`, `getElementById(id)`, `getElementByName(name)`
- `findElements(name, type)`, `findElementsByName(name)`, `findElementsByType(type)`
- `findElementsWithProperty(propertyName, propertyValue)`
- `upsertElement(name, type, documentation?)` — insert or return existing

**Relationships**

- `getRelationships()`, `getRelationshipById(id)`
- `findRelationshipsForElement(id, direction?)` — `'source' | 'target' | 'both'`
- `hasRelationship(source, target, type)`, `findRelationship(source, target, type)`
- `upsertRelationship(source, target, type)` — insert or return existing

**Properties**

- `getPropertyDefinitions()`
- `addProperty(target, name, value)` — auto-creates the property definition if needed
- `removeProperty(target, name)`
- `getPropertyByName(target, name)`

**Views** _(read-only — layout is managed by modelling tools)_

- `getViews()`, `getViewById(id)`, `getViewByName(name)`

**Utilities**

- `generateId()` — generate a random AEF-compatible identifier
- `toObject()` — return the underlying plain `Model` object
- `cleanupEmptyProperties()` — remove empty property arrays (called automatically by `Serializer`)

### `Parser`

- `Parser.parse(xml: string): Archimate` — parse an AEF XML string

### `Serializer`

- `Serializer.serialize(model: Archimate): string` — produce a valid AEF XML string

### `Validator`

- `validator.validate(model, options?)` — returns `{ success, errors, warnings }`

Options: `checkReferences` (default `true`), `validateNamespaces`, `strict`

### Error types

Errors thrown by this library are typed so callers can discriminate them:

```typescript
import { ParseError, IOError } from "tsaef";

try {
  const model = await tsaef.load("model.xml");
} catch (e) {
  if (e instanceof IOError) { /* file not found, permission denied, etc. */ }
  if (e instanceof ParseError) { /* malformed XML */ }
}
```

`ValidationError` is also exported for callers who want to throw on a failed `validate()` result.

### `PropertyFormatter`

Extensible value formatter for use when populating properties programmatically.

```typescript
import { PropertyFormatter } from "tsaef";

PropertyFormatter.format("hello world", { type: "string", options: { cleanup: true } });
PropertyFormatter.format("2024-01-01", { type: "date", options: { dateFormat: "yyyy-mm-dd" } });
PropertyFormatter.format("true", {
  type: "boolean",
  options: { trueValue: "Yes", falseValue: "No" },
});

// Register a custom formatter
PropertyFormatter.registerFormatter("myFormatter", (value) => String(value).toUpperCase());
```

## AEF element types

All ArchiMate 3.1 element and relationship types are exported as Zod enums with TypeScript types:

```typescript
import { ArchiMateElementTypes, ArchiMateRelationshipTypes } from "tsaef";
import type { ArchiMateElementType, ArchiMateRelationshipType } from "tsaef";
```

## Requirements

Node.js 18 or later.

## License

ISC
