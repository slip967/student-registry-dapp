
const fetch = require('node-fetch');

async function testFullFlow() {
    try {
        const randomId = Math.floor(Math.random() * 1000000);
        console.log("Testing Full Flow for Student ID:", randomId);

        // 1. Add Student
        console.log("Adding student...");
        const addRes = await fetch('http://localhost:3000/add-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: randomId,
                name: `Test User ${randomId}`,
                course: "Blockchain Demo",
                dateOfBirth: "2000-01-01",
                averageGrade: 95,
                status: "Graduated"
            })
        });
        const addData = await addRes.json();
        console.log("Add Result:", addData);

        if (!addData.success) {
            console.error("Add failed, stopping.");
            return;
        }

        // 2. Mint (Empty File)
        console.log("Minting (trigger generation)...");
        const mintRes = await fetch('http://localhost:3000/mint-diploma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: randomId,
                fileData: null,
                recipientAddress: "0x0000000000000000000000000000000000000000"
            })
        });
        const mintData = await mintRes.json();
        console.log("Mint Result:", JSON.stringify(mintData, null, 2));

        if (mintData.tokenURI) {
            console.log("CHECK THIS URI:", mintData.tokenURI);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

testFullFlow();
