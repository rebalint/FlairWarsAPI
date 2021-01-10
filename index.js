// Installed dependencies
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs');
const cors = require('cors')
const swaggerDocument = YAML.load('./swagger.yaml');

const CronJob = require('cron').CronJob

// Created dependencies
const UserRoute = require('./routes/user')
const ApiAuth = require('./routes/api_auth')
const CurrencyRoute = require('./routes/currency')
const TransactionRoute = require('./routes/transaction')
const CurrencyOps = require('./db/operations/currency')
const TransactionOps = require('./db/operations/transaction')
const Auth = require('./auth/auth_gate')

// Initialize an Express app
const app = express()

// Configure Express...

// Enable Express JSON bodies
app.use(express.json())

// Enable CORS
app.use(cors())

// Application Access Logging Middleware
let ApplicationAccessLogger = (req, res, next) => {
    let date = new Date().toISOString()
    let RequestMethod = req.method
    let RequestURL = req.url
    if (req.headers.hasOwnProperty('authorization')) {
        Auth.PullAppInfo(req.headers.authorization.split(' ')[1], thisApplication => {
            if (thisApplication) {
                console.log(`[${date}] <${thisApplication.AppName}> ${RequestMethod} : ${RequestURL}`)
            }
            else {
                console.log(`[${date}] ${RequestMethod} ${RequestURL}`)
            }
        })
    }
    else {
        console.log(`[${date}] ${RequestMethod} ${RequestURL}`)
    }
    
    next()
}

app.use(ApplicationAccessLogger)

// User Express Routers
app.use('/users', UserRoute)
app.use('/applications', ApiAuth)
app.use('/currencies', CurrencyRoute)
app.use('/transactions', TransactionRoute)

// This is a weekly job that recalculates the price of currencies for use with exchange rate
var PriceJob = new CronJob('0 0 0 * * 1', () => {
    CurrencyOps.ReadCurrencies().then( allCurrencies => {
        allCurrencies.forEach( currency => {
            TransactionOps.EvaluateCurrencyPrice(currency._id, CurrencyPrice => {
                currency.CurrencyPrice = CurrencyPrice
                currency.save()
            })
        })
    })
}, null, true, 'America/Denver')

PriceJob.start();
console.log(`Next CRON run: ${PriceJob.nextDate()}`)

// Swagger Renderer
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Start the app (Will use server PORT if available, otherwise defaults to 5000)
app.listen((process.env.PORT || 5000), () => {
    console.log(`The app has started.`)
})

// This initializes the MongoDB connection
const MongoDBConnector = require('./db/mongo_connect');
