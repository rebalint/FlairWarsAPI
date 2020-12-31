/**
 * Application Operations
 * Permissions:
 * 
 * CanWriteUsers - This application can create users
 * CanUpdateUsers - This application can update user info
 * CanDeleteUsers - This application can delete users
 * CanWriteCurrencies - This application can create currencies
 * CanUpdateCurrency - This application can change currency info (name, symbol)
 * CanMintCurrency - This application can add to the stockpile of a currency
 * CanDestroyCurrency - This application can remove currency from the stockpile
 * CanDeleteCurrency - This application can delete an entire currency
 * CanWithdrawCurrency - This application can pull currency from the Stockpile
 * CanDepositCurency - This application can put currency back into the Stockpile
 * 
 * All - This application can do anything
 */

 // The Application Schema file
const Application = require('../schema/application')

// Permission Types create an easy to use format for standardizing permission restrictions
module.exports.PermissionTypes = {
    CanWriteUsers: 'CanWriteUsers', 
    CanUpdateUsers: 'CanUpdateUsers',
    CanDeleteUsers: 'CanDeleteUsers',
    CanWriteCurrencies: 'CanWriteCurrencies',
    CanUpdateCurrency: 'CanUpdateCurrency',
    CanMintCurrency: 'CanMintCurrency',
    CanDestroyCurrency: 'CanDestroyCurrency',
    CanDeleteCurrency: 'CanDeleteCurrency',
    CanManageAppPerms: 'CanManageAppPerms',
    CanWithdrawCurrency: 'CanWithdrawCurrency',
    CanDepositCurency: 'CanDepositCurency',
    All: 'All'
}

// This function creates an application in the database.
module.exports.RegisterApplication = (AppName) => {
    let NewApplication = new Application.Model({
        AppName: AppName,
        Permissions: [],
        Currencies: []
    })

    return NewApplication.save()
}

// Retrieves an Application from the database using its secret
module.exports.ReadBySecret = async (AppSecret) => {
    return await Application.Model.findById(AppSecret).exec()
}

// Retrieves an Application from the database using its name
module.exports.ReadByName = async (AppName) => {
    return await Application.Model.findOne({AppName: AppName}).exec()
}

// Append Permissions to an application's Permissions array
module.exports.AddPermissions = (AppName, NewPermissions) => {
    Application.Model.findOne({AppName: AppName}).exec( (err, res) => {
        if (err) console.error(err);
        else {
            if (Array.isArray(NewPermissions)) {
                res.Permissions = res.Permissions.concat(NewPermissions)
                res.save()
            }
            else {
                res.Permissions.push(NewPermissions)
                res.save()
            }
        }
    })
}

// Remove Permissions from an application's Permissions array
module.exports.RemovePermissions = (AppName, PermsToRemove) => {
    Application.Model.findOne({AppName: AppName}).exec( (err, res) => {
        if (err) console.error(err);
        else {
            if (Array.isArray(PermsToRemove)) {
                PermsToRemove.forEach( permission => {
                    if (res.Permissions.includes(permission)) {
                        res.Permissions.splice(res.Permissions.indexOf(permission), 1)
                    }
                })
                res.save()
            }
            else {
                if (res.Permissions.includes(PermsToRemove)) {
                    res.Permissions.splice(res.Permissions.indexOf(PermsToRemove), 1)
                }
                res.save()
            }
        }
    })
}