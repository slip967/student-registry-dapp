
const { Blob } = require("buffer");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch"); // Wait, server.js uses global fetch?
// If Node 22, global fetch matches undici.
// We should try to use global fetch if available, else require it.

async function testUploadCrash() {
    console.log("Starting crash test...");

    // Mimic server.js setup
    const fileBuffer = Buffer.from("fake image content");
    const fileName = "test_diploma";
    const fileType = "image/jpeg";
    const PINATA_JWT = process.env.PINATA_JWT || "MISSING"; // We need to read .env

    console.log("JWT length:", PINATA_JWT.length);

    try {
        const fileForm = new FormData();
        fileForm.append("file", new Blob([fileBuffer], { type: fileType || "application/octet-stream" }), fileName || "diploma");
        fileForm.append("pinataMetadata", JSON.stringify({ name: fileName || "diploma" }));

        console.log("FormData created. Sending fetch...");

        const pinFileRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`
            },
            body: fileForm
        });

        console.log("Fetch returned status:", pinFileRes.status);
        if (!pinFileRes.ok) {
            const txt = await pinFileRes.text();
            console.log("Error body:", txt);
        } else {
            const json = await pinFileRes.json();
            console.log("Success:", json);
        }

    } catch (e) {
        console.error("CRASHED:", e);
    }
}

// Read .env manually since we don't have dotenv loaded in this snippet
const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
envContent.split("\n").forEach(line => {
    if (line.startsWith("PINATA_JWT=")) {
        process.env.PINATA_JWT = line.split("=")[1].trim();
    }
});

testUploadCrash();
