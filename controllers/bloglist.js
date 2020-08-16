const bloglistRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


bloglistRouter.get('/', async (request, response) => {
	const bloglist = await Blog.find({}).populate('user', { username: 1, name: 1 })
	response.json(bloglist)
})

bloglistRouter.get('/:id', async (req, res) => {
	const blog = await Blog.findById(req.params.id).populate('user', { username: 1, name: 1 })
	res.status(200).json(blog)
})


bloglistRouter.post('/', async (request, response) => {
	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if (!request.token || !decodedToken.id) {
		return response.status(401).json({ error: 'token missing or invalid' })
	}
	const user = await User.findById(decodedToken.id)

	const blog = new Blog({
		...request.body,
		likes: request.body.likes || 0,
		user: user._id,
		comments: []
	})

	try {
		const result = await blog.save()
		user.blogs = user.blogs.concat(result._id)
		await user.save()
		response.status(201).json(result)
	} catch (error) {
		response.status(400).end()
	}
})

bloglistRouter.post('/:id/comments', async (req, res) => {
	const blog = await Blog.findById(req.params.id)

	blog.comments ? blog.comments.push(req.body.comment) : blog.comments = [req.body.comment]


	try {
		const result = await blog.save()
		res.status(201).json(result)
	} catch(error) {
		res.status(400).end()
	}
})

bloglistRouter.delete('/:id', async (req, res) => {
	const decodedToken = jwt.verify(req.token, process.env.SECRET)
	if (!req.token || !decodedToken.id) {
		return res.status(401).json({ error: 'token missing or invalid' })
	}
	const blog = await Blog.findById(req.params.id)
	console.log(blog.user, decodedToken.id)
	if (blog.user.toString() === decodedToken.id) {
		await Blog.findByIdAndDelete(req.params.id)
		res.status(204).end()
	} else {
		res.status(401).json({ error: 'token invalid' })
	}
})

bloglistRouter.put('/:id', async (req, res) => {
	const blog = req.body
	const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
	res.json(updatedBlog)
})


module.exports = bloglistRouter