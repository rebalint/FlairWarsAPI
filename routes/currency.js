const express = require('express')
const router = express.Router()

const CurrencyOps = require('../db/operations/currency')
const AppOps = require('../db/operations/application')
const ProtectRoute = require('../auth/protected')

let MapCurrency = (currencyFromDB) => {
    return {
        id: currencyFromDB._id,
        Name: currencyFromDB.CurrencyName,
        Symbol: currencyFromDB.CurrencySymbol,
        RemainingStockpile: currencyFromDB.CurrencyRemainingStockpile,
        Stockpile: currencyFromDB.CurrencyTotalStockpile
    }
}

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
                {CurrencySymbol: req.query.Symbol},
                {_id: req.query.ID}
            ]
        }).then( queriedurrencies => {
            const responseArray = []
            queriedurrencies.forEach( currency => {
                let AddedCurrency = MapCurrency(currency)
                responseArray.push(AddedCurrency)
            })
            res.status(200).send(responseArray)
        })
    }
})

router.post('/', (req, res) => {

    const RoutePermissions = [AppOps.PermissionTypes.CanWriteCurrencies]

    const RouteOperation = () => {
        const RequiredFields = ['Name', 'Symbol']
        if (RequiredFields.every( item => req.body.hasOwnProperty(item))) {
            CurrencyOps.CreateCurrency(req.body.Name, req.body.Symbol).then( NewCurrency => {
                res.status(201).send(`Created currency ${NewCurrency.CurrencyName} with a stockpile of ${NewCurrency.CurrencySymbol}${NewCurrency.CurrencyTotalStockpile}`)
            })
        }
        else {
            res.status(400).send('Bad request: Incomplete body')
        }
    }

    ProtectRoute(RoutePermissions, req, res, RouteOperation)
})

module.exports = router