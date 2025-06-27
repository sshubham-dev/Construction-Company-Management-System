const express = require('express');
const Blogs = express.Router();
const { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog } = require('../controller/blog.controller');

// Create a new blog
Blogs.post('/', createBlog);

// Get all blogs
Blogs.get('/', getAllBlogs);

// Get a blog by ID
Blogs.get('/:id', getBlogById);

// Update a blog by ID
Blogs.put('/:id', updateBlog);

// Delete a blog by ID
Blogs.delete('/:id', deleteBlog);

module.exports = Blogs;
// This code defines the routes for managing blog posts in an Express application.