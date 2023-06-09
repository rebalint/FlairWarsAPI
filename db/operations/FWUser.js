/** 
 * Operations for a FWUser in the database
 */

// Import model/schema
const FWUser = require('../schema/FWUser')

// Additional Imports
const RedditUserOps = require('./redditUser')

// CREATE OPERATIONS

/**
 * Create an FWUser in the database
 * @param {String} redditUsername 
 * @param {String} discordId 
 * @param {Function} cb
 */

module.exports.CreateFWUser = (redditUsername, discordId, cb) => {
    console.log("create")
    RedditUserOps.ReadOneRedditUser(redditUsername, dbRes => {
        if (dbRes === "DBERR" || dbRes === "NOTFOUND") {
            cb(dbRes)
        }
        else {
            console.log(`added discordid: ${discordId}`)
            let newFWUser = new FWUser.Model({
                RedditInfo: dbRes._id,
                DiscordID: discordId,
                WPNickname: '',
                WPPassword: '',
                Permissions: [],
                GovRoles: []
            })

            newFWUser.save()

            cb(newFWUser)
        }
    })
}



module.exports.ValidateUser = () => {

}

// READ OPERATIONS

/**
 * Get all users from the database
 * @param {Function} cb 
 */

module.exports.GetAllFWUsers = (cb) => {
    FWUser.Model.find({}).populate('RedditInfo').exec((err, res) => {
        if (err) {
            console.error(err)
            cb('DBERR')
        }
        else if (res) {
            cb(res)
        }
        else {
            cb('NOTFOUND')
        }
    })
}

/**
 * Get a user by their Discord ID or return 'NOTFOUND'
 * @param {String} DiscordID
 * @param {Function} cb 
 */

module.exports.GetOneFWUser = (DiscordID, cb) => {
    FWUser.Model.findOne({DiscordID: DiscordID}).populate('RedditInfo').exec((err, res) => {
        if(err){
            console.error(err)
            cb('DBERR')
        }
        else if(res){
            cb(res)
        } else {
            cb('NOTFOUND')
        }
    })
}


// UPDATE OPERATIONS

module.exports.UpdateFields = () => {
    // RedditUser
    // DiscordId
    // WPNickname
}



module.exports.UpdateWPPassword = () => {

}



module.exports.AddPermission = () => {

}



module.exports.AddGovRole = () => {

}

// DELETE OPERATIONS

/**
 * Delete all documents in the collection
 * @param {Function} cb 
 */

module.exports.DeleteAllFWUsers = (cb) => {
    FWUser.Model.deleteMany({}, {}, (err) => {
        if (err) {
            console.error(err)
            cb('DBERR')
        }
        else {
            cb('NOCONTENT')
        }
    })
}



module.exports.RemovePermission = () => {

}

module.exports.RemoveGovrole = () => {

}