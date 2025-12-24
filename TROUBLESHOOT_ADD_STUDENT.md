# 🔧 Troubleshooting: Failed to Add Student

## Common Issues and Solutions:

### **1. Contract Not Initialized**

**Error:** "Contract not initialized"

**Solution:**
1. Check `.env` file has `CONTRACT_ADDRESS=0x0955E398C008089dE3515799F294711ca4cF0E33`
2. Restart the server:
   ```powershell
   cd C:\Users\Dell\StudentRegistryNew
   npm start
   ```

### **2. Server Not Running**

**Error:** Connection refused or timeout

**Solution:**
1. Make sure server is running:
   ```powershell
   npm start
   ```
2. You should see: `🚀 Server running on http://localhost:3000`
3. Keep the PowerShell window open!

### **3. Insufficient Gas (MATIC)**

**Error:** "insufficient funds" or "gas" related

**Solution:**
1. Get test MATIC from faucet: https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Enter your wallet address (the one with private key in .env)
4. Request tokens
5. Wait 2-3 minutes
6. Try again

### **4. Student Already Exists**

**Error:** "Student already exists"

**Solution:**
- Use a different Student ID
- Each student must have a unique ID

### **5. Invalid Data**

**Error:** "Missing required fields" or validation error

**Solution:**
- Make sure all fields are filled:
  - Student ID (number)
  - Full Name (text)
  - Course (text)
  - Date of Birth (date)
  - Average Grade (0-100)
  - Status (dropdown)

### **6. Network Issues**

**Error:** Network timeout or connection error

**Solution:**
1. Check internet connection
2. Verify Infura API key in `.env`
3. Try restarting server

## 🔍 How to Debug:

### **Step 1: Check Browser Console**

1. Open http://localhost:3000
2. Press `F12` (Developer Tools)
3. Click "Console" tab
4. Look for red error messages
5. **Copy the error message and tell me!**

### **Step 2: Check Server Logs**

Look at the PowerShell window where server is running:
- You should see error messages there
- **Copy the error and tell me!**

### **Step 3: Test Server**

Try this in browser console (F12):
```javascript
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return:
```json
{
  "status": "Server is running",
  "network": "Polygon Amoy",
  "contractAddress": "0x0955E398C008089dE3515799F294711ca4cF0E33"
}
```

## 📋 Quick Checklist:

- [ ] Server is running (`npm start`)
- [ ] `.env` file has `CONTRACT_ADDRESS=0x0955E398C008089dE3515799F294711ca4cF0E33`
- [ ] Wallet has test MATIC (check on PolygonScan)
- [ ] All form fields are filled
- [ ] Student ID is unique (not used before)
- [ ] Network is Polygon Amoy

## 🆘 Still Not Working?

**Tell me:**
1. What exact error message do you see? (in browser console F12)
2. What does the server terminal show? (PowerShell window)
3. Did you restart the server after updating `.env`?
4. Do you have MATIC in your wallet? (check on https://amoy.polygonscan.com/)

---

**Check the browser console (F12) and server logs for the exact error message!**


