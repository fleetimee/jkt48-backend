import fs from 'fs';
import multer from 'multer';
import path from 'path';

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

const storageMessage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user.id;
        const date = new Date();
        const dir = `./static/messages/${userId}/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

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
