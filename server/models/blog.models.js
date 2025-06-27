const moongose = require('mongoose');

const blogSchema = new moongose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: Object,
        required: true,
    },
    coverImage: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
        default: "Draft"
    },
}, { timestamps: true });

const Blog = moongose.model('Blog', blogSchema);