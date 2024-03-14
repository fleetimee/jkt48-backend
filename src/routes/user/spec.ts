/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         nickName:
 *           type: string
 *           description: The nickname of the user
 *         profileImage:
 *           type: string
 *           description: The profile image of the user
 *         birthday:
 *           type: string
 *           format: date-time
 *           description: The birthday of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         emailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         emailVerifiedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user's email was verified
 *         passwordHash:
 *           type: string
 *           description: The hashed password of the user
 *         fcmId:
 *           type: string
 *           description: The Firebase Cloud Messaging ID of the user
 *         verificationToken:
 *           type: string
 *           description: The verification token of the user
 *         roles:
 *           type: string
 *           description: The roles of the user
 *         tokenResetPassword:
 *           type: string
 *           description: The reset password token of the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user was last updated
 *       required:
 *         - id
 *         - name
 *         - email
 *         - emailVerified
 *         - passwordHash
 *         - roles
 *         - createdAt
 *         - updatedAt
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user. Must be a valid email.
 *         nickName:
 *           type: string
 *           description: The nickname of the user. Must be at least 1 character.
 *         name:
 *           type: string
 *           description: The name of the user. Must be at least 1 character.
 *         birthday:
 *           type: string
 *           format: date-time
 *           description: The birthday of the user. This is optional.
 *         profileImage:
 *           type: string
 *           description: The profile image of the user. This is optional.
 *       required:
 *         - email
 *         - nickName
 *         - name
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PostReaction:
 *       type: object
 *       properties:
 *         body:
 *           type: object
 *           properties:
 *             reactionId:
 *               type: string
 *               format: uuid
 *               description: The ID of the reaction. Must be a valid UUID.
 *       required:
 *         - body
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Fetches the authenticated user
 *     description: Returns the authenticated user if exists, otherwise returns a 404 status code.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success fetch authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/checkSubscription:
 *   get:
 *     summary: Checks the subscription status of the authenticated user
 *     description: Returns the subscription status of the authenticated user if exists, otherwise returns a 404 status code.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: The subscription status of the user
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User or Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/cancelSubscription:
 *   get:
 *     summary: Cancels the subscription of the authenticated user
 *     description: Cancels the subscription of the authenticated user if exists, otherwise returns a 404 status code.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription canceled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: The canceled subscription
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User or Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/transactionList:
 *   get:
 *     summary: Fetches the transaction list of the authenticated user
 *     description: Returns the transaction list of the authenticated user if exists, otherwise returns a 404 status code.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User transaction list fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: The transaction details
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/transactionDetail/{orderId}:
 *   get:
 *     summary: Fetches the transaction detail of a specific order for the authenticated user
 *     description: Returns the transaction detail of a specific order for the authenticated user if exists, otherwise returns a 404 status code.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order
 *     responses:
 *       200:
 *         description: User transaction detail fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   description: The transaction detail
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User, Order or Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/conversationList:
 *   get:
 *     summary: Fetches the conversation list of the authenticated user
 *     description: Returns the conversation list of the authenticated user if exists, otherwise returns a 404 status code.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User conversation list fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: The conversation details
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/conversation/{conversationId}:
 *   get:
 *     summary: Fetches the conversation of a specific ID for the authenticated user
 *     description: Returns the conversation of a specific ID for the authenticated user if exists, otherwise returns a 404 status code.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the conversation
 *     responses:
 *       200:
 *         description: User conversation fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: The conversation details
 *                 success:
 *                   type: boolean
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
 *       404:
 *         description: User or Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/reactMessage/{messageId}:
 *   post:
 *     summary: Posts a reaction to a message for the authenticated user
 *     description: Posts a reaction to a message for the authenticated user if the message and reaction exist, otherwise returns an error.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the message
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reactionId:
 *                 type: string
 *                 description: The ID of the reaction
 *             required:
 *               - reactionId
 *     responses:
 *       200:
 *         description: Reaction posted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: 'null'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /api/user/me/unReactMessage/{messageId}/reaction/{reactionId}:
 *   delete:
 *     summary: Removes a reaction to a message for the authenticated user
 *     description: Removes a reaction to a message for the authenticated user if the message and reaction exist, otherwise returns an error.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the message
 *       - in: path
 *         name: reactionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the reaction
 *     responses:
 *       200:
 *         description: Reaction removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: 'null'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */

/**
 * @swagger
 * /ap/user/me:
 *   patch:
 *     summary: Updates the authenticated user's details
 *     description: Updates the authenticated user's details if the user exists and the request body is valid, otherwise returns an error.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User details updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - User (Me)
 */
