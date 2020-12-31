/** 
 * Family Operations
 * 
 * === SCHEMA ===
 * FamilyName: String,
 * FamilyHead: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
 * FamilyManagers: [{
 *  ManagerUser: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},
 *  CanManageBalance: mongoose.Schema.Types.Boolean,
 *  CanManageAssignments: mongoose.Schema.Types.Boolean,
 *  CanManageRelationships: mongoose.Schema.Types.Boolean,
 *  CanManageDescAndSeal: mongoose.Schema.Types.Boolean
 * }],
 * FamilyMembers: [{type: mongoose.Schema.Types.ObjectId, ref: 'Users'}],
 * Relationships: [],
 * Titles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Titles' }],
 * Assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignments' }],
 * FamilyCurrency: Number,
 * FamilySealURL: String,
 * FamilyDesc: String
 */

const Family = require('../schema/family')
const User = require('../schema/user')

module.exports.CreateFamily = (FamilyName, FamilyHead) => {
    User.Model.findOne({MemberID: FamilyHead}).exec( (err, ThisUser) => {
        console.log(ThisUser)
        const NewFamily = new Family.Model({
            FamilyName: FamilyName,
            FamilyHead: ThisUser._id,
            FamilyManagers: [],
            FamilyMembers: [],
            Relationships: [],
            Titles: [],
            Assignments: [],
            FamilyCurrency: 0,
            FamilySealURL: "https://cdn.discordapp.com/embed/avatars/0.png",
            FamilyDesc: `The ${FamilyName} Family`
        })

        NewFamily.save()
    })
}

module.exports.ReadFamilyByUser = (MemberID, cb) => {
    User.Model.findOne({MemberID: MemberID})
        .exec( (UserErr, ThisUser) => {
        if (UserErr) console.error(UserErr);
        else {
            if (ThisUser) {
                Family.Model.findOne({$or: [{FamilyHead: ThisUser._id}, {FamilyMembers: ThisUser._id}]})
                .populate('FamilyHead')
                .populate('FamilyManagers')
                .populate('FamilyMembers')
                .populate('Titles')
                .populate('Assignments')
                .exec( (FamilyErr, ThisFamily) => {
                if (FamilyErr) console.error(FamilyErr);
                else {
                    cb(ThisFamily)
                }
            })
            }
            else {
                cb(null)
            }
        }
    })
}

module.exports.AddUserToFamily = (MemberID, InvitingFamilyMemberID) => {
    User.Model.findOne({MemberID: InvitingFamilyMemberID}).exec( (UserErr, ThisUser) => {
        if (UserErr) console.error(UserErr);
        else {
            Family.Model.findOne({ $or: [{FamilyHead: ThisUser._id}, {FamilyMembers: ThisUser._id}]}).exec( (FamilyErr, ThisFamily) => {
                if (FamilyErr) console.error(FamilyErr);
                else {
                    User.Model.findOne({MemberID: MemberID}).exec( (MemberErr, NewMember) => {
                        if (MemberErr) console.error(MemberErr);
                        else {
                            ThisFamily.FamilyMembers.push(NewMember._id)
                            ThisFamily.save()
                            // Change hontype
                            if (NewMember.Color == 'orange') NewMember.HonType = 3
                            else NewMember.HonType = 2
                            NewMember.save()
                        }
                    })
                }
            })
        }
    })
}

module.exports.RemoveUserFromFamily = (MemberID) => {
    User.Model.findOne({MemberID: MemberID}).exec( (UserErr, ThisUser) => {
        if (UserErr) console.error(UserErr);
        else {
            Family.Model.findOne({FamilyMembers: ThisUser._id}).exec( (FamilyErr, ThisFamily) => {
                if (FamilyErr) console.error(FamilyErr);
                else {
                    ThisFamily.FamilyMembers.splice(ThisFamily.FamilyMembers.indexOf(ThisUser._id), 1)
                    for (let i = 0; i < ThisFamily.FamilyManagers.length; i++) {
                        if (ThisFamily.FamilyManagers[i].ManagerUser.equals(ThisUser._id)) {
                            ThisFamily.FamilyManagers.splice(i, 1)
                        }
                    }
                    ThisFamily.save()
                }
            })
            ThisUser.HonType = 1
            ThisUser.save()
        }
    })
}

module.exports.DisbandFamily = (MemberID) => {
    User.Model.findOne({MemberID: MemberID}).exec( (UserErr, ThisUser) => {
        if (UserErr) console.error(UserErr);
        else {
            Family.Model.findOne({FamilyHead: ThisUser._id}).exec( (FamilyErr, ThisFamily) => {
                if (FamilyErr) console.error(FamilyErr);
                else {
                    ThisUser.HonType = 1
                    ThisUser.save()
                    if (ThisFamily.FamilyMembers.length > 0) {
                        ThisFamily.FamilyMembers.forEach(member => {
                            User.Model.findById(member).exec( (MemberErr, ThisMember) => {
                                if (MemberErr) console.error(MemberErr);
                                else {
                                    ThisMember.HonType = 1
                                    ThisMember.save()
                                }
                            })
                        })
                    }
                    ThisFamily.delete()
                }
            })
        }
    })
}
