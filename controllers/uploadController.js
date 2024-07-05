import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});

const upload = multer({ storage });

const uploadFile = (req, res) => {
    console.log('Uploaded file:', req.file); // Log the uploaded file details
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.status(201).json({ file: req.file });
};

const getFile = async (req, res) => {
    try {
        console.log('Fetching file:', req.params.filename); // Log the filename being fetched
        const conn = mongoose.connection;
        const gfs = new GridFSBucket(conn.db, {
            bucketName: 'uploads'
        });

        const files = await gfs.find({ filename: req.params.filename }).toArray();
        console.log('Files found:', files); // Log the files found

        if (!files || files.length === 0) {
            return res.status(404).json({ error: 'No files exist' });
        }

        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    } catch (error) {
        console.error('Error fetching file:', error); // Log the error
        res.status(500).json({ error: 'Server Error' });
    }
};

export { upload, uploadFile, getFile };
