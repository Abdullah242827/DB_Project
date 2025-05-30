document.getElementById('registerForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    fetch('register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => response.text())
    .then(raw => {
        console.log("Raw response from PHP:", raw); // debug log
        const data = JSON.parse(raw);
        if (data.success) {
            alert('Registration successful! You can now login.');
            window.location.href = 'login.html';
        } else {
            alert('Registration failed: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error during registration: ' + error.message);
    });
});


// Login user
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;

    fetch('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.role === 'admin') {
                window.location.href = 'admin.html'; // ✅ Redirect to admin.html
            } else {
                window.location.href = 'voter.html'; // Or any other page for voters
            }
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error during login: ' + error.message);
    });
});


// Create a new poll
document.getElementById('pollForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const pollTitle = document.getElementById('pollTitle').value.trim();
    const pollOptionsRaw = document.getElementById('pollOptions').value.trim();

    if (!pollTitle) {
        alert('Please enter a poll title.');
        return;
    }

    if (!pollOptionsRaw) {
        alert('Please enter at least one poll option.');
        return;
    }

    // Split options by comma and filter out empty ones
    const pollOptions = pollOptionsRaw.split(',')
        .map(option => option.trim())
        .filter(option => option.length > 0);

    if (pollOptions.length === 0) {
        alert('Please enter valid poll options.');
        return;
    }

    // For now, using hardcoded description and dates - you can add form inputs to collect these later
    const description = "Default poll description";  // You can make a new input field for this
    const start_date = "2025-06-01";                  // Example start date (YYYY-MM-DD)
    const end_date = "2025-06-10";                    // Example end date (YYYY-MM-DD)

    // Prepare candidates array as required by backend
    const candidates = pollOptions.map(option => ({
        name: option,
        description: ""   // Empty description for each candidate; you can extend UI for this
    }));

    const payload = {
        title: pollTitle,
        description: description,
        start_date: start_date,
        end_date: end_date,
        candidates: candidates
    };

    fetch('createPoll.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',  // Important: send cookies/session with request
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Poll created successfully!');
            // Optionally reset form
            document.getElementById('pollForm').reset();
        } else {
            alert('Failed to create poll: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error creating poll: ' + error.message);
    });
});


// Voting function
function vote(election_id, candidate_id) {
    fetch('vote.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // Include cookies/session for authentication
        body: JSON.stringify({ election_id, candidate_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Vote recorded successfully!');
        } else {
            alert('Voting failed: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error during voting: ' + error.message);
    });
}
