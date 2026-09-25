// Mock Enterprise Inventory Data
const products = [
    { id: 1, name: "Wireless Earbuds", category: "electronics", price: 79, tag: "🎧" },
    { id: 2, name: "Smart Fitness Watch", category: "electronics", price: 149, tag: "⌚" },
    { id: 3, name: "Mechanical Keyboard", category: "electronics", price: 99, tag: "⌨️" },
    { id: 4, name: "Premium Cotton Hoodie", category: "apparel", price: 59, tag: "🧥" },
    { id: 5, name: "Running Shoes", category: "apparel", price: 120, tag: "👟" },
    { id: 6, name: "Leather Minimalist Wallet", category: "accessories", price: 35, tag: "👛" },
    { id: 7, name: "Ergonomic Backpack", category: "accessories", price: 85, tag: "🎒" },
    { id: 8, name: "Ultra-Wide Monitor", category: "electronics", price: 199, tag: "🖥️" }
];

// Tracking Cart Total State
let cartItemCount = 0;

// DOM Hook Selectors
const productsGrid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const priceRange = document.getElementById('price-range');
const priceValue = document.getElementById('price-value');
const cartCountDisplay = document.getElementById('cart-count');

// Setup Interactive UI Change Listeners
searchInput.addEventListener('input', filterAndRenderProducts);
categorySelect.addEventListener('change', filterAndRenderProducts);
priceRange.addEventListener('input', (e) => {
    priceValue.textContent = e.target.value;
    filterAndRenderProducts();
});

// Render all inventory elements initially
filterAndRenderProducts();

// Core Filtering Logic Engine
function filterAndRenderProducts() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    const maxPrice = parseFloat(priceRange.value);

    // Apply high-order JS array logic chains
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesPrice = product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    renderGrid(filteredProducts);
}

// Render dynamic templates onto document DOM structures
function renderGrid(productsList) {
    productsGrid.innerHTML = '';

    if (productsList.length === 0) {
        productsGrid.innerHTML = `<div class="no-results">No items match your selected filter matrices.</div>`;
        return;
    }

    productsList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <div>
                <div class="product-image-placeholder">${product.tag} Display Visual</div>
                <div class="product-category">${product.category}</div>
                <h4>${escapeHTML(product.name)}</h4>
            </div>
            <div>
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart-btn" onclick="updateCartCounter()">Add to Pipeline</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Simple state incrementation logic wrapper
function updateCartCounter() {
    cartItemCount++;
    cartCountDisplay.textContent = cartItemCount;
}

// Prevention tool against cross-site query logic breaking text blocks
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
