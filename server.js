//================================
//          Dependencies
//================================
//get .env variable
require("dotenv").config();
//pull PORT and MONGOB_URL from .env
const { PORT = 5000, MONGODB_URL } = process.env;
//import express, mongoose, cors, morgan
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
//initialize app
const app = express();

//================================
//      Database Connection
//================================
//Establish connection
mongoose.connect(MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});
//connection Events
mongoose.connection
    .on("open", () => console.log("You are connected to mongoose"))
    .on("close", () => console.log("You are disconnected to mongoose"))
    .on("error", (error) => console.log(error));

//================================
//             Models
//================================
const GrocerySchema = new mongoose.Schema({
    item: String,
    date: String,
    urgent: Boolean,
    //to assiociate list with the user
    createdById: String,
});

const Grocery = mongoose.model("Grocery", GrocerySchema);

//================================
//          Middleware
//================================
app.use(cors()); // to prevent cors error when cross-origin requests are made
app.use(morgan("dev")); //logging the calls
app.use(express.json()); //parse json bodies

//================================
//   Google Firebase Middleware
//================================

const admin = require("firebase-admin");

const serviceAccount = require("./grocery-list-b4997-firebase-adminsdk-e8dnl-a724ef5fba.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
app.use(async function (req, res, next) {
    const token = req.get("Authorization");
    // next makes the next information to work in this case Routes!
    if (!token) return next();
    const user = await admin.auth().verifyIdToken(token.replace("Bearer ", ""));
    if (user) {
        req.user = user;
    } else {
        return res.status(401).json({ error: "token invalid" });
    }
    next();
});

function isAuthenticated(req, res, next) {
    if (req.user) return next();
    res.status(401).json({ error: "Please login first" });
}

//================================
//       Routes-Landing Page
//================================

app.get("/", (req, res) => {
    res.send("SSUP");
});
//================================
//       Routes-Index Page
//================================
app.get("/grocery", async (req, res) => {
    const query = req.query.uid ? { createdById: req.query.uid } : {};
    try {
        res.json(await Grocery.find(query));
    } catch (error) {
        res.status(400).json(error);
    }
});
//================================
//       Routes-Delete Page
//================================
app.delete("/grocery/:id", async (req, res) => {
    try {
        res.json(await Grocery.findByIdAndRemove(req.params.id));
    } catch (error) {
        res.status(400).json(error);
    }
});
//================================
//       Routes-Update Page
//================================
app.put("/grocery/:id", async (req, res) => {
    try {
        //send all grocery
        res.json(
            await Grocery.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
            })
        );
    } catch (error) {
        //send error
        console.log(error);
        res.status(400).json(error);
    }
});
//================================
//       Routes-Create Page
//================================
app.post("/grocery", isAuthenticated, async (req, res) => {
    try {
        req.body.createdById = req.user.uid;
        res.json(await Grocery.create(req.body));
    } catch (error) {
        res.status(400).json(error);
    }
});

//================================
//         Web-listeners
//================================
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
