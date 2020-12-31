const mongoose = require('mongoose');
const AppSchema = require('./schema/application')
const AssignmentSchema = require('./schema/assignment')
const CurrencySchema = require('./schema/currency')
const FamilySchema = require('./schema/family')
const GuildSchema = require('./schema/guild')
const ItemSchema = require('./schema/item')
const TitleSchema = require('./schema/title')
const UserSchema = require('./schema/user')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to MongoDB!")
});


