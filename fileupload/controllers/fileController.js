// fileController.js
const multer = require('multer');
const path = require('path');
const db = require('../config/dbConnect');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images and PDFs are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
    fileFilter: fileFilter
});

// Upload File Controller
exports.uploadFile = (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).send({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).send({ success: false, message: 'No file uploaded' });
        }

        const { filename, mimetype, size } = req.file;
        const uploaded_by = req.user.id; // Assuming req.user.id is available after authentication

        const sql = 'INSERT INTO files (filename, filepath, mimetype, size, uploaded_by) VALUES (?,?,?,?,?)';
        db.query(sql, [filename, `uploads/${filename}`, mimetype, size, uploaded_by], (err, result) => {
            if (err) throw err;
            res.status(200).send({
                success: true,
                message: 'File uploaded successfully',
                file: req.file
            });
        });
    });
};

// Other controllers (getFiles, deleteFile, etc.)
exports.getFiles = (req, res) => {
    const sql = 'SELECT * FROM files';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).send({
            success: true,
            files: result
        });
    });
};

exports.downloadFile = (req, res) => {
    const fileId = req.params.id;
    const sql = 'SELECT * FROM files WHERE id = ?';
    db.query(sql, [fileId], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(404).send({ success: false, message: 'File not found' });
        }
        res.download(result[0].filepath);
    });
};

exports.deleteFile = (req, res) => {
    const fileId = req.params.id;
    const sql = 'SELECT * FROM files WHERE id = ?';
    db.query(sql, [fileId], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(404).send({ success: false, message: 'File not found' });
        }

        fs.unlink(result[0].filepath, (err) => {
            if (err) throw err;
            const sql = 'DELETE FROM files WHERE id = ?';
            db.query(sql, [fileId], (err, result) => {
                if (err) throw err;
                res.status(200).send({
                    success: true,
                    message: 'File deleted successfully'
                });
            });
        });
    });
};
