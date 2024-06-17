const express = require('express');
const Client = express.Router();
const { getClient, getClients, createClient, updateClient, deleteClient } = require('../controller/client.controller')

Client.route('/').get(getClients).post(createClient);
Client.route('/:id').put(updateClient).delete(deleteClient);
Client.get('/:id', getClient)

module.exports = Client;