const express = require('express')
const router = express.Router()

const CurrencyOps = require('../db/operations/currency')
const Currency = require('../db/schema/currency')
const AppOps = require('../db/operations/application')
const ProtectRoute = require('../auth/protected')

// This helper function maps the DB properties to the JSON ones sent by the API
let MapCurrency = (currencyFromDB) => {
    return {
        id: currencyFromDB._id,
        Name: currencyFromDB.CurrencyName,
        Symbol: currencyFromDB.CurrencySymbol,
        RemainingStockpile: currencyFromDB.CurrencyRemainingStockpile,
        Stockpile: currencyFromDB.CurrencyTotalStockpile,
        Mint: `/currencies/${currencyFromDB._id}/mint`
    }
}

// Retrieve currencies, either all or ones that match given queries
router.get('/', (req, res) => {
    if (Object.keys(req.query).length === 0) {
        CurrencyOps.ReadCurrencies().then( allCurrencies => {
            const responseArray = []
            allCurrencies.forEach( currency => {
                let AddedCurrency = MapCurrency(currency)
                responseArray.push(AddedCurrency)
            })
            res.status(200).send(responseArray)
        })
    }
    else {
        CurrencyOps.ReadCurrenciesByQuery({
            $or: [
                {CurrencyName: req.query.Name},
                {CurrencySymbol: req.query.Symbol}
            ]
        }).then( queriedurrencies => {
            console.log(queriedurrencies)
            const responseArray = []
            queriedurrencies.forEach( currency => {
                let AddedCurrency = MapCurrency(currency)
                responseArray.push(AddedCurrency)
            })
            res.status(200).send(responseArray)
        })
    }
})

// Create a currency
router.post('/', (req, res) => {

    const RoutePermissions = [AppOps.PermissionTypes.CanWriteCurrencies]

    const RouteOperation = () => {
        const RequiredFields = ['Name', 'Symbol']
        if (RequiredFields.every( item => req.body.hasOwnProperty(item))) {
            CurrencyOps.CreateCurrency(req.body.Name, req.body.Symbol).then( NewCurrency => {
                res.status(201).send(`Created currency ${NewCurrency.CurrencyName} with a stockpile of ${NewCurrency.CurrencySymbol}${NewCurrency.CurrencyTotalStockpile}`)
                AppOps.AddCurrency(NewCurrency._id, req.headers.authorization.split(' ')[1])
            })
        }
        else {
            res.status(400).send('Bad request: Incomplete body')
        }
    }

    ProtectRoute(RoutePermissions, req, res, RouteOperation)
})

// Get a specific currency by its ID
router.get('/:CurrencyID', (req, res) => {
    CurrencyOps.ReadOneCurrency(req.params.CurrencyID).then(thisCurrency => {
        if (thisCurrency) {
            res.status(200).send(MapCurrency(thisCurrency))
        }
        else {
            res.status(404).send('Not Found: No currency with that ID')
        }
    })
})

// Update a currency's name and symbol
router.put('/:CurrencyID', (req, res) => {
    const RoutePermissions = [AppOps.PermissionTypes.CanChangeCurrencyMeta]

    const RouteOperation = () => {
        AppOps.ReadBySecret(req.headers.authorization.split(' ')[1]).then(thisApp => {
            if (thisApp.Currencies.includes(req.params.CurrencyID)) {
                const RequiredFields = ['Name', 'Symbol']
                if (RequiredFields.every( item => req.body.hasOwnProperty(item))) {
                    CurrencyOps.ReadOneCurrency(req.params.CurrencyID).then(thisCurrency => {
                        if (thisCurrency) {
                            thisCurrency.CurrencyName = req.body.Name
                            thisCurrency.CurrencySymbol = req.body.Symbol
                            thisCurrency.save()
                            res.status(200).send(`OK: Currency is now named ${thisCurrency.CurrencyName} with the symbol ${thisCurrency.CurrencySymbol}`)
                        }
                        else {
                            res.status(404).send('Not found: No currency at that ID')
                        }
                    })
                }
                else {
                    res.status(400).send('Bad request: Incomplete body')
                }
            }
            else {
                res.status(403).send(`Forbidden: Applications can only perform this operation on currencies they created`)
            }
        })
    }

    ProtectRoute(RoutePermissions, req, res, RouteOperation)
})

// Delete a currency
router.delete('/:CurrencyID', (req, res) => {
    const RequiredPermissions = [AppOps.PermissionTypes.CanDeleteCurrency]
    
    const RouteOperation = () => {
        AppOps.ReadBySecret(req.headers.authorization.split(' ')[1]).then(thisApp => {
            if (thisApp.Currencies.includes(req.params.CurrencyID)) {
                Currency.Model.deleteOne({_id: req.params.CurrencyID}, (err, MongoResponse) => {
                    if (err) res.status(500).send(err)
                    else {
                        AppOps.RemoveCurrency(req.params.CurrencyID, req.headers.authorization.split(' ')[1])
                        res.status(200).send('OK: Data deleted')
                    }
                })
            }
            else {
                res.status(403).send(`Forbidden: Applications can only perform this operation on currencies they created`)
            }
        })
    }
    
    ProtectRoute(RequiredPermissions, req, res, RouteOperation)
})

// Add to a currency's stockpile
router.put('/:CurrencyID/mint', (req, res) => {
    const RequiredPermissions = [AppOps.PermissionTypes.CanMintCurrency]

    const RouteOperation = () => {
        AppOps.ReadBySecret(req.headers.authorization.split(' ')[1]).then(thisApp => {
            if (thisApp.Currencies.includes(req.params.CurrencyID)) {
                if (req.query.hasOwnProperty('amount')) {
                    if (!isNaN(parseInt(req.query.amount)) && (parseInt(req.query.amount) >= 0)) {
                        CurrencyOps.ReadOneCurrency(req.params.CurrencyID).then( thisCurrency => {
                            if (thisCurrency) {
                                thisCurrency.CurrencyRemainingStockpile += parseInt(req.query.amount)
                                thisCurrency.CurrencyTotalStockpile += parseInt(req.query.amount)
                                thisCurrency.save()
                                res.status(200).send(thisCurrency)
                            }
                            else {
                                res.status(404).send(`Not found: Currency ID ${req.params.CurrencyID} does not exist`)
                            }
                        })
                    }
                    else {
                        res.status(400).send('Bad request: \'amount\' must be a positive, non-zero number')
                    }
                }
                else {
                    res.status(400).send('Bad request: No amount specified in query')
                }
            }
            else {
                res.status(403).send(`Forbidden: Applications can only perform this operation on currencies they created`)
            }
        })
    }

    ProtectRoute(RequiredPermissions, req, res, RouteOperation)
})

// Remove from a currency's stockpile
router.delete('/:CurrencyID/mint', (req, res) => {
    const RequiredPermissions = [AppOps.PermissionTypes.CanDestroyCurrency]

    const RouteOperation = () => {
        AppOps.ReadBySecret(req.headers.authorization.split(' ')[1]).then(thisApp => {
            if (thisApp.Currencies.includes(req.params.CurrencyID)) {
                if (req.query.hasOwnProperty('amount')) {
                    if (!isNaN(parseInt(req.query.amount)) && (parseInt(req.query.amount) >= 0)) {
                        CurrencyOps.ReadOneCurrency(req.params.CurrencyID).then( thisCurrency => {
                            if (thisCurrency) {
                                thisCurrency.CurrencyRemainingStockpile -= parseInt(req.query.amount)
                                thisCurrency.CurrencyTotalStockpile -= parseInt(req.query.amount)
                                thisCurrency.save()
                                res.status(200).send(thisCurrency)
                            }
                            else {
                                res.status(404).send(`Not found: Currency ID ${req.params.CurrencyID} does not exist`)
                            }
                        })
                    }
                    else {
                        res.status(400).send('Bad request: \'amount\' must be a positive, non-zero number')
                    }
                }
                else {
                    res.status(400).send('Bad request: No amount specified in query')
                }
            }
            else {
                res.status(403).send(`Forbidden: Applications can only perform this operation on currencies they created`)
            }
        })
        
    }

    ProtectRoute(RequiredPermissions, req, res, RouteOperation)
})

module.exports = router