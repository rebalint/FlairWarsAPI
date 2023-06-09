/** Operations for the Guild Model 
 * 
 * === SCHEMA ===
 * MemberID: String,
 * CurrencyCount: Number,
 * Titles: [{ TitleName: String, TitleDescription: String }],
 * Assignments: [{AssignmentName: String, AssignmentDescription: String}],
 * HonType: Number,
 * Color: Number,
 * RedditName: String,
 * Inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Items' }]
*/

const User = require('../schema/user')
const CurrencyOps = require('../operations/currency')
const { Op } = require('sequelize')

// This function creates a user.
module.exports.APICreateUser = (MemberID, RedditName, Color) => {
    return User.Schema.create({
        MemberID: MemberID,
        MemberNickname: RedditName, //TODO: is this correct
        // CurrencyCount: [],
        // Titles: [],
        // Assignments: [],
        // HonType: 0,
        Color: Color,
        RedditName: RedditName,
        // Inventory: []
    })
}

/** USER CRUD Operations 
 * Functions for adding assignments and titles will be in the sections below
*/

// Read one user from the database using their Discord ID
module.exports.ReadOneUser = async (MemberID) => {
    return await User.Schema.findOne({
        where: {
            MemberID: {
                [Op.eq]: MemberID
            }
        }
    })
}

// Read all users in the database
module.exports.ReadAllUsers = async () => {
    return await User.Schema.findAll()
}

module.exports.ReadUsersByQuery = async (query) => {
    return await User.Schema.findAll(query)
}

// Helper function that returns the index of an object in an array, given a key and value from the object
let IndexFinder = (array, key, value) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i][key].equals(value)) return i;
    }
    return -1
}

// Give currency of a given type to a user from the stockpile
module.exports.ChangeCurrencyAmount = (MemberID, CurrencyTypeID, amount) => {
    throw new Error('Feature not implemented') // TODO couldnt be bothered, sorry
    return User.Model.findOne({MemberID: MemberID}).exec( (err, res) => {
        if (err) console.error(err)
        else if (res) {
            if ( IndexFinder(res.CurrencyCount, 'CurrencyType', CurrencyTypeID) >= 0) {
                let CurrencyIndex = IndexFinder(res.CurrencyCount, 'CurrencyType', CurrencyTypeID)
                res.CurrencyCount[CurrencyIndex].CurrencyAmount += amount
                return res.save()
            }
            else {
                res.CurrencyCount.push({
                    CurrencyType: CurrencyTypeID,
                    CurrencyAmount: amount
                })
                return res.save()
            }
        }
        else {
            console.log(`User ${MemberID} not found`)
        }
    })
}