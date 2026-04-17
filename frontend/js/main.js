let currentProduct = null;
let productsData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Add WhatsApp Floating Chat Button everywhere
    if (!document.querySelector('.whatsapp-float')) {
        const waButton = document.createElement('a');
        waButton.href = 'https://wa.me/201280027006?text=مرحباً، لدي استفسار من متجر أطياب!';
        waButton.target = '_blank';
        waButton.className = 'whatsapp-float';
        waButton.title = 'تواصل معنا عبر واتساب';
        waButton.innerHTML = `
            <svg viewBox="0 0 32 32" width="35" height="35" fill="white">
                <path d="M16 1.4C7.9 1.4 1.4 7.9 1.4 16c0 2.6.7 5 1.9 7.1L1.4 29.8l6.8-1.8c2.1 1.2 4.5 1.8 7.1 1.8 8.1 0 14.6-6.5 14.6-14.6S24.1 1.4 16 1.4zm0 24.6c-2.2 0-4.3-.6-6.1-1.6l-.4-.2-4.5 1.2 1.2-4.4-.3-.4c-1.2-1.9-1.8-4-1.8-6.3 0-6.9 5.6-12.5 12.5-12.5S28.5 7.4 28.5 14.3 22.9 26 16 26zm6.9-9.5c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.6-.2-.8.2s-1 1.2-1.2 1.5c-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.4-1.4-1.6-1.8s-.1-.6.1-.8c.2-.2.4-.4.6-.6s.3-.4.4-.7c.1-.3 0-.5-.1-.7s-.8-1.9-1-2.6c-.2-.7-.4-.6-.6-.6H11c-.3 0-.7.1-1 .4-.4.4-1.4 1.4-1.4 3.4s1.4 3.9 1.6 4.2c.2.3 2.9 4.4 7 6.2.9.4 1.7.7 2.3.9 1 .3 1.9.3 2.6.2.8-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9s-.4-.3-.8-.5z"/>
            </svg>
        `;
        document.body.appendChild(waButton);
    }

    // Auth Check
    const currentUser = api.getCurrentUser();
    if (currentUser) {
        document.getElementById('nav-login-link').style.display = 'none';
        document.getElementById('nav-logout-link').style.display = 'block';
        document.getElementById('nav-add-product-link').style.display = 'block';
        document.getElementById('nav-dashboard-link').style.display = 'block';
        
        if (currentUser.role === 'admin') {
            document.getElementById('nav-visitors-link').style.display = 'block';
        }
    }

    loadProducts();

    // Setup Filters
    const filterBtns = document.querySelectorAll('#category-filters button');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.getAttribute('data-cat');
            const search = document.getElementById('search-input').value;
            loadProducts(search, cat);
        });
    });

    // Setup Search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const search = e.target.value;
        const activeCat = document.querySelector('#category-filters button.active').getAttribute('data-cat');
        loadProducts(search, activeCat);
    });

    // Image Upload hidden input setup
    const imageUploadInput = document.getElementById('hidden-image-upload');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && window.editingImageProductId) {
                try {
                    imageUploadInput.disabled = true; // prevent multiple clicks
                    
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    await api.editProductImage(window.editingImageProductId, formData);
                    loadProducts();
                } catch (err) {
                    alert('حدث خطأ أثناء تغيير الصورة');
                    console.error(err);
                } finally {
                    imageUploadInput.disabled = false;
                    e.target.value = '';
                    window.editingImageProductId = null;
                }
            }
        });
    }

    // Checkout Modal interactions
    const modal = document.getElementById('checkout-modal');
    const closeBtn = document.getElementById('close-checkout');
    const qtyInput = document.getElementById('order-quantity');
    const totalPriceEl = document.getElementById('checkout-total-price');
    const checkoutForm = document.getElementById('checkout-form');

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    qtyInput.addEventListener('input', (e) => {
        if(currentProduct) {
            const qty = parseInt(e.target.value) || 1;
            totalPriceEl.textContent = currentProduct.price * qty;
        }
    });

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const customer_name = document.getElementById('customer-name').value;
        const customer_phone = document.getElementById('customer-phone').value;
        const customer_address = document.getElementById('customer-address').value;
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;
        
        let orderItems = [];
        if (window.checkoutCartMode) {
            orderItems = cart.items.map(item => ({ product_id: item.product_id, quantity: item.quantity }));
        } else {
            const quantity = parseInt(document.getElementById('order-quantity').value);
            orderItems = [{ product_id: currentProduct._id, quantity: quantity }];
        }

        const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
        const senderPhone = document.getElementById('sender-phone').value;
        const transactionImage = document.getElementById('transaction-image').files[0];

        const btn = checkoutForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'جاري التنفيذ...';

        try {
            const formData = new FormData();
            formData.append('customer_name', customer_name);
            formData.append('customer_phone', customer_phone);
            formData.append('customer_address', customer_address);
            if (latitude) formData.append('latitude', latitude);
            if (longitude) formData.append('longitude', longitude);
            formData.append('items', JSON.stringify(orderItems));
            formData.append('payment_method', paymentMethod);
            if (senderPhone) formData.append('sender_phone', senderPhone);
            if (transactionImage) formData.append('transaction_image', transactionImage);

            if (paymentMethod === 'paypal') {
                 formData.append('transaction_id', 'PAYPAL_' + Date.now());
            }

            const order = await api.placeOrder(formData);
            
            if (paymentMethod === 'paypal') {
                 alert('تم إعداد الطلب! سيتم تحويلك إلى باي بال الآن...');
            } else {
                 alert('تم تأكيد الطلب بنجاح! جاري مراجعة الحوالة وسيتم التواصل معك.');
            }

            // Construct Whatsapp message
            let waMessage = `مرحباً، لدي طلب جديد!%0A`;
            waMessage += `الاسم: ${customer_name}%0A%0A`;
            waMessage += `المنتجات:%0A`;
            
            if (window.checkoutCartMode) {
                cart.items.forEach(item => {
                    waMessage += `- ${item.name} (عدد ${item.quantity}) = ${item.price * item.quantity} ج.م%0A`;
                });
                waMessage += `%0Aالإجمالي: ${cart.getTotal()} ج.م%0A`;
            } else {
                const qty = orderItems[0].quantity;
                waMessage += `- ${currentProduct.name} (عدد ${qty}) = ${currentProduct.price * qty} ج.م%0A`;
                waMessage += `%0Aالإجمالي: ${currentProduct.price * qty} ج.م%0A`;
            }

            waMessage += `طريقة الدفع: ${paymentMethod}`;
            const whatsappNumber = '201280027006'; 
            window.open(`https://wa.me/${whatsappNumber}?text=${waMessage}`, '_blank');

            modal.classList.remove('active');
            checkoutForm.reset();
            if (window.checkoutCartMode) cart.clear();
            loadProducts();
        } catch (err) {
            alert('حدث خطأ: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'تأكيد الطلب الآن';
        }
    });

    // Map Integration Logic
    let map = null;
    let marker = null;
    const toggleMapBtn = document.getElementById('toggle-map-btn');
    const mapContainer = document.getElementById('map-selection-container');

    toggleMapBtn.addEventListener('click', () => {
        const isVisible = mapContainer.style.display === 'block';
        if (isVisible) {
            mapContainer.style.display = 'none';
        } else {
            mapContainer.style.display = 'block';
            initDeliveryMap();
        }
    });

    function initDeliveryMap() {
        if (map) {
            map.invalidateSize();
            return;
        }

        // Default: Center of Egypt
        const defaultLat = 30.0444;
        const defaultLng = 31.2357;

        map = L.map('delivery-map').setView([defaultLat, defaultLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

        // Update hidden inputs when marker moves
        const updateCoords = (lat, lng) => {
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
        };

        marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            updateCoords(pos.lat, pos.lng);
        });

        // Click on map to move marker
        map.on('click', (e) => {
            marker.setLatLng(e.latlng);
            updateCoords(e.latlng.lat, e.latlng.lng);
        });

        // Initialize with default coords
        updateCoords(defaultLat, defaultLng);
    }
});

window.togglePaymentFields = function() {
    const selected = document.querySelector('input[name="payment_method"]:checked').value;
    const manualInfo = document.getElementById('manual-payment-info');
    const paypalInfo = document.getElementById('paypal-payment-info');
    const title = document.getElementById('payment-instruction-title');
    const bodyText = document.getElementById('payment-instruction-text');

    if (selected === 'vodafone') {
        manualInfo.style.display = 'block';
        paypalInfo.style.display = 'none';
        title.textContent = 'تحويل فودافون كاش';
        bodyText.innerHTML = 'يرجى تحويل المبلغ إلى الرقم: <strong>010XXXXXXXX</strong><br>الاسم: <strong>أطياب للعطور</strong>';
    } else if (selected === 'instapay') {
        manualInfo.style.display = 'block';
        paypalInfo.style.display = 'none';
        title.textContent = 'تحويل إنستا باي (InstaPay)';
        bodyText.innerHTML = 'يرجى تحويل المبلغ عبر إنستا باي إلى الحساب: <strong>atiab@instapay</strong><br>الاسم: <strong>Atyab Store</strong>';
    } else {
        manualInfo.style.display = 'none';
        paypalInfo.style.display = 'block';
    }
};

async function loadProducts(search = '', category = '') {
    const container = document.getElementById('product-container');
    container.innerHTML = `
        <div id="loading-state" style="text-align: center; width: 100%; padding: 4rem 1rem;">
            <div class="loading-spinner" style="margin: 0 auto 1.5rem auto; border: 3px solid rgba(212,175,55,0.1); border-top: 3px solid var(--gold-main); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
            <p style="color: var(--text-muted); font-size: 1.1rem;">جاري تحميل تشكيلتنا الفاخرة...</p>
        </div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;
    
    try {
        productsData = await api.getProducts(search, category);
        renderProducts(productsData);
    } catch (err) {
        console.error('Fetch error:', err);
        container.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 4rem 1rem; color: #777;">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">⚠️ عذراً، حدث خطأ أثناء الاتصال بالخادم.</p>
                <button onclick="loadProducts()" class="btn" style="padding: 0.6rem 2rem;">حاول مرة أخرى</button>
            </div>
        `;
    }
}

function renderProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    if (!products || products.length === 0) {
        const currentUser = api.getCurrentUser();
        container.innerHTML = `
            <div style="text-align: center; width: 100%; grid-column: 1/-1; padding: 5rem 1rem; border: 1px dashed var(--gold-main); border-radius: var(--border-radius); background: #fdfdfd;">
                <h3 style="color: var(--primary-dark); margin-bottom: 1rem; font-family: 'Amiri', serif; font-size: 2rem;">التشكيلة الجديدة قادمة قريباً</h3>
                <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2rem;">نعمل على إضافة مجموعة من أرقى العطور النادرة والزيوت الملكية.</p>
                ${currentUser && currentUser.role === 'admin' ? 
                    `<a href="dashboard.html" class="btn">إضافة منتجات الآن</a>` : 
                    `<p style="color: var(--gold-dark); font-weight: 700;">ترقبوا الافتتاح الكبير!</p>`
                }
            </div>
        `;
        return;
    }

    const currentUser = api.getCurrentUser();

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        let actionsHTML = '';
        if (currentUser && (currentUser.role === 'admin' || currentUser.id === p.vendor_id)) {
            actionsHTML = `
                <button class="delete-btn" title="حذف المنتج" data-id="${p._id}">&times;</button>
                <button class="edit-btn" title="تعديل السعر" data-id="${p._id}">✎</button>
                <button class="image-edit-btn" title="تغيير الصورة" data-id="${p._id}">🖼️</button>
            `;
        }

        card.innerHTML = `
            <div class="image-wrapper">
                ${actionsHTML}
                <img src="${p.image && p.image !== '' ? p.image : 'https://via.placeholder.com/300x400?text=بدون+صورة'}" alt="${p.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x400?text=بدون+صورة'">
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <div class="product-name">${p.name}</div>
                ${p.description ? `<p style="font-size: 0.9rem; color: var(--text-muted); margin: 5px 0 10px 0; line-height: 1.5; height: 40px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${p.description}</p>` : ''}
                <div class="product-price">${p.price} <span>ج.م</span></div>
                <button class="btn add-to-cart-btn" 
                    ${p.quantity <= 0 ? 'disabled style="background:#555; color:#aaa; cursor:not-allowed;"' : ''}>
                    ${p.quantity > 0 ? 'أضف للسلة' : 'نفذت الكمية'}
                </button>
            </div>
        `;
        
        const delBtn = card.querySelector('.delete-btn');
        if (delBtn) {
            delBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
                    try {
                        await api.deleteProduct(p._id);
                        loadProducts();
                    } catch(err) {
                        alert('حدث خطأ أثناء الحذف');
                    }
                }
            });
        }

        const editBtn = card.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const newPrice = prompt('أدخل السعر الجديد لـ ' + p.name + ':', p.price);
                if (newPrice !== null && !isNaN(newPrice) && newPrice !== '') {
                    try {
                        await api.editProductPrice(p._id, parseFloat(newPrice));
                        loadProducts();
                    } catch(err) {
                        alert('حدث خطأ أثناء تعديل السعر');
                    }
                }
            });
        }

        const imgEditBtn = card.querySelector('.image-edit-btn');
        if (imgEditBtn) {
            imgEditBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.editingImageProductId = p._id;
                document.getElementById('hidden-image-upload').click();
            });
        }

        if (p.quantity > 0) {
            card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                cart.addItem(p);
            });
        }
        
        container.appendChild(card);
    });
}

window.logoutUser = function(e) {
    if(e) e.preventDefault();
    api.logout();
    window.location.reload();
};

function openCheckout(product, isCartMode = false) {
    window.checkoutCartMode = isCartMode;
    const qtyGroup = document.getElementById('order-quantity').parentElement;
    
    if (isCartMode) {
        currentProduct = null;
        document.getElementById('checkout-product-id').value = 'CART';
        document.getElementById('checkout-total-price').textContent = cart.getTotal();
        qtyGroup.style.display = 'none'; // Hide qty input if checking out whole cart
    } else {
        currentProduct = product;
        document.getElementById('checkout-product-id').value = product._id;
        document.getElementById('order-quantity').value = 1;
        document.getElementById('checkout-total-price').textContent = product.price;
        qtyGroup.style.display = 'block';
    }
    
    document.getElementById('checkout-modal').classList.add('active');
}
