/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
 *       type: object
 *       properties:
 *         idOrder:
 *           type: string
 *           minLength: 1
 *           description: External ID must be at least 1 character long
 *         amount:
 *           type: number
 *           minimum: 1
 *           description: Amount must be at least 1
 *         currency:
 *           type: string
 *           minLength: 1
 *           description: Currency must be at least 1 character long
 *         description:
 *           type: string
 *           minLength: 1
 *           description: Description must be at least 1 character long
 *         customer:
 *           type: object
 *           properties:
 *             givename:
 *               type: string
 *             surname:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *             mobile_number:
 *               type: string
 *         customerNotificationPreferences:
 *           type: object
 *           properties:
 *             invoicePaid:
 *               type: array
 *               items:
 *                 type: string
 *         successRedirectUrl:
 *           type: string
 *           format: uri
 *         failureRedirectUrl:
 *           type: string
 *           format: uri
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               quantity:
 *                 type: number
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *         fees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               value:
 *                 type: number
 */

/**
 * @swagger
 * /api/invoice:
 *   get:
 *     summary: Retrieve a list of invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success fetches invoices
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
 *                     properties:
 *                       id:
 *                         type: string
 *                       externalId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       payerEmail:
 *                         type: string
 *                       description:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       status:
 *                         type: string
 *                       merchantName:
 *                         type: string
 *                       merchantProfilePictureUrl:
 *                         type: string
 *                       amount:
 *                         type: integer
 *                       expiryDate:
 *                         type: string
 *                         format: date-time
 *                       invoiceUrl:
 *                         type: string
 *                       availableBanks:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             bankCode:
 *                               type: string
 *                             collectionType:
 *                               type: string
 *                             bankBranch:
 *                               type: string
 *                             accountHolderName:
 *                               type: string
 *                             transferAmount:
 *                               type: integer
 *                       availableRetailOutlets:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             retailOutletName:
 *                               type: string
 *                       availableEwallets:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             ewalletType:
 *                               type: string
 *                       availableQrCodes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             qrCodeType:
 *                               type: string
 *                       availableDirectDebits:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             directDebitType:
 *                               type: string
 *                       availablePaylaters:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             paylaterType:
 *                               type: string
 *                       shouldExcludeCreditCard:
 *                         type: boolean
 *                       shouldSendEmail:
 *                         type: boolean
 *                       created:
 *                         type: string
 *                         format: date-time
 *                       updated:
 *                         type: string
 *                         format: date-time
 *                       currency:
 *                         type: string
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                             price:
 *                               type: integer
 *                             quantity:
 *                               type: integer
 *                             category:
 *                               type: string
 *                       customer:
 *                         type: object
 *                         properties:
 *                           givenNames:
 *                             type: string
 *                           email:
 *                             type: string
 *                           customerId:
 *                             type: string
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
 * /api/invoice/{invoiceId}:
 *   get:
 *     summary: Retrieve an invoice by its ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The invoice ID
 *     responses:
 *       200:
 *         description: Success fetches invoice
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
 *                     id:
 *                       type: string
 *                     externalId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     payerEmail:
 *                       type: string
 *                     description:
 *                       type: string
 *                     paymentMethod:
 *                       type: string
 *                     status:
 *                       type: string
 *                     merchantName:
 *                       type: string
 *                     merchantProfilePictureUrl:
 *                       type: string
 *                     amount:
 *                       type: integer
 *                     expiryDate:
 *                       type: string
 *                       format: date-time
 *                     invoiceUrl:
 *                       type: string
 *                     availableBanks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bankCode:
 *                             type: string
 *                           collectionType:
 *                             type: string
 *                           bankBranch:
 *                             type: string
 *                           accountHolderName:
 *                             type: string
 *                           transferAmount:
 *                             type: integer
 *                     availableRetailOutlets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           retailOutletName:
 *                             type: string
 *                     availableEwallets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ewalletType:
 *                             type: string
 *                     availableQrCodes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           qrCodeType:
 *                             type: string
 *                     availableDirectDebits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           directDebitType:
 *                             type: string
 *                     availablePaylaters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           paylaterType:
 *                             type: string
 *                     shouldExcludeCreditCard:
 *                       type: boolean
 *                     shouldSendEmail:
 *                       type: boolean
 *                     created:
 *                       type: string
 *                       format: date-time
 *                     updated:
 *                       type: string
 *                       format: date-time
 *                     currency:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           category:
 *                             type: string
 *                     customer:
 *                       type: object
 *                       properties:
 *                         givenNames:
 *                           type: string
 *                         email:
 *                           type: string
 *                         customerId:
 *                           type: string
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
 * /api/invoice:
 *   post:
 *     summary: Create an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idOrder:
 *                 type: string
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice created
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
 *                     externalId:
 *                       type: string
 *                     payerEmail:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     description:
 *                       type: string
 *                     customer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         customerId:
 *                           type: string
 *                         givenNames:
 *                           type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: integer
 *                           category:
 *                             type: string
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
