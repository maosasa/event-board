// Main JavaScript for Event Board

// Check user status on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUserStatus();
    loadEvents();
    setupSearch();
});

// Update user status (check if logged in)
async function updateUserStatus() {
    try {
        const response = await fetch('/api/user/status');
        const data = await response.json();
        
        if (data.logged_in) {
            document.getElementById('loginLink').style.display = 'none';
            document.getElementById('registerLink').style.display = 'none';
            document.getElementById('logoutLink').style.display = 'inline';
            document.getElementById('createEventLink').style.display = 'inline';
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('username').textContent = data.user.username;
        } else {
            document.getElementById('loginLink').style.display = 'inline';
            document.getElementById('registerLink').style.display = 'inline';
            document.getElementById('logoutLink').style.display = 'none';
            document.getElementById('createEventLink').style.display = 'none';
            document.getElementById('userInfo').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking user status:', error);
    }
}

// Load all events
async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('eventsGrid').innerHTML = '<div class="error-message">イベントの読み込みに失敗しました</div>';
    }
}

// Display events as cards
function displayEvents(events) {
    const grid = document.getElementById('eventsGrid');
    
    if (events.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6b7280;">イベントが見つかりません</div>';
        return;
    }
    
    grid.innerHTML = events.map(event => createEventCard(event)).join('');
    
    // Add click handlers to cards
    document.querySelectorAll('.event-card').forEach((card, index) => {
        card.addEventListener('click', () => showEventDetails(events[index]));
    });
}

// Create event card HTML
function createEventCard(event) {
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const maxParticipants = event.max_participants ? `${event.participant_count}/${event.max_participants}` : `${event.participant_count}人`;
    
    return `
        <div class="event-card">
            <div class="event-card-header">
                <div class="event-card-title">${escapeHtml(event.title)}</div>
                <div class="event-card-date">📅 ${formattedDate}</div>
            </div>
            <div class="event-card-body">
                <div class="event-card-location">📍 ${escapeHtml(event.location)}</div>
                <div class="event-card-description">${escapeHtml(event.description)}</div>
                <div class="event-card-meta">
                    <div class="event-card-participants">👥 ${maxParticipants}</div>
                    <div>作成者: ${escapeHtml(event.creator.username)}</div>
                </div>
                <div class="event-card-footer">
                    <button class="btn btn-primary btn-small" onclick="showEventDetails(event)">詳細を見る</button>
                </div>
            </div>
        </div>
    `;
}

// Show event details in modal
function showEventDetails(event) {
    const modal = document.getElementById('eventModal');
    const detailsDiv = document.getElementById('eventDetails');
    
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const maxParticipants = event.max_participants 
        ? `${event.participant_count}/${event.max_participants}人` 
        : `${event.participant_count}人`;
    
    let actionButtons = '';
    const isLoggedIn = document.getElementById('userInfo').style.display !== 'none';
    
    if (isLoggedIn) {
        const isParticipating = event.participants.some(p => p.username === document.getElementById('username').textContent);
        if (isParticipating) {
            actionButtons = `<button class="btn btn-danger btn-small" onclick="leaveEvent(${event.id})">参加をキャンセル</button>`;
        } else {
            actionButtons = `<button class="btn btn-primary btn-small" onclick="joinEvent(${event.id})">イベントに参加</button>`;
        }
    }
    
    const participantsList = event.participants.map(p => 
        `<div class="participant-badge">${escapeHtml(p.username)}</div>`
    ).join('');
    
    detailsDiv.innerHTML = `
        <div class="event-details">
            <div class="event-details-title">${escapeHtml(event.title)}</div>
            
            <div class="event-details-info">
                <div>
                    <label>日時:</label>
                    <span>${formattedDate}</span>
                </div>
                <div>
                    <label>場所:</label>
                    <span>${escapeHtml(event.location)}</span>
                </div>
                <div>
                    <label>参加者:</label>
                    <span>${maxParticipants}</span>
                </div>
                <div>
                    <label>作成者:</label>
                    <span>${escapeHtml(event.creator.username)}</span>
                </div>
            </div>
            
            <div class="event-details-info">
                <label>説明:</label>
                <p>${escapeHtml(event.description)}</p>
            </div>
            
            <div class="event-details-participants">
                <h3>参加メンバー</h3>
                <div class="participants-list">
                    ${participantsList || '<span>参加者はまだいません</span>'}
                </div>
            </div>
            
            <div class="event-details-actions">
                ${actionButtons}
                <button class="btn btn-secondary btn-small" onclick="closeEventModal()">閉じる</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close event modal
function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

// Join event
async function joinEvent(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            alert('イベントに参加しました！');
            closeEventModal();
            loadEvents();
        } else {
            const error = await response.json();
            alert('エラー: ' + error.error);
        }
    } catch (error) {
        console.error('Error joining event:', error);
        alert('参加に失敗しました');
    }
}

// Leave event
async function leaveEvent(eventId) {
    if (!confirm('このイベントから参加をキャンセルしますか？')) return;
    
    try {
        const response = await fetch(`/api/events/${eventId}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            alert('参加をキャンセルしました');
            closeEventModal();
            loadEvents();
        } else {
            const error = await response.json();
            alert('エラー: ' + error.error);
        }
    } catch (error) {
        console.error('Error leaving event:', error);
        alert('キャンセルに失敗しました');
    }
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}

// Handle search
async function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query)
        );
        
        displayEvents(filtered);
    } catch (error) {
        console.error('Error searching events:', error);
    }
}

// Logout
function logout(event) {
    event.preventDefault();
    if (confirm('ログアウトしますか？')) {
        window.location.href = '/logout';
    }
}

// Utility: Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility: Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}
