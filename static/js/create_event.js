// Create Event JavaScript

document.addEventListener('DOMContentLoaded', function() {
    updateUserStatus();
});

// Update user status
async function updateUserStatus() {
    try {
        const response = await fetch('/api/user/status');
        const data = await response.json();
        
        if (data.logged_in) {
            document.getElementById('username').textContent = data.user.username;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error checking user status:', error);
        window.location.href = '/login';
    }
}

// Handle create event form submission
async function handleCreateEvent(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const eventDate = document.getElementById('eventDate').value;
    const maxParticipants = document.getElementById('maxParticipants').value;
    
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    // Clear previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validate date is in the future
    const selectedDate = new Date(eventDate);
    if (selectedDate <= new Date()) {
        errorDiv.textContent = 'イベント日時は将来の日時を選択してください';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                description: description,
                location: location,
                event_date: eventDate,
                max_participants: maxParticipants ? parseInt(maxParticipants) : null
            })
        });
        
        if (response.ok || response.status === 201) {
            // Show success message and reset form
            successDiv.style.display = 'block';
            document.getElementById('createEventForm').reset();
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            const error = await response.json();
            errorDiv.textContent = error.error || 'イベント作成に失敗しました';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error creating event:', error);
        errorDiv.textContent = 'イベント作成中にエラーが発生しました';
        errorDiv.style.display = 'block';
    }
}

// Logout
function logout(event) {
    event.preventDefault();
    if (confirm('ログアウトしますか？')) {
        window.location.href = '/logout';
    }
}
