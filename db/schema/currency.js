/**
 * This is the Currency Schema. It contains...
 * Database Schema for Currency Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    CurrencyName: String,
    CurrencySymbol: String,
    CurrencyTotalStockpile: Number,
    CurrencyRemainingStockpile: Number,
    CurrencyPrice: Number
})

module.exports.Model = mongoose.model("CurrencyTypes", exports.Schema)