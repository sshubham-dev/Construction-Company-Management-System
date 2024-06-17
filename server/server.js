const connectDB = require('./db/dbConnection')
const server = require("./app");
const dotenv = require('dotenv');

const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    console.error(dotenvResult.error);
    throw new Error("Failed to load environment variables");
}
const port = process.env.PORT || 4000;

// io.on('connection', (socket) => {
//     console.log('User Connected');
//     // console.log('Id:', socket.id);
//     socket.on('disconnect', () => {
//       console.log('User Disconnected')
//     })
//   })

connectDB()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server is listening on port ${port}`)
        })
    })
    .catch((err) => {
        console.log(("MONGO db connection failed !!!", err))
    });