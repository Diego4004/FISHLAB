console.log('🚀 APP.JS LOADED');

// Supabase Configuration
const SUPABASE_URL = 'https://rxcgyreenwlfhqpvbsfh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4Y2d5cmVlbndsZmhxcHZic2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjI0NTksImV4cCI6MjA5NTg5ODQ1OX0.UsbpDbWzhQ5fC5ZJBYzXu7wY2OCI4U4SgUipWv8gxWY';

// Supabase API helper
const supabaseAPI = {
    async getProducts() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.warn('Error fetching products:', response.status);
                return JSON.parse(localStorage.getItem('adminProducts')) || [];
            }
            const data = await response.json();
            console.log('✅ Products loaded from Supabase:', data.length);
            return data;
        } catch (e) {
            console.warn('Error fetching products from Supabase:', e);
            return JSON.parse(localStorage.getItem('adminProducts')) || [];
        }
    },
    
    async getSettings() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/settings?select=*&limit=1`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.warn('Error fetching settings:', response.status);
                return JSON.parse(localStorage.getItem('storeSettings')) || {};
            }
            const data = await response.json();
            console.log('✅ Settings loaded from Supabase');
            return data.length > 0 ? data[0] : JSON.parse(localStorage.getItem('storeSettings')) || {};
        } catch (e) {
            console.warn('Error fetching settings from Supabase:', e);
            return JSON.parse(localStorage.getItem('storeSettings')) || {};
        }
    }
};

// Auto-cleanup localStorage if quota exceeded
function cleanupLocalStorage() {
    try {
        const testKey = '__test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn('🗑️ localStorage quota exceeded, auto-cleaning...');
            
            // Step 1: Remove images from settings
            try {
                const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
                if (settings.logoImage) {
                    delete settings.logoImage;
                    console.log('🗑️ Removed logoImage');
                }
                for (let i = 1; i <= 4; i++) {
                    if (settings[`catImage${i}`]) {
                        delete settings[`catImage${i}`];
                        console.log(`🗑️ Removed catImage${i}`);
                    }
                }
                localStorage.setItem('storeSettings', JSON.stringify(settings));
                console.log('✅ Cleaned settings');
            } catch (e2) {
                console.warn('Could not clean settings:', e2);
            }
            
            // Step 2: Remove images from products
            try {
                const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
                const cleanedProducts = products.map(p => ({
                    ...p,
                    image: null,  // Remove main image
                    images: []    // Remove additional images
                }));
                localStorage.setItem('adminProducts', JSON.stringify(cleanedProducts));
                console.log('✅ Removed images from products');
            } catch (e3) {
                console.warn('Could not clean products:', e3);
            }
            
            // Step 3: If still full, clear orders
            try {
                const testKey2 = '__test2_' + Date.now();
                localStorage.setItem(testKey2, 'test');
                localStorage.removeItem(testKey2);
            } catch (e4) {
                console.warn('Still full, clearing orders...');
                localStorage.removeItem('orders');
                console.log('✅ Cleared orders');
            }
        }
    }
}

// Run cleanup on page load
cleanupLocalStorage();

// Products data - ціни в UAH
const defaultProducts = [
    {
        id: 1,
        name: 'Копчений лосось',
        category: 'Копчена риба',
        description: 'Ніжне філе лосося холодного копчення, преміум якість',
        priceFrom: 890,
        priceTo: 950,
        price: 890,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
        icon: '🐟',
        inStock: true
    },
    {
        id: 2,
        name: 'Сушена вобла',
        category: 'В\'ялена риба',
        description: "Класична в'ялена вобла до пива, натуральна",
        priceFrom: 180,
        priceTo: 220,
        price: 180,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        icon: '🐠',
        inStock: true
    },
    {
        id: 3,
        name: 'Копчена скумбрія',
        category: 'Копчена риба',
        description: 'Жирна скумбрія гарячого копчення, сочна та смачна',
        priceFrom: 420,
        priceTo: 480,
        price: 420,
        image: 'https://images.unsplash.com/photo-1534947376037-85699269c2a8?w=400&h=300&fit=crop',
        icon: '🐟',
        inStock: true
    },
    {
        id: 4,
        name: 'Сушений кальмар',
        category: 'Закуски',
        description: 'Сушений кальмар соломкою, хрустка закуска до пива',
        priceFrom: 320,
        priceTo: 380,
        price: 320,
        image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
        icon: '🦑',
        inStock: true
    },
    {
        id: 5,
        name: 'Копчена форель',
        category: 'Копчена риба',
        description: 'Форель холодного копчення, філе, ніжна та ароматна',
        priceFrom: 560,
        priceTo: 620,
        price: 560,
        image: 'https://images.unsplash.com/photo-1599084993091-1a80155dd2a8?w=400&h=300&fit=crop',
        icon: '🐟',
        inStock: true
    },
    {
        id: 6,
        name: "Вобла в'ялена",
        category: 'В\'ялена риба',
        description: "Тушки вобли в'яленої, відбірної якості, без добавок",
        priceFrom: 340,
        priceTo: 400,
        price: 340,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        icon: '🐠',
        inStock: true
    },
    {
        id: 7,
        name: 'Креветки сушені',
        category: 'Закуски',
        description: 'Сушені креветки - смачна та поживна закуска',
        priceFrom: 260,
        priceTo: 320,
        price: 260,
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
        icon: '🦐',
        inStock: true
    },
    {
        id: 8,
        name: 'Омуль копчений',
        category: 'Копчена риба',
        description: 'Байкальський омуль холодного копчення, преміум',
        priceFrom: 980,
        priceTo: 1050,
        price: 980,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
        icon: '🐟',
        inStock: true
    }
];

// Load products from Supabase or localStorage
let products = [];

// Initialize products on page load
async function initializeProducts() {
    try {
        // Try to load from Supabase first
        const supabaseProducts = await supabaseAPI.getProducts();
        if (supabaseProducts && supabaseProducts.length > 0) {
            products = supabaseProducts;
            console.log('✅ Products loaded from Supabase:', products.length);
        } else {
            // Fallback to localStorage
            products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
            console.log('✅ Products loaded from localStorage:', products.length);
        }
        renderProducts();
        updateCategoryCounts();
    } catch (e) {
        console.warn('Error initializing products:', e);
        products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
        renderProducts();
    }
}

// Try to load from IndexedDB if available
const DB_NAME = 'RibakStore';
const STORE_NAME = 'products';

async function loadProductsFromIndexedDB() {
    try {
        const request = indexedDB.open(DB_NAME);
        return new Promise((resolve) => {
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const getAllRequest = store.getAll();
                
                getAllRequest.onsuccess = () => {
                    const result = getAllRequest.result;
                    if (result && result.length > 0) {
                        console.log('Loaded products from IndexedDB:', result.length);
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                };
                getAllRequest.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        });
    } catch (e) {
        console.warn('IndexedDB not available:', e);
        return null;
    }
}

// Load from IndexedDB on startup - will be called after initialization
let indexedDBLoaded = false;

// Cart state
let cart = [];

// Global variable to track last settings
let lastSettings = {};

// Search state
let currentSearchQuery = '';

// Filter state
let currentFilter = 'all';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.querySelector('.search-btn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutTotal = document.getElementById('checkoutTotal');
const successModal = document.getElementById('successModal');
const successOverlay = document.getElementById('successOverlay');
const closeSuccess = document.getElementById('closeSuccess');

// Format price - UAH
function formatPrice(price) {
    return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Render products with images
async function renderProducts() {
    // Load products from Supabase
    products = await supabaseAPI.getProducts();
    
    // Log all categories for debugging
    const allCategories = [...new Set(products.map(p => p.category))];
    console.log('All product categories:', allCategories);
    console.log('Current filter:', currentFilter);
    
    // Filter products by category and search query
    let filteredProducts = products;
    if (currentFilter !== 'all') {
        filteredProducts = products.filter(p => p.category === currentFilter);
        console.log(`Filtered products for "${currentFilter}":`, filteredProducts.length);
    }
    
    // Apply search filter
    if (currentSearchQuery.trim()) {
        const query = currentSearchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        // Get first image or fallback to product.image
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
        const hasMultipleImages = product.images && product.images.length > 1;
        // Format price range or single price
        const priceDisplay = product.priceTo && product.priceTo !== product.priceFrom 
            ? `${formatPrice(product.priceFrom)} - ${formatPrice(product.priceTo)}`
            : formatPrice(product.priceFrom || product.price);
        
        const outOfStock = product.inStock === false;
        
        return `
        <div class="product-card" data-id="${product.id}" onclick="openProductModal(${product.id})" style="cursor: pointer; ${outOfStock ? 'opacity: 0.7;' : ''}">
            <div class="product-image-wrapper">
                <img class="product-image" src="${mainImage}" alt="${product.name}">
                ${hasMultipleImages ? `<span class="product-images-count" style="position: absolute; top: 10px; right: 10px; background: transparent; color: var(--gray); font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px;"><i class="fas fa-images"></i> ${product.images.length}</span>` : ''}
                ${outOfStock ? `<span class="out-of-stock-badge" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600; text-align: center; font-size: 0.85rem; max-width: 90%; word-wrap: break-word;">Немає в наявності</span>` : ''}
                <button class="btn btn-primary add-to-cart-btn" onclick="event.stopPropagation(); ${outOfStock ? 'showNotification(\'Товар відсутній\')' : `openOrderModal(${product.id})`}" ${outOfStock ? 'disabled style="background: var(--gray);"' : ''}>
                    <i class="fas fa-phone"></i> ${outOfStock ? 'Немає в наявності' : 'Замовити'}
                </button>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                    <span>4.8</span>
                </div>
                <p class="product-desc">${product.description}</p>
                <div class="product-price">${priceDisplay} <span class="unit">/ кг</span></div>
            </div>
        </div>
    `}).join('');
}

// Filter by category
function filterCategory(category) {
    currentFilter = category;
    currentSearchQuery = ''; // Clear search when filtering by category
    if (searchInput) searchInput.value = '';
    renderProducts();
    document.getElementById('products').scrollIntoView({behavior: 'smooth'});
}

// Show all products
function showAllProducts() {
    currentFilter = 'all';
    currentSearchQuery = ''; // Clear search
    if (searchInput) searchInput.value = '';
    renderProducts();
    document.getElementById('products').scrollIntoView({behavior: 'smooth'});
}

// Search products
function searchProducts(query) {
    currentSearchQuery = query;
    currentFilter = 'all'; // Reset category filter when searching
    renderProducts();
    document.getElementById('products').scrollIntoView({behavior: 'smooth'});
}

// Update hero product from admin settings
function updateHeroProduct() {
    const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    const heroProductId = settings.heroProduct || 1;
    const heroProduct = products.find(p => p.id === heroProductId) || products[0];
    
    if (heroProduct) {
        const heroImage = document.getElementById('heroImage');
        const heroName = document.getElementById('heroName');
        const heroPrice = document.getElementById('heroPrice');
        const heroDesc = document.getElementById('heroDesc');
        const heroBtn = document.getElementById('heroBtn');
        
        // Get first image from images array or fallback to single image
        const mainImage = heroProduct.images && heroProduct.images.length > 0 ? heroProduct.images[0] : heroProduct.image;
        
        // Format price for hero (range or single)
        const heroPriceDisplay = heroProduct.priceTo && heroProduct.priceTo !== heroProduct.priceFrom 
            ? `${formatPrice(heroProduct.priceFrom)} - ${formatPrice(heroProduct.priceTo)}`
            : formatPrice(heroProduct.priceFrom || heroProduct.price);
        
        const heroOutOfStock = heroProduct.inStock === false;
        
        if (heroImage) heroImage.style.backgroundImage = `url('${mainImage}')`;
        if (heroName) heroName.textContent = heroProduct.name;
        if (heroPrice) heroPrice.textContent = heroPriceDisplay;
        if (heroDesc) heroDesc.textContent = heroProduct.description;
        if (heroBtn) {
            if (heroOutOfStock) {
                heroBtn.setAttribute('onclick', 'showNotification(\'Товар відсутній\')');
                heroBtn.style.background = 'var(--gray)';
                heroBtn.textContent = 'Немає в наявності';
            } else {
                heroBtn.setAttribute('onclick', `openOrderModal(${heroProduct.id})`);
                heroBtn.style.pointerEvents = 'auto';
                heroBtn.style.cursor = 'pointer';
                heroBtn.style.background = '';
                heroBtn.innerHTML = '<i class="fas fa-phone"></i> Замовити';
            }
        }
    }
}

// Update about section from admin settings
function updateAboutSection() {
    const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    
    console.log('=== updateAboutSection CALLED ===');
    console.log('Settings from localStorage:', settings);
    console.log('storeName value:', settings.storeName);
    
    // Update store name
    if (settings.storeName) {
        const storeNameDisplay = document.getElementById('storeNameDisplay');
        console.log('storeNameDisplay element found:', !!storeNameDisplay);
        if (storeNameDisplay) {
            console.log('OLD VALUE:', storeNameDisplay.textContent);
            storeNameDisplay.textContent = settings.storeName;
            console.log('NEW VALUE:', storeNameDisplay.textContent);
            console.log('✓ Updated storeName:', settings.storeName);
        } else {
            console.error('✗ storeNameDisplay element NOT FOUND!');
        }
    } else {
        console.warn('⚠ settings.storeName is empty or undefined');
    }
    
    // Update hero section
    if (settings.heroTitle) {
        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle) {
            heroTitle.textContent = settings.heroTitle;
            console.log('✓ Updated heroTitle:', settings.heroTitle);
        }
    }
    if (settings.heroSubtitle) {
        const heroSubtitle = document.getElementById('heroSubtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = settings.heroSubtitle;
            console.log('✓ Updated heroSubtitle:', settings.heroSubtitle);
        }
    }
    if (settings.heroBtn1) {
        const heroBtn1 = document.getElementById('heroBtn1');
        if (heroBtn1) {
            heroBtn1.textContent = settings.heroBtn1;
            console.log('✓ Updated heroBtn1:', settings.heroBtn1);
        }
    }
    if (settings.heroBtn2) {
        const heroBtn2 = document.getElementById('heroBtn2');
        if (heroBtn2) {
            heroBtn2.textContent = settings.heroBtn2;
            console.log('✓ Updated heroBtn2:', settings.heroBtn2);
        }
    }
    if (settings.heroTrust1) {
        const heroTrust1 = document.getElementById('heroTrust1');
        if (heroTrust1) {
            heroTrust1.textContent = settings.heroTrust1;
            console.log('✓ Updated heroTrust1:', settings.heroTrust1);
        }
    }
    if (settings.heroTrust2) {
        const heroTrust2 = document.getElementById('heroTrust2');
        if (heroTrust2) {
            heroTrust2.textContent = settings.heroTrust2;
            console.log('✓ Updated heroTrust2:', settings.heroTrust2);
        }
    }
    if (settings.heroTrust3) {
        const heroTrust3 = document.getElementById('heroTrust3');
        if (heroTrust3) {
            heroTrust3.textContent = settings.heroTrust3;
            console.log('✓ Updated heroTrust3:', settings.heroTrust3);
        }
    }
    
    // Update benefits
    for (let i = 1; i <= 4; i++) {
        if (settings[`benefit${i}`]) {
            const titleEl = document.getElementById(`benefitTitle${i}`);
            if (titleEl) {
                titleEl.textContent = settings[`benefit${i}`];
                console.log(`✓ Updated benefit${i}:`, settings[`benefit${i}`]);
            }
        }
        if (settings[`benefitDesc${i}`]) {
            const descEl = document.getElementById(`benefitDesc${i}`);
            if (descEl) {
                descEl.textContent = settings[`benefitDesc${i}`];
                console.log(`✓ Updated benefitDesc${i}:`, settings[`benefitDesc${i}`]);
            }
        }
        if (settings[`benefitIcon${i}`]) {
            const iconEl = document.getElementById(`benefitIcon${i}`);
            if (iconEl) {
                iconEl.innerHTML = `<i class="fas ${settings[`benefitIcon${i}`]}"></i>`;
                console.log(`✓ Updated benefitIcon${i}:`, settings[`benefitIcon${i}`]);
            }
        }
    }
    
    const aboutTitle = document.getElementById('aboutTitle');
    const aboutItem1 = document.getElementById('aboutItem1');
    const aboutItem2 = document.getElementById('aboutItem2');
    const aboutItem3 = document.getElementById('aboutItem3');
    const aboutItem4 = document.getElementById('aboutItem4');
    
    if (aboutTitle && settings.aboutTitle) aboutTitle.textContent = settings.aboutTitle;
    if (aboutItem1 && settings.aboutItem1) aboutItem1.textContent = settings.aboutItem1;
    if (aboutItem2 && settings.aboutItem2) aboutItem2.textContent = settings.aboutItem2;
    if (aboutItem3 && settings.aboutItem3) aboutItem3.textContent = settings.aboutItem3;
    if (aboutItem4 && settings.aboutItem4) aboutItem4.textContent = settings.aboutItem4;
    
    // Update footer from settings
    console.log('updateAboutSection: Updating footer...');
    if (settings.footerTagline) {
        const footerTagline = document.getElementById('footerTagline');
        if (footerTagline) {
            footerTagline.textContent = settings.footerTagline;
            console.log('✓ Updated footerTagline:', settings.footerTagline);
        }
    }
    if (settings.footerPhone) {
        const footerPhone = document.getElementById('footerPhone');
        if (footerPhone) {
            footerPhone.textContent = settings.footerPhone;
            console.log('✓ Updated footerPhone:', settings.footerPhone);
        }
    }
    if (settings.footerEmail) {
        const footerEmail = document.getElementById('footerEmail');
        if (footerEmail) {
            footerEmail.textContent = settings.footerEmail;
            console.log('✓ Updated footerEmail:', settings.footerEmail);
        }
    }
    if (settings.footerCopyright) {
        const footerCopyright = document.getElementById('footerCopyright');
        if (footerCopyright) {
            footerCopyright.textContent = settings.footerCopyright;
            console.log('✓ Updated footerCopyright:', settings.footerCopyright);
        }
    }
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        // Get first image from images array or fallback to single image
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: mainImage,
            icon: product.icon,
            quantity: 1
        });
    }
    
    showNotification('Товар додано до кошика!');
}


// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        font-weight: 500;
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Event listeners for search
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        searchProducts(e.target.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProducts(e.target.value);
        }
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        if (searchInput) {
            searchProducts(searchInput.value);
        }
    });
}

// Event listeners
checkoutOverlay.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

closeCheckout.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

successOverlay.addEventListener('click', () => {
    successModal.classList.remove('active');
});

closeSuccess.addEventListener('click', () => {
    successModal.classList.remove('active');
});

// Checkout form
checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        comment: document.getElementById('comment').value,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toISOString()
    };
    
    // Save order to localStorage (in real app, send to server)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(formData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    checkoutForm.reset();
    checkoutModal.classList.remove('active');
    successModal.classList.add('active');
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        checkoutModal.classList.remove('active');
        successModal.classList.remove('active');
    }
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Gallery Modal Elements
const galleryModal = document.getElementById('galleryModal');
const galleryOverlay = document.getElementById('galleryOverlay');
const closeGallery = document.getElementById('closeGallery');
const galleryTitle = document.getElementById('galleryTitle');
const galleryMainImage = document.getElementById('galleryMainImage');
const galleryThumbnails = document.getElementById('galleryThumbnails');

// Open gallery for product
function openGallery(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.images || product.images.length <= 1) return;
    
    galleryTitle.textContent = product.name;
    
    // Load thumbnails
    galleryThumbnails.innerHTML = product.images.map((img, index) => `
        <img src="${img}" alt="${product.name} ${index + 1}" 
             class="${index === 0 ? 'active' : ''}" 
             onclick="changeGalleryImage('${img}', this)">
    `).join('');
    
    // Set main image
    galleryMainImage.src = product.images[0];
    
    galleryModal.classList.add('active');
}

// Change gallery main image
function changeGalleryImage(src, thumbnail) {
    galleryMainImage.src = src;
    document.querySelectorAll('.gallery-thumbnails img').forEach(img => img.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Close gallery
galleryOverlay.addEventListener('click', () => galleryModal.classList.remove('active'));
closeGallery.addEventListener('click', () => galleryModal.classList.remove('active'));

// Close gallery on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        galleryModal.classList.remove('active');
    }
});

// Product Modal Elements
const productModal = document.getElementById('productModal');
const productOverlay = document.getElementById('productOverlay');
const closeProductModalBtn = document.getElementById('closeProductModalBtn');
const productModalTitle = document.getElementById('productModalTitle');
const productModalBody = document.getElementById('productModalBody');

// Open product modal
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
    const hasMultipleImages = product.images && product.images.length > 1;
    const priceDisplay = product.priceTo && product.priceTo !== product.priceFrom 
        ? `${formatPrice(product.priceFrom)} - ${formatPrice(product.priceTo)}`
        : formatPrice(product.priceFrom || product.price);
    const outOfStock = product.inStock === false;
    
    productModalTitle.textContent = product.name;
    productModalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 100%; height: 300px; background-image: url('${mainImage}'); background-size: cover; background-position: center; border-radius: 15px; position: relative; cursor: ${hasMultipleImages ? 'pointer' : 'default'};" ${hasMultipleImages ? `onclick="productModal.classList.remove('active'); openGallery(${product.id})"` : ''}>
                ${outOfStock ? `<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.9rem;">Немає в наявності</span>` : ''}
                ${hasMultipleImages ? `<div style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.9rem;"><i class="fas fa-expand"></i> Натисніть для перегляду галереї</div>` : ''}
            </div>
        </div>
        <div style="margin-bottom: 15px;">
            <span style="background: var(--primary-light); color: var(--primary); padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${product.category}</span>
        </div>
        <h2 style="margin-bottom: 10px; color: var(--dark);">${product.name}</h2>
        <p style="color: var(--gray); margin-bottom: 20px; line-height: 1.6;">${product.description}</p>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 20px;">
            ${priceDisplay} <span style="font-size: 1rem; color: var(--gray); font-weight: 400;">/ кг</span>
        </div>
        <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary btn-full" onclick="${outOfStock ? 'showNotification(\'Товар відсутній\')' : `openOrderModal(${product.id})`}" ${outOfStock ? 'disabled style="background: var(--gray);"' : ''}>
                <i class="fas fa-phone"></i> ${outOfStock ? 'Немає в наявності' : 'Замовити'}
            </button>
        </div>
    `;
    
    productModal.classList.add('active');
}

// Order Modal
const orderModal = document.getElementById('orderModal');
const orderOverlay = document.getElementById('orderOverlay');
const closeOrder = document.getElementById('closeOrder');

// Open order modal
function openOrderModal(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        // Update contact info in order modal
        const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
        const phone = settings.storePhone || '+38 (050) 533-88-39';
        const email = settings.storeEmail || 'info@rybak.com';
        const whatsapp = settings.storeWhatsApp || '380505338839';
        
        // Update phone link
        const phoneLink = orderModal.querySelector('a[href^="tel:"]');
        if (phoneLink) {
            phoneLink.href = `tel:${phone.replace(/\D/g, '')}`;
            phoneLink.querySelector('span').textContent = phone;
        }
        
        // Update WhatsApp link
        const whatsappLink = orderModal.querySelector('a[href^="https://wa.me"]');
        if (whatsappLink) {
            whatsappLink.href = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;
        }
        
        // Update email link
        const emailLink = orderModal.querySelector('a[href^="mailto:"]');
        if (emailLink) {
            emailLink.href = `mailto:${email}`;
            emailLink.querySelector('span').textContent = email;
        }
        
        productModal.classList.remove('active');
        orderModal.classList.add('active');
    }
}

// Close order modal
if (orderOverlay) {
    orderOverlay.addEventListener('click', () => orderModal.classList.remove('active'));
}
if (closeOrder) {
    closeOrder.addEventListener('click', () => orderModal.classList.remove('active'));
}

// Close product modal
if (productOverlay) {
    productOverlay.addEventListener('click', () => productModal.classList.remove('active'));
}
if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener('click', () => productModal.classList.remove('active'));
}

// Close modals on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        productModal.classList.remove('active');
        orderModal.classList.remove('active');
    }
});

// Initialize
(async () => {
    console.log('=== APP.JS INITIALIZATION ===');
    console.log('localStorage.storeSettings:', localStorage.getItem('storeSettings'));
    await loadSettings();
    await renderProducts();
    updateHeroProduct();
    updateAboutSection();
    await updateCategoryCounts();
    console.log('=== INITIALIZATION COMPLETE ===');
})();

// Load from IndexedDB after initialization
loadProductsFromIndexedDB().then(async dbProducts => {
    if (dbProducts && dbProducts.length > 0) {
        products = dbProducts;
        console.log('✓ Loaded products from IndexedDB:', dbProducts.length);
        indexedDBLoaded = true;
        // Re-render with IndexedDB products
        await renderProducts();
        await updateCategoryCounts();
    } else {
        console.log('No products in IndexedDB, using Supabase');
        indexedDBLoaded = true;
    }
});

// Listen for storage changes (sync between tabs)
window.addEventListener('storage', (e) => {
    if (e.key === 'adminProducts' || e.key === 'storeSettings') {
        // Try to load from IndexedDB first, then localStorage
        if (e.key === 'adminProducts') {
            loadProductsFromIndexedDB().then(dbProducts => {
                if (dbProducts && dbProducts.length > 0) {
                    products = dbProducts;
                    console.log('Loaded products from IndexedDB via storage event');
                } else {
                    const newProducts = JSON.parse(localStorage.getItem('adminProducts'));
                    if (newProducts) {
                        products = newProducts;
                        console.log('Loaded products from localStorage via storage event');
                    }
                }
                renderProducts();
                updateCategoryCounts();
            });
        }
        // Reload settings
        loadSettings();
        updateHeroProduct();
        updateAboutSection();
    }
});

// Listen for BroadcastChannel messages (same tab sync)
if ('BroadcastChannel' in window) {
    const bc = new BroadcastChannel('settings_channel');
    bc.onmessage = (event) => {
        console.log('Received message from admin:', event.data);
        if (event.data.type === 'settings' || event.data.type === 'products') {
            // Try to load from IndexedDB first, then localStorage
            loadProductsFromIndexedDB().then(dbProducts => {
                if (dbProducts && dbProducts.length > 0) {
                    products = dbProducts;
                    console.log('Loaded products from IndexedDB via BroadcastChannel');
                } else {
                    const newProducts = JSON.parse(localStorage.getItem('adminProducts'));
                    if (newProducts) {
                        products = newProducts;
                        console.log('Loaded products from localStorage via BroadcastChannel');
                    }
                }
                renderProducts();
                updateCategoryCounts();
            });
            loadSettings();
            updateHeroProduct();
            updateAboutSection();
        }
    };
}

// Listen for storage changes with immediate update
window.addEventListener('storage', (e) => {
    if (e.key === 'storeSettings') {
        console.log('🔄 Storage event detected for storeSettings');
        lastSettingsJSON = '';  // Force update on next interval check
        loadSettings();
        updateAboutSection();
    }
});


// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// NEW DESIGN FEATURES
// ========================================

// Header scroll effect
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    mobileMenuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Close on link click
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.benefit-card, .category-card, .review-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animate-in styles
const animateStyle = document.createElement('style');
animateStyle.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(animateStyle);

// Hero scroll button
document.querySelector('.hero-scroll')?.addEventListener('click', () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId !== '#') {
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// Filter category function
function filterCategory(category) {
    currentFilter = category;
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    renderProducts();
    showNotification(`Фільтр: ${category}`);
}

function showAllProducts() {
    currentFilter = 'all';
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    renderProducts();
}

// Update category counts based on products
async function updateCategoryCounts() {
    const prods = await supabaseAPI.getProducts();
    const categories = ["В'ялена риба", "Копчена риба", "Закуски"];
    
    categories.forEach((cat, index) => {
        const count = prods.filter(p => p.category === cat).length;
        const countEl = document.getElementById(`catCount${index + 1}`);
        if (countEl) {
            const word = count === 1 ? 'товар' : count > 1 && count < 5 ? 'товари' : 'товарів';
            countEl.textContent = `${count} ${word}`;
        }
    });
}

// Load settings from admin panel
async function loadSettings() {
    // Always load from localStorage first (admin panel saves here)
    const localSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    const settings = Object.keys(localSettings).length > 0 ? localSettings : await supabaseAPI.getSettings();
    
    console.log('Settings loaded:', settings);
    console.log('footerTagline in settings:', settings.footerTagline);
    console.log('footerPhone in settings:', settings.footerPhone);
    
    // Store name
    if (settings.storeName !== undefined) {
        const storeNameDisplay = document.getElementById('storeNameDisplay');
        if (storeNameDisplay) storeNameDisplay.textContent = settings.storeName;
    }
    
    // Logo image
    if (settings.logoImage) {
        const logoImg = document.querySelector('.logo-icon img');
        if (logoImg) {
            logoImg.src = settings.logoImage;
            console.log('✓ Updated logo image:', settings.logoImage.substring(0, 50) + '...');
        } else {
            console.warn('⚠ Logo image element not found');
        }
    } else {
        console.warn('⚠ settings.logoImage is empty');
    }
    
    // Hero section
    if (settings.heroTitle !== undefined) {
        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle) heroTitle.textContent = settings.heroTitle;
    }
    if (settings.heroSubtitle !== undefined) {
        const heroSubtitle = document.getElementById('heroSubtitle');
        if (heroSubtitle) heroSubtitle.textContent = settings.heroSubtitle;
    }
    if (settings.heroBtn1 !== undefined) {
        const heroBtn1 = document.getElementById('heroBtn1');
        if (heroBtn1) heroBtn1.textContent = settings.heroBtn1;
    }
    if (settings.heroBtn2 !== undefined) {
        const heroBtn2 = document.getElementById('heroBtn2');
        if (heroBtn2) heroBtn2.textContent = settings.heroBtn2;
    }
    if (settings.heroTrust1 !== undefined) {
        const heroTrust1 = document.getElementById('heroTrust1');
        if (heroTrust1) heroTrust1.textContent = settings.heroTrust1;
    }
    if (settings.heroTrust2 !== undefined) {
        const heroTrust2 = document.getElementById('heroTrust2');
        if (heroTrust2) heroTrust2.textContent = settings.heroTrust2;
    }
    if (settings.heroTrust3 !== undefined) {
        const heroTrust3 = document.getElementById('heroTrust3');
        if (heroTrust3) heroTrust3.textContent = settings.heroTrust3;
    }
    
    // Benefits section
    for (let i = 1; i <= 4; i++) {
        // Benefit titles
        if (settings[`benefit${i}`] !== undefined) {
            const titleEl = document.getElementById(`benefitTitle${i}`);
            if (titleEl) titleEl.textContent = settings[`benefit${i}`];
        }
        // Benefit descriptions
        if (settings[`benefitDesc${i}`] !== undefined) {
            const descEl = document.getElementById(`benefitDesc${i}`);
            if (descEl) descEl.textContent = settings[`benefitDesc${i}`];
        }
        // Benefit icons
        if (settings[`benefitIcon${i}`] !== undefined && settings[`benefitIcon${i}`]) {
            const iconEl = document.getElementById(`benefitIcon${i}`);
            if (iconEl) {
                const newIcon = settings[`benefitIcon${i}`];
                iconEl.innerHTML = `<i class="fas ${newIcon}"></i>`;
                console.log(`✓ Updated benefitIcon${i} to: ${newIcon}`);
            } else {
                console.warn(`⚠ benefitIcon${i} element not found`);
            }
        }
    }
    
    // Category images
    for (let i = 1; i <= 3; i++) {
        if (settings[`catImage${i}`] !== undefined && settings[`catImage${i}`]) {
            const imgEl = document.getElementById(`catImage${i}`);
            if (imgEl) {
                imgEl.style.backgroundImage = `url('${settings[`catImage${i}`]}')`;
                console.log(`✓ Updated catImage${i}:`, settings[`catImage${i}`]);
            }
        }
    }
    
    // Footer settings
    console.log('Processing footer settings...');
    console.log('footerTagline value:', settings.footerTagline, 'exists:', settings.footerTagline !== undefined);
    console.log('footerPhone value:', settings.footerPhone, 'exists:', settings.footerPhone !== undefined);
    console.log('footerEmail value:', settings.footerEmail, 'exists:', settings.footerEmail !== undefined);
    
    if (settings.footerTagline !== undefined) {
        const footerTagline = document.getElementById('footerTagline');
        console.log('footerTagline element:', footerTagline);
        if (footerTagline) {
            footerTagline.textContent = settings.footerTagline;
            console.log('✓ Updated footerTagline:', settings.footerTagline);
        } else {
            console.error('✗ footerTagline element NOT FOUND in DOM');
        }
    }
    if (settings.footerPhone !== undefined) {
        const footerPhone = document.getElementById('footerPhone');
        console.log('footerPhone element:', footerPhone);
        if (footerPhone) {
            footerPhone.textContent = settings.footerPhone;
            console.log('✓ Updated footerPhone:', settings.footerPhone);
        } else {
            console.error('✗ footerPhone element NOT FOUND in DOM');
        }
    }
    if (settings.footerEmail !== undefined) {
        const footerEmail = document.getElementById('footerEmail');
        if (footerEmail) {
            footerEmail.textContent = settings.footerEmail;
            console.log('✓ Updated footerEmail:', settings.footerEmail);
        } else {
            console.error('✗ footerEmail element NOT FOUND');
        }
    }
    if (settings.footerCopyright !== undefined) {
        const footerCopyright = document.getElementById('footerCopyright');
        if (footerCopyright) {
            footerCopyright.textContent = settings.footerCopyright;
            console.log('✓ Updated footerCopyright:', settings.footerCopyright);
        } else {
            console.error('✗ footerCopyright element NOT FOUND');
        }
    }
    
    // Update hero product (for price, image, etc.)
    updateHeroProduct();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Load font settings
function loadFontSettings() {
    const fontSettings = JSON.parse(localStorage.getItem('fontSettings') || '{}');
    console.log('Loading font settings:', fontSettings);
    
    if (fontSettings.mainFont) {
        document.body.style.setProperty('font-family', fontSettings.mainFont + ', sans-serif', 'important');
        console.log('Applied main font:', fontSettings.mainFont);
    }
    if (fontSettings.headingFont) {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, .logo-text');
        headings.forEach(h => {
            h.style.setProperty('font-family', fontSettings.headingFont + ', sans-serif', 'important');
        });
        console.log('Applied heading font:', fontSettings.headingFont);
    }
}

// Load settings on page load - ensure DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing...');
    
    // Check localStorage
    const storeSettings = localStorage.getItem('storeSettings');
    const fontSettings = localStorage.getItem('fontSettings');
    console.log('localStorage storeSettings:', storeSettings ? 'found' : 'not found');
    console.log('localStorage fontSettings:', fontSettings ? 'found' : 'not found');
    
    await loadSettings();
    loadFontSettings();
    await updateCategoryCounts();
    await renderProducts();
    console.log('Initialization complete');
    
    // Manual refresh button handler
    const refreshBtn = document.getElementById('refreshSettingsBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('Manual refresh triggered');
            loadSettings();
            loadFontSettings();
            products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
            updateCategoryCounts();
            renderProducts();
            
            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            `;
            notification.textContent = 'Налаштування оновлено!';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 2000);
        });
    }
});

// Update when localStorage changes (from admin panel)
window.addEventListener('storage', (e) => {
    console.log('Storage event:', e.key);
    if (e.key === 'adminProducts') {
        products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
        updateCategoryCounts();
        renderProducts();
    }
    if (e.key === 'storeSettings') {
        loadSettings();
    }
    if (e.key === 'fontSettings') {
        loadFontSettings();
    }
});

// BroadcastChannel for same-tab communication (if supported)
if ('BroadcastChannel' in window) {
    const bc = new BroadcastChannel('settings_channel');
    bc.addEventListener('message', (e) => {
        console.log('BroadcastChannel message:', e.data);
        if (e.data.type === 'settings') {
            loadSettings();
        }
        if (e.data.type === 'fonts') {
            loadFontSettings();
        }
        if (e.data.type === 'products') {
            products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
            updateCategoryCounts();
            renderProducts();
        }
    });
}

// Update when page becomes visible (user returns from admin panel)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        loadSettings();
        loadFontSettings();
        products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
        updateCategoryCounts();
        renderProducts();
    }
});

// Periodically check for updates (fallback for same-tab updates)
let lastSettingsJSON = '';
setInterval(() => {
    const storedProducts = JSON.parse(localStorage.getItem('adminProducts'));
    const storedSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    const storedFontSettings = JSON.parse(localStorage.getItem('fontSettings') || '{}');
    const currentSettingsJSON = JSON.stringify(storedSettings);
    
    // Check if products changed
    if (storedProducts && JSON.stringify(storedProducts) !== JSON.stringify(products)) {
        products = storedProducts;
        renderProducts();
    }
    
    // Check if settings changed
    if (currentSettingsJSON !== lastSettingsJSON) {
        console.log('Settings changed, updating...');
        lastSettingsJSON = currentSettingsJSON;
        loadSettings();
        updateAboutSection();
    }
    
    // Load font settings
    loadFontSettings();
}, 1000);

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing app...');
    initializeProducts();
    loadSettings();
    loadFontSettings();
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProducts);
} else {
    initializeProducts();
}

