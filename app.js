const express = require('express');
const env = require('dotenv');
env.config();
const app = express();
const port = process.env.PORT || 3000;
const connectDB = require('./config');
const productRouter = require('./routers/product');
const buy = require('./routers/buy')

app.use(express.json());
app.use("/uploads", express.static("uploads"));

connectDB();


app.use('/',productRouter);
app.use('/',buy);

app.listen(port, () => { 
    console.log(`Server running at http://localhost:${port}/`);
    });