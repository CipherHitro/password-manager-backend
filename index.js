const express = require("express");
const cookieParser = require('cookie-parser');
const passwordRoute = require("./routes/password");
const userRoute = require('./routes/user')
const { connectMongoDb } = require("./connection");
const { restrictToLoggedinUser } = require('./middlewares/auth')
require('dotenv').config();

const cors = require("cors");

const corsOptions = {
  origin: 'https://password-manager-frontend-psi.vercel.app', //  Must be a specific origin, not '*'
  credentials: true,              // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const app = express();
const port = process.env.PORT || 2000;

//Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


// Connect MongoDb
connectMongoDb(process.env.MONGO_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/password", restrictToLoggedinUser, passwordRoute);
app.use("/user", userRoute);


app.listen(port, () => {
  console.log("Server is running at http://localhost:" + port);
});
