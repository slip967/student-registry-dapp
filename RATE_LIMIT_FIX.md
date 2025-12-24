# ⚠️ Rate Limit Error - Too Many Requests

## Problem

You're getting "Too Many Requests" error from Infura. This happens when you exceed the free tier rate limits.

## Quick Solutions

### **Solution 1: Wait and Retry** (Easiest)

1. **Wait 5-10 minutes**
2. Try again
3. Infura free tier resets after a short period

### **Solution 2: Use Alternative RPC Endpoint**

You can use a different RPC provider. Update your `.env` file:

**Option A: Public Polygon RPC (Free, no limits)**
```env
RPC_URL=https://rpc-amoy.polygon.technology
```

**Option B: Alchemy (Free tier, higher limits)**
1. Sign up at https://www.alchemy.com/
2. Create Polygon Amoy app
3. Get your API key
4. Update `.env`:
```env
INFURA_API_KEY=your_alchemy_api_key
RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_API_KEY
```

**Option C: QuickNode (Free tier)**
1. Sign up at https://www.quicknode.com/
2. Create Polygon Amoy endpoint
3. Update `.env` with your endpoint URL

### **Solution 3: Update Server Code**

Edit `server/server.js` and change the RPC URL:

```javascript
// Option 1: Public RPC (no API key needed)
const RPC_URL = 'https://rpc-amoy.polygon.technology';

// Option 2: Keep Infura but add retry logic
```

### **Solution 4: Add Retry Logic**

The server now has better error handling. If you see rate limit errors:
- Wait a few minutes
- The error message will be clearer now

## Recommended: Use Public RPC

For development/testing, use the public Polygon RPC:

1. Edit `server/server.js` line ~28:
```javascript
const RPC_URL = 'https://rpc-amoy.polygon.technology';
```

2. Restart server:
```powershell
npm start
```

## Why This Happens

- Infura free tier: ~100,000 requests/day
- If you're testing a lot, you can hit the limit
- Public RPCs have no API key but may be slower

## Best Practice

For production, use:
- **Alchemy** (best free tier)
- **QuickNode** (good performance)
- **Infura** (if you upgrade to paid)

For development/testing:
- **Public RPC** (no limits, free)

---

**Quick Fix: Wait 5 minutes and try again, or switch to public RPC!**


