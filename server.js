require('dotenv').config(); 

const express = require('express');
const cors = require('cors'); 
const db = require('./db'); 

const app = express();
const port = process.env.PORT || 3000;

const envelopesRouter = require('./envelopesRouter');

app.use(cors());
app.use(express.json());

// This tells Express to serve your HTML/CSS/JS files from the current folder
app.use(express.static('./')); 

// This ensures that when someone goes to the URL, it opens index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use('/api/envelopes', envelopesRouter);

app.get('/', (req, res) => {
    res.send('Personal Budget API is ready with SQLite!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});