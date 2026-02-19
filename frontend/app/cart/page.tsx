import React from 'react';
import './cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = React.useState([]);

    const handleRemoveItem = (itemId) => {
        setCartItems(cartItems.filter(item => item.id !== itemId));
    };

    const handleCheckout = () => {
        // Implement checkout logic here
        alert('Proceeding to checkout!');
    };

    return (
        <div className="cart">
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cartItems.map(item => (
                        <li key={item.id} className="cart-item">
                            <span>{item.name} (Quantity: {item.quantity})</span>
                            <button onClick={() => handleRemoveItem(item.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={handleCheckout} className="checkout-button">Checkout</button>
        </div>
    );
};

export default Cart;