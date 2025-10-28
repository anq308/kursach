document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu();
    initTestData();
    loadStats();
});

function initBurgerMenu() {
    const burger = document.getElementById('burger');
    const navMenu = document.getElementById('navMenu');
    
    if (burger && navMenu) {
        burger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            const spans = burger.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.transform = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!burger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                const spans = burger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.transform = 'none';
            }
        });
    }
}

function initTestData() {
    const existingData = localStorage.getItem('coffeeReviewData');
    
    if (!existingData) {
        const testData = {
            users: [
                {
                    id: '1',
                    firstName: 'Анна',
                    lastName: 'Петрова',
                    email: 'anna@example.com',
                    password: 'password123',
                    role: 'client',
                    status: 'active',
                    createdAt: '2025-09-15',
                    avatar: ''
                },
                {
                    id: '2',
                    firstName: 'Дмитрий',
                    lastName: 'Соколов',
                    email: 'dmitry@example.com',
                    password: 'password123',
                    role: 'client',
                    status: 'active',
                    createdAt: '2025-09-20',
                    avatar: ''
                },
                {
                    id: 'admin',
                    firstName: 'Администратор',
                    lastName: 'Системы',
                    email: 'admin@coffeereview.ru',
                    password: 'admin123',
                    role: 'admin',
                    status: 'active',
                    createdAt: '2025-01-01',
                    avatar: ''
                }
            ],
            menuItems: [
                {
                    id: '1',
                    name: 'Капучино',
                    description: 'Классический итальянский кофе с молочной пеной',
                    category: 'кофе',
                    price: 250,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.8,
                    totalReviews: 45,
                    createdAt: '2025-01-01'
                },
                {
                    id: '2',
                    name: 'Латте',
                    description: 'Нежный кофе с большим количеством молока',
                    category: 'кофе',
                    price: 280,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.7,
                    totalReviews: 38,
                    createdAt: '2025-01-01'
                },
                {
                    id: '3',
                    name: 'Эспрессо',
                    description: 'Крепкий итальянский кофе',
                    category: 'кофе',
                    price: 180,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.9,
                    totalReviews: 52,
                    createdAt: '2025-01-01'
                },
                {
                    id: '4',
                    name: 'Американо',
                    description: 'Эспрессо с горячей водой',
                    category: 'кофе',
                    price: 200,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.6,
                    totalReviews: 31,
                    createdAt: '2025-01-01'
                },
                {
                    id: '5',
                    name: 'Раф кофе',
                    description: 'Кофе со сливками и ванильным сахаром',
                    category: 'кофе',
                    price: 320,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.8,
                    totalReviews: 28,
                    createdAt: '2025-01-01'
                },
                {
                    id: '6',
                    name: 'Флэт Уайт',
                    description: 'Двойной эспрессо с бархатистым микропенным молоком',
                    category: 'кофе',
                    price: 280,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.7,
                    totalReviews: 22,
                    createdAt: '2025-01-01'
                },
                {
                    id: '7',
                    name: 'Мокко',
                    description: 'Кофе с шоколадом и молоком',
                    category: 'кофе',
                    price: 300,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.6,
                    totalReviews: 19,
                    createdAt: '2025-01-01'
                },
                {
                    id: '8',
                    name: 'Черный чай',
                    description: 'Классический черный чай высшего сорта',
                    category: 'чай',
                    price: 150,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.5,
                    totalReviews: 15,
                    createdAt: '2025-01-01'
                },
                {
                    id: '9',
                    name: 'Зеленый чай',
                    description: 'Натуральный зеленый чай с жасмином',
                    category: 'чай',
                    price: 150,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.4,
                    totalReviews: 12,
                    createdAt: '2025-01-01'
                },
                {
                    id: '10',
                    name: 'Фруктовый чай',
                    description: 'Ароматный чай с кусочками фруктов и ягод',
                    category: 'чай',
                    price: 180,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.6,
                    totalReviews: 18,
                    createdAt: '2025-01-01'
                },
                {
                    id: '11',
                    name: 'Айс латте',
                    description: 'Холодный кофе с молоком и льдом',
                    category: 'холодные напитки',
                    price: 290,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.7,
                    totalReviews: 25,
                    createdAt: '2025-01-01'
                },
                {
                    id: '12',
                    name: 'Фраппучино',
                    description: 'Холодный кофейный напиток с взбитыми сливками',
                    category: 'холодные напитки',
                    price: 320,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.8,
                    totalReviews: 30,
                    createdAt: '2025-01-01'
                },
                {
                    id: '13',
                    name: 'Лимонад',
                    description: 'Домашний лимонад с мятой',
                    category: 'холодные напитки',
                    price: 200,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.5,
                    totalReviews: 16,
                    createdAt: '2025-01-01'
                },
                {
                    id: '14',
                    name: 'Тирамису',
                    description: 'Классический итальянский десерт с маскарпоне',
                    category: 'десерты',
                    price: 350,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.9,
                    totalReviews: 42,
                    createdAt: '2025-01-01'
                },
                {
                    id: '15',
                    name: 'Чизкейк',
                    description: 'Нежный чизкейк с ягодным соусом',
                    category: 'десерты',
                    price: 320,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.8,
                    totalReviews: 35,
                    createdAt: '2025-01-01'
                },
                {
                    id: '16',
                    name: 'Брауни',
                    description: 'Шоколадный брауни с грецкими орехами',
                    category: 'десерты',
                    price: 250,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.7,
                    totalReviews: 28,
                    createdAt: '2025-01-01'
                },
                {
                    id: '17',
                    name: 'Круассан',
                    description: 'Французский масляный круассан',
                    category: 'выпечка',
                    price: 180,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.6,
                    totalReviews: 24,
                    createdAt: '2025-01-01'
                },
                {
                    id: '18',
                    name: 'Маффин',
                    description: 'Шоколадный маффин с кусочками шоколада',
                    category: 'выпечка',
                    price: 150,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.5,
                    totalReviews: 20,
                    createdAt: '2025-01-01'
                },
                {
                    id: '19',
                    name: 'Эклер',
                    description: 'Заварное пирожное с кремом и глазурью',
                    category: 'выпечка',
                    price: 200,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.7,
                    totalReviews: 22,
                    createdAt: '2025-01-01'
                },
                {
                    id: '20',
                    name: 'Матча латте',
                    description: 'Зеленый чай матча с молоком',
                    category: 'чай',
                    price: 280,
                    imageUrl: '',
                    isActive: true,
                    averageRating: 4.6,
                    totalReviews: 17,
                    createdAt: '2025-01-01'
                }
            ],
            reviews: [
                {
                    id: '1',
                    userId: '1',
                    menuItemId: '1',
                    reviewType: 'menu_item',
                    text: 'Потрясающее место! Кофе просто превосходный, атмосфера уютная, персонал приветливый. Особенно понравился капучино с карамелью. Обязательно вернусь сюда снова!',
                    isAnonymous: false,
                    status: 'approved',
                    rejectionReason: null,
                    ratings: {
                        quality: 5,
                        taste: 5,
                        service: 5,
                        atmosphere: 5,
                        value: 5,
                        average: 5.0
                    },
                    photos: [],
                    adminReply: 'Спасибо за теплый отзыв! Рады, что вам понравилось.',
                    adminReplyAt: '2025-10-15',
                    moderatedBy: 'admin',
                    moderatedAt: '2025-10-15',
                    createdAt: '2025-10-15',
                    updatedAt: '2025-10-15'
                },
                {
                    id: '2',
                    userId: '2',
                    menuItemId: '3',
                    reviewType: 'menu_item',
                    text: 'Отличная кофейня в центре города. Хороший выбор десертов, вкусный эспрессо. Иногда бывает многолюдно, но это скорее плюс - значит, место популярное.',
                    isAnonymous: false,
                    status: 'approved',
                    rejectionReason: null,
                    ratings: {
                        quality: 4,
                        taste: 5,
                        service: 4,
                        atmosphere: 4,
                        value: 4,
                        average: 4.2
                    },
                    photos: [],
                    adminReply: null,
                    adminReplyAt: null,
                    moderatedBy: 'admin',
                    moderatedAt: '2025-10-14',
                    createdAt: '2025-10-14',
                    updatedAt: '2025-10-14'
                },
                {
                    id: '3',
                    userId: '1',
                    menuItemId: null,
                    reviewType: 'general',
                    text: 'Заходил утром перед работой - очень быстрое обслуживание. Латте приготовили за пару минут, вкус отличный. Буду заходить регулярно!',
                    isAnonymous: true,
                    status: 'approved',
                    rejectionReason: null,
                    ratings: {
                        quality: 5,
                        taste: 5,
                        service: 5,
                        atmosphere: 5,
                        value: 5,
                        average: 5.0
                    },
                    photos: [],
                    adminReply: null,
                    adminReplyAt: null,
                    moderatedBy: 'admin',
                    moderatedAt: '2025-10-13',
                    createdAt: '2025-10-13',
                    updatedAt: '2025-10-13'
                }
            ]
        };

        localStorage.setItem('coffeeReviewData', JSON.stringify(testData));
    }
}

function loadStats() {
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    
    if (data) {
        const approvedReviews = data.reviews.filter(r => r.status === 'approved');
        const totalReviews = approvedReviews.length;
        
        let totalRating = 0;
        approvedReviews.forEach(review => {
            totalRating += review.ratings.average;
        });
        const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;
        
        const positiveReviews = approvedReviews.filter(r => r.ratings.average >= 4).length;
        const happyPercent = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;
        
        const menuCount = data.menuItems.filter(m => m.isActive).length;

        document.getElementById('avgRating').textContent = avgRating;
        document.getElementById('totalReviews').textContent = totalReviews + 244;
        document.getElementById('happyClients').textContent = happyPercent + '%';
        document.getElementById('menuItems').textContent = menuCount + 33;
    }
}

function getCurrentUser() {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return null;
    
    const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
    return data.users.find(u => u.id === currentUserId);
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

if (typeof window.updateMenuData === 'undefined') {
    window.updateMenuData = function() {
        const data = JSON.parse(localStorage.getItem('coffeeReviewData'));
        if (data && data.menuItems && data.menuItems.length < 20) {
            localStorage.removeItem('coffeeReviewData');
            location.reload();
        }
    };
    setTimeout(() => window.updateMenuData(), 100);
}
