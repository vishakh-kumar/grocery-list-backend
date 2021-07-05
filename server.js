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
//       Routes-Landing Page
//================================

app.get("/", (req, res) => {
    res.send("SSUP");
});
//================================
//       Routes-Index Page
//================================
app.get("/grocery", async (req, res) => {
    try {
        res.json(await Grocery.find({}));
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
app.post("/grocery", async (req, res) => {
    try {
        res.json(await Grocery.create(req.body));
    } catch (error) {
        res.status(400).json(error);
    }
});

//================================
//         Web-listeners
//================================
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
