const Product = require('../models/Product');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Handle incoming chat messages
 */
exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const userMsg = message.toLowerCase();
        
        // Fetch products for context with seller info
        const products = await Product.find({}).populate('seller');
        const productsList = products.map(p => {
            const wa = p.seller?.whatsapp || process.env.ADMIN_WHATSAPP || '201280027006';
            return `${p.name} (${p.category}): ${p.price} ج.م [واتساب البائع: ${wa}]`;
        }).join(', ');

        // 1. Check if Gemini API Key exists
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_free_gemini_api_key_here') {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `
                أنت مساعد ذكي لمتجر "أطياب" للعطور والزيوت. 
                أجب على العميل بلهجة مصرية مهذبة وجذابة.
                المنتحات المتوفرة حالياً في المتجر هي: [${productsList}].
                
                هام جداً: إذا سأل العميل عن منتج معين، اذكر له السعر ووضح له أن بإمكانه التواصل مع البائع مباشرة.
                إذا أراد العميل رقم الواتساب لمنتج معين، أعطه الرقم المذكور بجانب المنتج [واتساب البائع: XXX].
                
                إذا لم يسأل عن منتج محدد، استخدم رقم الإدارة العام: ${process.env.ADMIN_WHATSAPP || '201280027006'}.
                
                لا تذكر أنك بوت أو ذكاء اصطناعي، بل أنت "مساعد أطياب".
                اجعل إجاباتك مختصرة ومفيدة.
                
                رسالة العميل: ${message}
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const reply = response.text();

                // Extract any phone number mentioned in the AI reply to set showWhatsApp correctly
                const foundPhone = reply.match(/\d{10,12}/);
                return res.json({ 
                    reply, 
                    whatsappNumber: foundPhone ? foundPhone[0] : null,
                    showWhatsApp: !!foundPhone 
                });
            } catch (aiError) {
                console.error('Gemini AI Error:', aiError);
            }
        }

        // 2. Logic Fallback (Search-based)
        if (userMsg.includes('سعر') || userMsg.includes('بكام') || userMsg.includes('متوفر') || userMsg.includes('عندك')) {
            const foundProducts = products.filter(p => 
                userMsg.includes(p.name.toLowerCase()) || 
                p.name.toLowerCase().includes(userMsg.split(' ').pop())
            );

            if (foundProducts.length > 0) {
                const p = foundProducts[0];
                const wa = p.seller?.whatsapp || '201280027006';
                let reply = `نعم، متوفر لدينا عطر ${p.name} بسعر ${p.price} ج.م. \n يمكنك التواصل مع البائع مباشرة عبر الواتساب لإتمام الطلب.`;
                return res.json({ 
                    reply, 
                    whatsappNumber: wa,
                    showWhatsApp: true 
                });
            }
        }

        // 3. Greeting / General fallback
        if (userMsg.includes('سلام') || userMsg.includes('مرحبا') || userMsg.includes('هلا')) {
            return res.json({ reply: 'أهلاً بك في أطياب للعطور! كيف يمكنني مساعدتك اليوم؟' });
        }

        return res.json({ 
            reply: 'سؤال جيد! يمكنك التحدث مباشرة مع أحد خبرائنا عبر الواتساب للحصول على أدق المعلومات.',
            showWhatsApp: true
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ reply: 'عذراً، حدث خطأ تقني. يرجى مراسلتنا واتساب مباشرة.' });
    }
};

/**
 * WhatsApp Webhook Verification
 */
exports.verifyWhatsApp = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WA_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

/**
 * Handle WhatsApp Messages
 */
exports.handleWhatsAppWebhook = async (req, res) => {
    // This is where you would process messages from WhatsApp Cloud API
    // and send replies using axios to Meta's API.
    console.log('WhatsApp Webhook Received:', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
};
