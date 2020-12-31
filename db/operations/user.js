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

// This function creates a user.
module.exports.APICreateUser = (MemberID, RedditName, Color) => {
    let NewUser = new User.Model({
        MemberID: MemberID,
        MemberNickname: RedditName,
        CurrencyCount: [],
        Titles: [],
        Assignments: [],
        HonType: 0,
        Color: Color,
        RedditName: RedditName,
        Inventory: []
    })

    return NewUser.save()
}

/** USER CRUD Operations 
 * Functions for adding assignments and titles will be in the sections below
*/

// Read one user from the database using their Discord ID
module.exports.ReadOneUser = async (MemberID) => {
    return await User.Model.findOne({MemberID: MemberID})
        .populate('CurrencyCount.CurrencyType')
        .exec()
}

// Read all users in the database
module.exports.ReadAllUsers = async () => {
    return await User.Model.find({})
        .populate('CurrencyCount.CurrencyType')
        .exec()
}

// Read all users given a Mongoose Query Object
module.exports.ReadUsersByQuery = async (query) => {
    return await User.Model.find(query)
    .populate('CurrencyCount.CurrencyType')
    .exec()
}

// Add a type of currency to a user
module.exports.AddCurrencyTypeToUser = async (MemberID, CurrencyID) => {
    return await User.Model.findOne({MemberID: MemberID}).exec( (err, res) => {
        if (err) console.error(err);
        else {
            res.CurrencyCount.push({
                CurrencyType: CurrencyID,
                CurrencyAmount: 0
            })
            res.save()
        }
    })
}

// Helper function that returns the index of an object in an array, given a key and value from the object
let IndexFinder = (array, key, value) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i][key].equals(value)) return i;
    }
    return -1
}

// Helper function to determine if an objec exists within an array, given a key and value from the object
let ItemPresent = (array, key, value) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i][key].equals(value)) return true
    }
    return false
}

// Give currency of a given type to a user from the stockpile
module.exports.ChangeCurrencyAmount = (MemberID, CurrencyTypeID, amount) => {
    return User.Model.findOne({MemberID: MemberID}).exec( (err, res) => {
        if (err) console.error(err)
        else {
            if ( ItemPresent(res.CurrencyCount, 'CurrencyType', CurrencyTypeID ) ) {
                let CurrencyIndex = IndexFinder(res.CurrencyCount, 'CurrencyType', CurrencyTypeID)
                res.CurrencyCount[CurrencyIndex].CurrencyAmount += CurrencyOps.StockpileTransaction(CurrencyTypeID, amount)
                return res.save()
            }
            else {
                module.exports.AddCurrencyTypeToUser(MemberID, CurrencyTypeID).then( () => {
                    let CurrencyIndex = IndexFinder(res.CurrencyCount, 'CurrencyType', CurrencyTypeID)
                    res.CurrencyCount[CurrencyIndex].CurrencyAmount += CurrencyOps.StockpileTransaction(CurrencyTypeID, amount)
                    return res.save()
                })
            }
        }
    })
}