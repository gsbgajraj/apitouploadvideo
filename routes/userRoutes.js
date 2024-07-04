// const express = require('express');
// const { upload, uploadFile, getFile } = require('../controllers/uploadController');

// const router = express.Router();

// router.post('/upload', upload.single('file'), uploadFile);
// router.get('/file/:filename', getFile);

// module.exports = router;

const express = require('express');
const { upload, uploadFile, getFile } = require('../controllers/uploadController');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/file/:filename', getFile);

module.exports = router;


