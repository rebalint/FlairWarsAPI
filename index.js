// Installed dependencies
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs');
const cors = require('cors')
const swaggerDocument = YAML.load('./swagger.yaml');

// Created dependencies
const UserRoute = require('./routes/user')
const ApiAuth = require('./routes/api_auth')
const CurrencyRoute = require('./routes/currency')

// Initialize an Express app
const app = express()

// Configure Express...

// Enable Express JSON bodies
app.use(express.json())

// Enable CORS
app.use(cors())

// User Express Routers
app.use('/users', UserRoute)
app.use('/application', ApiAuth)
app.use('/currency', CurrencyRoute)

// Swagger Renderer
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Start the app (Will use server PORT if available, otherwise defaults to 5000)
app.listen((process.env.PORT || 5000), () => {
    console.log(`The app has started.`)
})

// This initializes the MongoDB connection
const MongoDBConnector = require('./db/mongo_connect');
