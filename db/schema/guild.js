/**
 * This is the Guild Schema. It contains...
 * Database Schema for Guild Configuration Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    GuildID: String,
    GuildPrefix: String,
    LoggingChannelID: String,
    BotManagerRoles: [],
    Distinguished: {type: Boolean, default: false},
    DefaultCurrency: {type: mongoose.Schema.Types.ObjectId, ref: 'CurrencyTypes'}
})

module.exports.Model = mongoose.model("GuildConfigs", exports.Schema)