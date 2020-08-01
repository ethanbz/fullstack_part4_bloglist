const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({})

		const passwordHash = await bcrypt.hash('secret', 10)
		const user = new User({ username: 'root', passwordHash })

		await user.save()
	})

	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'yonni',
			name: 'Yonni Lonni',
			password: 'ylonni'

		}

		await api
			.post('/api/users')
			.send(newUser)
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

		const usernames = usersAtEnd.map(u => u.username)
		expect(usernames).toContain(newUser.username)
	})

	test('creation fails if username already taken', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'root',
			name: 'Groot',
			password: 'admin'

		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.message).toContain('`username` to be unique')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails if username is too short', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'ro',
			name: 'Groot',
			password: 'admin'

		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.message).toContain('is shorter than the minimum')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})

	test('creation fails if password is too short', async () => {
		const usersAtStart = await helper.usersInDb()

		const newUser = {
			username: 'root',
			name: 'Groot',
			password: 'ad'

		}

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/)

		expect(result.body.message).toContain('password length')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toHaveLength(usersAtStart.length)
	})
})

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

const initialUser = {
	username: 'root',
	name: 'Groot Root',
	password: 'admin'
}

let token = null
let userId = null

beforeEach(async () => {
	await Blog.deleteMany({})
	const blogObjects = initialBloglist.map(blog => new Blog(blog))
	const promiseArray = blogObjects.map(blog => blog.save())
	await Promise.all(promiseArray)

	await User.deleteMany({})
	const savedUser = await api
		.post('/api/users')
		.send(initialUser)

	userId = savedUser.body.id

	const result = await api
		.post('/api/login')
		.send(initialUser)

	token = result.body.token

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
		userId: userId
	}
	await api
		.post('/api/blogs')
		.set('Authorization', `bearer ${token}`)
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
		userId: userId
	}
	await api
		.post('/api/blogs')
		.set('Authorization', `bearer ${token}`)
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
		likes: 50,
		userId: userId
	}
	await api
		.post('/api/blogs')
		.set('Authorization', `bearer ${token}`)
		.send(newBlog)
		.expect(400)

})


afterAll(() => {
	mongoose.connection.close()
})