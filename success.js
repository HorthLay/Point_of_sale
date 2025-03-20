// Get order details from localStorage
const orderDetails = JSON.parse(localStorage.getItem('lastOrder')) || {};

// Generate a random order ID if not present
if (!orderDetails.orderId) {
    orderDetails.orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Format date
const orderDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

// Populate order details
document.getElementById('orderId').textContent = orderDetails.orderId;
document.getElementById('orderDate').textContent = orderDate;
document.getElementById('orderTotal').textContent = `$${orderDetails.total?.toFixed(2) || '0.00'}`;
document.getElementById('paymentMethod').textContent = orderDetails.paymentMethod.charAt(0).toUpperCase() + orderDetails.paymentMethod.slice(1);

// Handle cash payment details
const cashDetails = document.getElementById('cashDetails');
if (orderDetails.paymentMethod === 'cash') {
    document.getElementById('cashReceived').textContent = `$${orderDetails.cashReceived?.toFixed(2) || '0.00'}`;
    document.getElementById('changeAmount').textContent = `$${orderDetails.change?.toFixed(2) || '0.00'}`;
    cashDetails.style.display = 'block';
} else {
    cashDetails.style.display = 'none';
}

// Generate receipt content
function generateReceiptHTML() {
    const items = orderDetails.items || [];
    let html = `
        <h3>Receipt</h3>
        <div class="receipt-header">
            <p>${orderDate}</p>
            <p>Order ID: ${orderDetails.orderId}</p>
        </div>
        <div class="receipt-items">
    `;

    items.forEach(item => {
        html += `
            <div class="receipt-item">
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-type">${item.isBox ? `Box of ${item.boxSize}` : 'Single'}</span>
                </div>
                <div class="item-price">
                    <span class="quantity">x${item.quantity}</span>
                    <span class="price">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        `;
    });

    html += `
        </div>
        <div class="receipt-total">
            <div class="total-line">
                <span>Total:</span>
                <span>$${orderDetails.total?.toFixed(2) || '0.00'}</span>
            </div>
    `;

    if (orderDetails.paymentMethod === 'cash') {
        html += `
            <div class="total-line">
                <span>Cash Received:</span>
                <span>$${orderDetails.cashReceived?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="total-line">
                <span>Change:</span>
                <span>$${orderDetails.change?.toFixed(2) || '0.00'}</span>
            </div>
        `;
    }

    html += `
        </div>
        <div class="receipt-footer">
            <p>Payment Method: ${orderDetails.paymentMethod.charAt(0).toUpperCase() + orderDetails.paymentMethod.slice(1)}</p>
            <p>Thank you for your purchase!</p>
        </div>
    `;

    return html;
}

// Populate receipt preview
document.getElementById('receiptPreview').innerHTML = generateReceiptHTML();

// Print receipt
function printReceipt() {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        max-width: 400px;
                        margin: 0 auto;
                    }
                    .receipt-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .receipt-item {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                    }
                    .receipt-total {
                        border-top: 2px solid #000;
                        margin-top: 20px;
                        padding-top: 10px;
                        font-weight: bold;
                        display: flex;
                        justify-content: space-between;
                    }
                    .item-type {
                        color: #666;
                        font-size: 0.9em;
                    }
                    .quantity {
                        color: #666;
                        margin-right: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="receipt-header">
                    <h2>Receipt</h2>
                    <p>Order ID: ${orderDetails.orderId}</p>
                    <p>${orderDate}</p>
                </div>
                ${document.getElementById('receiptPreview').innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Start new order
function startNewOrder() {
    // Clear the last order from localStorage
    localStorage.removeItem('lastOrder');
    // Redirect to the main POS page
    window.location.href = 'index.html';
}
