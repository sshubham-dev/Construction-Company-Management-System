const express = require('express');
const upload = require('../middlewares/Upload');
const { uploadImage } = require('../controller/general.controller');

const UploadRouter = express.Router();

UploadRouter.post("/image", upload.single("image"), uploadImage);

module.exports = UploadRouter;
