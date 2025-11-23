const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');


// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.send('Hello World!');
})


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})