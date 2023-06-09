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
 * CanInteractWithCurrency - This application can withdraw or deposit currency to the Stockpile
 * CanChangeCurrencyMeta - This application can update the name and symbol of a currency
 * 
 * All - This application can do anything
 */

const crypto = require('crypto')

 // The Application Schema file
const Application = require('../schema/application')
const { Op } = require('sequelize')

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
    CanInteractWithCurrency: 'CanInteractWithCurrency',
    CanChangeCurrencyMeta: 'CanChangeCurrencyMeta',
    All: 'All'
}

// This function creates an application in the database.
module.exports.RegisterApplication = async (AppName) => {
    return await Application.Schema.create({
        AppName: AppName,
        Permissions: [],
        // Currencies: []
    })
}

// Retrieves an Application from the database using its secret
module.exports.ReadBySecret = async (secret) => {
    return await Application.Schema.findOne({
        where: {
            AppSecret: {
                [Op.eq]: secret
            }
        }
    })
}

// Retrieves an Application from the database using its name
module.exports.ReadByName = async (name) => {
    return await Application.Schema.findOne({
        where: {
            AppName: {[Op.eq]: name}
        }
    })
}

// Append Permissions to an application's Permissions array
module.exports.AddPermissions = (AppName, NewPermissions) => {
    this.ReadByName(AppName).then(app => {
        let newPermArray = []

        if(app.Permissions != null){
            newPermArray.concat(app.Permissions)
        }
        if(Array.isArray(NewPermissions)){
            newPermArray.concat(NewPermissions)
        } else {
            newPermArray.push(NewPermissions)
        }
        app.update({Permissions: newPermArray}, {where: {AppName: AppName}})
    })
}

// Remove Permissions from an application's Permissions array
module.exports.RemovePermissions = (AppName, PermsToRemove) => {
    this.ReadByName(AppName)
    .then(app => {
        let newPerms = app.Permissions
        if(Array.isArray(PermsToRemove)){
            PermsToRemove.forEach(perm => {
                if(newPerms.includes(perm)){
                    newPerms = newPerms.filter(p => p != perm)
                }
            })
        } else {
            newPerms = newPerms.filter(p => p != PermsToRemove)
        }
        Application.Schema.update({AppName: AppName}, {Permissions: newPerms})
    })
    .catch()
}

// Add a currency to this application's managed currencies array
module.exports.AddCurrency = (CurrencyID, ApplicationID) => {
    throw new Error('Feature not implemented') // TODO couldnt be bothered, sorry
    Application.Model.findById(ApplicationID).exec( (err, res) => {
        if (err) console.error(err);
        else {
            res.Currencies.push(CurrencyID)
            res.save()
        }
    })
}

// Remove a currency to from application's managed currencies array
module.exports.RemoveCurrency = (CurrencyID, ApplicationID) => {
    throw new Error('Feature not implemented') // TODO couldnt be bothered, sorry
    Application.Model.findById(ApplicationID).exec( (err, res) => {
        if (err) console.error(err);
        else {
            if(res.Currencies.includes(CurrencyID)) {
                res.Currencies = res.Currencies.splice(indexOf(CurrencyID), 1)
                res.save()
            }
        }
    })
}