const express = require('express');
const router = express.Router();
const db = require('./db');

// --- 1. GET ALL ENVELOPES ---
router.get('/', (req, res) => {
    const queryText = 'SELECT * FROM envelopes ORDER BY id;';
    db.all(queryText, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving envelopes:', err.message);
            return res.status(500).json({ error: 'Failed to retrieve envelopes.' });
        }
        res.status(200).json(rows);
    });
});

// --- 2. GET SINGLE ENVELOPE ---
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.get('SELECT * FROM envelopes WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Envelope not found.' });
        res.status(200).json(row);
    });
});

// --- 3. CREATE ENVELOPE ---
router.post('/', (req, res) => {
    const { title, budget } = req.body;
    if (!title || budget === undefined || isNaN(budget)) {
        return res.status(400).json({ error: 'Invalid title or budget.' });
    }
    const queryText = `INSERT INTO envelopes (title, budget) VALUES (?, ?)`;
    db.run(queryText, [title, budget], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to create envelope.' });
        res.status(201).json({ id: this.lastID, title, budget });
    });
});

// --- 4. UPDATE ENVELOPE ---
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, budget } = req.body;
    const queryText = `UPDATE envelopes SET title = ?, budget = ? WHERE id = ?`;
    db.run(queryText, [title, budget, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Envelope not found.' });
        res.status(200).json({ id, title, budget });
    });
});

// --- 5. DELETE ENVELOPE ---
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.run('DELETE FROM envelopes WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Envelope not found.' });
        res.status(204).send();
    });
});

// --- 6. LOG EXPENSE (SPEND) ---
router.post('/:id/spend', (req, res) => {
    const id = parseInt(req.params.id);
    const { amount } = req.body;
    const expense = parseFloat(amount);

    if (isNaN(id) || isNaN(expense) || expense <= 0) {
        return res.status(400).json({ error: 'Invalid ID or amount.' });
    }

    // Subtract amount from current budget
    const queryText = `UPDATE envelopes SET budget = budget - ? WHERE id = ?`;
    db.run(queryText, [expense, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Envelope not found.' });

        // Get updated balance to return to user
        db.get('SELECT * FROM envelopes WHERE id = ?', [id], (err, row) => {
            res.status(200).json({ message: `Spent ${expense}`, envelope: row });
        });
    });
});

// --- 7. SWEEP FUNDS (ROLLOVER) ---
router.post('/sweep', (req, res) => {
    const { destination_id } = req.body;
    const destId = parseInt(destination_id);

    if (!destId || isNaN(destId)) {
        return res.status(400).json({ error: 'Invalid destination ID.' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Calculate total sum of all other envelopes
        db.get(`SELECT SUM(budget) AS total FROM envelopes WHERE id != ?`, [destId], (err, row) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: 'Sweep calculation failed.' });
            }

            const totalSweep = row.total || 0;

            // Update all others to 0 and add total to destination
            db.run(`UPDATE envelopes SET budget = 0 WHERE id != ?`, [destId]);
            db.run(`UPDATE envelopes SET budget = budget + ? WHERE id = ?`, [totalSweep, destId], function(err) {
                if (err || this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Destination envelope not found.' });
                }

                db.run('COMMIT', (err) => {
                    if (err) return res.status(500).json({ error: 'Commit failed.' });
                    res.status(200).json({ 
                        message: `Sweep successful! Moved ${totalSweep} to ID ${destId}` 
                    });
                });
            });
        });
    });
});

module.exports = router;