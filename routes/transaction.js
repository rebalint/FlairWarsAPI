/** 
 * Transaction Routes
 */

const express = require('express')
const router = express.Router()

const TransactionOps = require('../db/operations/transaction')
const AppOps = require('../db/operations/application')
const CurrencyOps = require('../db/operations/currency')
const UserOps = require('../db/operations/user')
const ProtectRoute = require('../auth/protected')

const MapTransaction = (transactionFromDB) => {
    let thisTransaction = {}
    thisTransaction.ID = transactionFromDB._id
    thisTransaction.DateActioned = transactionFromDB.DateActioned.toDateString()
    thisTransaction.Type = transactionFromDB.Type
    switch(thisTransaction.Type) {
        case 'Withdrawal':
            thisTransaction.From = `/currencies/${transactionFromDB.FromEntity}`
            thisTransaction.To = `/users/${transactionFromDB.ToEntity}`
            break;
        case 'Deposit':
            thisTransaction.From = `/users/${transactionFromDB.FromEntity}`
            thisTransaction.To = `/currencies/${transactionFromDB.ToEntity}`
            break;
        case 'UserTransfer':
            thisTransaction.From = `/users/${transactionFromDB.FromEntity}`
            thisTransaction.To = `/users/${transactionFromDB.ToEntity}`
            thisTransaction.FromCurrency = `/currencies/${transactionFromDB.FromCurrency}`
            thisTransaction.ToCurrency = `/currencies/${transactionFromDB.ToCurrency}`
            break;
        case 'BankExchange':
            thisTransaction.From = `/currencies/${transactionFromDB.FromEntity}`
            thisTransaction.To = `/currencies/${transactionFromDB.ToEntity}`
            break;
        case 'UserExchange':
            thisTransaction.From = `/users/${transactionFromDB.FromEntity}`
            thisTransaction.To = `/currencies/${transactionFromDB.ToEntity}`
            thisTransaction.FromCurrency = `/currencies/${transactionFromDB.FromCurrency}`
            thisTransaction.ToCurrency = `/currencies/${transactionFromDB.ToCurrency}`
            break;
    }
    thisTransaction.Desc = transactionFromDB.TransactionDescription
    thisTransaction.Amount = transactionFromDB.Amount

    return thisTransaction
}

router.get('/', (req, res) => {
    // This route will retrieve all transactions, or transactions within a query

    if (Object.keys(req.query).length === 0) {
        TransactionOps.ReadAllTransactions().then(AllTransactions => {
            let ResponseArray = []
            AllTransactions.forEach(transaction => {
                ResponseArray.push(MapTransaction(transaction))
            })

            res.status(200).send(ResponseArray)
        })
    }
    else {
        let QueryBuild = {}
        Object.keys(req.query).forEach( queryParam => {
            let DateRegex = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/
            switch (queryParam) {
                case "fromDate":
                    if (DateRegex.test(req.query.fromDate)) {
                        if (!QueryBuild.hasOwnProperty('DateActioned')) QueryBuild.DateActioned = {}
                        QueryBuild.DateActioned.$gte = new Date(req.query.fromDate);
                    }
                    break;
                case "toDate":
                    if (DateRegex.test(req.query.fromDate)) {
                        if (!QueryBuild.hasOwnProperty('DateActioned')) QueryBuild.DateActioned = {}
                        QueryBuild.DateActioned.$lte = new Date(req.query.fromDate);
                    }
                    break;
                case "lessThan":
                    if (!QueryBuild.hasOwnProperty('Amount')) QueryBuild.Amount = {}
                    QueryBuild.Amount.$lte = req.query.lessThan
                    break;
                case "greaterThan":
                    if (!QueryBuild.hasOwnProperty('Amount')) QueryBuild.Amount = {}
                    QueryBuild.Amount.$gte = req.query.greaterThan
                    break;
                case "type":
                    QueryBuild.Type = req.query.type
                    break;
                case "from":
                    QueryBuild.FromEntity = req.query.from
                    break;
                case "to":
                    QueryBuild.ToEntity = req.query.to
                    break;
            }
        })
        TransactionOps.ReadTransactionsByQuery(QueryBuild).then(queriedTransactions => {
            let ResponseArray = []
            queriedTransactions.forEach(transaction => {
                ResponseArray.push(MapTransaction(transaction))
            })
            res.status(200).send(ResponseArray)
        })
    }
})

// This helper function validates that a User exists, respondes with a 404 if not
const ValidateUser = (UserID, res, cb) => {
    UserOps.ReadOneUser(UserID).then(thisUser => {
        if (thisUser) {
            cb(thisUser)
        }
        else {
            res.status(404).send(`Not found: User ${UserID} not found`)
        }
    })
}

// This helper function validates that a Currency exists, respondes with a 404 if not
const ValidateCurrency = (CurrencyID, res, cb) => {
    CurrencyOps.ReadOneCurrency(CurrencyID).then( thisCurrency => {
        if (thisCurrency) {
            cb(thisCurrency)
        }
        else {
            res.status(404).send(`Not found: Currency ${CurrencyID} not found`)
        }
    })
}

// This route handles validation of and creation of Transactions
router.post('/', (req, res) => {
    const RequiredPermissions = [AppOps.PermissionTypes.CanInteractWithCurrency]

    const RouteOperation = () => {
        const RequiredFields = ["Type", "From", "To", "Amount", "Desc"]
        if (RequiredFields.every( item => req.body.hasOwnProperty(item))) {
            if (!isNaN(parseInt(req.body.Amount)) && parseInt(req.body.Amount) > 0) {
                if (TransactionOps.TransactionTypes.hasOwnProperty(req.body.Type)) {
                    switch (req.body.Type) {
                        case 'Withdrawal':
                            // Withdrawal type transaction
                            ValidateCurrency(req.body.From, res, FromCurrency => {
                                ValidateUser(req.body.To, res, ToUser => {
                                    let TransactionObject = {
                                        From: FromCurrency._id,
                                        To: ToUser.MemberID,
                                        Amount: parseInt(req.body.Amount),
                                        Desc: req.body.Desc,
                                        FromCurrency: 'None',
                                        ToCurrency: 'None'
                                    }
                                    // TransactionOps.CreateTransaction('Withdrawal',    )
                                    TransactionOps.Create('Withdrawal', TransactionObject, Success => {
                                        if (Success) {
                                            res.status(201).send('Created')
                                        }
                                        else {
                                            res.status(400).send('Bad Request')
                                        }
                                    })
                                })
                            })

                            break;

                        case 'Deposit':
                            // Deposit type transaction
                            ValidateUser(req.body.From, res, FromUser => {
                                ValidateCurrency(req.body.To, res, ToCurrency => {
                                    let TransactionObject = {
                                        From: FromUser.MemberID,
                                        To: ToCurrency._id,
                                        Amount: parseInt(req.body.Amount),
                                        Desc: req.body.Desc,
                                        FromCurrency: 'None',
                                        ToCurrency: 'None'
                                    }
                                    TransactionOps.Create('Deposit', TransactionObject, Success => {
                                        if (Success) {
                                            console.log('Deposit Op Success')
                                            res.status(201).send('Created')
                                        }
                                        else {
                                            console.log('Deposit Op Failed')
                                            res.status(400).send('Bad Request')
                                        }
                                    })
                                })
                            })

                            break;

                        case 'UserTransfer':
                            // UserTransfer type transaction
                            ValidateUser(req.body.From, res, FromUser => {
                                ValidateUser(req.body.To, res, ToUser => {
                                    if (req.body.hasOwnProperty('FromCurrency')) {
                                        ValidateCurrency(req.body.FromCurrency, res, FromCurrency => {
                                            if (req.body.hasOwnProperty('ToCurrency')) {
                                                ValidateCurrency(req.body.ToCurrency, res, ToCurrency => {
                                                    let TransactionObject = {
                                                        From: FromUser.MemberID,
                                                        To: ToUser.MemberID,
                                                        Amount: parseInt(req.body.Amount),
                                                        Desc: req.body.Desc,
                                                        FromCurrency: FromCurrency._id,
                                                        ToCurrency: ToCurrency._id
                                                    }

                                                    TransactionOps.Create('UserTransfer', TransactionObject, Success => {
                                                        if (Success) {
                                                            res.status(201).send('Created')
                                                        }
                                                        else {
                                                            res.status(400).send('Bad Request')
                                                        }
                                                    })
                                                })
                                            }
                                            else {
                                                res.status(400).send('Bad request: Please include \'ToCurrency\'')
                                            }
                                        })
                                    }
                                    else {
                                        res.status(400).send('Bad request: Please include \'FromCurrency\'')
                                    }
                                })
                            })

                            break;

                        case 'BankExchange':

                            ValidateCurrency(req.body.From, res, FromCurrency => {
                                ValidateCurrency(req.body.To, res, ToCurrency => {
                                    let TransactionObject = {
                                        From: FromCurrency._id,
                                        To: ToCurrency._id,
                                        Amount: parseInt(req.body.Amount),
                                        Desc: req.body.Desc,
                                        FromCurrency: 'None',
                                        ToCurrency: 'None'
                                    }
                                    TransactionOps.Create('BankExchange', TransactionObject, Success => {
                                        if (Success) {
                                            res.status(201).send('Created')
                                        }
                                        else {
                                            res.status(400).send('Bad Request')
                                        }
                                    })
                                })
                            })

                            break;

                        case 'UserExchange':

                            ValidateUser(req.body.From, res, FromUser => {
                                ValidateCurrency(req.body.To, res, ToBank => {
                                    if (req.body.hasOwnProperty('FromCurrency')) {
                                        ValidateCurrency(req.body.FromCurrency, res, FromCurrency => {
                                            if (req.body.hasOwnProperty('ToCurrency')) {
                                                ValidateCurrency(req.body.ToCurrency, res, ToCurrency => {
                                                    let TransactionObject = {
                                                        From: FromUser.MemberID,
                                                        To: ToBank._id,
                                                        Amount: parseInt(req.body.Amount),
                                                        Desc: req.body.Desc,
                                                        FromCurrency: FromCurrency._id,
                                                        ToCurrency: ToCurrency._id
                                                    }
                                                    TransactionOps.Create('UserExchange', TransactionObject, Success => {
                                                        if (Success) {
                                                            res.status(201).send('Created')
                                                        }
                                                        else {
                                                            res.status(400).send('Bad Request')
                                                        }
                                                    })
                                                })
                                            }
                                            else {
                                                res.status(400).send('Bad request: Please include \'ToCurrency\'')
                                            }
                                        })
                                    }
                                    else {
                                        res.status(400).send('Bad request: Please include \'FromCurrency\'')
                                    }
                                })
                            })

                            break;

                    }
                }
                else {
                    res.status(400).send('Bad request: Invalid type')
                }
            }
            else {
                res.status(400).send('Bad request: Amount must be a positive non-zero number')
            }
        }
        else {
            res.status(403).send('Bad request: Incomplete body')
        }
    }

    ProtectRoute(RequiredPermissions, req, res, RouteOperation)
})

module.exports = router