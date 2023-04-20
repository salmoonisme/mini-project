// packagee
const express = require('express');
const app = express();
const routes = require('./routes');
require('dotenv').config();
const server = require('http').createServer(app);
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use('/api', routes);
app.use('/uploads', express.static('uploads')); //serve avatar path from Users database

// error handling from next()
app.use((err, req, res, next) => {
  let status = err.statusCode || err.status || 500
  const error = err.error || err.message || 'Internal server error'
  if (err.error || err.message) {
    status = err.status
  }
  return res.status(status).json({
    status: status,
    message: 'Error',
    error: error 
  })
})

// server
server.listen(port, () => {
  console.log(`Port running on localhost:${port}`);
});

