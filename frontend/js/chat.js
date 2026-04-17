document.addEventListener('DOMContentLoaded', () => {
    const launcher = document.getElementById('chat-widget-launcher');
    const container = document.getElementById('chat-widget-container');
    const closeBtn = document.getElementById('close-chat');
    const msgInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg-btn');
    const messagesArea = document.getElementById('chat-messages');

    // Toggle Chat
    launcher.addEventListener('click', () => {
        const isVisible = container.style.display === 'flex';
        container.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible && messagesArea.children.length === 0) {
            addMessage('مرحباً بك في أطياب! كيف يمكنني مساعدتك اليوم؟', 'bot');
        }
    });

    // Send Message
    const handleSend = async () => {
        const text = msgInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        msgInput.value = '';

        // Show typing
        const typingId = 'typing-' + Date.now();
        const typingEl = document.createElement('div');
        typingEl.id = typingId;
        typingEl.className = 'typing';
        typingEl.innerText = 'أطياب يكتب الآن...';
        messagesArea.appendChild(typingEl);
        messagesArea.scrollTop = messagesArea.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            document.getElementById(typingId).remove();
            
            if (data.reply) {
                addMessage(data.reply, 'bot');
                if (data.showWhatsApp) {
                    addWhatsAppButton(data.whatsappNumber);
                }
            }
        } catch (error) {
            console.error('Chat Error:', error);
            document.getElementById(typingId).remove();
            addMessage('عذراً، حدث خطأ في الاتصال. يمكنك مراسلتنا مباشرة عبر الواتساب.', 'bot');
            addWhatsAppButton();
        }
    };

    sendBtn.addEventListener('click', handleSend);
    msgInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${sender}`;
        msgDiv.innerText = text;
        messagesArea.appendChild(msgDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function addWhatsAppButton(customNumber) {
        if (document.querySelector('.whatsapp-fallback')) {
             document.querySelector('.whatsapp-fallback').remove();
        }
        const link = document.createElement('a');
        
        // استخدام رقم البائع إذا توفر، وإلا الرقم الافتراضي
        const myPhoneNumber = customNumber || '201280027006'; 
        
        link.href = `https://wa.me/${myPhoneNumber}?text=` + encodeURIComponent('مرحباً أطياب، لدي استفسار عن...');
        link.className = 'whatsapp-fallback';
        link.innerHTML = '<svg style="width:18px;height:18px;fill:white" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.08-1.1l-.29-.17-3.03.8.81-2.96-.19-.3a8.18 8.18 0 0 1-1.25-4.51c0-4.54 3.7-8.24 8.24-8.24m-3.96 3.03c-.22 0-.46.04-.67.1-.21.07-.4.18-.58.33-.36.28-.66.65-.89 1.1-.22.45-.34 1.14.21 2.16.55 1.02 1.34 1.95 2.22 2.76 1.48 1.37 3.33 2.5 5.21 3.08.38.12.7.18 1.02.18.5 0 .93-.15 1.24-.3.31-.15.6-.36.85-.6.31-.3.51-.73.54-1.12.03-.39-.12-.7-.36-.88-.24-.18-.54-.3-.99-.51-.45-.21-1.08-.51-1.5-.63-.42-.12-.72-.18-1.02.27-.3.45-.66.9-.99 1.14-.33.24-.66.27-1.11.06-.45-.21-1.91-.7-3.64-2.24-1.34-1.2-2.24-2.68-2.51-3.15-.27-.47-.03-.72.2-.95.23-.23.45-.54.67-.81.22-.27.3-.45.45-.75.15-.3.07-.57-.04-.78-.11-.21-.99-2.38-1.35-3.26-.35-.86-.68-.74-.99-.74z"/></svg> تحدث معنا واتساب';
        link.target = '_blank';
        messagesArea.appendChild(link);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
});
