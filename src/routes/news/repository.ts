import { desc, eq, sql } from 'drizzle-orm';
import slugify from 'slugify';

import db from '../../db';
import { news } from '../../models/news';

/**
 * Retrieves a news item from the database based on the provided news ID.
 * @param newsId - The ID of the news item to retrieve.
 * @returns The retrieved news item.
 */
export const getNews = async (newsId: string) => {
    const [newsItem] = await db.select().from(news).where(eq(news.id, newsId)).limit(1);

    return newsItem;
};

/**
 * Retrieves a list of news articles.
 * @param orderBy - The column to order the news articles by. Must be one of: 'created_at', 'updated_at', 'title', 'body'.
 * @param orderDirection - The direction to order the news articles. Must be either 'ASC' or 'DESC'.
 * @param limit - The maximum number of news articles to retrieve.
 * @param offset - The number of news articles to skip before starting to retrieve.
 * @returns A promise that resolves to an array of news articles.
 * @throws An error if the orderBy parameter is not a valid column.
 */
export const getNewsList = async (
    userId: string,
    orderBy: string,
    orderDirection: string,
    limit: number,
    offset: number,
) => {
    const validColumns = ['created_at', 'updated_at', 'title', 'body'];
    if (!validColumns.includes(orderBy)) {
        throw new Error('Invalid order by column');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let newsList = [] as any[];

    await db.transaction(async trx => {
        newsList = await trx.execute(
            sql.raw(`SELECT * FROM news ORDER BY ${orderBy} ${orderDirection} LIMIT ${limit} OFFSET ${offset}`),
        );

        await trx.execute(
            sql.raw(
                `INSERT INTO users_news (user_id, last_read_at)
                VALUES ('${userId}', NOW())
                ON CONFLICT (user_id) 
                DO UPDATE SET last_read_at = NOW()`,
            ),
        );
    });

    return newsList;
};

/**
 * Retrieves a news item by its slug.
 * @param slug - The slug of the news item.
 * @returns The news item matching the provided slug.
 */
export const getNewsBySlug = async (slug: string) => {
    const [newsItem] = await db.select().from(news).where(eq(news.slug, slug)).limit(1);

    return newsItem;
};

/**
 * Retrieves the latest news from the database.
 * @returns {Promise<object>} The latest news object.
 */
export const getLatestNews = async () => {
    const [latestNews] = await db.select().from(news).orderBy(desc(news.createdAt)).limit(1);

    return latestNews;
};

/**
 * Creates a new news entry in the database.
 * @param title - The title of the news.
 * @param body - The body/content of the news.
 * @param userId - The ID of the user who created the news.
 * @param image - The image associated with the news.
 * @param slug - The slug for the news URL.
 * @param createdAt - The date and time when the news was created.
 * @param updatedAt - The date and time when the news was last updated.
 * @returns A promise that resolves to the newly created news entry.
 */
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

/**
 * Updates a news item in the database.
 * @param title - The new title of the news item.
 * @param body - The new body of the news item.
 * @param newsId - The ID of the news item to update.
 * @returns The updated news item.
 */
export const updateNews = async (title: string, body: string, image: string, newsId: string) => {
    // Update date of the news
    const currentDate = new Date();
    const sluggify = slugify(title, {
        lower: true,
    });

    const [newsItem] = await db
        .update(news)
        .set({ title, body, image, updatedAt: currentDate, slug: sluggify })
        .where(eq(news.id, newsId))
        .returning();

    return newsItem;
};

/**
 * Deletes a news item from the database.
 * @param {string} newsId - The ID of the news item to delete.
 * @returns {Promise<void>} - A promise that resolves when the news item is deleted.
 */
export const deleteNews = async (newsId: string) => {
    await db.delete(news).where(eq(news.id, newsId));
};
