/**
 * Shopping Cart Handler
 * Manages cart state in localStorage and updates the UI
 */

const cart = {
    items: [],

    init() {
        // Load from localStorage
        const savedCart = localStorage.getItem('atyab_cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateUI();
        this.setupEventListeners();
    },

    save() {
        localStorage.setItem('atyab_cart', JSON.stringify(this.items));
        this.updateUI();
    },

    addItem(product, quantity = 1) {
        const existing = this.items.find(item => item.product_id === product._id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                product_id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        this.save();
        this.openDrawer();
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.product_id !== productId);
        this.save();
    },

    updateQuantity(productId, newQty) {
        const item = this.items.find(i => i.product_id === productId);
        if (item) {
            item.quantity = Math.max(1, newQty);
            this.save();
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    updateUI() {
        const badge = document.getElementById('cart-count-badge');
        const container = document.getElementById('cart-items-container');
        const totalPriceEl = document.getElementById('cart-total-price');
        const checkoutBtn = document.getElementById('go-to-checkout');

        // Update count
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = count;
        badge.style.display = count > 0 ? 'flex' : 'none';

        // Update items list
        if (this.items.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 2rem; color: #777;">السلة فارغة حالياً...</p>';
            checkoutBtn.disabled = true;
        } else {
            container.innerHTML = '';
            this.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${item.price} ج.م</div>
                        <div class="cart-item-qty-control">
                            <button onclick="cart.updateQuantity('${item.product_id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="cart.updateQuantity('${item.product_id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="cart.removeItem('${item.product_id}')">&times;</button>
                `;
                container.appendChild(itemDiv);
            });
            checkoutBtn.disabled = false;
        }

        // Update total
        totalPriceEl.innerText = this.getTotal() + ' ج.م';
    },

    setupEventListeners() {
        const launcher = document.getElementById('cart-floating-btn');
        const drawer = document.getElementById('cart-drawer');
        const closeBtn = document.getElementById('close-cart-drawer');
        const clearBtn = document.getElementById('clear-cart-btn');
        const checkoutBtn = document.getElementById('go-to-checkout');

        launcher.addEventListener('click', () => this.toggleDrawer());
        closeBtn.addEventListener('click', () => this.closeDrawer());
        
        clearBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من مسح كافة محتويات السلة؟')) {
                this.clear();
            }
        });

        checkoutBtn.addEventListener('click', () => {
            this.closeDrawer();
            // Open the existing checkout modal but with cart mode
            openCheckout(null, true); 
        });
    },

    toggleDrawer() {
        document.getElementById('cart-drawer').classList.toggle('active');
    },

    openDrawer() {
        document.getElementById('cart-drawer').classList.add('active');
    },

    closeDrawer() {
        document.getElementById('cart-drawer').classList.remove('active');
    }
};

window.cart = cart;
document.addEventListener('DOMContentLoaded', () => cart.init());
