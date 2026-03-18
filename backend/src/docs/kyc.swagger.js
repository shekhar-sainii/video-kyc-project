/**
 * @swagger
 * tags:
 *   name: KYC
 *   description: Video KYC APIs
 */

/**
 * @swagger
 * /kyc/submit:
 *   post:
 *     summary: Submit KYC application
 *     tags: [KYC]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - panNumber
 *               - signature
 *               - uploadedPhoto
 *             properties:
 *               panNumber:
 *                 type: string
 *                 example: ABCDE1234F
 *               signature:
 *                 type: string
 *                 description: Base64 encoded signature from signature pad
 *                 example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA
 *               uploadedPhoto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: KYC submitted successfully
 *       400:
 *         description: Invalid PAN format or missing fields
 */


/**
 * @swagger
 * /kyc/applications:
 *   get:
 *     summary: Get all KYC applications
 *     tags: [KYC]
 *     responses:
 *       200:
 *         description: List of submitted KYC applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   applicationId:
 *                     type: string
 *                     example: 665d43c123abc987
 *                   panNumber:
 *                     type: string
 *                     example: ABCD••••3F
 *                   status:
 *                     type: string
 *                     example: Pending
 *                   submittedAt:
 *                     type: string
 *                     example: 2026-03-18T10:20:00Z
 */


/**
 * @swagger
 * /kyc/verify:
 *   post:
 *     summary: Verify KYC via PAN card and selfie
 *     tags: [KYC]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - panCardImage
 *               - selfieImage
 *             properties:
 *               applicationId:
 *                 type: string
 *                 example: 665d43c123abc987
 *               panCardImage:
 *                 type: string
 *                 format: binary
 *               selfieImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Verification completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 faceMatch:
 *                   type: boolean
 *                   example: true
 *                 panMatch:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   example: Verified
 *                 verificationMessage:
 *                   type: string
 *                   example: KYC Verified Successfully
 *       400:
 *         description: Verification failed or missing images
 */