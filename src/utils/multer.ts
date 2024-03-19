import fs from 'fs';
import multer from 'multer';
import path from 'path';

/**
 * Multer disk storage configuration.
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `./static/${req.params.urlParam}`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

/**
 * Multer disk storage configuration for storing messages.
 */
const storageMessage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { conversationId } = req.body;
        const dir = `./static/conversation/${conversationId}`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

/**
 * Multer disk storage configuration for user profile images.
 */
const storageUserProfile = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `./static/profileImages/${req.user.roles}/${req.user.id}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-img-' + req.user.id + path.extname(file.originalname));
    },
});

/**
 * Middleware function for handling file uploads using Multer.
 * @param {Object} req - The Express request object.
 * @param {Object} file - The uploaded file object.
 * @param {Function} callback - The callback function to be called after file validation.
 * @returns {void}
 */
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024, // 500KB
    },
    fileFilter(req, file, callback) {
        console.log(file);

        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Please upload an image file'));
        }
        callback(null, true);
    },
});

/**
 * Middleware function for uploading messages.
 * @remarks
 * This function uses multer to handle file uploads and applies file size and file type restrictions.
 * @returns - The multer middleware function.
 */
export const uploadMessage = multer({
    storage: storageMessage,
    limits: {
        fileSize: 500 * 1024, // 500KB
    },
    fileFilter(req, file, callback) {
        console.log(file);

        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Please upload an image file'));
        }
        callback(null, true);
    },
});

/**
 * Middleware function for uploading user profile images.
 * @param {Object} req - The request object.
 * @param {Object} file - The uploaded file object.
 * @param {Function} callback - The callback function.
 * @returns {void}
 */
export const uploadUserProfile = multer({
    storage: storageUserProfile,
    limits: {
        fileSize: 500 * 1024, // 500KB
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Please upload an image file'));
        }
        callback(null, true);
    },
});
