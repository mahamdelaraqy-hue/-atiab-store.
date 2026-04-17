const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');
const User = require('./models/User');
const Category = require('./models/Category');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const products = [
    { name: 'عطر العود الملكي', category: 'عطور', price: 500, cost_price: 300, quantity: 15, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300' },
    { name: 'مسك الليل الأصيل', category: 'عطور', price: 450, cost_price: 250, quantity: 5, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300' },
    { name: 'عطر العنبر الفاخر', category: 'عطور', price: 600, cost_price: 400, quantity: 10, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=300' },
    { name: 'برفيوم روز باريس', category: 'عطور', price: 350, cost_price: 150, quantity: 20, image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=300' },
    { name: 'عطر سحر الشرق', category: 'عطور', price: 400, cost_price: 200, quantity: 12, image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=300' },
    { name: 'زيت اللافندر الصافي', category: 'زيوت', price: 200, cost_price: 80, quantity: 30, image: 'https://images.unsplash.com/photo-1608528577891-eb0559d1a8e2?auto=format&fit=crop&w=300' },
    { name: 'زيت الورد الدمشقي', category: 'زيوت', price: 250, cost_price: 100, quantity: 20, image: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=300' },
    { name: 'زيت الشاي الأسترالي', category: 'زيوت', price: 180, cost_price: 60, quantity: 25, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300' },
    { name: 'زيت الأرغان المغربي', category: 'زيوت', price: 300, cost_price: 150, quantity: 18, image: 'https://images.unsplash.com/photo-1615397323602-140b904ae1db?auto=format&fit=crop&w=300' },
    { name: 'مبخرة خشبية فخمة', category: 'إكسسوارات', price: 150, cost_price: 70, quantity: 50, image: 'https://images.unsplash.com/photo-1601614394017-d27a1cbe572e?auto=format&fit=crop&w=300' },
    { name: 'فواحة عطرية ذكية', category: 'إكسسوارات', price: 350, cost_price: 200, quantity: 10, image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=300' },
    { name: 'زجاجات عطرية كريستال', category: 'إكسسوارات', price: 250, cost_price: 120, quantity: 15, image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=300' },
    { name: 'أكياس معطرة للملابس', category: 'إكسسوارات', price: 80, cost_price: 30, quantity: 100, image: 'https://images.unsplash.com/photo-1606103920295-9a091573f160?auto=format&fit=crop&w=300' },
    { name: 'زيت النعناع المنعش', category: 'زيوت', price: 150, cost_price: 50, quantity: 40, image: 'https://images.unsplash.com/photo-1595116773467-f417fcd5f74a?auto=format&fit=crop&w=300' }
];

const categories = [
    { name: 'عطور' },
    { name: 'زيوت' },
    { name: 'إكسسوارات' }
];

async function seed() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/perfumestore';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing (Optional - if you want a fresh start, uncomment)
        // await Product.deleteMany({});
        // await User.deleteMany({});
        // await Category.deleteMany({});

        // Add Categories
        for (const cat of categories) {
            const exists = await Category.findOne({ name: cat.name });
            if (!exists) await new Category(cat).save();
        }
        console.log('Categories seeded.');

        // Add Products
        for (const prod of products) {
            const exists = await Product.findOne({ name: prod.name });
            if (!exists) await new Product(prod).save();
        }
        console.log('Products seeded.');

        // Add Admin User
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const admin = new User({
                name: 'المدير العام',
                username: 'admin',
                password: '123',
                role: 'admin'
            });
            await admin.save();
            console.log('Admin user created (admin/123).');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Seeding completed successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
