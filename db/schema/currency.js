/**
 * This is the Currency Schema. It contains...
 * Database Schema for Currency Objects in the database
 */

const { DataTypes } = require('sequelize')
const { Db } = require('../db')

module.exports.Schema = Db.define("Currency", {
    CurrencyName: DataTypes.STRING,
    CurrencySymbol: DataTypes.STRING,
    CurrencyTotalStockpile: DataTypes.INTEGER,
    CurrencyRemainingStockpile: DataTypes.INTEGER,
    CurrencyPrice: DataTypes.INTEGER
})

//module.exports.Model = mongoose.model("CurrencyTypes", exports.Schema)