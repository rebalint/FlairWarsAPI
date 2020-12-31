// Installed dependencies
const express = require('express')
const axios = require('axios')

// Created dependencies
const UserRoute = require('./routes/user')
const ApiAuth = require('./routes/api_auth')
const UserOps = require('./db/operations/user')

// Initialize an Express app
const app = express()

// Configure Express...

// Enable Express JSON bodies
app.use(express.json())

// User Express Routers
app.use('/users', UserRoute)
app.use('/application', ApiAuth)

// Start the app (Will use server PORT if available, otherwise defaults to 5000)
app.listen((process.env.PORT || 5000), () => {
    console.log(`The app has started.`)
})

// This initializes the MongoDB connection
const MongoDBConnector = require('./db/mongo_connect');
