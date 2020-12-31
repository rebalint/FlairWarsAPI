/**
 * This is the User Schema. It contains...
 * The User Schema for User Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    MemberID: String,
    MemberNickname: String,
    CurrencyCount: [
        {
            CurrencyType: {type: mongoose.Schema.Types.ObjectId, ref: 'CurrencyTypes'},
            CurrencyAmount: Number
        }
    ],
    Titles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Titles' }],
    Assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignments' }],
    HonType: Number,
    Color: String,
    RedditName: String,
    Inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Items' }]
})

module.exports.Model = mongoose.model('Users', exports.Schema)