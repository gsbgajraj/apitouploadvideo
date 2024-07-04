// const multer = require('multer');
// const { GridFsStorage } = require('multer-gridfs-storage');
// const crypto = require('crypto');
// const path = require('path');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');

// dotenv.config();

// // Create storage engine
// const storage = new GridFsStorage({
//     url: process.env.MONGO_URI,
//     file: (req, file) => {
//         return new Promise((resolve, reject) => {
//             crypto.randomBytes(16, (err, buf) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 const filename = buf.toString('hex') + path.extname(file.originalname);
//                 const fileInfo = {
//                     filename: filename,
//                     bucketName: 'uploads'
//                 };
//                 resolve(fileInfo);
//             });
//         });
//     }
// });

// const upload = multer({ storage });

// const uploadFile = (req, res) => {
//     res.status(201).json({ file: req.file });
// };

// const getFile = async (req, res) => {
//     const conn = mongoose.connection;
//     const gfs = new mongoose.mongo.GridFSBucket(conn.db, {
//         bucketName: 'uploads'
//     });

//     gfs.find({ filename: req.params.filename }).toArray((err, files) => {
//         if (!files || files.length === 0) {
//             return res.status(404).json({ err: 'No files exist' });
//         }

//         gfs.openDownloadStreamByName(req.params.filename).pipe(res);
//     });
// };

// module.exports = { upload, uploadFile, getFile };


const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
        const gfs = new mongoose.mongo.GridFSBucket(conn.db, {
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

module.exports = { upload, uploadFile, getFile };
