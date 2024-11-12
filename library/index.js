const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./config/dbConnect');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/User');
const bookRouter = require('./routes/Book');

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

app.use('/api/v1/auth',userRouter);
app.use('/api/v1/book',bookRouter);

app.listen(PORT, () => {   
    console.log(`Server is running on port ${PORT}`);
});

