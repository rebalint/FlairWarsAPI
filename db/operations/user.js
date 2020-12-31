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
const Title = require('../schema/title')
const Assignment = require('../schema/assignment')
const CurrencyOps = require('../operations/currency')

module.exports.HonTypeDict = { // This maps the HonType to a description
    0: "Not Honorary",
    1: "Individual Registration",
    2: "Family Member",
    3: "Orange Family Member"
}

module.exports.CreateUser = (MemberID, Nickname) => {
    let NewUser = new User.Model({
        MemberID: MemberID,
        MemberNickname: Nickname,
        CurrencyCount: [],
        Titles: [],
        Assignments: [],
        HonType: 0,
        Color: 'None',
        RedditName: 'None',
        Inventory: []
    })

    return NewUser.save()
}

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

module.exports.ReadOneUser = async (MemberID) => {
    return await User.Model.findOne({MemberID: MemberID})
        .populate('Titles')
        .populate('Assignments')
        .populate('CurrencyCount.CurrencyType')
        .populate('Inventory')
        .exec()
}

module.exports.ReadAllUsers = async () => {
    return await User.Model.find({})
        .populate('Titles')
        .populate('Assignments')
        .populate('CurrencyCount.CurrencyType')
        .populate('Inventory')
        .exec()
}

module.exports.ReadUsersByQuery = async (query) => {
    return await User.Model.find(query)
    .populate('Titles')
    .populate('Assignments')
    .populate('CurrencyCount.CurrencyType')
    .populate('Inventory')
    .exec()
}


module.exports.AddTitleToUser = (MemberID, TitleID) => {
    User.Model.findOne({MemberID: MemberID}).exec( (userErr, ThisUser) => {
        if (userErr) console.error(userErr);
        else {
            Title.Model.findById(TitleID).exec( (titleErr, ThisTitle) => {
                if (titleErr) console.error(titleErr)
                else {
                    ThisUser.Titles.push(ThisTitle)
                    ThisUser.save()
                }
            })
        }
    })
}

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

let IndexFinder = (array, key, value) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i][key].equals(value)) return i;
    }
    return -1
}

let ItemPresent = (array, key, value) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i][key].equals(value)) return true
    }
    return false
}

module.exports.ChangeCurrencyAmount = (MemberID, CurrencyTypeID, amount) => {
    return User.Model.findOne({MemberID: MemberID}).exec( (err, res) => {
        if (err) console.error(err)
        else {
            if ( ItemPresent(res.CurrencyCount, 'CurrencyType', CurrencyTypeID ) ) {
                let CurrencyIndex = IndexFinder(res.CurrencyCount, 'CurrencyType', CurrencyTypeID)
                res.CurrencyCount[CurrencyIndex].CurrencyAmount += CurrencyOps.PullFromStockpile(CurrencyTypeID, amount)
                return res.save()
            }
            else {
                module.exports.AddCurrencyTypeToUser(MemberID, CurrencyTypeID).then( () => {
                    let CurrencyIndex = IndexFinder(res.CurrencyCount, 'CurrencyType', CurrencyTypeID)
                    res.CurrencyCount[CurrencyIndex].CurrencyAmount += CurrencyOps.PullFromStockpile(CurrencyTypeID, amount)
                    return res.save()
                })
            }
        }
    })
}

module.exports.AddItemToInventory = (MemberID, ItemID) => {
    User.Model.findOne({MemberID: MemberID}).exec( (err, thisUser) => {
        if (err) console.error(err);
        else {
            thisUser.Inventory.push(ItemID)
            return thisUser.save()
        }
    })
}

module.exports.RemoveItemFromInventory = (MemberID, ItemID) => {
    User.Model.findOne({MemberID: MemberID}).exec( (err, thisUser) => {
        if (err) console.error(err)
        else {
            const itemIndex = thisUser.Inventory.indexOf(ItemID)
            if (itemIndex > -1) {
                thisUser.Inventory.splice(itemIndex, 1)
            }
            return thisUser.save()
        }
    })
}


module.exports.AddAssignmentToUser = (MemberID, AssignmentID) => {
    User.Model.findOne({MemberID: MemberID}).exec( (userErr, ThisUser) => {
        if (userErr) console.error(userErr);
        else {
            Assignment.Model.findById(AssignmentID).exec( (assignmentError, ThisAssignment) => {
                if (assignmentError) console.error(assignmentError);
                else {
                    ThisUser.Assignments.push(ThisAssignment)
                    return ThisUser.save()
                }
            })
        }
    })
}

module.exports.DeleteOneAssignment = (AssignmentID) => {
    console.log('Deleting assignment...')
    Assignment.Model.findByIdAndDelete(AssignmentID).exec( (err, res) => {
        if (err) console.error(err);
        else {
            console.log(`Delete operation performed\n${res}`)
        }
    })
}



/** ASSIGNMENT CRUD Operations */

const GetCurrentDate = () => {
    const DateNow = new Date();
    return new Date(DateNow.getFullYear(), DateNow.getMonth(), DateNow.getDate())
}

const GetOffsetDate = (numDays) => {
    let FutureDate = new Date();
    FutureDate.setDate(FutureDate.getDate() + numDays)
    return new Date(FutureDate.getFullYear(), FutureDate.getMonth(), FutureDate.getDate())
}

module.exports.CreateEndlessAssignment = (AssignmentName, AssignmentDescription) => {
    let NewAssignment = new Assignment.Model({
        AssignmentName: AssignmentName,
        AssignmentDescription: AssignmentDescription,
        AssignmentStartDate: GetCurrentDate(),
        AssignmentEndDate: null
    })

    return NewAssignment.save()
}

module.exports.CreateTimedAssignment = (AssignmentName, AssignmentDescription, AssignmentTimeDays) => {
    let NewAssignment = new Assignment.Model({
        AssignmentName: AssignmentName,
        AssignmentDescription: AssignmentDescription,
        AssignmentStartDate: GetCurrentDate(),
        AssignmentEndDate: GetOffsetDate(AssignmentTimeDays)
    })

    return NewAssignment.save()
}

module.exports.ReadAllAssignments = async () => {
    return await Assignment.Model.find({}).exec()
}

/** TITLES CRUD OPERATIONS */

module.exports.CreateTitle = (TitleName, TitleDescription) => {
    const NewTitle = new Title.Model({
        TitleName: TitleName,
        TitleDescription: TitleDescription
    })

    return NewTitle.save()
}

module.exports.ReadAllTitles = async () => {
    return await Title.Model.find({}).exec()
}