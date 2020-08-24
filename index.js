#!/usr/bin/env nodemon

// * Setting *
const PORT = 4000


// * Import Modules *
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const mainapp = require('./src')


// * Set Express Modules *
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/', mainapp)
app.listen(PORT,()=>console.log(`HTTP server for JIGUGONG is start on ${PORT}`))