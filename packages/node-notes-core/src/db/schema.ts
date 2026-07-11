import {
  pgTable,
  text,
  timestamp,
  varchar,
  doublePrecision,
  uuid,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users } from '@profile/auth/schema';

export const nodeNoteDocuments = pgTable('node_note_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 120 }).notNull(),
  viewport: text('viewport'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const nodeNoteNodes = pgTable('node_note_nodes', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id')
    .notNull()
    .references(() => nodeNoteDocuments.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  contentMd: text('content_md').notNull().default(''),
  positionX: doublePrecision('position_x').notNull().default(0),
  positionY: doublePrecision('position_y').notNull().default(0),
  width: doublePrecision('width').notNull().default(280),
  height: doublePrecision('height').notNull().default(160),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const nodeNoteEdges = pgTable(
  'node_note_edges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => nodeNoteDocuments.id, { onDelete: 'cascade' }),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => nodeNoteNodes.id, { onDelete: 'cascade' }),
    targetId: uuid('target_id')
      .notNull()
      .references(() => nodeNoteNodes.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('node_note_edges_doc_source_target_idx').on(
      table.documentId,
      table.sourceId,
      table.targetId,
    ),
    check('node_note_edges_no_self_loop', sql`${table.sourceId} <> ${table.targetId}`),
  ],
);

export const nodeNoteDocumentsRelations = relations(nodeNoteDocuments, ({ many }) => ({
  nodes: many(nodeNoteNodes),
  edges: many(nodeNoteEdges),
}));

export const nodeNoteNodesRelations = relations(nodeNoteNodes, ({ one, many }) => ({
  document: one(nodeNoteDocuments, {
    fields: [nodeNoteNodes.documentId],
    references: [nodeNoteDocuments.id],
  }),
  outgoingEdges: many(nodeNoteEdges, { relationName: 'edgeSource' }),
  incomingEdges: many(nodeNoteEdges, { relationName: 'edgeTarget' }),
}));

export const nodeNoteEdgesRelations = relations(nodeNoteEdges, ({ one }) => ({
  document: one(nodeNoteDocuments, {
    fields: [nodeNoteEdges.documentId],
    references: [nodeNoteDocuments.id],
  }),
  source: one(nodeNoteNodes, {
    fields: [nodeNoteEdges.sourceId],
    references: [nodeNoteNodes.id],
    relationName: 'edgeSource',
  }),
  target: one(nodeNoteNodes, {
    fields: [nodeNoteEdges.targetId],
    references: [nodeNoteNodes.id],
    relationName: 'edgeTarget',
  }),
}));
