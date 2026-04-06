const express = require('express');
const Client = express.Router();
const { getClient, getClients, createClient, updateClient, deleteClient } = require('../controller/client.controller')
const { userAuth } = require('../middlewares/auth.middleware');

Client.route('/').get(userAuth, getClients).post(userAuth, createClient);
Client.route('/:id').put(userAuth, updateClient).delete(deleteClient);
Client.get('/:id', getClient)

module.exports = Client;