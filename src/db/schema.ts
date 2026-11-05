import { pgTable, serial, text, timestamp, doublePrecision, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', [
  'GENERAL_MANAGER',
  'RECEIVING_OPERATOR',
  'QUALITY_MANAGER',
  'PRODUCTION_SUPERVISOR',
  'WAREHOUSE_OPERATOR',
  'EXPORT_OPERATOR'
]);

export const lotStatusEnum = pgEnum('lot_status', [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'PROCESSING',
  'COMPLETED',
  'SHIPPED'
]);

// Organizations (Tenants)
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Branches
export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  branchId: integer('branch_id').references(() => branches.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Suppliers
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Vessel, Farm, etc.
  riskLevel: text('risk_level').default('LOW'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Lots (Traceability Units)
export const lots = pgTable('lots', {
  id: serial('id').primaryKey(),
  lotId: text('lot_id').notNull().unique(), // KF-PSD-2024-001
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  branchId: integer('branch_id').references(() => branches.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  vesselName: text('vessel_name'),
  sourceType: text('source_type'), // Sea, Farm
  weight: doublePrecision('weight').notNull(),
  temperature: doublePrecision('temperature'),
  status: lotStatusEnum('status').default('PENDING').notNull(),
  qualityPassed: boolean('quality_passed').default(false),
  receivedAt: timestamp('received_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id),
});

// Processing Events
export const processingEvents = pgTable('processing_events', {
  id: serial('id').primaryKey(),
  lotId: integer('lot_id').references(() => lots.id).notNull(),
  type: text('type').notNull(), // Filleting, Cleaning, etc.
  inputWeight: doublePrecision('input_weight').notNull(),
  outputWeight: doublePrecision('output_weight'),
  wasteWeight: doublePrecision('waste_weight'),
  operatorId: integer('operator_id').references(() => users.id),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
});

// Inventory Locations
export const storageLocations = pgTable('storage_locations', {
  id: serial('id').primaryKey(),
  branchId: integer('branch_id').references(() => branches.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Freezer, Chiller
  capacityPercent: integer('capacity_percent').default(0),
  targetTemp: doublePrecision('target_temp'),
});

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  actorId: integer('actor_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  metadata: text('metadata'), // JSON string
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Quality Inspections
export const qualityInspections = pgTable('quality_inspections', {
  id: serial('id').primaryKey(),
  lotId: integer('lot_id').references(() => lots.id).notNull(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  inspectorId: integer('inspector_id').references(() => users.id),
  type: text('type').notNull(), // Sensory, Lab, Weight
  parameter: text('parameter').notNull(), // Odor, Histamine, etc.
  value: text('value'),
  status: text('status').default('PENDING').notNull(), // PENDING, PASS, FAIL
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Shipments
export const shipments = pgTable('shipments', {
  id: serial('id').primaryKey(),
  shipmentNumber: text('shipment_number').notNull().unique(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  customerName: text('customer_name').notNull(),
  destination: text('destination').notNull(),
  portOfLoading: text('port_of_loading').default('Port Said (East)'),
  vesselName: text('vessel_name'),
  status: text('status').default('DRAFT').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Shipment Items (linking lots to shipments)
export const shipmentItems = pgTable('shipment_items', {
  id: serial('id').primaryKey(),
  shipmentId: integer('shipment_id').references(() => shipments.id).notNull(),
  lotId: integer('lot_id').references(() => lots.id).notNull(),
  weight: doublePrecision('weight').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Documents
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  ownerId: integer('owner_id').references(() => users.id),
  name: text('name').notNull(),
  fileType: text('file_type').notNull(),
  storagePath: text('storage_path').notNull(),
  linkedEntityType: text('linked_entity_type'), // Lot, Shipment, etc.
  linkedEntityId: text('linked_entity_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  branches: many(branches),
  users: many(users),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [branches.orgId],
    references: [organizations.id],
  }),
  users: many(users),
  lots: many(lots),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
}));

export const lotsRelations = relations(lots, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [lots.supplierId],
    references: [suppliers.id],
  }),
  processingEvents: many(processingEvents),
  inspections: many(qualityInspections),
}));

export const shipmentsRelations = relations(shipments, ({ many }) => ({
  items: many(shipmentItems),
}));

export const shipmentItemsRelations = relations(shipmentItems, ({ one }) => ({
  shipment: one(shipments, {
    fields: [shipmentItems.shipmentId],
    references: [shipments.id],
  }),
  lot: one(lots, {
    fields: [shipmentItems.lotId],
    references: [lots.id],
  }),
}));
