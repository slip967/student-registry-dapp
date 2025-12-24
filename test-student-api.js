// Test adding a student via API
const fetch = require('node-fetch');

async function testAddStudent() {
  try {
    const studentData = {
      id: 1,
      name: "Test Student",
      course: "Computer Science",
      dateOfBirth: "2000-01-01",
      averageGrade: 85,
      status: "Active"
    };

    console.log("Testing add student API...");
    console.log("Data:", studentData);

    const response = await fetch('http://localhost:3000/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });

    const result = await response.json();
    console.log("\nResponse Status:", response.status);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("\n✅ Success! Student added!");
    } else {
      console.log("\n❌ Failed:", result.error);
      console.log("Reason:", result.reason);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testAddStudent();


