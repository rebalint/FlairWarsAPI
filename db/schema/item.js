/**
 * This is the Item Schema. It contains...
 * Database Schema for Item Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    ItemName: String,
    ItemDescription: String,
    ItemBuyPrice: Number,
    ItemSellPrice: Number,
    ItemHonPrice: Number,
    ItemFunc: String,
    ItemExpiration: Date,
    ItemsInStock: Number
})

module.exports.Model = mongoose.model("Items", exports.Schema)