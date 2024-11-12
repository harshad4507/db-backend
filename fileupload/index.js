const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./config/dbConnect');
const cookieParser = require('cookie-parser');
const path = require('path');
const fileroutes = require('./routes/Files');

const PORT = process.env.PORT || 3000; 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to database');
  }
});

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

app.use('/api/v1/uploads',fileroutes);
app.use('/api/v1/auth',require('./routes/User'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});