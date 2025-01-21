const express = require('express');
const dbConnect = require('./config/dbConnect');
const authRouter = require('./routes/authRoute');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const dotenv = require('dotenv').config();
PORT = process.env.PORT || 4000
dbConnect();
// app.use (express.json());
// app.use(express.urlencoded({extended: true}));
app.use (bodyParser.json());
app.use(cookieParser())
app.use (bodyParser.urlencoded({extended:false}));
app.get('/', (req, res) => {
    res.send('Hello, world!');
  });
app.use('/api/user', authRouter);


app.use(notFound);
app.use(errorHandler)

app.listen(PORT, ()=> {
    console.log(`Server running on http://localhost:${PORT}`);
});


