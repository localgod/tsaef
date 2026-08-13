import { z } from "zod";

export const ArchiMateElementTypes = z.enum([
  // Business Layer
  "BusinessActor",
  "BusinessRole",
  "BusinessCollaboration",
  "BusinessInterface",
  "BusinessProcess",
  "BusinessFunction",
  "BusinessInteraction",
  "BusinessEvent",
  "BusinessService",
  "BusinessObject",
  "Contract",
  "Representation",
  "Product",
  // Application Layer
  "ApplicationComponent",
  "ApplicationCollaboration",
  "ApplicationInterface",
  "ApplicationFunction",
  "ApplicationInteraction",
  "ApplicationProcess",
  "ApplicationEvent",
  "ApplicationService",
  "DataObject",
  // Technology Layer
  "Node",
  "Device",
  "SystemSoftware",
  "TechnologyCollaboration",
  "TechnologyInterface",
  "Path",
  "CommunicationNetwork",
  "TechnologyFunction",
  "TechnologyProcess",
  "TechnologyInteraction",
  "TechnologyEvent",
  "TechnologyService",
  "Artifact",
  // Physical Layer
  "Equipment",
  "Facility",
  "DistributionNetwork",
  "Material",
  // Motivation Layer
  "Stakeholder",
  "Driver",
  "Assessment",
  "Goal",
  "Outcome",
  "Principle",
  "Requirement",
  "Constraint",
  "Meaning",
  "Value",
  // Strategy Layer
  "Resource",
  "Capability",
  "CourseOfAction",
  "ValueStream",
  // Implementation & Migration
  "WorkPackage",
  "Deliverable",
  "ImplementationEvent",
  "Plateau",
  "Gap",
  // Composites
  "Grouping",
  "Location",
  // Junctions
  "AndJunction",
  "OrJunction",
]);

export const ArchiMateRelationshipTypes = z.enum([
  "Composition",
  "Aggregation",
  "Assignment",
  "Realization",
  "Serving",
  "Access",
  "Influence",
  "Triggering",
  "Flow",
  "Specialization",
  "Association",
]);

export const AccessTypes = z.enum(["Access", "Read", "Write", "ReadWrite"]);

export const DataTypes = z.enum(["string", "boolean", "currency", "date", "time", "number"]);

export const ARCHIMATE_NAMESPACE = "http://www.opengroup.org/xsd/archimate/3.0/";
export const XSI_NAMESPACE = "http://www.w3.org/2001/XMLSchema-instance";
export const SCHEMA_LOCATION = `${ARCHIMATE_NAMESPACE} http://www.opengroup.org/xsd/archimate/3.1/archimate3_Diagram.xsd`;

export type ArchiMateElementType = z.infer<typeof ArchiMateElementTypes>;
export type ArchiMateRelationshipType = z.infer<typeof ArchiMateRelationshipTypes>;
export type AccessType = z.infer<typeof AccessTypes>;
export type DataType = z.infer<typeof DataTypes>;
