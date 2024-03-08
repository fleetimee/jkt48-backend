import db from '../../db';
import { reaction } from '../../models/message_reaction';

export const getReactions = async () => {
    const reactions = await db.select().from(reaction);

    return reactions;
};
