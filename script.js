// Product database (in real system, this would come from a backend)
const productDatabase = {
    '4901234567890': { 
        name: 'Milk', 
        price: 3.99,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200',
        stock: 20,
    },
    '5901234567890': { 
        name: 'Bread', 
        price: 2.49,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
        stock: 30,
        boxSize: 12
    },
    '6901234567890': { 
        name: 'Eggs', 
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200',
        stock: 50,
        boxSize: 12
    },
    '7901234567890': { 
        name: 'Cheese', 
        price: 5.99,
        image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200',
        stock: 25,
        boxSize: 8
    }
};

let cart = [];
let isScanning = false;

function updateDateTime() {
    const now = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', options);
}

// Barcode scanner initialization
function initializeScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#interactive"),
            constraints: {
                facingMode: "environment"
            },
        },
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader"]
        }
    }, function(err) {
        if (err) {
            console.error(err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        const barcode = result.codeResult.code;
        handleBarcode(barcode);
    });
}

function toggleCamera() {
    const viewport = document.querySelector('#interactive');
    if (!isScanning) {
        viewport.style.display = 'block';
        initializeScanner();
    } else {
        viewport.style.display = 'none';
        Quagga.stop();
    }
    isScanning = !isScanning;
}

// Handle barcode input (both scanned and manually entered)
document.getElementById('barcode-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleBarcode(this.value);
        this.value = '';
    }
});

function handleBarcode(barcode) {
    const product = productDatabase[barcode];
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }

    // If product has box option (boxSize > 1) and single items available, show selection modal
    if (product.boxSize > 1 && product.stock > 0) {
        showSelectionModal(barcode, product);
    } else {
        // If no box option or no stock, add as single item
        addToCart({ ...product, isBox: false });
        showNotification(`Added ${product.name} to cart`);
    }
}

function showSelectionModal(barcode, product) {
    const modal = document.createElement('div');
    modal.className = 'selection-modal';
    modal.innerHTML = `
        <div class="selection-modal-content">
            <div class="selection-modal-header">
                <h3>${product.name}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="selection-modal-body">
                <div class="product-preview">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="selection-options">
                    <div class="selection-option single-option">
                        <h4>Single Item</h4>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <div class="quantity-control">
                            <label>Quantity:</label>
                            <div class="quantity-input-group">
                                <button class="qty-btn minus" onclick="updateQuantity(this, -1)">-</button>
                                <input type="number" min="1" max="${product.stock}" value="1" class="quantity-input">
                                <button class="qty-btn plus" onclick="updateQuantity(this, 1)">+</button>
                            </div>
                        </div>
                        <button class="add-btn" onclick="addSingleItems('${barcode}', this.parentElement.querySelector('.quantity-input').value)">
                            Add to Cart
                        </button>
                    </div>
                    ${product.boxSize ? `
                    <div class="selection-option box-option">
                        <h4>Box (${product.boxSize} units)</h4>
                        <p class="price">$${(product.price * product.boxSize * 0.9).toFixed(2)}</p>
                        <p class="discount">10% off!</p>
                        <div class="quantity-control">
                            <label>Quantity:</label>
                            <div class="quantity-input-group">
                                <button class="qty-btn minus" onclick="updateQuantity(this, -1)">-</button>
                                <input type="number" min="1" max="${Math.floor(product.stock / product.boxSize)}" value="1" class="quantity-input">
                                <button class="qty-btn plus" onclick="updateQuantity(this, 1)">+</button>
                            </div>
                        </div>
                        <button class="add-btn" onclick="addBoxItems('${barcode}', this.parentElement.querySelector('.quantity-input').value)">
                            Add Boxes
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function updateQuantity(button, change) {
    const input = button.parentElement.querySelector('.quantity-input');
    let newValue = parseInt(input.value) + change;
    newValue = Math.max(parseInt(input.min), Math.min(newValue, parseInt(input.max)));
    input.value = newValue;
}

function addSingleItems(barcode, quantity) {
    const product = productDatabase[barcode];
    quantity = parseInt(quantity);
    
    if (product.stock < quantity) {
        showNotification('Not enough stock available', 'error');
        return;
    }

    cart.push({
        ...product,
        isBox: false,
        quantity: quantity
    });

    // Update stock
    product.stock -= quantity;

    // Update displays
    updateCartDisplay();
    showNotification(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} of ${product.name} to cart`);

    // Close the selection modal
    const modal = document.querySelector('.selection-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function addBoxItems(barcode, quantity) {
    const product = productDatabase[barcode];
    quantity = parseInt(quantity);
    
    if (!product.boxSize || product.stock < (product.boxSize * quantity)) {
        showNotification('Not enough stock available', 'error');
        return;
    }

    cart.push({
        ...product,
        isBox: true,
        quantity: quantity,
        price: product.price * product.boxSize * 0.9 // 10% discount for box
    });

    // Update stock
    product.stock -= (product.boxSize * quantity);

    // Update displays
    updateCartDisplay();
    showNotification(`Added ${quantity} ${quantity > 1 ? 'boxes' : 'box'} of ${product.name} to cart`);

    // Close the selection modal
    const modal = document.querySelector('.selection-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

function showProductList() {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-header">
                <h2>Product List</h2>
                <div class="search-box">
                    <input type="text" id="productSearch" placeholder="Search by name or barcode...">
                    <i class="fas fa-search"></i>
                </div>
                <button class="close-btn">&times;</button>
            </div>
            <div id="searchResults" class="search-results"></div>
            <div class="product-grid" id="productGrid"></div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = () => {
        document.body.removeChild(modal);
    };

    // Search functionality with debounce
    const searchInput = modal.querySelector('#productSearch');
    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = e.target.value.trim().toLowerCase();
            displayFilteredProducts(searchTerm);
        }, 300);
    });

    // Initial display of all products
    displayFilteredProducts('');
}

function displayFilteredProducts(searchTerm) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    Object.entries(productDatabase).forEach(([barcode, product]) => {
        if (searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) || 
            barcode.toLowerCase().includes(searchTerm)) {
            const productCard = createProductCard(barcode, product);
            productGrid.appendChild(productCard);
        }
    });

    // Show "no results" message if no products match
    if (productGrid.children.length === 0) {
        productGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No products found matching "${searchTerm}"</p>
            </div>
        `;
    }
}

function createProductCard(barcode, product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="stock">In Stock: ${product.stock}</p>
            ${product.boxSize ? `<p class="box-size">Box Size: ${product.boxSize} units</p>` : ''}
        </div>
    `;

    // Add click handler to show selection modal
    card.addEventListener('click', () => {
        if (product.stock > 0) {
            showSelectionModal(barcode, product);
        } else {
            showNotification('Out of stock', 'error');
        }
    });

    return card;
}

function addToCart(product) {
    cart.push(product);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    const groupedCart = cart.reduce((acc, item) => {
        const key = `${item.name}-${item.isBox ? 'box' : 'single'}`;
        if (!acc[key]) {
            acc[key] = { ...item, quantity: 0 };
        }
        acc[key].quantity++;
        return acc;
    }, {});
    
    Object.values(groupedCart).forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-type">${item.isBox ? `Box of ${item.boxSize}` : 'Single'}</span>
                <span class="cart-item-quantity">Qty: ${item.quantity}</span>
                <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <button onclick="removeItemGroup('${item.name}', ${item.isBox})" class="remove-btn">×</button>
        `;
        cartItems.appendChild(itemElement);
    });

    // Update total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;

    // Enable/disable checkout button based on cart status
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

function removeItemGroup(name, isBox) {
    cart = cart.filter(item => !(item.name === name && item.isBox === isBox));
    updateCartDisplay();
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    document.getElementById('items-count').textContent = cart.length;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    document.getElementById('last-scanned-info').textContent = 'No item scanned';
    document.getElementById('cash-received').value = '';
    document.getElementById('change-amount').textContent = '';
}

function processPayment() {
    if (cart.length === 0) {
        alert('Please add items to cart first');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0) * 1.1;
    const paymentMethod = document.getElementById('payment-method').value;
    const cashReceived = parseFloat(document.getElementById('cash-received').value) || 0;

    if (paymentMethod === 'cash') {
        if (cashReceived < total) {
            alert('Insufficient payment amount');
            return;
        }
        const change = cashReceived - total;
        document.getElementById('change-amount').textContent = `Change: $${change.toFixed(2)}`;
    }

    // In a real system, here we would:
    // 1. Process the payment through a payment gateway
    // 2. Print a receipt
    // 3. Update inventory
    // 4. Save transaction to database

    alert(`Payment processed successfully!\nTotal: $${total.toFixed(2)}`);
    clearCart();
}

function toggleCashInput() {
    const paymentMethod = document.getElementById('payment-method').value;
    const cashPayment = document.getElementById('cash-payment');
    cashPayment.style.display = paymentMethod === 'cash' ? 'block' : 'none';
    if (paymentMethod !== 'cash') {
        document.getElementById('cash-received').value = '';
        document.getElementById('change-amount').textContent = '$0.00';
    }
}

function updateChange() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const cashReceived = parseFloat(document.getElementById('cash-received').value) || 0;
    const change = cashReceived - total;
    document.getElementById('change-amount').textContent = change >= 0 ? `$${change.toFixed(2)}` : '$0.00';
    return { cashReceived, change };
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Cart is empty', 'error');
        return;
    }

    const paymentMethod = document.getElementById('payment-method').value;
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    if (paymentMethod === 'cash') {
        const { cashReceived, change } = updateChange();
        if (cashReceived < total) {
            showNotification('Insufficient cash amount', 'error');
            return;
        }
    }

    // Group cart items for storage
    const groupedItems = cart.reduce((acc, item) => {
        const key = `${item.name}-${item.isBox}`;
        if (!acc[key]) {
            acc[key] = {
                ...item,
                quantity: 0
            };
        }
        acc[key].quantity++;
        return acc;
    }, {});

    // Create order details
    const orderDetails = {
        orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toISOString(),
        items: Object.values(groupedItems),
        total: total,
        paymentMethod: paymentMethod
    };

    // Add cash payment details if applicable
    if (paymentMethod === 'cash') {
        const { cashReceived, change } = updateChange();
        orderDetails.cashReceived = cashReceived;
        orderDetails.change = change;
    }

    // Save to localStorage
    localStorage.setItem('lastOrder', JSON.stringify(orderDetails));

    // Clear cart
    cart = [];
    updateCartDisplay();

    // Show success notification and redirect to success page
    showNotification('Payment processed successfully!');
    setTimeout(() => {
        window.location.href = 'success.html';
    }, 1000);
}

// Initialize payment method display
document.addEventListener('DOMContentLoaded', function() {
    toggleCashInput();
    
    // Add event listener for cash received input
    const cashReceivedInput = document.getElementById('cash-received');
    if (cashReceivedInput) {
        cashReceivedInput.addEventListener('input', updateChange);
    }
});

function showManualEntry() {
    const barcode = prompt('Enter product barcode:');
    if (barcode) {
        handleBarcode(barcode);
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <div class="notification-content">${message}</div>
    `;
    document.body.appendChild(notification);
    
    // Show the notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide and remove the notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Initialize
updateDateTime();
setInterval(updateDateTime, 60000);
