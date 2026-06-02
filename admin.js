// Admin Panel JavaScript

// Supabase Configuration
const SUPABASE_URL = 'https://rxcgyreenwlfhqpvbsfh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Le8tl8h2Bj0xRMeQLvtaOQ_h15hB2LZ';

// Compress image before upload
async function compressImage(base64Image) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Resize if too large
            const maxWidth = 1200;
            const maxHeight = 1200;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with quality 0.7
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressed);
        };
        img.src = base64Image;
    });
}

// Upload image to Supabase Storage and get public URL
async function uploadImageToSupabase(base64Image, filename) {
    try {
        if (!base64Image || !base64Image.startsWith('data:image')) {
            console.warn('Invalid image format');
            return null;
        }
        
        // Compress image first
        console.log('🖼️ Compressing image...');
        const compressedImage = await compressImage(base64Image);
        
        // Convert base64 to blob properly
        const arr = compressedImage.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        
        console.log('📦 Blob created:', blob.size, 'bytes (compressed)');
        
        // Upload to Supabase Storage using PUT method
        const uploadResponse = await fetch(
            `${SUPABASE_URL}/storage/v1/object/product-images/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Content-Type': mime
                },
                body: blob
            }
        );
        
        console.log('📊 Upload response status:', uploadResponse.status);
        
        if (uploadResponse.ok || uploadResponse.status === 200) {
            // Get public URL
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-images/${filename}`;
            console.log('✅ Image uploaded:', publicUrl);
            return publicUrl;
        } else {
            const errorText = await uploadResponse.text();
            console.error('❌ Upload error:', uploadResponse.status);
            console.error('📋 Error details:', errorText);
            console.error('📋 Filename:', filename);
            console.error('📋 Blob size:', blob.size);
            try {
                const errorJson = JSON.parse(errorText);
                console.error('📋 Error JSON:', errorJson);
            } catch (e) {}
            return null;
        }
    } catch (e) {
        console.error('❌ Error uploading image:', e);
        return null;
    }
}

// Supabase API helper
const supabaseAPI = {
    async saveProduct(product) {
        try {
            console.log('📤 Sending product to Supabase:', product);
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });
            console.log('📊 Save response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error saving product:', response.status);
                console.error('📋 Error details:', errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('📋 Error JSON:', errorJson);
                } catch (e) {}
                return null;
            }
            const data = await response.json();
            console.log('✅ Product saved to Supabase:', data);
            return data[0];
        } catch (e) {
            console.error('❌ Error saving product to Supabase:', e);
            return null;
        }
    },
    
    async updateProduct(id, product) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });
            if (!response.ok) {
                console.warn('Error updating product:', response.status);
                return null;
            }
            console.log('✅ Product updated in Supabase');
            return true;
        } catch (e) {
            console.warn('Error updating product in Supabase:', e);
            return null;
        }
    },
    
    async deleteProduct(id) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            if (!response.ok) {
                console.warn('Error deleting product:', response.status);
                return null;
            }
            console.log('✅ Product deleted from Supabase');
            return true;
        } catch (e) {
            console.warn('Error deleting product from Supabase:', e);
            return null;
        }
    },
    
    async saveSettings(settings) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/settings`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            if (!response.ok) {
                console.warn('Error saving settings:', response.status);
                return null;
            }
            console.log('✅ Settings saved to Supabase');
            return true;
        } catch (e) {
            console.warn('Error saving settings to Supabase:', e);
            return null;
        }
    }
};

// IndexedDB helper for storing large images
const DB_NAME = 'RibakStore';
const DB_VERSION = 1;
const STORE_NAME = 'products';

function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

async function saveProductsToIndexedDB(products) {
    try {
        const db = await initIndexedDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Clear old data
        store.clear();
        
        // Save each product
        products.forEach(product => {
            store.put(product);
        });
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (e) {
        console.warn('IndexedDB not available:', e);
    }
}

async function loadProductsFromIndexedDB() {
    try {
        const db = await initIndexedDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn('IndexedDB not available:', e);
        return null;
    }
}

// Clear old data with base64 images to fix quota issues
try {
    // Check localStorage quota
    const testKey = '__localStorage_test__';
    try {
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
    } catch (e) {
        console.warn('localStorage quota exceeded, clearing old data...');
        // If quota exceeded, clear old products
        localStorage.removeItem('adminProducts');
        localStorage.removeItem('orders');
        alert('localStorage переповнений! Товари очищені. Будь ласка, додайте товари знову.');
        location.reload();
    }
    
    const oldSettings = localStorage.getItem('storeSettings');
    if (oldSettings) {
        const parsed = JSON.parse(oldSettings);
        // Remove catImage fields if they contain base64 data (too large)
        let hasChanges = false;
        for (let i = 1; i <= 4; i++) {
            const key = `catImage${i}`;
            if (parsed[key] && parsed[key].includes('base64')) {
                delete parsed[key];
                hasChanges = true;
            }
        }
        if (hasChanges) {
            localStorage.setItem('storeSettings', JSON.stringify(parsed));
            console.log('Cleaned old settings - removed base64 images');
        }
    }
} catch (e) {
    console.warn('Error cleaning old settings:', e);
}

// Clear old products if localStorage is full
try {
    const oldProducts = localStorage.getItem('adminProducts');
    if (oldProducts && oldProducts.length > 3000000) { // > ~3MB
        console.warn('adminProducts too large, clearing...');
        localStorage.removeItem('adminProducts');
        alert('localStorage переповнений! Старі товари очищені. Будь ласка, додайте товари знову з меншою кількістю фото.');
    }
} catch (e) {
    console.warn('Error checking adminProducts:', e);
}

// Auth credentials (base64 encoded to hide from view)
const _auth = {
    l: atob('YWRtaW4='),           // admin
    p: atob('bWloYWlsMjgwOQ==')    // mihail2809
};
const checkAuth = (login, pass) => login === _auth.l && pass === _auth.p;

// Products array - will be loaded from Supabase or localStorage
let products = [];

// Initialize products from Supabase or localStorage
async function initializeAdminProducts() {
    try {
        // Try to load from Supabase first
        console.log('🔄 Loading products from Supabase...');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Supabase response status:', response.status);
        
        if (response.ok) {
            const supabaseProducts = await response.json();
            console.log('📦 Supabase products:', supabaseProducts);
            
            if (supabaseProducts && supabaseProducts.length > 0) {
                products = supabaseProducts;
                console.log('✅ Products loaded from Supabase:', products.length);
                // Save to localStorage as backup
                try {
                    localStorage.setItem('adminProducts', JSON.stringify(products));
                } catch (e) {
                    console.warn('localStorage full');
                }
                return;
            } else {
                console.log('⚠️ Supabase returned empty array');
            }
        } else {
            console.warn('❌ Supabase error:', response.status, response.statusText);
        }
    } catch (e) {
        console.warn('❌ Error loading from Supabase:', e);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('adminProducts');
    console.log('💾 localStorage adminProducts:', stored ? stored.substring(0, 100) + '...' : 'empty');
    products = stored ? JSON.parse(stored) : [];
    console.log('✅ Products loaded from localStorage:', products.length);
    
    // Setup BroadcastChannel for real-time sync between tabs
    if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('products_channel');
        bc.onmessage = (event) => {
            if (event.data.type === 'products_updated') {
                console.log('🔄 Products updated from another tab');
                products = event.data.products;
                loadProductsTable();
            }
        };
        window.productsBroadcastChannel = bc;
    }
}

// DOM Elements - will be initialized when DOM is ready
let loginScreen, adminDashboard, loginForm, logoutBtn;
let sidebarLinks, tabContents;
let orderModal, productModal;
let productMainImageInput, productAdditionalImagesInput;
let mainImagePreview, mainImagePreviewImg, additionalImagesPreview;
let currentMainImageBase64 = '';
let currentAdditionalImagesBase64 = [];
let logoImageInput, logoPreviewImg, logoPlaceholder;
let currentLogoBase64 = '';

// Initialize DOM elements when page loads
function initializeDOMElements() {
    loginScreen = document.getElementById('loginScreen');
    adminDashboard = document.getElementById('adminDashboard');
    loginForm = document.getElementById('loginForm');
    logoutBtn = document.getElementById('logoutBtn');
    
    sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    tabContents = document.querySelectorAll('.tab-content');
    
    orderModal = document.getElementById('orderModal');
    productModal = document.getElementById('productModal');
    
    productMainImageInput = document.getElementById('productMainImage');
    productAdditionalImagesInput = document.getElementById('productAdditionalImages');
    mainImagePreview = document.getElementById('mainImagePreview');
    mainImagePreviewImg = document.getElementById('mainImagePreviewImg');
    additionalImagesPreview = document.getElementById('additionalImagesPreview');
    
    logoImageInput = document.getElementById('logoImage');
    logoPreviewImg = document.getElementById('logoPreviewImg');
    logoPlaceholder = document.getElementById('logoPlaceholder');
    
    console.log('✅ DOM elements initialized');
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }
    
    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const login = document.getElementById('adminLogin').value;
            const password = document.getElementById('adminPassword').value;
            
            console.log('Login attempt:', login);
            
            if (checkAuth(login, password)) {
                console.log('✅ Auth successful');
                localStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
            } else {
                console.warn('❌ Auth failed');
                alert('Невірний логін або пароль!');
            }
        });
    } else {
        console.error('❌ loginForm not found!');
    }
    
    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminLoggedIn');
            location.reload();
        });
    }
    
    // Setup other event handlers
    setupEventHandlers();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDOMElements);
} else {
    initializeDOMElements();
}

// Show dashboard
async function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    
    // Load products from Supabase
    await initializeAdminProducts();
    loadProductsTable();
    
    // Load admin nickname
    const savedNickname = localStorage.getItem('adminNickname');
    if (savedNickname) {
        document.getElementById('adminNickname').textContent = savedNickname;
        document.getElementById('adminNicknameInput').value = savedNickname;
    }
}

// Settings button handler - moved inside initializeDOMElements
function setupEventHandlers() {
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Click on settings sidebar link
            const settingsLink = document.querySelector('[data-tab="settings"]');
            if (settingsLink) {
                settingsLink.click();
            }
        });
    }

    // Tab navigation
    if (sidebarLinks && sidebarLinks.length > 0) {
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.dataset.tab;
                
                // Update active states
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show corresponding tab
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tab + 'Tab').classList.add('active');
                
                // Load data for tab
                if (tab === 'products') {
                    loadProductsTable();
                } else if (tab === 'fonts') {
                    // Load font settings
                    const savedFontSettings = JSON.parse(localStorage.getItem('fontSettings') || '{}');
                    if (savedFontSettings.mainFont) {
                        document.getElementById('mainFont').value = savedFontSettings.mainFont;
                    }
                    if (savedFontSettings.headingFont) {
                        document.getElementById('headingFont').value = savedFontSettings.headingFont;
                    }
                } else if (tab === 'settings') {
                    loadHeroProductOptions();
                    // Restore all saved settings
                    const savedSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
                    if (savedSettings.heroProduct) {
                        document.getElementById('heroProduct').value = savedSettings.heroProduct;
                    }
                    if (savedSettings.storeEmail) {
                        document.getElementById('storeEmail').value = savedSettings.storeEmail;
                    }
                    if (savedSettings.storeWhatsApp) {
                        document.getElementById('storeWhatsApp').value = savedSettings.storeWhatsApp;
                    }
                    if (savedSettings.aboutTitle) {
                        document.getElementById('aboutTitle').value = savedSettings.aboutTitle;
                    }
                    if (savedSettings.aboutItem1) {
                        document.getElementById('aboutItem1').value = savedSettings.aboutItem1;
                    }
                    if (savedSettings.aboutItem2) {
                        document.getElementById('aboutItem2').value = savedSettings.aboutItem2;
                    }
                    if (savedSettings.aboutItem3) {
                        document.getElementById('aboutItem3').value = savedSettings.aboutItem3;
                    }
                    if (savedSettings.aboutItem4) {
                        document.getElementById('aboutItem4').value = savedSettings.aboutItem4;
                    }
                    if (savedSettings.logoImage) {
                        currentLogoBase64 = savedSettings.logoImage;
                        logoPreviewImg.src = savedSettings.logoImage;
                        logoPreviewImg.style.display = 'block';
                        logoPlaceholder.style.display = 'none';
                    }
                }
            });
        });
    }
    
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            document.getElementById('productModalTitle').textContent = 'Додати товар';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            mainImagePreview.style.display = 'none';
            mainImagePreviewImg.src = '';
            additionalImagesPreview.innerHTML = '';
            additionalImagesPreview.style.display = 'none';
            currentMainImageBase64 = '';
            currentAdditionalImagesBase64 = [];
            productMainImageInput.required = true;
            productModal.classList.add('active');
        });
    }
    
    // Main image preview handler
    if (productMainImageInput) {
        productMainImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Файл занадто великий! Максимальний розмір 5MB');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentMainImageBase64 = e.target.result;
                    mainImagePreviewImg.src = e.target.result;
                    mainImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Remove main image handler
    const removeMainImageBtn = document.getElementById('removeMainImage');
    if (removeMainImageBtn) {
        removeMainImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentMainImageBase64 = '';
            productMainImageInput.value = '';
            mainImagePreview.style.display = 'none';
            mainImagePreviewImg.src = '';
        });
    }
    
    // Additional images preview handler
    if (productAdditionalImagesInput) {
        productAdditionalImagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            currentAdditionalImagesBase64 = [];
            additionalImagesPreview.innerHTML = '';
            
            if (files.length > 4) {
                alert('Максимум 4 додаткових фото! Вибрано: ' + files.length);
                this.value = '';
                return;
            }
            
            files.forEach((file, index) => {
                if (file.size > 5 * 1024 * 1024) {
                    alert(`Файл ${file.name} занадто великий! Максимальний розмір 5MB`);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentAdditionalImagesBase64.push(e.target.result);
                    
                    const container = document.createElement('div');
                    container.style.cssText = 'position: relative; width: fit-content;';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--primary);';
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.style.cssText = 'position: absolute; top: -10px; right: -10px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;';
                    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    removeBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const idx = currentAdditionalImagesBase64.indexOf(e.target.result);
                        if (idx > -1) {
                            currentAdditionalImagesBase64.splice(idx, 1);
                        }
                        container.remove();
                        if (currentAdditionalImagesBase64.length === 0) {
                            additionalImagesPreview.style.display = 'none';
                            productAdditionalImagesInput.value = '';
                        }
                    });
                    
                    container.appendChild(img);
                    container.appendChild(removeBtn);
                    additionalImagesPreview.appendChild(container);
                    additionalImagesPreview.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            });
        });
    }
    
    // Logo image preview handler
    if (logoImageInput) {
        logoImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Файл занадто великий! Максимальний розмір 5MB');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentLogoBase64 = e.target.result;
                    logoPreviewImg.src = e.target.result;
                    logoPreviewImg.style.display = 'block';
                    logoPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Product form handler
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submit triggered');
            
            const productId = document.getElementById('productId').value;
            console.log('Product ID:', productId);
            console.log('Current main image:', currentMainImageBase64 ? 'Set' : 'Not set');
            
            // Check if main image is selected (for new products)
            if (!productId && !currentMainImageBase64) {
                alert('Будь ласка, виберіть головне фото товару!');
                return;
            }
            
            // Get existing product for images if editing and no new images selected
            const existingProduct = productId ? products.find(p => p.id === parseInt(productId)) : null;
            
            // Build images array: main image + additional images
            let productImages = [];
            
            if (currentMainImageBase64) {
                productImages.push(currentMainImageBase64);
            }
            
            if (currentAdditionalImagesBase64.length > 0) {
                productImages.push(...currentAdditionalImagesBase64);
            }
            
            // If editing and no new images selected, keep existing
            if (productId && productImages.length === 0 && existingProduct) {
                if (existingProduct.images && existingProduct.images.length > 0) {
                    productImages = existingProduct.images;
                } else if (existingProduct.image) {
                    productImages = [existingProduct.image];
                }
            }
            
            const priceFrom = parseInt(document.getElementById('productPriceFrom').value);
            const priceTo = parseInt(document.getElementById('productPriceTo').value);
            
            // For Supabase: store only essential data (no base64 images)
            // Generate ID: if updating use existing ID, else generate new one
            let newId;
            if (productId) {
                newId = parseInt(productId);
            } else {
                const maxId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) : 0;
                newId = maxId + 1;
            }
            
            // For new products, don't include ID (let Supabase auto-generate)
            // For updates, include ID
            const productDataSupabase = {
                ...(productId && { id: newId }), // Only include ID if updating
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                priceFrom: priceFrom,
                priceTo: priceTo,
                price: priceFrom,
                description: document.getElementById('productDescription').value,
                image: productImages[0] || '',
                icon: '🐟',
                in_stock: document.getElementById('productInStock').checked
            };
            
            console.log('🔄 Starting product save process...');
            console.log('📋 Product ID:', newId);
            console.log('📋 Product data:', productDataSupabase);
            
            // STEP 1: Upload images FIRST (before saving to database)
            try {
                // Upload main image if it's base64
                if (currentMainImageBase64 && currentMainImageBase64.startsWith('data:image')) {
                    console.log('📤 Uploading main image...');
                    const timestamp = Date.now();
                    const mainImageUrl = await uploadImageToSupabase(
                        currentMainImageBase64,
                        `product-${productDataSupabase.id}-main-${timestamp}`
                    );
                    if (mainImageUrl) {
                        productDataSupabase.image = mainImageUrl;
                        console.log('✅ Main image uploaded:', mainImageUrl);
                    } else {
                        console.warn('⚠️ Main image upload failed, continuing without image');
                    }
                }
                
                // Upload additional images if they're base64
                if (currentAdditionalImagesBase64.length > 0) {
                    console.log('📤 Uploading additional images...');
                    const uploadedImages = [];
                    for (let i = 0; i < currentAdditionalImagesBase64.length; i++) {
                        const img = currentAdditionalImagesBase64[i];
                        if (img.startsWith('data:image')) {
                            const timestamp = Date.now();
                            const imgUrl = await uploadImageToSupabase(
                                img,
                                `product-${productDataSupabase.id}-img-${i}-${timestamp}`
                            );
                            if (imgUrl) {
                                uploadedImages.push(imgUrl);
                                console.log(`✅ Additional image ${i} uploaded`);
                            }
                        } else {
                            uploadedImages.push(img); // Already a URL
                        }
                    }
                    if (uploadedImages.length > 0) {
                        productDataSupabase.images = uploadedImages;
                    }
                }
            } catch (e) {
                console.error('❌ Error uploading images:', e);
            }
            
            // STEP 2: Save to Supabase AFTER images are uploaded
            try {
                console.log('💾 Saving product to Supabase:', productDataSupabase);
                if (productId) {
                    // Update existing product
                    await supabaseAPI.updateProduct(parseInt(productId), productDataSupabase);
                    console.log('✅ Product updated in Supabase');
                } else {
                    // Save new product
                    await supabaseAPI.saveProduct(productDataSupabase);
                    console.log('✅ Product saved to Supabase');
                }
                
                // STEP 3: Update local products array AFTER Supabase save succeeds
                if (productId) {
                    const index = products.findIndex(p => p.id === parseInt(productId));
                    if (index > -1) {
                        products[index] = productDataSupabase;
                    }
                } else {
                    // Add new product to array
                    products.push(productDataSupabase);
                }
                
                const productsJSON = JSON.stringify(products);
                console.log('Products size:', productsJSON.length, 'bytes');
                
                // Don't save to localStorage - only Supabase!
                console.log('✅ Products saved to Supabase only');
                
                // Also save to IndexedDB (for large data) - optional, don't block on error
                try {
                    await saveProductsToIndexedDB(products);
                    console.log('✅ Saved to IndexedDB');
                } catch (e) {
                    console.warn('⚠️ IndexedDB save failed (optional):', e);
                }
                
                // Notify other tabs via BroadcastChannel
                if (window.productsBroadcastChannel) {
                    window.productsBroadcastChannel.postMessage({ 
                        type: 'products_updated',
                        products: products
                    });
                    console.log('📢 Notified other tabs about product update');
                }
                
                // Reset form
                document.getElementById('productForm').reset();
                mainImagePreview.style.display = 'none';
                mainImagePreviewImg.src = '';
                additionalImagesPreview.innerHTML = '';
                additionalImagesPreview.style.display = 'none';
                currentMainImageBase64 = '';
                currentAdditionalImagesBase64 = [];
                productMainImageInput.required = false;
                
                productModal.classList.remove('active');
                loadProductsTable();
                alert('Товар збережено!');
            } catch (e) {
                console.error('Failed to save product:', e);
                alert('Помилка збереження товару: ' + e.message + '\n\nСпробуйте видалити деякі товари або очистити браузер.');
            }
        });
    }
    
    // Close product modal
    const productModalOverlay = document.getElementById('productModalOverlay');
    if (productModalOverlay) {
        productModalOverlay.addEventListener('click', () => {
            productModal.classList.remove('active');
            // Reset preview
            mainImagePreview.style.display = 'none';
            mainImagePreviewImg.src = '';
            additionalImagesPreview.innerHTML = '';
            additionalImagesPreview.style.display = 'none';
            currentMainImageBase64 = '';
            currentAdditionalImagesBase64 = [];
            productMainImageInput.required = false;
        });
    }
    
    const closeProductModal = document.getElementById('closeProductModal');
    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            productModal.classList.remove('active');
            // Reset preview
            mainImagePreview.style.display = 'none';
            mainImagePreviewImg.src = '';
            additionalImagesPreview.innerHTML = '';
            additionalImagesPreview.style.display = 'none';
            currentMainImageBase64 = '';
            currentAdditionalImagesBase64 = [];
            productMainImageInput.required = true;
        });
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) {
        return;
    }
    
    try {
        // Remove from local array
        products = products.filter(p => p.id !== productId);
        
        // Save to localStorage
        try {
            localStorage.setItem('adminProducts', JSON.stringify(products));
            console.log('✅ Product deleted and saved to localStorage');
        } catch (e) {
            console.warn('localStorage full');
        }
        
        // Save to IndexedDB
        await saveProductsToIndexedDB(products);
        console.log('✅ Saved to IndexedDB');
        
        // Reload table
        loadProductsTable();
        
        // Notify other tabs
        if (window.productsBroadcastChannel) {
            window.productsBroadcastChannel.postMessage({ 
                type: 'products_updated',
                products: products
            });
            console.log('📢 Notified other tabs about product deletion');
        }
        
        alert('Товар видалено!');
    } catch (e) {
        console.error('Error deleting product:', e);
        alert('Помилка при видаленні товару!');
    }
}

// Load products table
function loadProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${(product.images || [product.image]).slice(0, 3).map(img => `<img src="${img}" alt="${product.name}" class="product-thumb" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">`).join('')}
                ${(product.images || []).length > 3 ? `<span style="align-self: center; color: var(--gray);">+${product.images.length - 3}</span>` : ''}
            </div>
        </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.priceTo && product.priceTo !== product.priceFrom ? formatPrice(product.priceFrom) + ' - ' + formatPrice(product.priceTo) : formatPrice(product.priceFrom || product.price)}</td>
            <td>
                <span style="color: ${product.inStock !== false ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                    ${product.inStock !== false ? '✓ В наявності' : '✗ Немає'}
                </span>
            </td>
            <td>
                <div class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('productModalTitle').textContent = 'Редагувати товар';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPriceFrom').value = product.priceFrom || product.price;
    document.getElementById('productPriceTo').value = product.priceTo || product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productInStock').checked = product.inStock !== false;
    
    // Show current images
    mainImagePreview.innerHTML = '';
    mainImagePreviewImg.src = '';
    mainImagePreview.style.display = 'none';
    additionalImagesPreview.innerHTML = '';
    additionalImagesPreview.style.display = 'none';
    currentMainImageBase64 = '';
    currentAdditionalImagesBase64 = [];
    
    // Show main image (first from images array or single image)
    let mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
    if (mainImage) {
        currentMainImageBase64 = mainImage;
        mainImagePreviewImg.src = mainImage;
        mainImagePreview.style.display = 'block';
    }
    
    // Show additional images (all except first)
    if (product.images && product.images.length > 1) {
        currentAdditionalImagesBase64 = product.images.slice(1);
        product.images.slice(1).forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid var(--primary);';
            additionalImagesPreview.appendChild(img);
        });
        additionalImagesPreview.style.display = 'flex';
    }
    
    // Remove required from file input when editing
    productMainImageInput.required = false;
    
    productModal.classList.add('active');
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Ви впевнені, що хочете видалити цей товар?')) return;
    
    const index = products.findIndex(p => p.id === productId);
    if (index > -1) {
        products.splice(index, 1);
        // Don't save to localStorage - only Supabase!
        
        // Notify other tabs via BroadcastChannel
        if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('settings_channel');
            bc.postMessage({ type: 'products' });
        }
        
        loadProductsTable();
        alert('Товар видалено!');
    }
}

// Settings
const saveSettingsBtn = document.getElementById('saveSettings');
if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
    // Save admin nickname
    const adminNickname = document.getElementById('adminNicknameInput').value;
    if (adminNickname) {
        localStorage.setItem('adminNickname', adminNickname);
        document.getElementById('adminNickname').textContent = adminNickname;
    }
    
    const settings = {
        storeName: document.getElementById('storeName').value,
        storePhone: document.getElementById('storePhone').value,
        heroProduct: parseInt(document.getElementById('heroProduct').value),
        heroTitle: document.getElementById('heroTitle').value,
        heroSubtitle: document.getElementById('heroSubtitle').value,
        heroBtn1: document.getElementById('heroBtn1').value,
        heroBtn2: document.getElementById('heroBtn2').value,
        heroTrust1: document.getElementById('heroTrust1').value,
        heroTrust2: document.getElementById('heroTrust2').value,
        heroTrust3: document.getElementById('heroTrust3').value,
        benefit1: document.getElementById('benefit1').value,
        benefit2: document.getElementById('benefit2').value,
        benefit3: document.getElementById('benefit3').value,
        benefit4: document.getElementById('benefit4').value,
        benefitDesc1: document.getElementById('benefitDesc1').value,
        benefitDesc2: document.getElementById('benefitDesc2').value,
        benefitDesc3: document.getElementById('benefitDesc3').value,
        benefitDesc4: document.getElementById('benefitDesc4').value,
        benefitIcon1: document.getElementById('benefitIcon1').value || 'fa-shipping-fast',
        benefitIcon2: document.getElementById('benefitIcon2').value || 'fa-fish',
        benefitIcon3: document.getElementById('benefitIcon3').value || 'fa-star',
        benefitIcon4: document.getElementById('benefitIcon4').value || 'fa-shield-alt',
        catImage1: document.getElementById('catImage1').value,
        catImage2: document.getElementById('catImage2').value,
        catImage3: document.getElementById('catImage3').value,
        footerTagline: document.getElementById('footerTagline').value,
        footerPhone: document.getElementById('footerPhone').value,
        footerEmail: document.getElementById('footerEmail').value,
        footerCopyright: document.getElementById('footerCopyright').value,
        logoImage: currentLogoBase64,
        storeEmail: document.getElementById('storeEmail').value,
        storeWhatsApp: document.getElementById('storeWhatsApp').value
    };
    
    try {
        // Remove logo if it's too large to save space
        let settingsToSave = {...settings};
        const settingsJSON = JSON.stringify(settingsToSave);
        
        // If settings are too large, remove logo image
        if (settingsJSON.length > 4000000) {
            console.warn('Settings too large, removing logo image...');
            delete settingsToSave.logoImage;
        }
        
        // Save to Supabase ONLY - no localStorage!
        await supabaseAPI.saveSettings(settingsToSave);
        console.log('✅ Settings saved to Supabase');
        
        const finalJSON = JSON.stringify(settingsToSave);
        console.log('Settings size:', finalJSON.length, 'bytes');
        
        // Notify other tabs via BroadcastChannel
        if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('settings_channel');
            bc.postMessage({ type: 'settings' });
            console.log('✅ BroadcastChannel message sent');
        } else {
            console.warn('⚠ BroadcastChannel not supported');
        }
        
        alert('Налаштування збережено!');
    } catch (e) {
        console.error('Failed to save settings:', e);
        if (e.name === 'QuotaExceededError') {
            // Try to save without logo
            try {
                const settingsNoLogo = {...settings};
                delete settingsNoLogo.logoImage;
                localStorage.setItem('storeSettings', JSON.stringify(settingsNoLogo));
                alert('Налаштування збережено (без логотипу)!\n\nlocalStorage переповнений. Видаліть деякі товари або очистіть браузер.');
            } catch (e2) {
                // Clear old products and try again
                localStorage.removeItem('adminProducts');
                localStorage.removeItem('orders');
                try {
                    localStorage.setItem('storeSettings', JSON.stringify(settings));
                    alert('localStorage очищено! Налаштування збережено.\nТовари видалені. Додайте їх заново.');
                } catch (e3) {
                    alert('Критична помилка: localStorage переповнений!\nОчистіть браузер (F12 → Console → localStorage.clear())');
                }
            }
        } else {
            alert('Помилка збереження: ' + e.message);
        }
    }
    });
}

// Fonts settings
document.getElementById('saveFonts')?.addEventListener('click', () => {
    const fontSettings = {
        mainFont: document.getElementById('mainFont').value,
        headingFont: document.getElementById('headingFont').value
    };
    localStorage.setItem('fontSettings', JSON.stringify(fontSettings));
    console.log('Font settings saved:', fontSettings);
    
    // Notify other tabs via BroadcastChannel
    if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('settings_channel');
        bc.postMessage({ type: 'fonts' });
    }
    
    alert('Шрифти збережено!');
});

// Load font settings
const savedFontSettings = JSON.parse(localStorage.getItem('fontSettings') || '{}');
if (savedFontSettings.mainFont) {
    document.getElementById('mainFont').value = savedFontSettings.mainFont;
}
if (savedFontSettings.headingFont) {
    document.getElementById('headingFont').value = savedFontSettings.headingFont;
}

// Load hero product options
function loadHeroProductOptions() {
    const heroSelect = document.getElementById('heroProduct');
    heroSelect.innerHTML = products.map(product => `
        <option value="${product.id}">${product.name} - ${product.price} ₴</option>
    `).join('');
}

// Handle category image file uploads
for (let i = 1; i <= 3; i++) {
    const fileInput = document.getElementById(`catImageFile${i}`);
    const hiddenInput = document.getElementById(`catImage${i}`);
    const preview = document.getElementById(`catPreview${i}`);
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    hiddenInput.value = dataUrl;
                    preview.style.backgroundImage = `url('${dataUrl}')`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Load settings on page load
const savedSettings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
if (savedSettings.storeName) {
    const el = document.getElementById('storeName');
    if (el) el.value = savedSettings.storeName;
}
if (savedSettings.storePhone) {
    const el = document.getElementById('storePhone');
    if (el) el.value = savedSettings.storePhone;
}
if (savedSettings.heroTitle) {
    const el = document.getElementById('heroTitle');
    if (el) el.value = savedSettings.heroTitle;
}
if (savedSettings.heroSubtitle) {
    const el = document.getElementById('heroSubtitle');
    if (el) el.value = savedSettings.heroSubtitle;
}
if (savedSettings.benefit1) {
    const el = document.getElementById('benefit1');
    if (el) el.value = savedSettings.benefit1;
}
if (savedSettings.benefit2) {
    const el = document.getElementById('benefit2');
    if (el) el.value = savedSettings.benefit2;
}
if (savedSettings.benefit3) {
    const el = document.getElementById('benefit3');
    if (el) el.value = savedSettings.benefit3;
}
if (savedSettings.benefit4) {
    const el = document.getElementById('benefit4');
    if (el) el.value = savedSettings.benefit4;
}

// Hero buttons & trust
if (savedSettings.heroBtn1) {
    const el = document.getElementById('heroBtn1');
    if (el) el.value = savedSettings.heroBtn1;
}
if (savedSettings.heroBtn2) {
    const el = document.getElementById('heroBtn2');
    if (el) el.value = savedSettings.heroBtn2;
}
if (savedSettings.heroTrust1) {
    const el = document.getElementById('heroTrust1');
    if (el) el.value = savedSettings.heroTrust1;
}
if (savedSettings.heroTrust2) {
    const el = document.getElementById('heroTrust2');
    if (el) el.value = savedSettings.heroTrust2;
}
if (savedSettings.heroTrust3) {
    const el = document.getElementById('heroTrust3');
    if (el) el.value = savedSettings.heroTrust3;
}

// Benefit descriptions
if (savedSettings.benefitDesc1) {
    const el = document.getElementById('benefitDesc1');
    if (el) el.value = savedSettings.benefitDesc1;
}
if (savedSettings.benefitDesc2) {
    const el = document.getElementById('benefitDesc2');
    if (el) el.value = savedSettings.benefitDesc2;
}
if (savedSettings.benefitDesc3) {
    const el = document.getElementById('benefitDesc3');
    if (el) el.value = savedSettings.benefitDesc3;
}
if (savedSettings.benefitDesc4) {
    const el = document.getElementById('benefitDesc4');
    if (el) el.value = savedSettings.benefitDesc4;
}

// Benefit icons - update hidden inputs and preview icons
for (let i = 1; i <= 4; i++) {
    if (savedSettings[`benefitIcon${i}`]) {
        const iconInput = document.getElementById(`benefitIcon${i}`);
        const iconPreview = document.getElementById(`iconPreview${i}`);
        if (iconInput) iconInput.value = savedSettings[`benefitIcon${i}`];
        if (iconPreview) iconPreview.innerHTML = `<i class="fas ${savedSettings[`benefitIcon${i}`]}"></i>`;
    }
}

// Category images - update hidden inputs and previews
for (let i = 1; i <= 3; i++) {
    if (savedSettings[`catImage${i}`]) {
        const hiddenInput = document.getElementById(`catImage${i}`);
        const preview = document.getElementById(`catPreview${i}`);
        if (hiddenInput) hiddenInput.value = savedSettings[`catImage${i}`];
        if (preview) preview.style.backgroundImage = `url('${savedSettings[`catImage${i}`]}')`;
    }
}

// Footer settings - use !== undefined to allow empty strings
if (savedSettings.footerTagline !== undefined) {
    document.getElementById('footerTagline').value = savedSettings.footerTagline;
}
if (savedSettings.footerPhone !== undefined) {
    document.getElementById('footerPhone').value = savedSettings.footerPhone;
}
if (savedSettings.footerEmail !== undefined) {
    document.getElementById('footerEmail').value = savedSettings.footerEmail;
}
if (savedSettings.footerCopyright !== undefined) {
    document.getElementById('footerCopyright').value = savedSettings.footerCopyright;
}

// Load hero product options first, then set value
loadHeroProductOptions();
if (savedSettings.heroProduct) {
    document.getElementById('heroProduct').value = savedSettings.heroProduct;
}

// Helper functions
function formatPrice(price) {
    return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Dynamic contacts management
const contactIcons = ['fa-phone', 'fa-envelope', 'fa-map-marker-alt', 'fa-clock', 'fa-globe', 'fa-fax'];
let dynamicContactCount = 0;

function createContactField(value = '', icon = 'fa-phone') {
    dynamicContactCount++;
    const div = document.createElement('div');
    div.className = 'dynamic-field';
    div.dataset.index = dynamicContactCount;
    
    const iconOptions = contactIcons.map(ic => 
        `<option value="${ic}" ${ic === icon ? 'selected' : ''}>${ic.replace('fa-', '')}</option>`
    ).join('');
    
    div.innerHTML = `
        <select class="field-icon-select">
            ${iconOptions}
        </select>
        <input type="text" class="dynamic-contact-input" placeholder="Текст контакту" value="${value}">
        <button type="button" class="remove-field" onclick="removeContactField(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return div;
}

function removeContactField(btn) {
    const field = btn.closest('.dynamic-field');
    field.remove();
}

// Add contact button handler
document.getElementById('addContactBtn')?.addEventListener('click', () => {
    const container = document.getElementById('dynamicContacts');
    container.appendChild(createContactField());
});

// Load saved dynamic contacts
if (savedSettings.dynamicContacts && Array.isArray(savedSettings.dynamicContacts)) {
    const container = document.getElementById('dynamicContacts');
    savedSettings.dynamicContacts.forEach(contact => {
        container.appendChild(createContactField(contact.value, contact.icon));
    });
}

// Available FontAwesome icons for benefits
const availableIcons = [
    'fa-shipping-fast', 'fa-truck', 'fa-box', 'fa-gift', 'fa-home',
    'fa-fish', 'fa-utensils', 'fa-drumstick-bite', 'fa-bread-slice', 'fa-cheese',
    'fa-star', 'fa-medal', 'fa-trophy', 'fa-crown', 'fa-gem',
    'fa-shield-alt', 'fa-lock', 'fa-check-circle', 'fa-certificate', 'fa-award',
    'fa-thumbs-up', 'fa-heart', 'fa-smile', 'fa-handshake', 'fa-user-check',
    'fa-clock', 'fa-calendar-check', 'fa-sync', 'fa-redo', 'fa-undo',
    'fa-phone', 'fa-headset', 'fa-comments', 'fa-envelope', 'fa-bell',
    'fa-credit-card', 'fa-wallet', 'fa-money-bill', 'fa-coins', 'fa-piggy-bank',
    'fa-leaf', 'fa-seedling', 'fa-tree', 'fa-sun', 'fa-cloud',
    'fa-fire', 'fa-burn', 'fa-temperature-high', 'fa-tint', 'fa-water'
];

// Render icon grids for each benefit
function renderIconGrids() {
    for (let i = 1; i <= 4; i++) {
        const grid = document.getElementById(`iconGrid${i}`);
        const hiddenInput = document.getElementById(`benefitIcon${i}`);
        const preview = document.getElementById(`iconPreview${i}`);
        
        if (!grid) continue;
        
        grid.innerHTML = availableIcons.map(icon => `
            <div class="icon-btn ${hiddenInput.value === icon ? 'active' : ''}" data-icon="${icon}" data-index="${i}">
                <i class="fas ${icon}"></i>
            </div>
        `).join('');
        
        // Add click handlers
        grid.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const icon = btn.dataset.icon;
                const index = btn.dataset.index;
                
                // Update hidden input
                document.getElementById(`benefitIcon${index}`).value = icon;
                // Update preview
                const previewEl = document.getElementById(`iconPreview${index}`);
                if (previewEl) previewEl.innerHTML = `<i class="fas ${icon}"></i>`;
                
                // Update visual selection
                grid.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
}

// Render icon grids on page load
renderIconGrids();

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        orderModal.classList.remove('active');
        productModal.classList.remove('active');
    }
});
