const { Sequelize } = require('sequelize')

// Connect to the database
const db = new Sequelize(process.env.DB_URI, {
    logging: false
})
db.authenticate()
    .then(console.log("Connected to database"))
    .catch(e => console.log)
module.exports.Db = db