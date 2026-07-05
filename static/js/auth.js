// Authentication JavaScript

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        if (response.ok) {
            window.location.href = '/';
        } else {
            const error = await response.json();
            errorDiv.textContent = error.error || 'ログインに失敗しました';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error logging in:', error);
        errorDiv.textContent = 'ログイン中にエラーが発生しました';
        errorDiv.style.display = 'block';
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('errorMessage');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'パスワードが一致しません';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        errorDiv.textContent = 'パスワードは6文字以上である必要があります';
        errorDiv.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        if (response.ok || response.status === 201) {
            window.location.href = '/';
        } else {
            const error = await response.json();
            errorDiv.textContent = error.error || '登録に失敗しました';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error registering:', error);
        errorDiv.textContent = '登録中にエラーが発生しました';
        errorDiv.style.display = 'block';
    }
}
