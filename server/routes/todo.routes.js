const express = require('express');
const Todo = express.Router();
const {
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
} = require('../controller/todo.controller.js');

Todo.route('/')
.get(getTodos)
.post(createTodo);

Todo.route('/:id')
.get(getTodo)
.put(updateTodo)
.delete(deleteTodo);

module.exports = Todo;