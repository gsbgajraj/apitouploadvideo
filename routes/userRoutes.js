
import express from 'express';
import { upload, uploadFile, getFile } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/file/:filename', getFile);

export default router;

