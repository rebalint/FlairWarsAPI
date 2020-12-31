/**
 * This is the Guild Schema. It contains...
 * Database Schema for Guild Configuration Objects in the database
 */

const mongoose = require('mongoose')

module.exports.Schema = new mongoose.Schema({
    FamilyName: String,
    FamilyHead: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
    FamilyManagers: [{
        ManagerUser: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
        CanManageBalance: mongoose.Schema.Types.Boolean,
        CanManageAssignments: mongoose.Schema.Types.Boolean,
        CanManageRelationships: mongoose.Schema.Types.Boolean,
        CanManageDescAndSeal: mongoose.Schema.Types.Boolean
    }],
    FamilyMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
    Relationships: [],
    Titles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Titles' }],
    Assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignments' }],
    FamilyCurrency: Number,
    FamilySealURL: String,
    FamilyDesc: String
})

module.exports.Model = mongoose.model("Families", exports.Schema)