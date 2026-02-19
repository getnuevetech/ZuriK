import React from 'react';

const OrderConfirmation = () => {
    const orderDetails = {
        orderId: '123456',
        customerName: 'John Doe',
        totalAmount: '50.00',
        items: [
            { name: 'Item 1', price: '20.00' },
            { name: 'Item 2', price: '30.00' }
        ],
        orderDate: '2026-02-19 16:25:44 UTC'
    };

    return (
        <div>
            <h1>Order Confirmation</h1>
            <p>Thank you for your order, {orderDetails.customerName}!</p>
            <p>Your order ID is: {orderDetails.orderId}</p>
            <p>Total Amount: ${orderDetails.totalAmount}</p>
            <h2>Order Details:</h2>
            <ul>
                {orderDetails.items.map((item, index) => (
                    <li key={index}>{item.name} - ${item.price}</li>
                ))}
            </ul>
            <p>Order Date: {orderDetails.orderDate}</p>
        </div>
    );
};

export default OrderConfirmation;