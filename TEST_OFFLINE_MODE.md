# Testing Offline Mode with Caching - Step by Step Guide

## 🎯 Test Checklist

Follow these steps to thoroughly test the offline mode feature:

---

## Test 1: Initial Page Load (Online)

**Goal**: Verify data loads and gets cached

1. Open browser to `http://localhost:3000`
2. Search for a district (e.g., "Mumbai" or "Delhi")
3. Click on the district to view details
4. **Expected Result**:
   - ✅ District data loads successfully
   - ✅ No cache indicator visible (fresh data)
   - ✅ Refresh button is enabled

**Verification**:

- Open DevTools (F12)
- Go to Application tab → IndexedDB → vayura-cache → districts
- You should see one entry with the district slug

---

## Test 2: Enable Offline Mode

**Goal**: Test offline detection and cached data display

1. Keep the district page open
2. Open Chrome DevTools (F12)
3. Go to **Network** tab
4. Change throttling from "No throttling" to **"Offline"**
5. **Reload the page** (Ctrl+R or Cmd+R)

**Expected Results**:

- ✅ Page loads successfully from cache
- ✅ Amber offline banner appears at top: "You're offline — Viewing cached data only"
- ✅ Cache indicator card shows:
  - "Offline Mode" status
  - "You're viewing cached data"
  - Cache timestamp (e.g., "2 minutes ago")
- ✅ Refresh button is **disabled** (greyed out)
- ✅ All district data displays correctly

---

## Test 3: Navigate to Cached District

**Goal**: Test navigation between cached districts offline

1. Stay in offline mode
2. Click browser back button
3. Search for another district you visited earlier
4. Click on it

**Expected Results**:

- ✅ Cached district loads successfully
- ✅ Offline indicators remain visible
- ✅ Data displays correctly

---

## Test 4: Try to Load Non-Cached District (Offline)

**Goal**: Test error handling for unavailable data

1. Stay in offline mode
2. Go back to home page
3. Search for a NEW district you haven't visited
4. Try to navigate to it

**Expected Results**:

- ❌ Error message or "No data available"
- ✅ Prompt to connect to internet
- ✅ Cannot load new districts while offline

---

## Test 5: Return Online and Refresh

**Goal**: Test online transition and data refresh

1. On a district page
2. In DevTools Network tab, change from "Offline" to **"No throttling"**
3. Click the **"Refresh Data"** button

**Expected Results**:

- ✅ Offline banner disappears
- ✅ Refresh button becomes enabled
- ✅ Loading spinner appears on button
- ✅ Data refreshes successfully
- ✅ Cache timestamp updates
- ✅ Cache indicator shows fresh data (green background)

---

## Test 6: Cache Staleness (>24 Hours)

**Goal**: Test stale cache warning

### Method 1: Manual Timestamp Manipulation

1. Open DevTools Console
2. Run this script:

```javascript
(async () => {
  const request = indexedDB.open("vayura-cache", 1);
  request.onsuccess = function (event) {
    const db = event.target.result;
    const tx = db.transaction(["districts"], "readwrite");
    const store = tx.objectStore("districts");

    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = function () {
      const entries = getAllRequest.result;

      // Set timestamp to 25 hours ago
      entries.forEach((entry) => {
        entry.timestamp = Date.now() - 25 * 60 * 60 * 1000;
        store.put(entry);
      });

      console.log("✅ Cache timestamps updated to 25 hours ago");
    };
  };
})();
```

3. Reload the page (while online)

**Expected Results**:

- ✅ Blue cache indicator appears (instead of green)
- ✅ Shows "Cached Data (Stale)"
- ✅ Warning: "This data may be outdated. Click 'Refresh Data' to update."
- ✅ Page automatically fetches fresh data in background

---

## Test 7: Cache Limit (Max 10 Districts)

**Goal**: Test automatic cache cleanup

1. Visit **11 different districts** (one after another)
2. Open DevTools → Application → IndexedDB → vayura-cache → districts
3. Check the number of cached entries

**Expected Results**:

- ✅ Only **10 entries** remain (oldest one was removed)
- ✅ Most recently visited districts are cached
- ✅ Least recently accessed district was cleaned up

---

## Test 8: Multiple Browser Tabs

**Goal**: Test cache sharing across tabs

1. Open district page in first tab
2. Open **new tab** with same district
3. Enable offline mode in DevTools
4. Reload both tabs

**Expected Results**:

- ✅ Both tabs load from shared IndexedDB cache
- ✅ Both show offline indicators
- ✅ Cache is shared across tabs

---

## Test 9: Private/Incognito Mode

**Goal**: Test offline mode in private browsing

1. Open new **Incognito/Private window**
2. Navigate to `http://localhost:3000`
3. Visit a district page
4. Enable offline mode
5. Reload

**Expected Results**:

- ✅ Caching works in private mode
- ✅ Cache persists during the session
- ⚠️ Cache clears when incognito window closes (expected browser behavior)

---

## Test 10: Offline Banner Visibility

**Goal**: Test global offline banner

1. Enable offline mode
2. Navigate to different pages:
   - Home page
   - District pages
   - Calculator page
   - Leaderboard
   - Any other page

**Expected Results**:

- ✅ Amber offline banner appears at top of **all pages**
- ✅ Banner text: "You're offline — Viewing cached data only"
- ✅ Banner has WifiOff icon

---

## 🐛 Common Issues and Solutions

### Issue: "Firebase: Error (auth/invalid-api-key)"

**Solution**:

- Ensure `.env.local` has valid Firebase credentials
- Restart dev server after adding credentials
- For testing offline mode only, Firebase auth can be skipped

### Issue: IndexedDB not available

**Solution**:

- Check browser compatibility (Chrome, Firefox, Edge, Safari)
- Ensure not in very old browser version
- Check if IndexedDB is disabled in browser settings

### Issue: Cache not working in Private/Incognito mode

**Solution**:

- Some browsers restrict IndexedDB in private mode
- This is expected behavior
- Regular mode should work fine

### Issue: "Cannot read from cache"

**Solution**:

- Clear browser data and try again
- Check DevTools console for specific errors
- Ensure visit district page first before going offline

---

## ✅ Success Criteria

All tests pass if:

- [x] District data loads and caches automatically
- [x] Offline mode is detected and shows banner
- [x] Cached data displays correctly when offline
- [x] Cache indicators show correct status (fresh/stale/offline)
- [x] Refresh button works online, disabled offline
- [x] Cannot load non-cached districts offline
- [x] Cache cleanup works (max 10 districts)
- [x] Stale cache warning appears after 24h
- [x] Online/offline transitions are smooth
- [x] No console errors during normal operation

---

## 📊 Quick Test Commands

### Check Cache in DevTools Console:

```javascript
// View all cached districts
(async () => {
  const request = indexedDB.open("vayura-cache", 1);
  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction(["districts"], "readonly");
    const store = tx.objectStore("districts");
    const req = store.getAll();
    req.onsuccess = () => {
      console.log("Cached districts:", req.result.length);
      req.result.forEach((entry) => {
        const age = Date.now() - entry.timestamp;
        const hours = Math.floor(age / (1000 * 60 * 60));
        console.log(`- ${entry.slug}: ${hours}h old`);
      });
    };
  };
})();
```

### Clear Cache:

```javascript
// Clear all cached data
(async () => {
  const request = indexedDB.deleteDatabase("vayura-cache");
  request.onsuccess = () => console.log("✅ Cache cleared");
  request.onerror = () => console.log("❌ Failed to clear cache");
})();
```

---

## 🎉 Testing Complete!

If all tests pass, the offline mode with caching feature is working correctly!

**Report any issues to the development team with:**

- Browser and version
- Steps to reproduce
- Console errors (if any)
- Screenshots of unexpected behavior
