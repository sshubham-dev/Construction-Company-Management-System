const Todo = require('../models/todo.models.js');
const sendMessage = require('../utils/message.js');
const User = require('../models/user.models.js');

const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find()
            .populate('to')
            .populate('by')
            .exec();
        if (todos.length === 0) return res.status(404).json({ error: 'No Todos Found' });
        res.status(201).json(todos);
    } catch (error) {
        console.log(error);
        res.status(501).json({ message: 'Internal Server Error' })
    }
};

const getTodo = async (req, res) => {
    try {
        const id = req.params.id;
        const todo = await Todo.findById(id)
            .populate('to')
            .populate('by')
            .exec();
        if (!todo) return res.status(404).json({ error: 'No Todo Found' });
        res.status(201).json(todo);
    } catch (error) {
        console.log(error);
        res.status(501).json({ message: 'Internal Server Error' })
    }
};

const createTodo = async (req, res) => {
    try {
        const {
            task,
            to,
            completeBy,
            remindAt,
            remindTime,
            remindGap,
        } = req.body;
        const user = await User.findById(to);
        const newTodo = new Todo({
            task,
            to,
            completeBy,
            remindAt,
            remindTime,
            remindGap,
        });
        const todo = await newTodo.save();
        console.log(todo)
        const data = todo.task;
        const whatsappNo = `whatsapp:+91${user.phone}`;
        console.log(whatsappNo)
        sendMessage(data, whatsappNo);
        // const no = 9955589832
        //     client.messages.create({
        //         body: `Message From App`,
        //         from: 'whatsapp:+14155238886',
        //         to: `whatsapp:+91${no}`
        //     })
        //         .then(message => console.log(message.sid))
        //         .catch(error => console.log(error))
        res.status(201).json({ message: 'Todo Added Successfully', todo });
    } catch (error) {
        console.log(error);
        res.status(501).json({ message: 'Internal Server Error' })
    }
};

const updateTodo = async (req, res) => {
    try {
        const id = req.params.id;
        const todo = await Todo.findById(id);
        if (!todo) return res.status(404).json({ error: 'No Todo Found' });
    } catch (error) {
        console.log(error);
        res.status(501).json({ message: 'Internal Server Error' })
    }
};

const deleteTodo = async (req, res) => {
    try {
        const id = req.params.id;
        const todo = await Todo.findByIdAndDelete(id)
            .populate('to')
            .populate('by')
            .exec();
        if (!todo) return res.status(404).json({ error: 'No Todo Found' });
        const todos = await Todo.find()
            .populate('to')
            .populate('by')
            .exec();
        if (todos.length === 0) return res.status(404).json({ error: 'No Todos Found' });
        res.status(201).json(todos);
    } catch (error) {
        console.log(error);
        res.status(501).json({ message: 'Internal Server Error' })
    }
};

module.exports = {
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
}