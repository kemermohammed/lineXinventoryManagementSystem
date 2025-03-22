const express = require('express');
const env = require('dotenv');
env.config();
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./config');
connectDB();



app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}/`);
    });