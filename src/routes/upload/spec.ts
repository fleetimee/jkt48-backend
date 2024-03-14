/**
 * @swagger
 * /api/upload/{urlParam}:
 *   post:
 *     summary: Uploads a file to a specific URL parameter
 *     description: Uploads a file to either the 'news' or 'profile' URL parameter if the file exists and is within the size limit, otherwise returns an error.
 *     parameters:
 *       - in: path
 *         name: urlParam
 *         schema:
 *           type: string
 *           enum: [news, profile]
 *         required: true
 *         description: The URL parameter to which the file is uploaded
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                   properties:
 *                     url:
 *                       type: string
 *                 success:
 *                   type: boolean
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       403:
 *         description: File size exceeds the limit
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     tags:
 *       - File Upload
 */
