// ==========================================================================
// EMS - E-Millenial Store Application Logic
// ==========================================================================

// 1. Products Database
const products = [
    { id: 1, name: 'SAMSUNG TV', price: 4500, img: 'images/product1.png' },
    { id: 2, name: 'PIXEL 4a', price: 1800, img: 'images/product2.png' },
    { id: 3, name: 'PS 5', price: 6200, img: 'images/product3.png' },
    { id: 4, name: 'MACBOOK AIR', price: 9500, img: 'images/product4.png' },
    { id: 5, name: 'APPLE WATCH', price: 2200, img: 'images/product5.png' },
    { id: 6, name: 'AIR PODS', price: 1200, img: 'images/product6.png' }
];

// 2. State Management
let cart = []; // Array of { id, quantity }
let customerInfo = { name: '', email: '', phone: '' };

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartItemCountBadge = document.getElementById('cart-item-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPriceEl = document.getElementById('cart-total-price');

const cartModal = document.getElementById('cart-modal');
const cartModalOverlay = document.getElementById('cart-modal-overlay');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const cartCloseBtn = document.getElementById('cart-close-btn');
const continueShoppingBtn = document.getElementById('continue-shopping-btn');
const checkoutSubmitBtn = document.getElementById('checkout-submit-btn');

const checkoutUserForm = document.getElementById('checkout-user-form');
const nameInput = document.getElementById('customer-name');
const emailInput = document.getElementById('customer-email');
const phoneInput = document.getElementById('customer-phone');

const summaryModalOverlay = document.getElementById('summary-modal-overlay');
const summaryGreetTitle = document.getElementById('summary-greet-title');
const summaryTableBody = document.getElementById('summary-table-body');
const summaryConfirmBtn = document.getElementById('summary-confirm-btn');

const hamburgerMenuBtn = document.getElementById('hamburger-menu-btn');
const navMenu = document.getElementById('nav-menu');

// ==========================================================================
// 3. UI Interactions & Event Listeners
// ==========================================================================

// Toggle Mobile Navigation Menu
hamburgerMenuBtn.addEventListener('click', () => {
    hamburgerMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close Mobile Nav Menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburgerMenuBtn.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Update active class
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

// Toggle Shopping Cart Sidebar Modal
function toggleCartModal() {
    const isVisible = cartModal.classList.contains('active');
    if (isVisible) {
        cartModal.classList.remove('active');
        cartModalOverlay.classList.remove('active');
        cartModal.setAttribute('aria-hidden', 'true');
    } else {
        cartModal.classList.add('active');
        cartModalOverlay.classList.add('active');
        cartModal.setAttribute('aria-hidden', 'false');
    }
}

cartToggleBtn.addEventListener('click', toggleCartModal);
cartCloseBtn.addEventListener('click', toggleCartModal);
cartModalOverlay.addEventListener('click', toggleCartModal);
continueShoppingBtn.addEventListener('click', toggleCartModal);

// Helper to Format Currency as Ghana Cedis
function formatCedi(amount) {
    return 'GH₵ ' + amount.toLocaleString('en-US');
}

// ==========================================================================
// 4. Product Gallery Rendering & Management
// ==========================================================================

function renderProducts() {
    productsContainer.innerHTML = '';
    products.forEach(product => {
        const inCart = cart.some(item => item.id === product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formatCedi(product.price)}</p>
                <button class="btn btn-shop ${inCart ? 'btn-remove-cart' : 'btn-add-cart'}" 
                        onclick="handleProductAction(${product.id}, this)">
                    ${inCart ? 'Remove from Cart' : 'Add to Cart'}
                </button>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

// Handle Add/Remove Toggle on Landing Page Product Card
window.handleProductAction = function(productId, buttonEl) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        // Remove from cart
        cart.splice(itemIndex, 1);
        buttonEl.textContent = 'Add to Cart';
        buttonEl.classList.remove('btn-remove-cart');
        buttonEl.classList.add('btn-add-cart');
    } else {
        // Add to cart
        cart.push({ id: productId, quantity: 1 });
        buttonEl.textContent = 'Remove from Cart';
        buttonEl.classList.remove('btn-add-cart');
        buttonEl.classList.add('btn-remove-cart');
    }
    updateCartUI();
};

// ==========================================================================
// 5. Cart Logic & Computation
// ==========================================================================

function updateCartUI() {
    // 1. Update Cart Badge Count (unique items, not total quantity)
    cartItemCountBadge.textContent = cart.length;
    
    // 2. Render Cart Items inside Modal
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="empty-cart-msg" style="text-align: center; color: #888899; padding: 2rem 0;">Your cart is empty.</p>`;
        cartTotalPriceEl.textContent = formatCedi(0);
        renderProducts(); // Refresh gallery buttons state
        return;
    }
    
    let totalSum = 0;
    
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (!product) return;
        
        totalSum += (product.price * cartItem.quantity);
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <div class="cart-item-img">
                <img src="${product.img}" alt="${product.name}">
            </div>
            <div class="cart-item-info">
                <h4>${product.name}</h4>
                <p class="item-price">${formatCedi(product.price)}</p>
            </div>
            <div class="cart-item-actions">
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateItemQuantity(${product.id}, -1)">-</button>
                    <span class="qty-val">${cartItem.quantity}</span>
                    <button class="qty-btn" onclick="updateItemQuantity(${product.id}, 1)">+</button>
                </div>
                <span class="item-remove-btn" onclick="removeCartItem(${product.id})">Remove</span>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });
    
    // Update total amount display
    cartTotalPriceEl.textContent = formatCedi(totalSum);
    
    // Re-render gallery buttons to keep sync
    renderProducts();
}

// Update item quantity (cannot drop below 1)
window.updateItemQuantity = function(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) {
            item.quantity = 1;
        }
        updateCartUI();
    }
};

// Remove item from cart modal
window.removeCartItem = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
};

// ==========================================================================
// 6. User Form Validation (Real-time Blur & Input Listeners)
// ==========================================================================

function validateName() {
    const value = nameInput.value.trim();
    const parent = nameInput.parentElement;
    if (value === '') {
        parent.classList.remove('valid');
        parent.classList.add('invalid');
        return false;
    } else {
        parent.classList.remove('invalid');
        parent.classList.add('valid');
        return true;
    }
}

function validateEmail() {
    const value = emailInput.value.trim();
    const parent = emailInput.parentElement;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value === '' || !emailRegex.test(value)) {
        parent.classList.remove('valid');
        parent.classList.add('invalid');
        return false;
    } else {
        parent.classList.remove('invalid');
        parent.classList.add('valid');
        return true;
    }
}

function validatePhone() {
    const value = phoneInput.value.trim();
    const parent = phoneInput.parentElement;
    // Checks if phone number is 10 or 11 digits (supports Ghana & Nigeria formats)
    const phoneRegex = /^\d{10,11}$/;
    if (value === '' || !phoneRegex.test(value)) {
        parent.classList.remove('valid');
        parent.classList.add('invalid');
        return false;
    } else {
        parent.classList.remove('invalid');
        parent.classList.add('valid');
        return true;
    }
}

// Bind Validation Listeners
nameInput.addEventListener('blur', validateName);
nameInput.addEventListener('input', validateName);

emailInput.addEventListener('blur', validateEmail);
emailInput.addEventListener('input', validateEmail);

phoneInput.addEventListener('blur', validatePhone);
phoneInput.addEventListener('input', validatePhone);

// Validate Entire Form on Checkout Click
function validateForm() {
    const nameOk = validateName();
    const emailOk = validateEmail();
    const phoneOk = validatePhone();
    return nameOk && emailOk && phoneOk;
}

// ==========================================================================
// 7. Paystack Payment Integration (Test Mode)
// ==========================================================================

checkoutSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 1. Verify Cart is not Empty
    if (cart.length === 0) {
        alert('Your shopping cart is empty. Please add items to checkout.');
        return;
    }
    
    // 2. Perform Form Validations
    if (!validateForm()) {
        alert('Please fill out the form fields with valid information before proceeding.');
        return;
    }
    
    // 3. Compute Total Amount in Pesewas
    let totalSum = 0;
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            totalSum += (product.price * item.quantity);
        }
    });
    
    const amountInPesewas = totalSum * 100;
    
    // Save customer details info
    customerInfo.name = nameInput.value.trim();
    customerInfo.email = emailInput.value.trim();
    customerInfo.phone = phoneInput.value.trim();
    
    // 4. Initialize Paystack Pop-up Modal (using Test Public Key)
    let handler = PaystackPop.setup({
        key: 'pk_test_2cb74bdac4801c9b82a299316291e705a45ea10a', // Test Public Key
        email: customerInfo.email,
        amount: amountInPesewas,
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: customerInfo.name
                },
                {
                    display_name: "Phone Number",
                    variable_name: "phone_number",
                    value: customerInfo.phone
                }
            ]
        },
        callback: function(response) {
            // Payment success callback
            closeCartModalOnSuccess();
            showSummaryModal();
        },
        onClose: function() {
            alert('Checkout payment process cancelled.');
        }
    });
    
    handler.openIframe();
});

// ==========================================================================
// 8. Order Success & Summary Modal
// ==========================================================================

function closeCartModalOnSuccess() {
    cartModal.classList.remove('active');
    cartModalOverlay.classList.remove('active');
    cartModal.setAttribute('aria-hidden', 'true');
}

function showSummaryModal() {
    // 1. Set personalized thank-you greeting
    summaryGreetTitle.textContent = `Thank You, ${customerInfo.name}!`;
    
    // 2. Populate Order Summary Table
    summaryTableBody.innerHTML = '';
    cart.forEach((cartItem, index) => {
        const product = products.find(p => p.id === cartItem.id);
        if (!product) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${cartItem.quantity}</td>
        `;
        summaryTableBody.appendChild(row);
    });
    
    // 3. Clear cart variables in state
    cart = [];
    
    // 4. Open success summary popup
    summaryModalOverlay.classList.add('active');
}

// Confirmation Button reload page to clear all states
summaryConfirmBtn.addEventListener('click', () => {
    summaryModalOverlay.classList.remove('active');
    // Reloads/refreshes page to clean state as required
    window.location.reload();
});

// Initialize Gallery & UI Elements on load
window.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});
