// Get invoices from localStorage
function getInvoices() {
    return JSON.parse(localStorage.getItem('invoices') || '[]');
}

// Search for an invoice by number
function searchInvoice() {
    const invoiceNumber = document.getElementById('invoice-number').value;
    if (!invoiceNumber) {
        alert('Please enter an invoice number');
        return;
    }

    const invoices = getInvoices();
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    
    const invoiceDetails = document.getElementById('invoice-details');
    
    if (!invoice) {
        alert('Invoice not found!');
        invoiceDetails.classList.add('hidden');
        return;
    }

    // Don't allow returns for already returned invoices
    if (invoice.status === 'RETURNED') {
        alert('This invoice has already been returned!');
        invoiceDetails.classList.add('hidden');
        return;
    }

    // Display invoice info
    document.getElementById('invoice-date').textContent = new Date(invoice.date).toLocaleDateString();
    document.getElementById('invoice-total').textContent = `$${invoice.total.toFixed(2)}`;
    document.getElementById('invoice-status').textContent = invoice.status;

    // Display returnable items
    const returnItemsList = document.querySelector('.return-items-list');
    returnItemsList.innerHTML = invoice.items.map((item, index) => `
        <div class="return-item" data-index="${index}">
            <div class="col-select">
                <input type="checkbox" id="item-${index}" onchange="updateReturnSummary()">
            </div>
            <div class="col-item">
                <label for="item-${index}">
                    ${item.name}
                    ${item.isBox ? ' (Box)' : ''}
                </label>
            </div>
            <div class="col-price">$${item.price.toFixed(2)}</div>
            <div class="col-qty">
                <input type="number" 
                    id="return-qty-${index}" 
                    class="return-qty" 
                    min="1" 
                    max="${item.quantity}" 
                    value="1" 
                    disabled 
                    onchange="validateQuantity(this, ${item.quantity})"
                    oninput="updateReturnSummary()">
                <span class="qty-total">/ ${item.quantity}</span>
            </div>
            <div class="col-total" id="item-total-${index}">$0.00</div>
        </div>
    `).join('');

    // Add event listeners to checkboxes
    document.querySelectorAll('.return-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const qtyInput = this.closest('.return-item').querySelector('input[type="number"]');
            qtyInput.disabled = !this.checked;
            if (!this.checked) {
                qtyInput.value = "1";
            }
            updateReturnSummary();
        });
    });

    // Reset form fields
    document.getElementById('return-reason').value = '';
    document.getElementById('return-condition').value = '';
    document.getElementById('return-comments').value = '';
    
    // Show the form
    invoiceDetails.classList.remove('hidden');
    updateReturnSummary();
}

// Validate quantity input
function validateQuantity(input, max) {
    let value = parseInt(input.value);
    if (isNaN(value) || value < 1) {
        input.value = 1;
    } else if (value > max) {
        input.value = max;
    }
    updateReturnSummary();
}

// Update the return summary when selections change
function updateReturnSummary() {
    let selectedCount = 0;
    let returnTotal = 0;

    document.querySelectorAll('.return-item').forEach(item => {
        const index = item.dataset.index;
        const checkbox = document.getElementById(`item-${index}`);
        const qtyInput = document.getElementById(`return-qty-${index}`);
        const itemTotal = document.getElementById(`item-total-${index}`);
        
        if (checkbox.checked) {
            selectedCount++;
            const invoiceNumber = document.getElementById('invoice-number').value;
            const invoices = getInvoices();
            const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
            const itemPrice = invoice.items[index].price;
            const quantity = parseInt(qtyInput.value) || 0;
            const total = itemPrice * quantity;
            
            returnTotal += total;
            itemTotal.textContent = `$${total.toFixed(2)}`;
        } else {
            itemTotal.textContent = '$0.00';
        }
    });

    document.getElementById('selected-items-count').textContent = selectedCount;
    document.getElementById('return-total').textContent = `$${returnTotal.toFixed(2)}`;
}

// Process the return
function processReturn() {
    const invoiceNumber = document.getElementById('invoice-number').value;
    const returnReason = document.getElementById('return-reason').value;
    const returnCondition = document.getElementById('return-condition').value;
    const comments = document.getElementById('return-comments').value;

    if (!returnReason) {
        alert('Please select a return reason!');
        return;
    }

    if (!returnCondition) {
        alert('Please select the product condition!');
        return;
    }

    // Get selected items
    const selectedItems = [];
    document.querySelectorAll('.return-item').forEach(item => {
        const index = parseInt(item.dataset.index);
        const checkbox = document.getElementById(`item-${index}`);
        
        if (checkbox.checked) {
            const qtyInput = document.getElementById(`return-qty-${index}`);
            const qty = parseInt(qtyInput.value);
            
            if (isNaN(qty) || qty < 1) {
                alert('Please enter valid quantities for all selected items!');
                return;
            }
            
            selectedItems.push({
                index: index,
                quantity: qty
            });
        }
    });

    if (selectedItems.length === 0) {
        alert('Please select at least one item to return!');
        return;
    }

    // Process the return in localStorage
    const invoices = getInvoices();
    const invoiceIndex = invoices.findIndex(inv => inv.invoiceNumber === invoiceNumber);
    
    if (invoiceIndex === -1) {
        alert('Invoice not found!');
        return;
    }

    // Update invoice status and add return information
    invoices[invoiceIndex].status = 'RETURNED';
    invoices[invoiceIndex].return = {
        date: new Date().toISOString(),
        reason: returnReason,
        condition: returnCondition,
        comments: comments,
        items: selectedItems.map(item => ({
            ...invoices[invoiceIndex].items[item.index],
            returnedQuantity: item.quantity
        }))
    };

    // Save updated invoices
    localStorage.setItem('invoices', JSON.stringify(invoices));

    // Show success message and redirect
    alert('Return processed successfully!');
    window.location.href = 'invoices.html';
}

// Cancel return and go back to invoice list
function cancelReturn() {
    if (confirm('Are you sure you want to cancel this return?')) {
        window.location.href = 'invoices.html';
    }
}
