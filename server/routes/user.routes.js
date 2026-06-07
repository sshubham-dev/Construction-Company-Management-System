const express = require('express');
const { createUser, users, user, login, updateUser, deleteUser, register, logout, resetPasswd, refresh } = require('../controller/user.controller');
const { adminAuth, userAuth } = require('../middlewares/auth.middleware');
const UserRouter = express.Router();

const upload = require('../middlewares/Upload');

UserRouter.post('/register', upload.single('avatar'), register);
UserRouter.get('/lists', users);
UserRouter.get('/:id', user);
UserRouter.post('/', createUser);
UserRouter.post('/login', login);
UserRouter.post('/refresh', refresh);
UserRouter.post('/logout', userAuth, logout);
UserRouter.put('/reset', resetPasswd);
UserRouter.put('/:id', upload.single('avatar'), updateUser);
UserRouter.delete('/:id', adminAuth, deleteUser);


module.exports = UserRouter;