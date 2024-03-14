/**
 * @swagger
 * /api/top-idol:
 *   get:
 *     summary: Fetches the top idol
 *     description: Returns the top idol if exists, otherwise returns a 404 status code.
 *     responses:
 *       200:
 *         description: Success fetch top idol
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Idol'
 *       404:
 *         description: No top idol found
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
 *                   type: array
 *                   items: {}
 *     tags:
 *      - Top Idol
 *
 */
