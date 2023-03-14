require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const mongoose = require('mongoose');
const indexRouter = require('./routes/index');

mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGODB_URI; 
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);





////////////////////////////////////////////
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({err});
});

module.exports = app;