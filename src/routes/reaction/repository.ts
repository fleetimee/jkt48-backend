import { eq } from 'drizzle-orm';

import db from '../../db';
import { reaction } from '../../models/message_reaction';
import { NotFoundError } from '../../utils/errors';

/**
 * Retrieves all reactions from the database.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of reaction objects.
 */
export const getReactions = async () => {
    const reactions = await db.select().from(reaction);

    return reactions;
};

/**
 * Retrieves a reaction item from the database by its ID.
 * @param id - The ID of the reaction item to retrieve.
 * @returns A Promise that resolves to the reaction item with the specified ID.
 */
export const getReactionById = async (id: string) => {
    const [reactionItem] = await db.select().from(reaction).where(eq(reaction.id, id)).limit(1);

    if (!reactionItem) {
        throw new NotFoundError('Reaction not found');
    }

    return reactionItem;
};
