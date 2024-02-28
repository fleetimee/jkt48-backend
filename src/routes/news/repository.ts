import { desc, eq, sql } from 'drizzle-orm';

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

export const getNewsBySlug = async (slug: string) => {
    const [newsItem] = await db.select().from(news).where(eq(news.slug, slug)).limit(1);

    return newsItem;
};

export const getLatestNews = async () => {
    const [latestNews] = await db.select().from(news).orderBy(desc(news.createdAt)).limit(1);

    return latestNews;
};

export const createNews = async (
    title: string,
    body: string,
    userId: string,
    image: string,
    slug: string,
    createdAt: Date,
    updatedAt: Date,
) => {
    return await db.insert(news).values({ title, body, userId, image, slug, createdAt, updatedAt }).returning();
};
