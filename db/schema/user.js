/**
 * This is the User Schema. It contains...
 * The User Schema for User Objects in the database
 */

const { DataTypes, DATE } = require('sequelize')
const { Db } = require('../db')

module.exports.Schema = Db.define("User", {
    MemberID: DataTypes.STRING,
    MemberNickname: DataTypes.STRING,
    // CurrencyCount: [
    //     {
    //         CurrencyType: {type: mongoose.Schema.Types.ObjectId, ref: 'CurrencyTypes'},
    //         CurrencyAmount: Number
    //     }
    // ],
    //Titles: [],
    //Assignments: [],
    //HonType: Number,
    Color: DataTypes.STRING,
    RedditName: DataTypes.STRING,
    //Inventory: []
})