// Import multer for handling file uploads and path for working with file paths
const multer = require('multer');
const path = require('path');

// Configure storage settings for uploaded files
const storage = multer.diskStorage({
    // Set the destination folder where files will be stored
    destination: function (req, file, cb) {
        // Store in ../public/tmp folder (relative to this file)
        cb(null, path.join(__dirname, '../public/tmp'));
    },

    // Set the filename format for uploaded files
    filename: function (req, file, cb) {
        // Example filename: 1699372929123-originalname.png
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Create multer upload middleware with limits & file filter
const upload = multer({
    storage, // use the custom storage config

    // Limit file size to 5MB
    limits: { fileSize: 5 * 1024 * 1024 },

    // Allow only specific file types
    fileFilter: (req, file, cb) => {
        const allowedType = ['image/jpeg', 'image/jpg', 'image/png'];

        // Check if the file type is allowed
        if (allowedType.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Only .jpg, .jpeg, .png files are allowed")); // reject other types
    }
});

// Export upload middleware to use in routes
module.exports = upload;
