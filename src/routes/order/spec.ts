/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - packageId
 *         - subtotal
 *         - tax
 *         - total
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the order
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The id of the user who made the order
 *         packageId:
 *           type: string
 *           format: uuid
 *           description: The id of the package
 *         paymentMethod:
 *           type: string
 *           enum: [xendit, midtrans, gopay, ovo, dana, google_pay, apple_pay]
 *           description: The payment method used for the order
 *         subtotal:
 *           type: number
 *           format: float
 *           description: The subtotal of the order
 *         tax:
 *           type: number
 *           format: float
 *           description: The tax of the order
 *         total:
 *           type: number
 *           format: float
 *           description: The total of the order
 *         orderStatus:
 *           type: string
 *           enum: [pending, success, failed]
 *           description: The status of the order
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time the order was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time the order was last updated
 *         expiredAt:
 *           type: string
 *           format: date-time
 *           description: The time the order will expire
 *         callbackData:
 *           type: object
 *           description: The callback data of the order
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrder:
 *       type: object
 *       required:
 *         - packageId
 *         - paymentMethod
 *         - subtotal
 *         - tax
 *         - total
 *       properties:
 *         packageId:
 *           type: string
 *           description: The id of the package
 *           minLength: 1
 *         paymentMethod:
 *           type: string
 *           enum: [xendit, midtrans, gopay, ovo, dana, google_pay, apple_pay]
 *           description: The payment method used for the order
 *         subtotal:
 *           type: number
 *           description: The subtotal of the order
 *           minimum: 1
 *         tax:
 *           type: number
 *           description: The tax of the order
 *           minimum: 1
 *         total:
 *           type: number
 *           description: The total of the order
 *           minimum: 1
 *         idolIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The ids of the idols
 */

/**
 * @swagger
 * /api/order/{orderId}:
 *   get:
 *     security:
 *      - bearerAuth: []
 *     tags: [Order]
 *     summary: Retrieve an order by its ID
 *     description: Retrieve an order by its ID. If the order does not exist, it returns a 404 error.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: A successful response, returns the order data
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
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /order/inquiry/{orderId}:
 *   get:
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     summary: Retrieve an inquiry order by its ID
 *     description: Retrieve an inquiry order by its ID. If the order does not exist, it returns a 404 error.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The inquiry order ID
 *     responses:
 *       200:
 *         description: A successful response, returns the inquiry order data
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
 *                   $ref: '#/components/schemas/InquiryOrder'
 *       404:
 *         description: Inquiry order not found
 */

/**
 * @swagger
 * /api/order/inquiry/{orderId}/idol:
 *   get:
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     summary: Retrieve an inquiry order list of idols by its ID
 *     description: Retrieve an inquiry order list of idols by its ID. If the order does not exist, it returns a 404 error.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The inquiry order ID
 *     responses:
 *       200:
 *         description: A successful response, returns the inquiry order data
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
 *                   $ref: '#/components/schemas/InquiryOrderListIdol'
 *       404:
 *         description: Inquiry order not found
 */

/**
 * @swagger
 * /api/order:
 *   post:
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     summary: Create a new order
 *     description: Create a new order. If the user already has an active subscription, it returns a 404 error.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *     responses:
 *       200:
 *         description: A successful response, returns the created order data
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
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: User already have an active subscription
 */
