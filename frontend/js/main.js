 // انسخ الكود ده كله وحطه مكان القديم في main.js
let currentProduct = null;
let productsData = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.whatsapp-float')) {
        const waButton = document.createElement('a');
        waButton.href = 'https://wa.me/201280027006?text=مرحباً، لدي استفسار من متجر أطياب!';
        waButton.target = '_blank';
        waButton.className = 'whatsapp-float';
        waButton.innerHTML = `
            <svg viewBox="0 0 32 32" width="35" height="35" fill="white">
                <path d="M16 1.4C7.9 1.4 1.4 7.9 1.4 16c0 2.6.7 5 1.9 7.1L1.4 29.8l6.8-1.8c2.1 1.2 4.5 1.8 7.1 1.8 8.1 0 14.6-6.5 14.6-14.6S24.1 1.4 16 1.4zm0 24.6c-2.2 0-4.3-.6-6.1-1.6l-.4-.2-4.5 1.2 1.2-4.4-.3-.4c-1.2-1.9-1.8-4-1.8-6.3 0-6.9 5.6-12.5 12.5-12.5S28.5 7.4 28.5 14.3 22.9 26 16 26zm6.9-9.5c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.6-.2-.8.2s-1 1.2-1.2 1.5c-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.4-1.4-1.6-1.8s-.1-.6.1-.8c.2-.2.4-.4.6-.6s.3-.4.4-.7c.1-.3 0-.5-.1-.7s-.8-1.9-1-2.6c-.2-.7-.4-.6-.6-.6H11c-.3 0-.7.1-1 .4-.4.4-1.4 1.4-1.4 3.4s1.4 3.9 1.6 4.2c.2.3 2.9 4.4 7 6.2.9.4 1.7.7 2.3.9 1 .3 1.9.3 2.6.2.8-.1 2.3-1 2.6-1.9.3-.9.3-1.7.2-1.9s-.4-.3-.8-.5z"/>
            </svg>
        `;
        document.body.appendChild(waButton);
    }
    loadProducts();
});

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
        container.innerHTML = `<div style="text-align: center; padding: 4rem;">⚠️ عذراً، حدث خطأ أثناء الاتصال بالخادم.</div>`;
    }
}

function renderProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    if (!products || products.length === 0) {
        const currentUser = api.getCurrentUser();
        container.innerHTML = `
            <div style="text-align: center; width: 100%; grid-column: 1/-1; padding: 5rem 1rem; border: 1px dashed var(--gold-main); border-radius: 4px; background: #fdfdfd;">
                <h3 style="color: #121418; margin-bottom: 1rem; font-family: 'Amiri', serif; font-size: 2rem;">التشكيلة الجديدة قادمة قريباً</h3>
                <p style="color: #A0A5AA; font-size: 1.1rem; margin-bottom: 2rem;">نعمل على إضافة مجموعة من أرقى العطور النادرة والزيوت الملكية.</p>
                ${currentUser && currentUser.role === 'admin' ? `<a href="dashboard.html" class="btn">إضافة منتجات الآن</a>` : `<p style="color: #D4AF37; font-weight: 700;">ترقبوا الافتتاح الكبير!</p>`}
            </div>
        `;
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="image-wrapper">
                <img src="${p.image || 'https://via.placeholder.com/300x400'}" alt="${p.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-category">${p.category}</div>
                <div class="product-name">${p.name}</div>
                <div class="product-price">${p.price} ج.م</div>
                <button class="btn add-to-cart-btn">أضف للسلة</button>
            </div>
        `;
        container.appendChild(card);
    });
}
