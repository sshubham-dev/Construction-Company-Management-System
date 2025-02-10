const mongoose = require('mongoose');

const returnableSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
    },
    receivedQuantity: {
        type: Number,
    },
    unit: {
        type: String,
    },
    remarks: String,
})
const returnSchema = new mongoose.Schema({
    site: {
        name: String,
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Site',
        }
    },
    materialType: {
        type: String,
        required: true,
        enum: ['New', 'Used', 'Scrap']
    },
    date: Date,
    returnable: [returnableSchema],
    status: [{
        name: String,
        date: Date,
    }]
}, { timestamps: true });

const Return = mongoose.model('Return', returnSchema);