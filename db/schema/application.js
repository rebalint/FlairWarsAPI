/**
 * This is the Application Schema. It contains...
 * Database Schema for Application Configuration Objects in the database
 * 
 * 
 */

const { DataTypes } = require('sequelize')
const { Db } = require('../db')

module.exports.Schema = Db.define('App', {
    AppName: DataTypes.STRING,
    AppSecret: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
    Permissions: DataTypes.ARRAY(DataTypes.STRING),
    // Currencies: [] // TODO bring this back?
})

//module.exports.Model = mongoose.model("Apps", exports.Schema)