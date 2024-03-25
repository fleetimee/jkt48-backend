import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const usersNews = pgTable('users_news', {
    user_id: uuid('user_id')
        .notNull()
        .references(() => users.id),
    last_read_at: timestamp('last_read_at'),
});
