const API_URL = '/api/envelopes';

// DOM Elements
const envelopesList = document.getElementById('envelopes-list');
const spendingSelect = document.getElementById('spending-envelope-id');
const sweepSelect = document.getElementById('sweep-destination-id');
const createForm = document.getElementById('create-envelope-form');
const spendForm = document.getElementById('log-spending-form');
const sweepForm = document.getElementById('sweep-form');

// Currency Formatter (Kenya Shillings)
const formatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
});

/**
 * Fetch and Refresh UI
 */
async function fetchEnvelopes() {
    try {
        const response = await fetch(API_URL);
        const envelopes = await response.json();
        
        renderCards(envelopes);
        populateDropdowns(envelopes);
    } catch (error) {
        envelopesList.innerHTML = `<p style="color: red;">Check if your server is running!</p>`;
    }
}

/**
 * Render Cards to Grid
 */
function renderCards(envelopes) {
    envelopesList.innerHTML = '';
    envelopes.forEach(env => {
        const card = document.createElement('div');
        // Add a red background class if budget is 0 or less
        card.className = `envelope-card ${env.budget <= 0 ? 'low-budget' : ''}`;
        
        card.innerHTML = `
            <h3>${env.title}</h3>
            <div class="amount">${formatter.format(env.budget)}</div>
            <p>ID: ${env.id}</p>
            <button class="delete-btn" onclick="deleteEnvelope(${env.id})">Delete</button>
        `;
        envelopesList.appendChild(card);
    });
}

/**
 * Update Dropdown menus
 */
function populateDropdowns(envelopes) {
    const options = envelopes.map(env => 
        `<option value="${env.id}">${env.title} (${formatter.format(env.budget)})</option>`
    ).join('');
    
    const placeholder = '<option value="">-- Select --</option>';
    spendingSelect.innerHTML = placeholder + options;
    sweepSelect.innerHTML = placeholder + options;
}

/**
 * Event: Create New
 */
createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        title: document.getElementById('new-name').value,
        budget: parseFloat(document.getElementById('new-budget').value)
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    createForm.reset();
    fetchEnvelopes();
});

/**
 * Event: Log Spending
 */
spendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = spendingSelect.value;
    const amount = parseFloat(document.getElementById('spending-amount').value);

    await fetch(`${API_URL}/${id}/spend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
    });

    spendForm.reset();
    fetchEnvelopes();
});

/**
 * Event: Sweep Funds
 */
sweepForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const destination_id = sweepSelect.value;

    await fetch(`${API_URL}/sweep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id })
    });

    alert("Funds swept successfully!");
    fetchEnvelopes();
});

/**
 * Action: Delete
 */
async function deleteEnvelope(id) {
    if (confirm("Delete this envelope?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchEnvelopes();
    }
}

// Startup
fetchEnvelopes();