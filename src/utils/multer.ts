import fs from 'fs';
import multer from 'multer';
import path from 'path';

import { getConversationIdByIdolId } from '../routes/conversation/repository';
import { getMemberIdByUserId } from '../routes/idol/repository';

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
    destination: async (req, file, cb) => {
        const userId = req.user.id;
        const idolId = await getMemberIdByUserId(userId);
        const conversation = await getConversationIdByIdolId(idolId.idol_id as string);
        const dir = `./static/conversation/${conversation.id}`;

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
 * Multer disk storage destination to tmp.
 */
const storageUserProfileMember = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = `./static/profileImages/tmp/`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
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
        fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter(req, file, callback) {
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
        fileSize: 500 * 1024 * 1024, // 500MB
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
        fileSize: 100 * 1024 * 1024, // 100MB
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Please upload an image file'));
        }
        callback(null, true);
    },
});

/**
 * Middleware for uploading user profile member images.
 */
export const uploadUserProfileMember = multer({
    storage: storageUserProfileMember,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
    /**
     * File filter function to check if the uploaded file is an image.
     * @param req - The HTTP request object.
     * @param file - The uploaded file object.
     * @param callback - The callback function to handle the file filter result.
     */
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new Error('Please upload an image file'));
        }
        callback(null, true);
    },
});
