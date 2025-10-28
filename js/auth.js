document.addEventListener('DOMContentLoaded', () => {
    initAuthTabs();
    initLoginForm();
    initRegisterForm();
    checkAuth();
});

function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const links = document.querySelectorAll('.auth-link');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    links.forEach(link => {
        link.addEventListener('click', () => switchTab(link.dataset.tab));
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        clearError('loginError');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        clearError('registerError');
    }
}

function initLoginForm() {
    const form = document.getElementById('loginFormElement');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        clearError('loginError');
        
        if (!validateEmail(email)) {
            showError('loginError', 'Введите корректный email адрес');
            return;
        }
        
        if (password.length < 8) {
            showError('loginError', 'Пароль должен содержать минимум 8 символов');
            return;
        }
        
        const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        
        if (!data || !data.users) {
            showError('loginError', 'Пользователь не найден');
            return;
        }
        
        const user = data.users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password
        );
        
        if (!user) {
            showError('loginError', 'Неверный email или пароль');
            return;
        }
        
        if (user.status === 'blocked') {
            showError('loginError', 'Ваш аккаунт заблокирован');
            return;
        }
        
        localStorage.setItem('currentUserId', user.id);
        
        if (rememberMe) {
            localStorage.setItem('rememberUser', 'true');
        }
        
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'profile.html';
        }
    });
}

function initRegisterForm() {
    const form = document.getElementById('registerFormElement');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('registerFirstName').value.trim();
        const lastName = document.getElementById('registerLastName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        
        clearError('registerError');
        
        if (firstName.length < 2 || firstName.length > 50) {
            showError('registerError', 'Имя должно содержать от 2 до 50 символов');
            return;
        }
        
        if (lastName.length < 2 || lastName.length > 50) {
            showError('registerError', 'Фамилия должна содержать от 2 до 50 символов');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('registerError', 'Введите корректный email адрес');
            return;
        }
        
        if (password.length < 8) {
            showError('registerError', 'Пароль должен содержать минимум 8 символов');
            return;
        }
        
        if (!validatePassword(password)) {
            showError('registerError', 'Пароль должен содержать буквы и цифры');
            return;
        }
        
        if (password !== passwordConfirm) {
            showError('registerError', 'Пароли не совпадают');
            return;
        }
        
        if (!agreeTerms) {
            showError('registerError', 'Необходимо согласие на обработку персональных данных');
            return;
        }
        
        let data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        
        if (!data) {
            data = { users: [], menuItems: [], reviews: [] };
        }
        
        const existingUser = data.users.find(u => 
            u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (existingUser) {
            showError('registerError', 'Пользователь с таким email уже существует');
            return;
        }
        
        const newUser = {
            id: generateId(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            role: 'client',
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            avatar: ''
        };
        
        data.users.push(newUser);
        localStorage.setItem('coffeeReviewData', JSON.stringify(data));
        
        localStorage.setItem('currentUserId', newUser.id);
        
        window.location.href = 'profile.html';
    });
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    const hasLetter = /[a-zA-Zа-яА-Я]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLetter && hasNumber;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function checkAuth() {
    const currentUserId = localStorage.getItem('currentUserId');
    
    if (currentUserId) {
        const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        
        if (data && data.users) {
            const user = data.users.find(u => u.id === currentUserId);
            
            if (user && user.status === 'active') {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'profile.html';
                }
            }
        }
    }
}
