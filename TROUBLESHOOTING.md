# 🛠️ Troubleshooting Guide

This guide helps resolve common setup and development issues in Vayura.

---

## 🔐 1. Firebase Admin Private Key Formatting Issues

### ❗ Problem
Firebase Admin SDK throws errors like:
- "Invalid private key"
- "Error parsing private key"

### 🤔 Why It Happens
The private key inside `.env` loses proper newline formatting.

### ✅ Fix
1. Replace `\n` with actual line breaks.
2. Ensure the key is wrapped correctly in quotes.
3. Restart the development server after updating `.env`.

---

## 🌍 2. NEXT_PUBLIC vs Server-side Environment Variables

### ❗ Problem
Environment variables return `undefined`.

### 🤔 Why It Happens
Variables without `NEXT_PUBLIC_` prefix are not accessible on the client side.

### ✅ Fix
- Use `NEXT_PUBLIC_` prefix for frontend variables.
- Keep sensitive keys (like Firebase Admin or Gemini API keys) server-side only.
- Restart server after modifying `.env`.

---

## 📊 3. Firestore Index Errors

### ❗ Problem
Error message:
> The query requires an index.

### 🤔 Why It Happens
Firestore requires composite indexes for certain queries.

### ✅ Fix
1. Check terminal error.
2. Click the provided Firestore console link.
3. Create the suggested index.
4. Wait for deployment to complete.

---

## 🐳 4. Docker Build or Port Conflicts

### ❗ Problem
Port 3000 already in use.

### 🤔 Why It Happens
Another process is running on that port.

### ✅ Fix
- Stop the running process.
- Or change port: npm run dev -- -p 3001

---

## 🤖 5. Gemini API Key or Quota Issues

### ❗ Problem
- 403 error
- Gemini API not responding

### 🤔 Why It Happens
Invalid API key or exceeded quota.

### ✅ Fix
1. Check `.env` for correct `GEMINI_API_KEY`.
2. Verify quota in Google Cloud Console.
3. Restart server after changes.

---

## 🌱 6. Seed Script Execution Failures

### ❗ Problem
Seed script crashes or doesn’t insert data.

### 🤔 Why It Happens
- Firebase Admin not configured
- Missing environment variables

### ✅ Fix
- Ensure Firebase Admin credentials are correct.
- Verify Firestore project ID.
- Run: npm run seed


---

## 🧪 7. Common TypeScript Build Errors

### ❗ Problem
Type errors during `npm run build`.

### 🤔 Why It Happens
Type mismatch or missing interfaces.

### ✅ Fix
- Check types in `src/lib/types`.
- Ensure interfaces match Firestore document structure.
- Run: npm run build


---

# 💡 Final Tip

After changing environment variables:
- Always restart the development server.
- Clear `.next` folder if build behaves unexpectedly: