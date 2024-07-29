const { app } = require("./src/app.js")
// const {connectDB} = require("./src/db/index.js")
const auth = require('./src/file/auth.forward.js')
const express = require("express")
const apps = express()
const dotenv = require("dotenv")
dotenv.config()

    apps.get("/",(req,res)=>{
        res.status(200).json({
            name:"vishal",
            class:12,
            roll:"2ADDHDH&^&"
        })
    })