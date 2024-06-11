const express = require("express");
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser =  require ("body-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
//const CLIENT_APP_PATH = '../frontend/build';
// config file coneection
dotenv.config({path:"Backend/config/config.env"});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());
app.use(cors())
//Routes Import

const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRouter");


app.use("/api/v1",product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1",payment);


// app.use(express.static(CLIENT_APP_PATH));

// // ...express middlewares, rest, etc...

// // in the end of app routing
// // serves frontend application
// app.get('/*', (req, res) => {
//     res.sendFile(path.resolve(`${CLIENT_APP_PATH}/index.html`), { root: __dirname }, err => {
//         if (err) {
//             res.status(500).send(err);
//         }
//     });
// });
app.get('/', (req, res) => {
res.send("hello");
         })

//Middleware for Error
app.use(errorMiddleware);


module.exports = app;







//const dotenv = require("dotenv");
//dotenv.config({path:"Backend/config/config.env"});
