// cart.ts

// Cart item interface
interface CartItem {
    id: string;
    quantity: number;
}

// Cart management class
class Cart {
    private cart: CartItem[];

    constructor() {
        this.cart = this.loadCart();
    }

    // Load cart from local storage
    private loadCart(): CartItem[] {
        const cartData = localStorage.getItem('cart');
        return cartData ? JSON.parse(cartData) : [];
    }

    // Save cart to local storage
    private saveCart(): void {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Add item to cart
    addItem(id: string, quantity: number): void {
        const existingItem = this.cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ id, quantity });
        }
        this.saveCart();
    }

    // Remove item from cart
    removeItem(id: string): void {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
    }

    // Update item quantity in cart
    updateItem(id: string, quantity: number): void {
        const existingItem = this.cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity = quantity;
            this.saveCart();
        }
    }

    // Get cart items
    getItems(): CartItem[] {
        return this.cart;
    }
}

// Export Cart class
export default Cart;