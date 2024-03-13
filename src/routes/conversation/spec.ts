/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The primary key for the conversation
 *         idolId:
 *           type: string
 *           maxLength: 10
 *           description: The ID of the idol, referencing the idol's ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the conversation was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the conversation was last updated
 *       required:
 *         - id
 *         - idolId
 *         - createdAt
 *         - updatedAt
 */

/**
 * @swagger
 * /api/conversation:
 *   get:
 *     summary: Retrieve a list of conversations
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: The number of items per page
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: The search query string
 *     responses:
 *       200:
 *         description: Success fetches conversation list
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Conversation object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     orderBy:
 *                       type: string
 *                     orderDirection:
 *                       type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/conversation/{id}:
 *   get:
 *     summary: Retrieve a conversation by its ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The conversation ID
 *     responses:
 *       200:
 *         description: Success fetches conversation
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
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       422:
 *         description: Unprocessable Entity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
