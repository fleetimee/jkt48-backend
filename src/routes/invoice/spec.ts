/**
 * @swagger
 * /api/invoice:
 *   get:
 *     summary: Retrieve a list of invoices
 *     tags: [Invoices]
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
