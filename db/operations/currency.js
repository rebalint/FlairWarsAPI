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

// Create a new currency type. The default stockpile is 1bil
module.exports.CreateCurrency = (CurrencyName, CurrencySymbol) => {
    let NewCurrency = new Currency.Model({
        CurrencyName: CurrencyName,
        CurrencySymbol: CurrencySymbol,
        CurrencyTotalStockpile: 1000000000,
        CurrencyRemainingStockpile: 1000000000
    })

    return NewCurrency.save()
}

// Read a currency from the database by its ID
module.exports.ReadOneCurrency = async (CurrencyID) => {
    return await Currency.Model.findById(CurrencyID).exec()
}

// Read all currencies from the database
module.exports.ReadCurrencies = async () => {
    return await Currency.Model.find({}).exec()
}

// Read currencies given some query
module.exports.ReadCurrenciesByQuery = async (query) => {
    return await Currency.Model.find(query).exec
}

// Perform a transaction with the Stockpile. Note- Adding to the stockpile is a NEGATIVE amount,
// pulling from the stockpile is a POSITIVE amount. This is because it is used in reference to a user
module.exports.StockpileTransaction = (CurrencyID, Amount) => {
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