
const { Blob } = require('buffer');
const fetch = require('node-fetch'); // emulate fetch if needed, though Node 18 has it
const FormData = require('form-data'); // Pinata needs this potentially?
// Wait, in server.js we used native 'FormData' if available?
// server.js doesn't require 'form-data'. It assumes global FormData?
// Node.js 18 has global FormData.
// Let's test if these globals exist.

async function testGlobals() {
    console.log("Node Version:", process.version);
    try {
        const b = new Blob(['test']);
        console.log("Blob created successfully");
    } catch (e) { console.error("Blob failed:", e.message); }

    try {
        const f = new FormData();
        console.log("FormData created successfully");
    } catch (e) {
        console.error("FormData failed:", e.message);
        console.log("Checking if we need 'undici' or similar for fetch/FormData in this Node ver");
    }
}

testGlobals();
