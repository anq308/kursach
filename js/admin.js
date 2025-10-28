let currentReviewId = null;
let currentMenuItemId = null;
let currentReviewFilter = 'pending';

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadAdminData();
    initAdminTabs();
    initAdminFilters();
    initModals();
    initLogout();
});

function checkAdminAuth() {
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
    
    if (!user || user.role !== 'admin' || user.status !== 'active') {
        alert('У вас нет доступа к админ панели');
        window.location.href = '../index.html';
        return;
    }
    
    document.getElementById('adminName').textContent = `${user.firstName} ${user.lastName}`;
}

function loadAdminData() {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    if (!data) return;
    
    loadAdminStats(data);
    loadAdminReviews(data);
    loadAdminMenu(data);
    loadAdminUsers(data);
}

function loadAdminStats(data) {
    const totalReviews = data.reviews.length;
    const pendingReviews = data.reviews.filter(r => r.status === 'pending').length;
    const approvedReviews = data.reviews.filter(r => r.status === 'approved').length;
    const rejectedReviews = data.reviews.filter(r => r.status === 'rejected').length;
    
    document.getElementById('totalReviewsCount').textContent = totalReviews;
    document.getElementById('pendingCount').textContent = pendingReviews;
    document.getElementById('approvedCount').textContent = approvedReviews;
    document.getElementById('rejectedCount').textContent = rejectedReviews;
}

function initAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.getElementById('reviewsTab').classList.toggle('hidden', tabName !== 'reviews');
            document.getElementById('menuTab').classList.toggle('hidden', tabName !== 'menu');
            document.getElementById('usersTab').classList.toggle('hidden', tabName !== 'users');
        });
    });
}

function initAdminFilters() {
    const filterBtns = document.querySelectorAll('.admin-filter-buttons .filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentReviewFilter = btn.dataset.status;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
            loadAdminReviews(data);
        });
    });
}

function loadAdminReviews(data) {
    const container = document.getElementById('adminReviewsList');
    
    let reviews = [...data.reviews];
    
    if (currentReviewFilter !== 'all') {
        reviews = reviews.filter(r => r.status === currentReviewFilter);
    }
    
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-state-text">Отзывов не найдено</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const user = data.users.find(u => u.id === review.userId);
        const menuItem = review.menuItemId ? data.menuItems.find(m => m.id === review.menuItemId) : null;
        
        const authorName = review.isAnonymous ? 'Анонимно' : `${user.firstName} ${user.lastName}`;
        const authorEmail = user.email;
        
        return `
            <div class="admin-review-card">
                <div class="admin-review-header">
                    <div>
                        <div class="admin-review-author">${authorName}</div>
                        <div class="admin-review-email">${authorEmail}</div>
                        <div class="admin-review-date">${formatDate(review.createdAt)}</div>
                    </div>
                    <div>
                        <span class="review-status ${review.status}">${getStatusText(review.status)}</span>
                    </div>
                </div>
                
                <div class="admin-review-content">
                    ${menuItem ? `<p style="font-size: 14px; color: var(--gray-600); margin-bottom: 8px;"><strong>Отзыв о:</strong> ${menuItem.name}</p>` : ''}
                    <p class="admin-review-text">${review.text}</p>
                    
                    <div class="admin-review-ratings">
                        <div class="admin-rating-item"><strong>Качество:</strong> ${review.ratings.quality}</div>
                        <div class="admin-rating-item"><strong>Вкус:</strong> ${review.ratings.taste}</div>
                        <div class="admin-rating-item"><strong>Сервис:</strong> ${review.ratings.service}</div>
                        <div class="admin-rating-item"><strong>Атмосфера:</strong> ${review.ratings.atmosphere}</div>
                        <div class="admin-rating-item"><strong>Цена:</strong> ${review.ratings.value}</div>
                        <div class="admin-rating-item"><strong>Средняя:</strong> ${review.ratings.average}</div>
                    </div>
                </div>
                
                ${review.status === 'rejected' && review.rejectionReason ? `
                    <div style="margin-bottom: 16px; padding: 12px; background: #FEE2E2; border: 1px solid #FECACA; border-radius: 6px;">
                        <strong style="font-size: 13px; color: #991B1B;">Причина отклонения:</strong>
                        <p style="font-size: 14px; color: #991B1B; margin-top: 4px;">${review.rejectionReason}</p>
                    </div>
                ` : ''}
                
                ${review.adminReply ? `
                    <div style="margin-bottom: 16px; padding: 12px; background: var(--gray-50); border-left: 3px solid var(--black); border-radius: 4px;">
                        <strong style="font-size: 13px;">Ваш ответ:</strong>
                        <p style="font-size: 14px; color: var(--gray-700); margin-top: 4px;">${review.adminReply}</p>
                    </div>
                ` : ''}
                
                <div class="admin-review-actions">
                    ${review.status === 'pending' ? `
                        <button class="btn btn-success btn-small" onclick="approveReview('${review.id}')">Одобрить</button>
                        <button class="btn btn-danger btn-small" onclick="openRejectModal('${review.id}')">Отклонить</button>
                    ` : ''}
                    ${review.status !== 'rejected' ? `
                        <button class="btn btn-outline btn-small" onclick="openReplyModal('${review.id}')">
                            ${review.adminReply ? 'Изменить ответ' : 'Ответить'}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function approveReview(reviewId) {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    const review = data.reviews.find(r => r.id === reviewId);
    
    if (!review) return;
    
    review.status = 'approved';
    review.moderatedBy = localStorage.getItem('currentUserId');
    review.moderatedAt = new Date().toISOString().split('T')[0];
    
    localStorage.setItem('coffeeReviewData', JSON.stringify(data));
    
    loadAdminData();
    alert('Отзыв одобрен');
}

function openRejectModal(reviewId) {
    currentReviewId = reviewId;
    document.getElementById('rejectReason').value = '';
    document.getElementById('rejectModal').classList.remove('hidden');
}

function openReplyModal(reviewId) {
    currentReviewId = reviewId;
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    const review = data.reviews.find(r => r.id === reviewId);
    
    document.getElementById('replyText').value = review.adminReply || '';
    document.getElementById('replyModal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    currentReviewId = null;
    currentMenuItemId = null;
}

function initModals() {
    document.getElementById('submitRejectBtn').addEventListener('click', () => {
        const reason = document.getElementById('rejectReason').value.trim();
        
        if (!reason) {
            alert('Укажите причину отклонения');
            return;
        }
        
        const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        const review = data.reviews.find(r => r.id === currentReviewId);
        
        if (!review) return;
        
        review.status = 'rejected';
        review.rejectionReason = reason;
        review.moderatedBy = localStorage.getItem('currentUserId');
        review.moderatedAt = new Date().toISOString().split('T')[0];
        
        localStorage.setItem('coffeeReviewData', JSON.stringify(data));
        
        closeModal('rejectModal');
        loadAdminData();
        alert('Отзыв отклонён');
    });
    
    document.getElementById('submitReplyBtn').addEventListener('click', () => {
        const reply = document.getElementById('replyText').value.trim();
        
        if (!reply) {
            alert('Введите текст ответа');
            return;
        }
        
        const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        const review = data.reviews.find(r => r.id === currentReviewId);
        
        if (!review) return;
        
        review.adminReply = reply;
        review.adminReplyAt = new Date().toISOString().split('T')[0];
        
        localStorage.setItem('coffeeReviewData', JSON.stringify(data));
        
        closeModal('replyModal');
        loadAdminData();
        alert('Ответ отправлен');
    });
    
    document.getElementById('addMenuItemBtn').addEventListener('click', () => {
        currentMenuItemId = null;
        document.getElementById('menuModalTitle').textContent = 'Добавить позицию';
        document.getElementById('menuItemForm').reset();
        document.getElementById('menuModal').classList.remove('hidden');
    });
    
    document.getElementById('saveMenuItemBtn').addEventListener('click', () => {
        saveMenuItem();
    });
}

function loadAdminMenu(data) {
    const container = document.getElementById('adminMenuList');
    
    const menuItems = [...data.menuItems];
    menuItems.sort((a, b) => a.name.localeCompare(b.name));
    
    container.innerHTML = menuItems.map(item => `
        <div class="admin-menu-card">
            <div class="admin-menu-info">
                <div class="admin-menu-name">${item.name}</div>
                <div class="admin-menu-desc">${item.description}</div>
                <div class="admin-menu-meta">
                    <span>Категория: ${item.category}</span>
                    <span>Цена: ${item.price}₽</span>
                    <span>Рейтинг: ${item.averageRating.toFixed(1)} (${item.totalReviews} отзывов)</span>
                    <span style="color: ${item.isActive ? '#059669' : '#DC2626'}">${item.isActive ? 'Активно' : 'Неактивно'}</span>
                </div>
            </div>
            <div class="admin-menu-actions">
                <button class="btn btn-outline btn-small" onclick="editMenuItem('${item.id}')">Редактировать</button>
                <button class="btn ${item.isActive ? 'btn-outline' : 'btn-success'} btn-small" onclick="toggleMenuItem('${item.id}')">
                    ${item.isActive ? 'Скрыть' : 'Показать'}
                </button>
            </div>
        </div>
    `).join('');
}

function editMenuItem(id) {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    const item = data.menuItems.find(m => m.id === id);
    
    if (!item) return;
    
    currentMenuItemId = id;
    document.getElementById('menuModalTitle').textContent = 'Редактировать позицию';
    document.getElementById('menuItemName').value = item.name;
    document.getElementById('menuItemDesc').value = item.description;
    document.getElementById('menuItemCategory').value = item.category;
    document.getElementById('menuItemPrice').value = item.price;
    document.getElementById('menuItemActive').checked = item.isActive;
    
    document.getElementById('menuModal').classList.remove('hidden');
}

function saveMenuItem() {
    const name = document.getElementById('menuItemName').value.trim();
    const description = document.getElementById('menuItemDesc').value.trim();
    const category = document.getElementById('menuItemCategory').value;
    const price = parseInt(document.getElementById('menuItemPrice').value);
    const isActive = document.getElementById('menuItemActive').checked;
    
    if (!name || !price) {
        alert('Заполните все обязательные поля');
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    if (currentMenuItemId) {
        const item = data.menuItems.find(m => m.id === currentMenuItemId);
        item.name = name;
        item.description = description;
        item.category = category;
        item.price = price;
        item.isActive = isActive;
    } else {
        const newItem = {
            id: generateId(),
            name,
            description,
            category,
            price,
            imageUrl: '',
            isActive,
            averageRating: 0,
            totalReviews: 0,
            createdAt: new Date().toISOString().split('T')[0]
        };
        data.menuItems.push(newItem);
    }
    
    localStorage.setItem('coffeeReviewData', JSON.stringify(data));
    
    closeModal('menuModal');
    loadAdminData();
    alert(currentMenuItemId ? 'Позиция обновлена' : 'Позиция добавлена');
}

function toggleMenuItem(id) {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    const item = data.menuItems.find(m => m.id === id);
    
    if (!item) return;
    
    item.isActive = !item.isActive;
    localStorage.setItem('coffeeReviewData', JSON.stringify(data));
    
    loadAdminData();
}

function loadAdminUsers(data) {
    const container = document.getElementById('adminUsersList');
    
    const users = data.users.filter(u => u.role !== 'admin');
    
    container.innerHTML = users.map(user => {
        const initials = (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
        const reviewCount = data.reviews.filter(r => r.userId === user.id).length;
        
        return `
            <div class="admin-user-card">
                <div class="admin-user-info">
                    <div class="admin-user-avatar">${initials}</div>
                    <div>
                        <div class="admin-user-name">
                            ${user.firstName} ${user.lastName}
                            <span class="user-status-badge ${user.status}">${user.status === 'active' ? 'Активен' : 'Заблокирован'}</span>
                        </div>
                        <div class="admin-user-email">${user.email}</div>
                        <div class="admin-user-meta">
                            Регистрация: ${formatDate(user.createdAt)} • Отзывов: ${reviewCount}
                        </div>
                    </div>
                </div>
                <div>
                    <button class="btn ${user.status === 'active' ? 'btn-danger' : 'btn-success'} btn-small" onclick="toggleUserStatus('${user.id}')">
                        ${user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleUserStatus(userId) {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    const user = data.users.find(u => u.id === userId);
    
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    const confirmText = newStatus === 'blocked' 
        ? 'Вы уверены, что хотите заблокировать пользователя?' 
        : 'Вы уверены, что хотите разблокировать пользователя?';
    
    if (!confirm(confirmText)) return;
    
    user.status = newStatus;
    localStorage.setItem('coffeeReviewData', JSON.stringify(data));
    
    loadAdminData();
    alert(newStatus === 'blocked' ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
}

function initLogout() {
    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите выйти?')) {
            localStorage.removeItem('currentUserId');
            window.location.href = '../index.html';
        }
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getStatusText(status) {
    const statuses = {
        'approved': 'Одобрен',
        'pending': 'На модерации',
        'rejected': 'Отклонён'
    };
    return statuses[status] || status;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
