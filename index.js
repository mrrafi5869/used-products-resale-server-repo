require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', async(req, res) => {
    res.send('used products server is running');
});

app.listen(port, async(req, res) => {
    console.log(`server is running on port ${port}`);
});