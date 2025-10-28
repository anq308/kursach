document.addEventListener('DOMContentLoaded', () => {
    checkProfileAuth();
    loadUserProfile();
    initProfileTabs();
    initFilterButtons();
    initLogout();
    initSettingsForm();
});

function checkProfileAuth() {
    const currentUserId = localStorage.getItem('currentUserId');
    
    if (!currentUserId) {
        window.location.href = 'auth.html';
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    if (!data || !data.users) {
        window.location.href = 'auth.html';
        return;
    }
    
    const user = data.users.find(u => u.id === currentUserId);
    
    if (!user || user.status !== 'active') {
        localStorage.removeItem('currentUserId');
        window.location.href = 'auth.html';
    }
}

function loadUserProfile() {
    const currentUserId = localStorage.getItem('currentUserId');
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    const user = data.users.find(u => u.id === currentUserId);
    
    if (!user) return;
    
    const initials = user.firstName.charAt(0) + user.lastName.charAt(0);
    document.getElementById('avatarInitials').textContent = initials.toUpperCase();
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('memberSince').textContent = formatDate(user.createdAt);
    
    loadUserStats(currentUserId, data);
    loadUserReviews(currentUserId, data);
    
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editEmail').value = user.email;
}

function loadUserStats(userId, data) {
    const userReviews = data.reviews.filter(r => r.userId === userId);
    const approvedReviews = userReviews.filter(r => r.status === 'approved');
    const pendingReviews = userReviews.filter(r => r.status === 'pending');
    
    let totalRating = 0;
    approvedReviews.forEach(review => {
        totalRating += review.ratings.average;
    });
    const avgRating = approvedReviews.length > 0 ? (totalRating / approvedReviews.length).toFixed(1) : '0.0';
    
    document.getElementById('totalReviews').textContent = userReviews.length;
    document.getElementById('avgUserRating').textContent = avgRating;
    document.getElementById('approvedReviews').textContent = approvedReviews.length;
    document.getElementById('pendingReviews').textContent = pendingReviews.length;
}

function loadUserReviews(userId, data, filter = 'all') {
    const container = document.getElementById('userReviewsList');
    let userReviews = data.reviews.filter(r => r.userId === userId);
    
    if (filter !== 'all') {
        userReviews = userReviews.filter(r => r.status === filter);
    }
    
    userReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (userReviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-state-text">У вас пока нет отзывов</p>
                <a href="review.html" class="btn btn-primary">Написать первый отзыв</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userReviews.map(review => {
        const menuItem = review.menuItemId ? data.menuItems.find(m => m.id === review.menuItemId) : null;
        const statusText = getStatusText(review.status);
        const statusClass = review.status;
        
        return `
            <div class="user-review-card">
                <div class="user-review-header">
                    <div class="user-review-meta">
                        <span class="user-review-date">${formatDate(review.createdAt)}</span>
                        <span class="review-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="user-review-actions">
                        ${review.status === 'pending' ? `
                            <button class="icon-btn" onclick="editReview('${review.id}')">Редактировать</button>
                            <button class="icon-btn" onclick="deleteReview('${review.id}')">Удалить</button>
                        ` : ''}
                    </div>
                </div>
                
                ${menuItem ? `<p style="font-size: 14px; color: var(--gray-600); margin-bottom: 12px;">Отзыв о: <strong>${menuItem.name}</strong></p>` : ''}
                
                <p class="user-review-content">${review.text}</p>
                
                <div class="user-review-rating">
                    <div class="stars">
                        ${generateStars(review.ratings.average)}
                    </div>
                    <span class="rating-num">${review.ratings.average.toFixed(1)}</span>
                </div>
                
                ${review.status === 'rejected' && review.rejectionReason ? `
                    <div style="margin-top: 12px; padding: 12px; background: #FEE2E2; border: 1px solid #FECACA; border-radius: 6px;">
                        <strong style="font-size: 13px; color: #991B1B;">Причина отклонения:</strong>
                        <p style="font-size: 14px; color: #991B1B; margin-top: 4px;">${review.rejectionReason}</p>
                    </div>
                ` : ''}
                
                ${review.adminReply ? `
                    <div style="margin-top: 12px; padding: 12px; background: #F3F4F6; border-left: 3px solid var(--black); border-radius: 4px;">
                        <strong style="font-size: 13px;">Ответ администрации:</strong>
                        <p style="font-size: 14px; color: var(--gray-700); margin-top: 4px;">${review.adminReply}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'active' : ''}"></span>`;
    }
    return stars;
}

function getStatusText(status) {
    const statuses = {
        'approved': 'Одобрен',
        'pending': 'На модерации',
        'rejected': 'Отклонён'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function initProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.getElementById('reviewsTab').classList.toggle('hidden', tabName !== 'reviews');
            document.getElementById('settingsTab').classList.toggle('hidden', tabName !== 'settings');
        });
    });
}

function initFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const currentUserId = localStorage.getItem('currentUserId');
            const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
            loadUserReviews(currentUserId, data, filter);
        });
    });
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) {
        console.error('Кнопка выхода не найдена');
        return;
    }
    
    logoutBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('currentUserId');
            localStorage.removeItem('rememberUser');
            window.location.href = '../index.html';
        }
    });
}

function initSettingsForm() {
    const form = document.getElementById('settingsForm');
    const cancelBtn = document.getElementById('cancelEditBtn');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('editFirstName').value.trim();
        const lastName = document.getElementById('editLastName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        clearError('settingsError');
        
        const currentUserId = localStorage.getItem('currentUserId');
        const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        const user = data.users.find(u => u.id === currentUserId);
        
        if (!user) return;
        
        if (email !== user.email) {
            const emailExists = data.users.find(u => u.email === email && u.id !== currentUserId);
            if (emailExists) {
                showError('settingsError', 'Email уже используется другим пользователем');
                return;
            }
        }
        
        if (newPassword) {
            if (!currentPassword) {
                showError('settingsError', 'Введите текущий пароль для изменения');
                return;
            }
            
            if (currentPassword !== user.password) {
                showError('settingsError', 'Неверный текущий пароль');
                return;
            }
            
            if (newPassword.length < 8) {
                showError('settingsError', 'Новый пароль должен содержать минимум 8 символов');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showError('settingsError', 'Пароли не совпадают');
                return;
            }
            
            user.password = newPassword;
        }
        
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        
        localStorage.setItem('coffeeReviewData', JSON.stringify(data));
        
        alert('Настройки успешно сохранены!');
        
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        loadUserProfile();
    });
    
    cancelBtn.addEventListener('click', () => {
        loadUserProfile();
        clearError('settingsError');
    });
}

function editReview(reviewId) {
    alert('Функция редактирования будет доступна на странице создания отзыва');
}

function deleteReview(reviewId) {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    data.reviews = data.reviews.filter(r => r.id !== reviewId);
    localStorage.setItem('coffeeReviewData', JSON.stringify(data));
    
    const currentUserId = localStorage.getItem('currentUserId');
    loadUserProfile();
    
    alert('Отзыв успешно удалён');
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
