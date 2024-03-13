/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The primary key for the message
 *         conversationId:
 *           type: string
 *           format: uuid
 *           description: The ID of the conversation, referencing the conversation's ID
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user, referencing the user's ID
 *         message:
 *           type: string
 *           description: The text of the message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the message was last updated
 *         isApproved:
 *           type: boolean
 *           description: Whether the message is approved or not
 *       required:
 *         - id
 *         - conversationId
 *         - userId
 *         - message
 *         - createdAt
 *         - updatedAt
 *         - isApproved
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateMessage:
 *       type: object
 *       properties:
 *         conversationId:
 *           type: string
 *           minLength: 1
 *           description: Conversation ID cannot be empty
 *         messages:
 *           type: string
 *           minLength: 1
 *           description: Message cannot be empty
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               file_path:
 *                 type: string
 *                 minLength: 1
 *                 description: Please enter a file path
 *               file_type:
 *                 type: string
 *                 minLength: 1
 *                 description: Please enter a file type
 *               file_size:
 *                 type: number
 *                 minimum: 1
 *                 description: Please enter a file size
 *               checksum:
 *                 type: string
 *                 minLength: 1
 *                 description: Please enter a checksum
 *           nullable: true
 *       required:
 *         - conversationId
 *         - messages
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ApproveOrRejectMessage:
 *       type: object
 *       properties:
 *         isApproved:
 *           type: boolean
 *           description: Approval status of the message
 *       required:
 *         - isApproved
 */

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Retrieve a message by its ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The message ID
 *     responses:
 *       200:
 *         description: Success fetches message
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
 *                   $ref: '#/components/schemas/Message'
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

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Create a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessage'
 *     responses:
 *       200:
 *         description: Message created
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
 *                   type: object
 *                   properties:
 *                     sendMessage:
 *                       $ref: '#/components/schemas/Message'
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
