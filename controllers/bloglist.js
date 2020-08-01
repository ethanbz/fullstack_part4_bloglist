const bloglistRouter = require('express').Router()
const Blog = require('../models/blog')


bloglistRouter.get('/', async (request, response) => {
	const bloglist = await Blog.find({})
	response.json(bloglist)
})

bloglistRouter.post('/', async (request, response) => {
	const blog = new Blog({
		...request.body,
		likes: request.body.likes || 0
	})

	try {
		const result = await blog.save()

		response.status(201).json(result)

	} catch (error) {
		response.status(400).end()
	}
})

bloglistRouter.delete('/:id', async (req, res) => {
	await Blog.findByIdAndRemove(req.params.id)
	res.status(204).end()
})

bloglistRouter.put('/:id', async (req, res) => {
    const blog = req.body
	const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
	res.json(updatedBlog)
})


module.exports = bloglistRouter