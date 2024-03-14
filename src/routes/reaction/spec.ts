/**
 * @swagger
 * /api/reaction:
 *   get:
 *     tags: [Reaction]
 *     summary: Retrieve all reactions
 *     description: Retrieve all reactions. If there are no reactions, it returns an empty array.
 *     responses:
 *       200:
 *         description: A successful response, returns the reactions data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 */
