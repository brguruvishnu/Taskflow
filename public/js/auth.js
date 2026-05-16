document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
        });
    });

    // Login Form
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        try {
            const data = await api.login({ email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard.html';
        } catch (error) {
            loginError.textContent = error.message;
            loginError.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Log In';
        }
    });

    // Signup Form
    const signupForm = document.getElementById('signup-form');
    const signupError = document.getElementById('signup-error');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupError.style.display = 'none';

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const globalRole = document.getElementById('signup-role').value;
        const btn = signupForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Signing up...';

        try {
            const data = await api.register({ name, email, password, globalRole });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard.html';
        } catch (error) {
            signupError.textContent = error.message;
            signupError.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Sign Up';
        }
    });
});
