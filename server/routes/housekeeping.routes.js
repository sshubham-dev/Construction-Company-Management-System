const express = require('express');
const Housekeeping = express.Router();
const { createHousekeeping, updateHousekeeping,  deleteHousekeeping, getHousekeeping } = require('../controller/housekeeping.controller')
const {userAuth} = require('../middlewares/auth.middleware')

Housekeeping.route('/').get(getHousekeeping).post(userAuth, createHousekeeping)
Housekeeping.route('/:id').put(userAuth, updateHousekeeping).delete(userAuth, deleteHousekeeping)