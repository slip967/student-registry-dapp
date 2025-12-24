
const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch if node 18+

async function testMint() {
    try {
        const response = await fetch('http://localhost:3000/mint-diploma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: 999,
                fileData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                fileName: "test_pixel.png",
                fileType: "image/png",
                recipientAddress: "0x0000000000000000000000000000000000000000"
            })
        });
        const data = await response.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

testMint();
