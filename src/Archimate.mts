import type { Model } from "./interfaces/Model.mjs";
import type { Element } from "./interfaces/Element.mjs";
import type { Relationship } from "./interfaces/Relationship.mjs";
import type { Property } from "./interfaces/Property.mjs";
import type { PropertyDefinition } from "./interfaces/PropertyDefinition.mjs";
import type { View } from "./interfaces/View.mjs";
import {
  ARCHIMATE_NAMESPACE,
  XSI_NAMESPACE,
  SCHEMA_LOCATION,
} from "./constants/archimate-types.mjs";

export class Archimate {
  private model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  static create(name: string, identifier?: string): Archimate {
    const id = identifier ?? Archimate.generateRandomId();
    return new Archimate({
      identifier: id,
      name,
      lang: "en",
      xmlns: ARCHIMATE_NAMESPACE,
      xsiNamespace: XSI_NAMESPACE,
      schemaLocation: SCHEMA_LOCATION,
      elements: [],
      relationships: [],
      propertyDefinitions: [],
      organizations: [],
      views: [],
    });
  }

  // --- Model metadata ---

  getId(): string {
    return this.model.identifier;
  }

  getName(): string {
    return this.model.name;
  }

  // --- Elements ---

  getElements(): Element[] {
    return this.model.elements;
  }

  getElementById(id: string): Element | undefined {
    return this.model.elements.find((e) => e.identifier === id);
  }

  getElementByName(name: string): Element | undefined {
    return this.model.elements.find((e) => e.name === name);
  }

  findElements(name: string, type: string): Element | undefined {
    return this.model.elements.find((e) => e.name === name && e.type === type);
  }

  findElementsByName(name: string): Element[] {
    return this.model.elements.filter((e) => e.name === name);
  }

  findElementsByType(type: string): Element[] {
    return this.model.elements.filter((e) => e.type === type);
  }

  findElementsWithProperty(propertyName: string, propertyValue: string): Element[] {
    const def = this.model.propertyDefinitions.find((d) => d.name === propertyName);
    if (!def) return [];
    return this.model.elements.filter((e) =>
      e.properties?.some((p) => p.definitionRef === def.identifier && p.value === propertyValue),
    );
  }

  upsertElement(name: string, type: string, documentation?: string): Element {
    const existing = this.findElements(name, type);
    if (existing) return existing;
    const element: Element = {
      identifier: this.generateId(),
      type,
      name,
      lang: "en",
      documentation,
    };
    this.model.elements.push(element);
    return element;
  }

  // --- Relationships ---

  getRelationships(): Relationship[] {
    return this.model.relationships;
  }

  getRelationshipById(id: string): Relationship | undefined {
    return this.model.relationships.find((r) => r.identifier === id);
  }

  findRelationshipsForElement(
    id: string,
    direction: "source" | "target" | "both" = "both",
  ): Relationship[] {
    return this.model.relationships.filter((r) => {
      if (direction === "source") return r.source === id;
      if (direction === "target") return r.target === id;
      return r.source === id || r.target === id;
    });
  }

  hasRelationship(source: string, target: string, type: string): boolean {
    return this.model.relationships.some(
      (r) => r.source === source && r.target === target && r.type === type,
    );
  }

  findRelationship(source: string, target: string, type: string): Relationship | undefined {
    return this.model.relationships.find(
      (r) => r.source === source && r.target === target && r.type === type,
    );
  }

  upsertRelationship(source: string, target: string, type: string): Relationship {
    const existing = this.findRelationship(source, target, type);
    if (existing) return existing;
    const relationship: Relationship = {
      identifier: this.generateId(),
      type,
      source,
      target,
    };
    this.model.relationships.push(relationship);
    return relationship;
  }

  // --- Properties ---

  getPropertyDefinitions(): PropertyDefinition[] {
    return this.model.propertyDefinitions;
  }

  addProperty(target: Element | Relationship | View, name: string, value: string): void {
    let def = this.model.propertyDefinitions.find((d) => d.name === name);
    if (!def) {
      def = {
        identifier: Archimate.generateRandomId(),
        type: "string",
        name,
      };
      this.model.propertyDefinitions.push(def);
    }
    if (!target.properties) target.properties = [];
    const existing = target.properties.find((p: Property) => p.definitionRef === def!.identifier);
    if (existing) {
      existing.value = value;
    } else {
      target.properties.push({ definitionRef: def.identifier, value, lang: "en" });
    }
  }

  removeProperty(target: Element | Relationship | View, name: string): void {
    const def = this.model.propertyDefinitions.find((d) => d.name === name);
    if (!def || !target.properties) return;
    target.properties = target.properties.filter(
      (p: Property) => p.definitionRef !== def.identifier,
    );
    if (target.properties.length === 0) delete target.properties;
  }

  getPropertyByName(target: Element | Relationship | View, name: string): Property | undefined {
    const def = this.model.propertyDefinitions.find((d) => d.name === name);
    if (!def || !target.properties) return undefined;
    return target.properties.find((p: Property) => p.definitionRef === def.identifier);
  }

  // --- Views ---

  getViews(): View[] {
    return this.model.views;
  }

  getViewById(id: string): View | undefined {
    return this.model.views.find((v) => v.identifier === id);
  }

  getViewByName(name: string): View | undefined {
    return this.model.views.find((v) => v.name === name);
  }

  // --- Utilities ---

  generateId(): string {
    return Archimate.generateRandomId();
  }

  toObject(): Model {
    return this.model;
  }

  cleanupEmptyProperties(): void {
    const clean = (items: Array<Element | Relationship | View>) => {
      for (const item of items) {
        if (item.properties && item.properties.length === 0) {
          delete item.properties;
        }
      }
    };
    clean(this.model.elements);
    clean(this.model.relationships);
    clean(this.model.views);
  }

  private static generateRandomId(): string {
    const chars = "abcdef0123456789";
    let id = "id-";
    for (let i = 0; i < 32; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }
}
