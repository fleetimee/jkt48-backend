/**
 * @swagger
 * /api/privacy-policy:
 *   get:
 *     summary: Retrieve the privacy policy
 *     tags: [Privacy Policy]
 *     responses:
 *       200:
 *         description: Success fetches privacy policy
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
 *                     type: string
 *                     description: HTML content of the privacy policy
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
