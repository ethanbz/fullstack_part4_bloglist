const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res) => {
	const body = req.body

	if (!body.password || body.password.length < 3) {
		return res.status(400).json({ message: 'password length must be at least 3 characters' })
	}

	const saltRounds = 10
	const passwordHash = await bcrypt.hash(body.password, saltRounds)

	const user = new User({
		username: body.username,
		name: body.name,
		passwordHash
	})
	try {
		const savedUser = await user.save()
		res.json(savedUser)
	} catch (error) {
		res.status(400).json(error)
	}
})

usersRouter.get('/', async (req, res) => {
	const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 })
	res.json(users.map(u => u.toJSON()))
})

usersRouter.get('/:id', async (req, res) => {
	const user = await User.findById(req.params.id)
	res.json(user)
})

module.exports = usersRouter