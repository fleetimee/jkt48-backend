import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { message } from './message';

export const attachment = pgTable('message_attachment', {
    id: uuid('id').primaryKey().unique().notNull().defaultRandom(),
    messageId: uuid('message_id')
        .notNull()
        .references(() => message.id),
    filePath: text('file_path').notNull(),
    fileType: text('file_type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
