import { bigint, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { message } from './message';

export const attachment = pgTable('message_attachment', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    messageId: uuid('message_id')
        .notNull()
        .references(() => message.id, {
            onDelete: 'cascade',
        }),
    filePath: text('file_path').notNull(),
    fileType: text('file_type').notNull(),
    fileSize: bigint('file_size', { mode: 'number' }).default(0),
    checksum: varchar('checksum', {
        length: 64,
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
