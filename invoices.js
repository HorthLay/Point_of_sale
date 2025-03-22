// Pagination state
let currentPage = 1;
const itemsPerPage = 10;
let filteredInvoices = [];

// Get invoices from localStorage
function getInvoices() {
    return JSON.parse(localStorage.getItem('invoices') || '[]');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadInvoices();
});

// Load and display invoices
function loadInvoices() {
    const invoices = getInvoices();
    applyFilters(); // This will set filteredInvoices and update display
}

// Search invoices
function searchInvoices() {
    const searchTerm = document.getElementById('invoice-search').value.toLowerCase();
    applyFilters(searchTerm);
}

// Apply filters to invoices
function applyFilters(searchTerm = '') {
    const statusFilter = document.getElementById('status-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    const invoices = getInvoices();
    
    filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = searchTerm ? 
            (invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
             new Date(invoice.date).toLocaleDateString().includes(searchTerm)) : true;
        
        const matchesStatus = statusFilter === 'all' ? true : 
            invoice.status.toLowerCase() === statusFilter;
        
        const invoiceDate = new Date(invoice.date);
        const matchesDateFrom = dateFrom ? invoiceDate >= new Date(dateFrom) : true;
        const matchesDateTo = dateTo ? invoiceDate <= new Date(dateTo) : true;
        
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });

    // Sort by date, newest first
    filteredInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    currentPage = 1; // Reset to first page when filters change
    updateDisplay();
}

// Update the display with current page of filtered invoices
function updateDisplay() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageInvoices = filteredInvoices.slice(startIndex, endIndex);
    
    const tableBody = document.getElementById('invoice-table-body');
    tableBody.innerHTML = pageInvoices.map(invoice => `
        <tr>
            <td>${invoice.invoiceNumber}</td>
            <td>${new Date(invoice.date).toLocaleDateString()}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>
                <span class="status-badge ${invoice.status.toLowerCase()}">
                    ${invoice.status}
                </span>
            </td>
            <td>
                <button onclick="viewInvoice('${invoice.invoiceNumber}')" class="action-btn">
                    <i class="fas fa-eye"></i>
                </button>
                ${invoice.status !== 'RETURNED' ? `
                    <button onclick="window.location.href='return.html?invoice=${invoice.invoiceNumber}'" class="action-btn">
                        <i class="fas fa-undo"></i>
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('');

    // Update pagination info
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
}

// Navigation functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateDisplay();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateDisplay();
    }
}

// View invoice details
function viewInvoice(invoiceNumber) {
    const invoices = getInvoices();
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    
    if (!invoice) {
        alert('Invoice not found!');
        return;
    }

    // Create modal for invoice details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Invoice #${invoice.invoiceNumber}</h2>
                <button onclick="this.closest('.modal').remove()" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="invoice-details">
                    <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${invoice.status}</p>
                    <p><strong>Total:</strong> $${invoice.total.toFixed(2)}</p>
                </div>
                <div class="invoice-items">
                    <h3>Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}${item.isBox ? ' (Box)' : ''}</td>
                                    <td>$${item.price.toFixed(2)}</td>
                                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${invoice.return ? `
                    <div class="return-details">
                        <h3>Return Information</h3>
                        <p><strong>Return Date:</strong> ${new Date(invoice.return.date).toLocaleDateString()}</p>
                        <p><strong>Reason:</strong> ${invoice.return.reason}</p>
                        ${invoice.return.comments ? `<p><strong>Comments:</strong> ${invoice.return.comments}</p>` : ''}
                        <h4>Returned Items</h4>
                        <ul>
                            ${invoice.return.items.map(item => `
                                <li>${item.name} - ${item.returnedQuantity} units</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button onclick="printInvoice('${invoice.invoiceNumber}')" class="print-btn">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Print invoice
function printInvoice(invoiceNumber) {
    const invoices = getInvoices();
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    
    if (!invoice) {
        alert('Invoice not found!');
        return;
    }

    // Create printable content
    const printContent = `
        <div class="print-invoice">
            <h1>Invoice #${invoice.invoiceNumber}</h1>
            <div class="invoice-info">
                <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${invoice.status}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}${item.isBox ? ' (Box)' : ''}</td>
                            <td>$${item.price.toFixed(2)}</td>
                            <td>$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>Total</strong></td>
                        <td><strong>$${invoice.total.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice #${invoice.invoiceNumber}</title>
                <link rel="stylesheet" href="style.css">
                <style>
                    @media print {
                        .print-invoice { padding: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; border: 1px solid #ddd; }
                        th { background-color: #f5f5f5; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
}
