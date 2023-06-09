/**
 * This is the Transaction Schema. It contains...
 * Database Schema for Transaction Objects in the database
 */

const { DataTypes } = require('sequelize')
const { Db } = require('../db')

module.exports.Schema = Db.define("Transaction", {
    DateActioned: DataTypes.DATE,
    Type: DataTypes.STRING,
    FromEntity: DataTypes.STRING,
    ToEntity: DataTypes.STRING,
    TransactionDescription: DataTypes.STRING,
    Amount: DataTypes.INTEGER,
    FromCurrency: DataTypes.STRING,
    ToCurrency: DataTypes.STRING
})