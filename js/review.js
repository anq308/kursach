document.addEventListener('DOMContentLoaded', () => {
    checkReviewAuth();
    initReviewTypeSelector();
    initRatingStars();
    initCharCounter();
    initReviewForm();
    loadMenuItems();
});

function checkReviewAuth() {
    const currentUserId = localStorage.getItem('currentUserId');
    
    if (!currentUserId) {
        if (confirm('Для оставления отзыва необходимо войти в систему. Перейти на страницу входа?')) {
            window.location.href = 'auth.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}

function initReviewTypeSelector() {
    const radioButtons = document.querySelectorAll('input[name="reviewType"]');
    const menuItemGroup = document.getElementById('menuItemGroup');
    const menuItemSelect = document.getElementById('menuItem');
    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'menu_item') {
                menuItemGroup.classList.remove('hidden');
                menuItemSelect.required = true;
            } else {
                menuItemGroup.classList.add('hidden');
                menuItemSelect.required = false;
                menuItemSelect.value = '';
            }
        });
    });
}

function initRatingStars() {
    const ratingGroups = document.querySelectorAll('.rating-stars');
    
    ratingGroups.forEach(group => {
        const stars = group.querySelectorAll('.rating-star');
        const ratingName = group.dataset.rating;
        const hiddenInput = document.querySelector(`input[name="${ratingName}"]`);
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                hiddenInput.value = value;
                
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                updateAverageRating();
            });
            
            star.addEventListener('mouseenter', () => {
                const value = parseInt(star.dataset.value);
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.style.color = 'var(--black)';
                    } else {
                        s.style.color = 'var(--gray-300)';
                    }
                });
            });
        });
        
        group.addEventListener('mouseleave', () => {
            const currentValue = parseInt(hiddenInput.value);
            stars.forEach((s, index) => {
                if (index < currentValue) {
                    s.style.color = 'var(--black)';
                } else {
                    s.style.color = 'var(--gray-300)';
                }
            });
        });
    });
}

function updateAverageRating() {
    const ratings = ['quality', 'taste', 'service', 'atmosphere', 'value'];
    let total = 0;
    let count = 0;
    
    ratings.forEach(rating => {
        const value = parseInt(document.querySelector(`input[name="${rating}"]`).value);
        if (value > 0) {
            total += value;
            count++;
        }
    });
    
    const average = count > 0 ? (total / count).toFixed(1) : '0.0';
    document.getElementById('averageRating').textContent = average;
}

function initCharCounter() {
    const textarea = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');
    
    textarea.addEventListener('input', () => {
        charCount.textContent = textarea.value.length;
    });
}

function loadMenuItems() {
    const select = document.getElementById('menuItem');
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    if (!data || !data.menuItems) return;
    
    const activeItems = data.menuItems.filter(item => item.isActive);
    
    activeItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} — ${item.price}₽`;
        select.appendChild(option);
    });
}

function initReviewForm() {
    const form = document.getElementById('reviewForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const reviewType = document.querySelector('input[name="reviewType"]:checked').value;
        const menuItemId = reviewType === 'menu_item' ? document.getElementById('menuItem').value : null;
        const reviewText = document.getElementById('reviewText').value.trim();
        const isAnonymous = document.getElementById('isAnonymous').checked;
        
        const ratings = {
            quality: parseInt(document.querySelector('input[name="quality"]').value),
            taste: parseInt(document.querySelector('input[name="taste"]').value),
            service: parseInt(document.querySelector('input[name="service"]').value),
            atmosphere: parseInt(document.querySelector('input[name="atmosphere"]').value),
            value: parseInt(document.querySelector('input[name="value"]').value)
        };
        
        clearError('reviewError');
        
        if (reviewType === 'menu_item' && !menuItemId) {
            showError('reviewError', 'Выберите позицию из меню');
            return;
        }
        
        if (reviewText.length < 20) {
            showError('reviewError', 'Отзыв должен содержать минимум 20 символов');
            return;
        }
        
        if (ratings.quality === 0 || ratings.taste === 0 || ratings.service === 0 || 
            ratings.atmosphere === 0 || ratings.value === 0) {
            showError('reviewError', 'Пожалуйста, оцените все критерии');
            return;
        }
        
        const average = (ratings.quality + ratings.taste + ratings.service + 
                        ratings.atmosphere + ratings.value) / 5;
        ratings.average = parseFloat(average.toFixed(1));
        
        const currentUserId = localStorage.getItem('currentUserId');
        const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        
        const newReview = {
            id: generateId(),
            userId: currentUserId,
            menuItemId: menuItemId,
            reviewType: reviewType,
            text: reviewText,
            isAnonymous: isAnonymous,
            status: 'pending',
            rejectionReason: null,
            ratings: ratings,
            photos: [],
            adminReply: null,
            adminReplyAt: null,
            moderatedBy: null,
            moderatedAt: null,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        
        data.reviews.push(newReview);
        localStorage.setItem('coffeeReviewData', JSON.stringify(data));
        
        alert('Отзыв успешно отправлен! Он будет опубликован после модерации.');
        window.location.href = 'profile.html';
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}
