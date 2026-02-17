// No import needed for Node 18+ global fetch
const fs = require('fs');
const path = require('path');

// Manually read .env.local to avoid dependency on 'dotenv'
const envPath = path.join(__dirname, '.env.local');
let VERIFICATION_TOKEN = '';
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/KOFI_WEBHOOK_VERIFICATION_TOKEN=(.*)/);
    if (match) VERIFICATION_TOKEN = match[1].trim();
}

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/kofi';

async function testWebhook() {
    console.log("🚀 Simulating Ko-fi Webhook...");

    const mockData = {
        verification_token: VERIFICATION_TOKEN,
        message_id: "test-msg-123",
        timestamp: new Date().toISOString(),
        type: "Subscription",
        is_public: true,
        from_name: "Test Supporter",
        message: "WBP-29EDAD", // Change this to a real short code from your DB
        amount: "4.99",
        currency: "USD",
        url: "https://ko-fi.com",
        email: "test_gamer@example.com",
        tier_name: "Pro",
        kofi_transaction_id: "TST-" + Math.random().toString(36).substring(7).toUpperCase()
    };

    const formData = new URLSearchParams();
    formData.append('data', JSON.stringify(mockData));

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const result = await response.json();
        console.log("✅ Server Response:", result);

        if (response.ok) {
            console.log("\n✨ Success! Check your database or site to see the upgrade.");
        } else {
            console.log("\n❌ Failed. Check your console for errors.");
        }
    } catch (error) {
        console.error("💥 Error sending webhook:", error.message);
    }
}

testWebhook();
