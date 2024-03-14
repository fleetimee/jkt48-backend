/**
 * @swagger
 * /api/terms:
 *   get:
 *     summary: Retrieve the terms of service
 *     tags: [Terms of Service]
 *     description: Retrieve the terms of service. If there are no terms, it returns an empty array.
 *     responses:
 *       200:
 *         description: A successful response, returns the terms of service data
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
 */
