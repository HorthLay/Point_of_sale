// Initialize example invoices
function initializeExampleData() {
    const exampleInvoices = [
        {
            invoiceNumber: "INV-2025-001",
            date: "2025-03-20T13:30:00",
            total: 56.93,
            status: "COMPLETED",
            items: [
                {
                    name: "Milk",
                    price: 3.99,
                    quantity: 2,
                    isBox: false
                },
                {
                    name: "Bread",
                    price: 2.49,
                    quantity: 3,
                    isBox: false
                },
                {
                    name: "Eggs",
                    price: 4.99,
                    quantity: 2,
                    isBox: true,
                    boxSize: 12
                },
                {
                    name: "Cheese",
                    price: 5.99,
                    quantity: 5,
                    isBox: false
                }
            ]
        },
        {
            invoiceNumber: "INV-2025-002",
            date: "2025-03-20T14:15:00",
            total: 89.85,
            status: "COMPLETED",
            items: [
                {
                    name: "Milk",
                    price: 3.99,
                    quantity: 5,
                    isBox: false
                },
                {
                    name: "Eggs",
                    price: 4.99,
                    quantity: 3,
                    isBox: true,
                    boxSize: 12
                },
                {
                    name: "Cheese",
                    price: 5.99,
                    quantity: 8,
                    isBox: false
                }
            ]
        },
        {
            invoiceNumber: "INV-2025-003",
            date: "2025-03-20T15:00:00",
            total: 45.92,
            status: "RETURNED",
            items: [
                {
                    name: "Bread",
                    price: 2.49,
                    quantity: 4,
                    isBox: false
                },
                {
                    name: "Eggs",
                    price: 4.99,
                    quantity: 2,
                    isBox: true,
                    boxSize: 12
                },
                {
                    name: "Cheese",
                    price: 5.99,
                    quantity: 4,
                    isBox: false
                }
            ],
            return: {
                date: "2025-03-20T16:00:00",
                reason: "defective",
                condition: "damaged",
                comments: "Eggs were broken on arrival",
                items: [
                    {
                        name: "Eggs",
                        price: 4.99,
                        quantity: 2,
                        isBox: true,
                        boxSize: 12,
                        returnedQuantity: 2
                    }
                ]
            }
        }
    ];

    // Save to localStorage
    localStorage.setItem('invoices', JSON.stringify(exampleInvoices));
    console.log('Example invoices initialized');
}

// Initialize data when the script loads
initializeExampleData();
