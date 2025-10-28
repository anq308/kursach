class Database {
    constructor() {
        this.initialized = false;
        this.data = {
            users: [],
            menuItems: [],
            reviews: [],
            ratings: []
        };
    }

    async init() {
        if (this.initialized) return;
        
        try {
            await this.loadData();
            this.initialized = true;
            console.log('База данных загружена');
        } catch (error) {
            console.error('Ошибка загрузки БД:', error);
        }
    }

    async loadData() {
        const files = {
            users: 'data/users.json',
            menuItems: 'data/menuItems.json',
            reviews: 'data/reviews.json',
            ratings: 'data/ratings.json'
        };

        const promises = Object.entries(files).map(async ([key, file]) => {
            const response = await fetch(file);
            const json = await response.json();
            this.data[key] = json[key] || [];
        });

        await Promise.all(promises);
    }

    saveData() {
        localStorage.setItem('coffeeReviewDB', JSON.stringify(this.data));
        console.log('Данные сохранены в localStorage');
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('coffeeReviewDB');
        if (saved) {
            this.data = JSON.parse(saved);
            return true;
        }
        return false;
    }

    getUsers() {
        return this.data.users;
    }

    getUserById(id) {
        return this.data.users.find(u => u.id === id);
    }

    getUserByEmail(email) {
        return this.data.users.find(u => u.email === email);
    }

    addUser(user) {
        const newUser = {
            id: 'u' + Date.now(),
            ...user,
            createdAt: new Date().toISOString()
        };
        this.data.users.push(newUser);
        this.saveData();
        return newUser;
    }

    getMenuItems() {
        return this.data.menuItems.filter(item => item.isActive);
    }

    getMenuItemById(id) {
        return this.data.menuItems.find(m => m.id === id);
    }

    getMenuItemsByCategory(category) {
        return this.data.menuItems.filter(m => m.category === category && m.isActive);
    }

    getReviews() {
        return this.data.reviews;
    }

    getReviewById(id) {
        return this.data.reviews.find(r => r.id === id);
    }

    getApprovedReviews() {
        return this.data.reviews.filter(r => r.status === 'approved');
    }

    getReviewsByUserId(userId) {
        return this.data.reviews.filter(r => r.userId === userId);
    }

    getReviewsByMenuItem(menuItemId) {
        return this.data.reviews.filter(r => r.menuItemId === menuItemId && r.status === 'approved');
    }

    addReview(review) {
        const newReview = {
            id: 'r' + Date.now(),
            ...review,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        this.data.reviews.push(newReview);
        this.saveData();
        return newReview;
    }

    updateReviewStatus(reviewId, status) {
        const review = this.data.reviews.find(r => r.id === reviewId);
        if (review) {
            review.status = status;
            this.saveData();
            return true;
        }
        return false;
    }

    getRatingByReviewId(reviewId) {
        return this.data.ratings.find(ra => ra.reviewId === reviewId);
    }

    addRating(rating) {
        const average = (rating.quality + rating.taste + rating.service + 
                        rating.atmosphere + rating.valueForMoney) / 5;
        
        const newRating = {
            id: 'ra' + Date.now(),
            ...rating,
            average: parseFloat(average.toFixed(1))
        };
        this.data.ratings.push(newRating);
        this.saveData();
        return newRating;
    }

    getReviewWithRating(reviewId) {
        const review = this.getReviewById(reviewId);
        if (!review) return null;

        const rating = this.getRatingByReviewId(reviewId);
        const user = this.getUserById(review.userId);
        const menuItem = review.menuItemId ? this.getMenuItemById(review.menuItemId) : null;

        return {
            ...review,
            rating,
            user,
            menuItem
        };
    }

    getAllReviewsWithDetails() {
        return this.data.reviews.map(review => {
            const rating = this.getRatingByReviewId(review.id);
            const user = this.getUserById(review.userId);
            const menuItem = review.menuItemId ? this.getMenuItemById(review.menuItemId) : null;

            return {
                ...review,
                rating,
                user,
                menuItem
            };
        });
    }

    getApprovedReviewsWithDetails() {
        return this.getAllReviewsWithDetails().filter(r => r.status === 'approved');
    }

    getAverageRatingForMenuItem(menuItemId) {
        const reviews = this.getReviewsByMenuItem(menuItemId);
        if (reviews.length === 0) return 0;

        const ratings = reviews.map(r => this.getRatingByReviewId(r.id)).filter(Boolean);
        if (ratings.length === 0) return 0;

        const sum = ratings.reduce((acc, r) => acc + r.average, 0);
        return parseFloat((sum / ratings.length).toFixed(1));
    }

    getOverallAverageRating() {
        const approvedReviews = this.getApprovedReviews();
        if (approvedReviews.length === 0) return 0;

        const ratings = approvedReviews.map(r => this.getRatingByReviewId(r.id)).filter(Boolean);
        if (ratings.length === 0) return 0;

        const sum = ratings.reduce((acc, r) => acc + r.average, 0);
        return parseFloat((sum / ratings.length).toFixed(1));
    }

    getStatistics() {
        const approvedReviews = this.getApprovedReviews();
        const ratings = approvedReviews.map(r => this.getRatingByReviewId(r.id)).filter(Boolean);

        return {
            totalUsers: this.data.users.filter(u => u.role === 'client').length,
            totalReviews: approvedReviews.length,
            pendingReviews: this.data.reviews.filter(r => r.status === 'pending').length,
            averageRating: this.getOverallAverageRating(),
            totalMenuItems: this.getMenuItems().length
        };
    }
}

const db = new Database();

if (!db.loadFromLocalStorage()) {
    db.init();
}

window.database = db;
