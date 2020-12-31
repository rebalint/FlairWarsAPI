/** Operations for the Guild Model 
 * 
 * === SCHEMA ===
 * GuildID: String,
 * GuildPrefix: String,
 * LoggingChannelID: { type: String, default: 'None' },
 * BotManagerRoles: [],
 * DefaultCurrency: {type: mongoose.Schema.Types.ObjectId, ref: 'CurrencyTypes'}
*/
const Guild = require('../schema/guild')
const Currency = require('../schema/currency')

module.exports.CreateGuild = (GuildID) => {
    let NewGuild = new Guild.Model({
        GuildID: GuildID,
        GuildPrefix: '::',
        LoggingChannelID: 'None',
        BotManagerRoles: [],
        DefaultCurrency: null
    })

    NewGuild.save( err => {
        if (err) console.log(err);
    })
}

module.exports.ReadOneGuild = async (GuildID) => {
    return await Guild.Model.findOne({GuildID: GuildID}).populate('DefaultCurrency').exec()
}

module.exports.ReadAllGuilds = async () => {
    return await Guild.Model.find({}).populate('DefaultCurrency').exec()
}

module.exports.AddBotManagerRole = (GuildID, RoleID) => {
    Guild.Model.findOne({GuildID: GuildID}).exec( (err, res) => {
        if (err) console.error(err);
        else {
            if (res.BotManagerRoles.includes(RoleID)) return;
            else {
                res.BotManagerRoles.push(RoleID)
                res.save()
            }
        }
    })
}

module.exports.RemoveBotManagerRole = (GuildID, RoleID) => {
    Guild.Model.findOne({GuildID: GuildID}).exec( (err, res) => {
        if (err) console.error(err);
        else {
            if (res.BotManagerRoles.includes(RoleID)) {
                res.BotManagerRoles.splice(res.BotManagerRoles.indexOf(RoleID), 1)
                res.save()
            }
            else return;
        }
    })
}

module.exports.ChangePrefix = (GuildID, NewPrefix) => {
    Guild.Model.findOne({GuildID: GuildID}).exec( (err, res) => {
        if (err) console.error(err);
        else {
            res.GuildPrefix = NewPrefix
            res.save()
        }
    })
}

module.exports.ChangeLoggingChannel = (GuildID, NewChannel) => {
    Guild.Model.findOne({GuildID: GuildID}).exec( (err, res) => {
        if (err) console.error(err);
        else {
            res.LoggingChannelID = NewChannel
            res.save()
        }
    })
}

module.exports.ChangeGuildCurrency = (GuildID, CurrencyID) => {
    Guild.Model.findOne({GuildID: GuildID}).exec( (GuildErr, ThisGuild) => {
        if (GuildErr) console.error(err);
        else {
            Currency.Model.findById(CurrencyID).exec( (err, ThisCurrency) => {
                if (err) console.error(err);
                else {
                    if (ThisCurrency) {
                        ThisGuild.DefaultCurrency = ThisCurrency
                        ThisGuild.save()
                    }
                }
            })
        }
    })
}