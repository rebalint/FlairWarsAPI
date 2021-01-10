/** 
 * Transaction Operations
 * 
 * === SCHEMA ===
 * DateActioned: Date,
 * Type: String,
 * FromEntity: String,
 * ToEntity: String,
 * TransactionDescription: String,
 * Amount: Number
 * 
 * 
 * TransactionTypes
 * Withdrawal - Stockpile to User (Same currency type)
 * Deposit - User to Stockpile (Same currency type)
 * UserTransfer - User to User (Same currency type)
 * BankExchange - Stockpile to stockpile (different currency types)
 * UserExchange - User to Stockpile (different currency types)
 */

const Transaction = require('../schema/transaction')

const UserOps = require('./user')
const CurrencyOps = require('./currency')

// Structure for valid transaction type
module.exports.TransactionTypes = {
    Withdrawal: 'Withdrawal',
    Deposit: 'Deposit',
    UserTransfer: 'UserTransfer',
    BankExchange: 'BankExchange',
    UserExchange: 'UserExchange'
}

let IndexFinder = (array, key, value) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i][key].equals(value)) return i;
    }
    return -1
}

// This helper function will verify that a Currency has enough to cover some transaction
const VerifyCurrencyAmount = (CurrencyID, Amount, cb) => {
    CurrencyOps.ReadOneCurrency(CurrencyID).then( thisCurrency => {
        if (thisCurrency) {
            if (Amount > thisCurrency.CurrencyRemainingStockpile) {
                cb(false)
            }
            else cb(true)
        }
        else cb(false)
    })
}

// This helper function will verify that a User has enough to cover some transaction
const VerifyUserAmount = (CurrencyID, MemberID, Amount, cb) => {
    console.log(`Searching for user ${MemberID}`)
    UserOps.ReadOneUser(MemberID).then(thisUser => {
        if (thisUser) {
            let CurrencyIndex = IndexFinder(thisUser.CurrencyCount, 'CurrencyType', CurrencyID)
            if (CurrencyIndex >= 0) {
                console.log('Currency was found')
                if (Amount > thisUser.CurrencyCount[CurrencyIndex].CurrencyAmount) {
                    console.log('NOT ENOUGH - INSIDE VERIFY AMOUNT')
                    cb(false)
                }
                else cb(true)
            }
            else {
                console.log('Currency was not found')
                cb(false)
            }
        }
        else {
            console.log('USER was not found')
            cb(false)
        }
    })
}

module.exports.EvaluateCurrencyPrice = (currencyID, cb) => {
    let OneWeekAgo = new Date(new Date().getTime() - (60*60*24*7*1000))
    let NowDate = new Date()
    let WeekAgoQuery = new Date(OneWeekAgo.getFullYear(), OneWeekAgo.getMonth(), OneWeekAgo.getDate())
    let NowDateQuery = new Date(NowDate.getFullYear(), NowDate.getMonth(), NowDate.getDate())
    console.log(WeekAgoQuery)
    console.log(NowDateQuery)
    CurrencyOps.ReadOneCurrency(currencyID).then(thisCurrency => {
        Transaction.Model.find({
            $or: [
                { FromEntity: thisCurrency._id },
                { ToEntity: thisCurrency._id },
                { FromCurrency: thisCurrency._id },
                { ToCurrency: thisCurrency._id }
            ],
            DateActioned: {
                $gte: WeekAgoQuery,
                $lt: NowDateQuery
            }
        }).exec( (err, res) => {
            if (err) console.error(err);
            else {
                let TotalTransactions = res.length
                console.log(`Found ${TotalTransactions} transactions since last week`)
                let StockpileMultiplier = 1 - ( thisCurrency.CurrencyRemainingStockpile / thisCurrency.CurrencyTotalStockpile )
                console.log(`The stockpile multiplier is ${StockpileMultiplier}`)
                let CurrencyCost = (TotalTransactions * StockpileMultiplier) + 1
                console.log(`The price of this currency is ${CurrencyCost}`)
                cb (CurrencyCost)
            }
        })
    })
}

module.exports.Create = (Type, TransactionObject, cb) => {
    switch(Type) {
        case 'Withdrawal':
            VerifyCurrencyAmount(TransactionObject.From, TransactionObject.Amount, EnoughCurrency => {
                if (EnoughCurrency) {
                    CurrencyOps.StockpileTransaction(TransactionObject.From, TransactionObject.Amount)
                    UserOps.ChangeCurrencyAmount(TransactionObject.To, TransactionObject.From, TransactionObject.Amount)
                    let newTransaction = new Transaction.Model({
                        DateActioned: new Date(),
                        Type: Type,
                        FromEntity: TransactionObject.From,
                        ToEntity: TransactionObject.To,
                        TransactionDescription: TransactionObject.Desc,
                        Amount: TransactionObject.Amount,
                        FromCurrency: TransactionObject.FromCurrency,
                        ToCurrency: TransactionObject.ToCurrency
                    })
                    newTransaction.save()
                    cb(true)
                }
                else cb(false)
            })
            break;
        
        case 'Deposit':
            VerifyUserAmount(TransactionObject.To, TransactionObject.From, TransactionObject.Amount, EnoughCurrency => {
                if (EnoughCurrency) {
                    console.log('Enough Currency')
                    CurrencyOps.StockpileTransaction(TransactionObject.To, -(TransactionObject.Amount))
                    UserOps.ChangeCurrencyAmount(TransactionObject.From, TransactionObject.To, -(TransactionObject.Amount))
                    let newTransaction = new Transaction.Model({
                        DateActioned: new Date(),
                        Type: Type,
                        FromEntity: TransactionObject.From,
                        ToEntity: TransactionObject.To,
                        TransactionDescription: TransactionObject.Desc,
                        Amount: TransactionObject.Amount,
                        FromCurrency: TransactionObject.FromCurrency,
                        ToCurrency: TransactionObject.ToCurrency
                    })
                    newTransaction.save()
                    cb(true)
                }
                else {
                    console.log('Not enough Currency')
                    cb(false)
                }
            })
            break;
        
        case 'UserTransfer':
            VerifyUserAmount(TransactionObject.FromCurrency, TransactionObject.From, TransactionObject.Amount, EnoughCurrency => {
                if (EnoughCurrency) {
                    console.log('Enough currency')
                    UserOps.ChangeCurrencyAmount(TransactionObject.From, TransactionObject.FromCurrency, -(TransactionObject.Amount))
                    UserOps.ChangeCurrencyAmount(TransactionObject.To, TransactionObject.ToCurrency, TransactionObject.Amount)
                    let newTransaction = new Transaction.Model({
                        DateActioned: new Date(),
                        Type: Type,
                        FromEntity: TransactionObject.From,
                        ToEntity: TransactionObject.To,
                        TransactionDescription: TransactionObject.Desc,
                        Amount: TransactionObject.Amount,
                        FromCurrency: TransactionObject.FromCurrency,
                        ToCurrency: TransactionObject.ToCurrency
                    })
                    newTransaction.save()
                    cb(true)
                }
                else {
                    console.log('Not enough Currency')
                    cb(false)
                }
            })
            break;
        
        case 'BankExchange':
            VerifyCurrencyAmount(TransactionObject.From, TransactionObject.Amount, EnoughCurrency => {
                if (EnoughCurrency) {
                    CurrencyOps.ExchangeCurrency(TransactionObject.From, TransactionObject.To, TransactionObject.Amount, ExchangedAmount => {
                        console.log(`Exchange function succeded - ${ExchangedAmount} exchanged`)
                    })
                    let newTransaction = new Transaction.Model({
                        DateActioned: new Date(),
                        Type: Type,
                        FromEntity: TransactionObject.From,
                        ToEntity: TransactionObject.To,
                        TransactionDescription: TransactionObject.Desc,
                        Amount: TransactionObject.Amount,
                        FromCurrency: TransactionObject.FromCurrency,
                        ToCurrency: TransactionObject.ToCurrency
                    })
                    newTransaction.save()

                    cb(true)
                }
                else cb(false)
            })
            break;
        
        case 'UserExchange':
            VerifyUserAmount(TransactionObject.FromCurrency, TransactionObject.From, TransactionObject.Amount, EnoughCurrency => {
                if (EnoughCurrency) {
                    UserOps.ChangeCurrencyAmount(TransactionObject.From, TransactionObject.FromCurrency, -(TransactionObject.Amount))
                    CurrencyOps.ExchangeCurrency(TransactionObject.FromCurrency, TransactionObject.ToCurrency, TransactionObject.Amount, ExchangedAmount => {
                        UserOps.ChangeCurrencyAmount(TransactionObject.From, TransactionObject.ToCurrency, ExchangedAmount)
                        let newTransaction = new Transaction.Model({
                            DateActioned: new Date(),
                            Type: Type,
                            FromEntity: TransactionObject.From,
                            ToEntity: TransactionObject.To,
                            TransactionDescription: TransactionObject.Desc,
                            Amount: TransactionObject.Amount,
                            FromCurrency: TransactionObject.FromCurrency,
                            ToCurrency: TransactionObject.ToCurrency
                        })
                        newTransaction.save()
                        
                        cb(true)
                    })
                    
                }
                else cb(false)
            })
            break;
    }
}

// Retrieve ALL transactions
module.exports.ReadAllTransactions = async () => {
    return await Transaction.Model.find({}).exec()
}

// Retrieve transactions given a query
module.exports.ReadTransactionsByQuery = async (query) => {
    return await Transaction.Model.find(query).exec()
}