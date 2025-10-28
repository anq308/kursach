let currentCategory = 'all';
let allMenuItems = [];

document.addEventListener('DOMContentLoaded', () => {
    loadMenuData();
    initMenuFilters();
});

function loadMenuData() {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    if (!data || !data.menuItems) {
        allMenuItems = [];
        displayMenuItems();
        return;
    }
    
    allMenuItems = data.menuItems.filter(item => item.isActive);
    calculateMenuRatings(data);
    displayMenuItems();
}

function calculateMenuRatings(data) {
    allMenuItems.forEach(item => {
        const itemReviews = data.reviews.filter(
            r => r.menuItemId === item.id && r.status === 'approved'
        );
        
        if (itemReviews.length > 0) {
            const totalRating = itemReviews.reduce((sum, r) => sum + r.ratings.average, 0);
            item.averageRating = parseFloat((totalRating / itemReviews.length).toFixed(1));
            item.totalReviews = itemReviews.length;
        }
    });
}

function initMenuFilters() {
    const filterBtns = document.querySelectorAll('.menu-filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            displayMenuItems();
        });
    });
}

function displayMenuItems() {
    const container = document.getElementById('menuItemsGrid');
    
    let filteredItems = [...allMenuItems];
    
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentCategory);
    }
    
    filteredItems.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
        }
        return a.name.localeCompare(b.name);
    });
    
    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p class="empty-state-text">В этой категории пока нет позиций</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredItems.map(item => `
        <div class="menu-item-card">
            <div class="menu-item-header">
                <div>
                    <div class="menu-item-name">${item.name}</div>
                    <div class="menu-item-category">${item.category}</div>
                </div>
                <div class="menu-item-price">${item.price}₽</div>
            </div>
            
            <p class="menu-item-description">${item.description}</p>
            
            <div class="menu-item-rating">
                <div class="menu-item-stars">
                    ${generateStars(item.averageRating)}
                </div>
                <span class="menu-item-rating-text">
                    ${item.averageRating > 0 
                        ? `${item.averageRating.toFixed(1)} (${item.totalReviews} ${getReviewWord(item.totalReviews)})` 
                        : 'Нет отзывов'}
                </span>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
        stars += `<span class="star ${i < fullStars ? 'active' : ''}"></span>`;
    }
    
    return stars;
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
