/**
 * @swagger
 * /api/xendit-callback:
 *   post:
 *     summary: Updates order status based on Xendit callback
 *     description: Receives a callback from Xendit, updates the order status accordingly and returns a response. If the body is invalid or the status is neither 'PAID' nor 'FAILED', it returns a 400 status code.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ['PAID', 'FAILED']
 *               external_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xendit callback received and processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid body or status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     tags:
 *       - Xendit Callback
 */
