// Import dependencies
const connectDB = require('./db/dbConnection');
const app = require('./app');



// Set up the port
const port = process.env.PORT || 4000;

// Connect to the database
connectDB()
  .then(() => {
    // Start the server
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((err) => {
    // Handle database connection error
    console.error("MongoDB connection failed!!!", err);
  });