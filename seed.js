const db = require('./db');

const expenses = [
    { title: 'General Shopping', budget: 6000 },
    { title: 'Internet', budget: 2000 },
    { title: 'Electricity', budget: 2000 },
    { title: 'Rent', budget: 12000 },
    { title: 'Netflix', budget: 1100 },
    { title: 'Food', budget: 5000 },
    { title: 'Offetory', budget: 1000 },
    { title: 'Hair Care', budget: 2000 },
    { title: 'Airtime', budget: 500 }
];

db.serialize(() => {
    // 1. Create the table
    db.run(`CREATE TABLE IF NOT EXISTS envelopes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        budget REAL NOT NULL
    )`);

    // 2. Clear existing data (optional, prevents duplicates if you run it twice)
    db.run(`DELETE FROM envelopes`);

    // 3. Insert your data
    const stmt = db.prepare(`INSERT INTO envelopes (title, budget) VALUES (?, ?)`);
    
    expenses.forEach(expense => {
        stmt.run(expense.title, expense.budget);
    });

    stmt.finalize();
    console.log("Database seeded successfully with your expenses!");
});