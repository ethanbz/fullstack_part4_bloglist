const express = require('express')
const app = express()
const cors = require('cors')
const bloglistRouter = require('./controllers/bloglist')
const mongoose = require('mongoose')
const config = require('./utils/config')
//const logger = require('./utils/logger')

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())
app.use(express.json())

app.use('/api/blogs', bloglistRouter)

module.exports = app