const sqlite3 = require('sqlite3').verbose();// For detailed error messages and to analyze how long it took SQL queries to run.
const path = require('path');

// Just define the path and export the connection
const dbPath = path.resolve(__dirname, 'budget.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to budget.sqlite');
    }
});

module.exports = db;