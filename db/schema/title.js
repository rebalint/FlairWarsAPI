/**
 * This is the Title Schema. It contains...
 * Database Schema for Title Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    TitleName: String,
    TitleDescription: String
})

module.exports.Model = mongoose.model("Titles", exports.Schema)