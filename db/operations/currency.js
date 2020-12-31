/** 
 * Currency Operations
 * 
 * === SCHEMA ===
 * CurrencyName: String,
 * CurrencySymbol: String,
 * CurrencyTotalStockpile: Number,
 * CurrencyRemainingStockpile: Number
 */

const Currency = require('../schema/currency')

module.exports.CreateCurrency = (CurrencyName, CurrencySymbol) => {
    let NewCurrency = new Currency.Model({
        CurrencyName: CurrencyName,
        CurrencySymbol: CurrencySymbol,
        CurrencyTotalStockpile: 1000000000,
        CurrencyRemainingStockpile: 1000000000
    })

    return NewCurrency.save()
}

module.exports.ReadOneCurrency = async (CurrencyID) => {
    return await Currency.Model.findById(CurrencyID).exec()
}

module.exports.ReadCurrencies = async () => {
    return await Currency.Model.find({}).exec()
}

module.exports.PullFromStockpile = (CurrencyID, Amount) => {
    Currency.Model.findById(CurrencyID).exec( (err, res) => {
        if (err) console.error(err);
        else {
            console.log(`STOCKPILE INTERACTION: <${res.CurrencyName} - ${res.CurrencySymbol}${Amount}> TRANSFERRED`)
            res.CurrencyRemainingStockpile -= Amount
            res.save()
        }
    })
    return Amount
}