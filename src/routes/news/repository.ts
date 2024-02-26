import { eq, sql } from 'drizzle-orm';

import db from '../../db';
import { news } from '../../models/news';

export const getNews = async (newsId: string) => {
    const [newsItem] = await db.select().from(news).where(eq(news.id, newsId)).limit(1);

    return newsItem;
};

export const getNewsList = async (orderBy: string, orderDirection: string, limit: number, offset: number) => {
    const validColumns = ['created_at', 'updated_at', 'title', 'body'];
    if (!validColumns.includes(orderBy)) {
        throw new Error('Invalid order by column');
    }

    const newsList = await db.execute(
        sql.raw(`SELECT * FROM news ORDER BY ${orderBy} ${orderDirection} LIMIT ${limit} OFFSET ${offset}`),
    );

    return newsList;
};
