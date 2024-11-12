const express = require('express');
const router = express.Router();
const {uploadFile,getFiles,deleteFile,downloadFile} = require('../controllers/fileController');
const {auth} = require('../middleware/auth');

router.post('/upload',auth,uploadFile);
router.get('/getfiles',auth,getFiles);
router.get('/downloadfiles/:id',auth,downloadFile);
router.delete('/deletefiles/:id',auth,deleteFile);

module.exports = router;