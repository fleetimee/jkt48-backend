/**
 * @swagger
 * components:
 *   schemas:
 *     CreateIdol:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *         - nickname
 *         - birthday
 *         - height
 *         - bloodType
 *         - horoscope
 *         - xUrl
 *         - instagramUrl
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The idol's email
 *         password:
 *           type: string
 *           description: The idol's password
 *           minLength: 8
 *         fullName:
 *           type: string
 *           description: The idol's full name
 *           minLength: 1
 *         nickname:
 *           type: string
 *           description: The idol's nickname
 *           minLength: 1
 *         birthday:
 *           type: string
 *           format: date
 *           description: The idol's birthday
 *         height:
 *           type: number
 *           description: The idol's height
 *         bloodType:
 *           type: string
 *           description: The idol's blood type
 *         horoscope:
 *           type: string
 *           description: The idol's horoscope
 *         xUrl:
 *           type: string
 *           description: The idol's xUrl
 *         instagramUrl:
 *           type: string
 *           description: The idol's Instagram URL
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateIdol:
 *       type: object
 *       required:
 *         - email
 *         - fullName
 *         - nickName
 *         - birthday
 *         - height
 *         - bloodType
 *         - horoscope
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The idol's email
 *         fullName:
 *           type: string
 *           description: The idol's full name
 *           minLength: 1
 *         nickName:
 *           type: string
 *           description: The idol's nickname
 *           minLength: 1
 *         birthday:
 *           type: string
 *           format: date
 *           description: The idol's birthday
 *         height:
 *           type: number
 *           description: The idol's height
 *         bloodType:
 *           type: string
 *           description: The idol's blood type
 *         horoscope:
 *           type: string
 *           description: The idol's horoscope
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Idol:
 *       type: object
 *       required:
 *         - id
 *         - givenName
 *         - familyName
 *         - horoscope
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The idol's ID
 *           maxLength: 10
 *         bio:
 *           type: string
 *           description: The idol's bio
 *         givenName:
 *           type: string
 *           description: The idol's given name
 *         familyName:
 *           type: string
 *           description: The idol's family name
 *         horoscope:
 *           type: string
 *           description: The idol's horoscope
 *         height:
 *           type: string
 *           description: The idol's height
 *         bloodType:
 *           type: string
 *           description: The idol's blood type
 *         instagramUrl:
 *           type: string
 *           description: The idol's Instagram URL
 *         xUrl:
 *           type: string
 *           description: The idol's xUrl
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user who created the idol
 */

/**
 * @swagger
 * /api/idol:
 *   get:
 *     summary: Retrieve a list of idols
 *     tags: [Idols]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to return
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: The number of idols to return per page
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: The field to order the idols by
 *       - in: query
 *         name: orderDirection
 *         schema:
 *           type: string
 *         description: The direction to sort the idols
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: The search query to filter idols
 *     responses:
 *       200:
 *         description: Success fetches idol list
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
 *                     $ref: '#/components/schemas/Idol'
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
 * /api/idol/{id}:
 *   get:
 *     summary: Retrieve a member by its ID
 *     tags: [Idols]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The member ID
 *     responses:
 *       200:
 *         description: Success fetches member
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
 *                   $ref: '#/components/schemas/Idol'
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 * /api/idol:
 *   post:
 *     summary: Create a new member
 *     tags: [Idols]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIdol'
 *     responses:
 *       201:
 *         description: Success create new member
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
 *                   $ref: '#/components/schemas/Idol'
 *       422:
 *         description: Unprocessable Entity (Email is already registered)
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
 * /api/idol/{userId}:
 *   patch:
 *     summary: Update a member by its ID
 *     tags: [Idols]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The member's user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIdol'
 *     responses:
 *       200:
 *         description: Success update member
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
 *                   $ref: '#/components/schemas/Idol'
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       422:
 *         description: Unprocessable Entity (User id is not valid)
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
 * /api/idol/{userId}:
 *   delete:
 *     summary: Delete a member by its ID
 *     tags: [Idols]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The member's user ID
 *     responses:
 *       200:
 *         description: Success delete member
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
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       422:
 *         description: Unprocessable Entity (User id is not valid)
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
