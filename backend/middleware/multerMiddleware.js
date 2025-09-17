const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/tmp'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedType = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedType.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only .jpg, .jpeg, .png files are allowed"));
    }
});

module.exports = upload;
