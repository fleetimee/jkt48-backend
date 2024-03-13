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
