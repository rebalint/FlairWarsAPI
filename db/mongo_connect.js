const mongoose = require('mongoose');

// Connect to the database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// Create a reference to the connection
const db = mongoose.connection;

// Handle ERROR events by logging them
db.on('error', console.error.bind(console, 'connection error:'));

// Logs once the connection is completed
db.once('open', function() {
  console.log("Connected to MongoDB!")
});


