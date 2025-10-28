const REVIEWS_PER_PAGE = 10;
let currentPage = 1;
let currentFilter = 'all';
let currentSort = 'date-desc';
let currentSearch = '';
let allReviews = [];

document.addEventListener('DOMContentLoaded', () => {
    loadRatingsData();
    initFilters();
    initSearch();
    initSort();
});

function loadRatingsData() {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    if (!data || !data.reviews) {
        allReviews = [];
        displayReviews();
        return;
    }
    
    allReviews = data.reviews.filter(r => r.status === 'approved');
    
    calculateOverallRating(allReviews, data);
    displayReviews();
}

function calculateOverallRating(reviews, data) {
    if (reviews.length === 0) {
        document.getElementById('overallRating').textContent = '0.0';
        document.getElementById('overallStars').innerHTML = generateStars(0);
        document.getElementById('reviewCount').textContent = '0 отзывов';
        return;
    }
    
    let totalQuality = 0, totalTaste = 0, totalService = 0, totalAtmosphere = 0, totalValue = 0;
    let totalAverage = 0;
    
    reviews.forEach(review => {
        totalQuality += review.ratings.quality;
        totalTaste += review.ratings.taste;
        totalService += review.ratings.service;
        totalAtmosphere += review.ratings.atmosphere;
        totalValue += review.ratings.value;
        totalAverage += review.ratings.average;
    });
    
    const count = reviews.length;
    const avgQuality = (totalQuality / count).toFixed(1);
    const avgTaste = (totalTaste / count).toFixed(1);
    const avgService = (totalService / count).toFixed(1);
    const avgAtmosphere = (totalAtmosphere / count).toFixed(1);
    const avgValue = (totalValue / count).toFixed(1);
    const avgOverall = (totalAverage / count).toFixed(1);
    
    document.getElementById('overallRating').textContent = avgOverall;
    document.getElementById('overallStars').innerHTML = generateStars(avgOverall);
    document.getElementById('reviewCount').textContent = `${count} ${getReviewWord(count)}`;
    
    document.getElementById('qualityValue').textContent = avgQuality;
    document.getElementById('qualityBar').style.width = (avgQuality / 5 * 100) + '%';
    
    document.getElementById('tasteValue').textContent = avgTaste;
    document.getElementById('tasteBar').style.width = (avgTaste / 5 * 100) + '%';
    
    document.getElementById('serviceValue').textContent = avgService;
    document.getElementById('serviceBar').style.width = (avgService / 5 * 100) + '%';
    
    document.getElementById('atmosphereValue').textContent = avgAtmosphere;
    document.getElementById('atmosphereBar').style.width = (avgAtmosphere / 5 * 100) + '%';
    
    document.getElementById('valueValue').textContent = avgValue;
    document.getElementById('valueBar').style.width = (avgValue / 5 * 100) + '%';
}

function getReviewWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return 'отзывов';
    }
    
    if (lastDigit === 1) return 'отзыв';
    if (lastDigit >= 2 && lastDigit <= 4) return 'отзыва';
    return 'отзывов';
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
        stars += `<span class="star ${i < fullStars ? 'active' : ''}"></span>`;
    }
    
    return stars;
}

function initFilters() {
    const filterBtns = document.querySelectorAll('.ratings-filters .filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            displayReviews();
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = searchInput.value.trim().toLowerCase();
            currentPage = 1;
            displayReviews();
        }, 300);
    });
}

function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        currentPage = 1;
        displayReviews();
    });
}

function displayReviews() {
    let filteredReviews = [...allReviews];
    
    if (currentFilter === 'positive') {
        filteredReviews = filteredReviews.filter(r => r.ratings.average >= 4);
    } else if (currentFilter === 'neutral') {
        filteredReviews = filteredReviews.filter(r => r.ratings.average === 3);
    } else if (currentFilter === 'negative') {
        filteredReviews = filteredReviews.filter(r => r.ratings.average < 3);
    }
    
    if (currentSearch) {
        filteredReviews = filteredReviews.filter(r => 
            r.text.toLowerCase().includes(currentSearch)
        );
    }
    
    filteredReviews = sortReviews(filteredReviews);
    
    const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIndex = startIndex + REVIEWS_PER_PAGE;
    const pageReviews = filteredReviews.slice(startIndex, endIndex);
    
    renderReviews(pageReviews);
    renderPagination(totalPages);
}

function sortReviews(reviews) {
    const sorted = [...reviews];
    
    switch (currentSort) {
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'rating-desc':
            sorted.sort((a, b) => b.ratings.average - a.ratings.average);
            break;
        case 'rating-asc':
            sorted.sort((a, b) => a.ratings.average - b.ratings.average);
            break;
    }
    
    return sorted;
}

function renderReviews(reviews) {
    const container = document.getElementById('ratingsList');
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-state-text">Отзывов не найдено</p>
            </div>
        `;
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    container.innerHTML = reviews.map(review => {
        const user = data.users.find(u => u.id === review.userId);
        const menuItem = review.menuItemId ? data.menuItems.find(m => m.id === review.menuItemId) : null;
        
        const authorName = review.isAnonymous ? 'Анонимно' : `${user.firstName} ${user.lastName}`;
        const initials = review.isAnonymous ? 'А' : (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
        
        return `
            <div class="rating-card">
                <div class="rating-card-header">
                    <div class="rating-author-info">
                        <div class="rating-avatar">${initials}</div>
                        <div>
                            <div class="rating-author-name">${authorName}</div>
                            <div class="rating-date">${formatDate(review.createdAt)}</div>
                        </div>
                    </div>
                    <div class="rating-score">
                        <div class="rating-score-stars">
                            ${generateStars(review.ratings.average)}
                        </div>
                        <span class="rating-score-num">${review.ratings.average.toFixed(1)}</span>
                    </div>
                </div>
                
                <div class="rating-card-content">
                    ${menuItem ? `<span class="rating-menu-item">${menuItem.name}</span>` : ''}
                    <p class="rating-text">${review.text}</p>
                </div>
                
                <div class="rating-criteria">
                    <div class="criteria-item">
                        <div class="criteria-label">Качество</div>
                        <div class="criteria-value">${review.ratings.quality}</div>
                    </div>
                    <div class="criteria-item">
                        <div class="criteria-label">Вкус</div>
                        <div class="criteria-value">${review.ratings.taste}</div>
                    </div>
                    <div class="criteria-item">
                        <div class="criteria-label">Сервис</div>
                        <div class="criteria-value">${review.ratings.service}</div>
                    </div>
                    <div class="criteria-item">
                        <div class="criteria-label">Атмосфера</div>
                        <div class="criteria-value">${review.ratings.atmosphere}</div>
                    </div>
                    <div class="criteria-item">
                        <div class="criteria-label">Цена</div>
                        <div class="criteria-value">${review.ratings.value}</div>
                    </div>
                </div>
                
                ${review.adminReply ? `
                    <div class="rating-admin-reply">
                        <div class="admin-reply-label">Ответ администрации:</div>
                        <div class="admin-reply-text">${review.adminReply}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ← Назад
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span style="padding: 0 8px; color: var(--gray-400);">...</span>`;
        }
    }
    
    html += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            Вперёд →
        </button>
    `;
    
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    displayReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
