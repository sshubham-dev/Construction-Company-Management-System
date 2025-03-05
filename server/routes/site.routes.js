// siteRoute.js
const express = require('express');
const Site = express.Router();
const { getSites, createSite, getSite, updateSite, deleteSite, siteByUser } = require('../controller/site.controller');
const { adminAuth, userAuth, clientAuth  } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/Upload');

// GET /api/sites - Get all sites
Site.get('/', userAuth, getSites);
Site.post('/', upload.single('agreement'), adminAuth, createSite);
Site.get('/:id', userAuth, getSite);
Site.put('/:id', upload.single('agreement'), userAuth, updateSite);
Site.delete('/:id', adminAuth, deleteSite);
Site.get('/user/:id', userAuth, siteByUser);


module.exports = Site;
