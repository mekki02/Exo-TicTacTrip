const express = require("express");
const bodyParser = require("body-parser");

const app = express();

//Routes Configurations
const tokenRoutes = require("./api/token");
const justifyRoutes = require("./api/justify");

//Configuration of the body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/token", tokenRoutes);
app.use("/api/justify", justifyRoutes);

module.exports = app;