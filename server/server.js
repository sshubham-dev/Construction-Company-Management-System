const app = require('./app');
const connectDB = require('./db/dbConnection');
const dotenv = require('dotenv');

dotenv.config();
const port = process.env.PORT || 4000;

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed!!!", err);
    });
