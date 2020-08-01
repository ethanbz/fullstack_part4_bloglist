const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBloglist = [
	{
		_id: '5f245abed95df33c40759191',
		title: 'blog1',
		author: 'Richter',
		url: 'moocfi.com',
		likes: 9000,
		__v: 0
	},
	{
		_id: '5f2462e480b0bd4820c818bb',
		title: 'blog2',
		author: 'Yachter',
		url: 'moocfi.com',
		likes: 9000,
		__v: 0
	}
]

beforeEach(async () => {
	await Blog.deleteMany({})
    const blogObjects = initialBloglist.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

})

test('blogs are returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
	const res = await api.get('/api/blogs')

	expect(res.body).toHaveLength(initialBloglist.length)
})

test('blog id property is not prefixed with underscore', async () => {
    const res = await api.get('/api/blogs')

    expect(res.body[0].id).toBeDefined()
})

test('a specific blog is within the returned blogs', async () => {
	const res = await api.get('/api/blogs')
	const titles = res.body.map(blog => blog.title)
	expect(titles).toContain('blog2')
})

test('a valid blog can be added', async () => {
	const newBlog = {
		title: 'blog3',
		author: 'Johannesburhg',
		url: 'moocfi.com',
		likes: 9009,
	}
	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const res = await api.get('/api/blogs')
	const titles = res.body.map(blog => blog.title)
	expect(titles).toContain('blog3')
	expect(res.body).toHaveLength(initialBloglist.length + 1)

})

test('a blog with missing likes property can be added and is initialized to 0', async () => {
	const newBlog = {
		title: 'blog3',
		author: 'Johannesburhg',
		url: 'moocfi.com',
	}
	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/)

	const res = await api.get('/api/blogs')
	expect(res.body[2].likes).toBe(0)

})

test('a blog with missing title returns status code 400', async () => {
	const newBlog = {
		author: 'Johannesburhg',
        url: 'moocfi.com',
        likes: 50
	}
	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(400)

})


afterAll(() => {
	mongoose.connection.close()
})