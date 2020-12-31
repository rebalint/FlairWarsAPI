/**
 * This is the Assignment Schema. It contains...
 * Database Schema for Assignment Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    AssignmentName: String,
    AssignmentDescription: String,
    AssignmentStartDate: Date,
    AssignmentEndDate: Date,
    WealthAwarded: String
})

module.exports.Model = mongoose.model("Assignments", exports.Schema)