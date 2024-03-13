/**
 * @swagger
 * components:
 *   schemas:
 *     Package:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - totalMembers
 *         - price
 *         - isActive
 *         - createdAt
 *         - updatedAt
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the package
 *         name:
 *           type: string
 *           description: The name of the package
 *         description:
 *           type: string
 *           description: The description of the package
 *         totalMembers:
 *           type: number
 *           format: float
 *           description: The total number of members in the package
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the package
 *         isActive:
 *           type: boolean
 *           description: Whether the package is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the package was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the package was updated
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The id of the user who created the package
 *       example:
 *         id: "d5fE_asz"
 *         name: "Premium Package"
 *         description: "This is a premium package"
 *         totalMembers: 100
 *         price: 99.99
 *         isActive: true
 *         createdAt: "2022-01-01T00:00:00Z"
 *         updatedAt: "2022-01-01T00:00:00Z"
 *         userId: "a1b2c3d4"
 */

/**
 * @swagger
 * /api/package:
 *   get:
 *     summary: Retrieve a list of packages
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success fetches package list
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
 *                     $ref: '#/components/schemas/Package'
 *               example:
 *                 success: true
 *                 code: 200
 *                 message: "Success fetches package list"
 *                 data: []
 *       401:
 *         description: Authorization information is missing or invalid or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Token expired"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Internal Server Error"
 */

/**
 * @swagger
 * /api/package/{id}:
 *   get:
 *     summary: Retrieve a package by its ID
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The package ID
 *     responses:
 *       200:
 *         description: Success fetches package item
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
 *                     $ref: '#/components/schemas/Package'
 *               example:
 *                 success: true
 *                 code: 200
 *                 message: "Success fetches package item"
 *                 data: []
 *       401:
 *         description: Authorization information is missing or invalid or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Token expired"
 *       404:
 *         description: The package could not be found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Package not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Internal Server Error"
 */

/**
 * @swagger
 * /api/package/{id}:
 *   patch:
 *     summary: Update a package by its ID
 *     tags: [Packages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               totalMembers:
 *                 type: string
 *               price:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *           example:
 *             name: "New Package Name"
 *             description: "New Package Description"
 *             totalMembers: "100"
 *             price: "1000"
 *             isActive: true
 *             updatedAt: "2022-01-01T00:00:00Z"
 *     responses:
 *       200:
 *         description: The updated package data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       401:
 *         description: Authorization information is missing or invalid or token expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               example:
 *                 error: "Token expired"
 *       403:
 *         description: Forbidden, requires admin role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Requires admin role"
 *       404:
 *         description: The package could not be found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Package not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Internal Server Error"
 */
