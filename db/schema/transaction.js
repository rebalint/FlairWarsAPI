/**
 * This is the Transaction Schema. It contains...
 * Database Schema for Transaction Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    DateActioned: Date,
    Type: String,
    FromEntity: String,
    ToEntity: String,
    TransactionDescription: String,
    Amount: Number,
    FromCurrency: String,
    ToCurrency: String
})

module.exports.Model = mongoose.model("Transactions", exports.Schema)