const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        const originalName = path.basename(file.originalname, path.extname(file.originalname));
        const fileExt = path.extname(file.originalname).toLowerCase();
        const mimeExt = file.mimetype === 'image/jpeg' ? '.jpg' : file.mimetype === 'image/png' ? '.png' : file.mimetype === 'image/webp' ? '.webp' : file.mimetype === 'image/gif' ? '.gif' : '';
        const extension = fileExt || mimeExt || '.jpg';
        cb(null, `${originalName}-${Date.now()}${extension}`);
    }
});

function checkFileType(file, cb) {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/heic',
        'image/heif',
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];
    const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpg, jpeg, png)'));
    }
}

const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', upload.single('image'), (req, res) => {
    if(!req.file) {
        res.status(400).send('No file uploaded');
    } else {
        const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
        const imageUrl = `${req.protocol}://${req.get('host')}${imagePath}`;
        res.json({ imagePath, imageUrl });
    }
});

module.exports = router;
