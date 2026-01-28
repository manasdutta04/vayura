# Testing Offline Mode - Quick Start

## 🎯 Quick Testing Guide

Follow these steps to test the offline mode feature:

### 1️⃣ Start the Development Server

```bash
npm run dev
```

### 2️⃣ Visit a District Page (While Online)

1. Navigate to http://localhost:3000
2. Search for any district (e.g., "Mumbai", "Delhi", "Bangalore")
3. Click on a district to view its details
4. Note that the data loads normally

### 3️⃣ Enable Offline Mode

#### Chrome/Edge:

1. Press `F12` to open DevTools
2. Click the **Network** tab
3. Find the throttling dropdown (says "No throttling")
4. Select **Offline**

#### Firefox:

1. Press `F12` to open DevTools
2. Click the **Network** tab
3. Check the **Offline** checkbox

### 4️⃣ Test Cached Data

1. **Reload the page** (Ctrl+R or Cmd+R)
2. You should see:
   - ✅ Offline banner at the top (amber background)
   - ✅ Cache indicator showing when data was cached
   - ✅ All district data displays normally
   - ✅ Refresh button is disabled

### 5️⃣ Navigate to Another District

1. Click browser back button
2. Search for another district you haven't visited yet
3. Try to navigate to it
4. Expected: Error message (no cached data available)

### 6️⃣ Return Online

1. In DevTools, change throttling back to "No throttling"
2. Click the **Refresh Data** button on the district page
3. You should see:
   - ✅ Offline banner disappears
   - ✅ Data refreshes with latest information
   - ✅ Cache timestamp updates

### 7️⃣ Test Cache Staleness

To test stale cache indicator:

1. In DevTools Console, run:

```javascript
// Open IndexedDB
const request = indexedDB.open("vayura-cache", 1);
request.onsuccess = function (event) {
  const db = event.target.result;
  const tx = db.transaction(["districts"], "readwrite");
  const store = tx.objectStore("districts");

  // Get all entries
  const getAllRequest = store.getAll();
  getAllRequest.onsuccess = function () {
    const entries = getAllRequest.result;

    // Update timestamp to 25 hours ago
    entries.forEach((entry) => {
      entry.timestamp = Date.now() - 25 * 60 * 60 * 1000;
      store.put(entry);
    });
  };
};
```

2. Reload the page (while online)
3. You should see a blue cache indicator saying "Stale data"

## 🔍 What to Look For

### Visual Indicators

1. **Offline Banner** (Top of page)
   - Only appears when offline
   - Amber background with warning icon
   - Text: "You're offline — Viewing cached data only"

2. **Cache Status Card** (District page)
   - Green: Fresh cached data (<24h)
   - Blue: Stale cached data (>24h)
   - Amber: Offline mode
   - Shows cache age (e.g., "2 hours ago")

3. **Refresh Button**
   - Enabled when online
   - Disabled (greyed out) when offline
   - Shows spinner animation when refreshing

### Expected Behavior

✅ **Online + Fresh Cache (<24h)**

- Page loads from cache instantly
- Green cache indicator
- Can manually refresh

✅ **Online + Stale Cache (>24h)**

- Page loads from cache first
- Blue cache indicator
- Automatically fetches fresh data
- Can manually refresh

✅ **Offline + Cached Data**

- Page loads from cache
- Amber offline indicator
- Refresh button disabled
- Cannot fetch new districts

❌ **Offline + No Cache**

- Error message displayed
- Prompts to connect to internet
- Cannot load district data

## 🐛 Troubleshooting

### Issue: Cache not working

**Solution:**

1. Check browser console for errors
2. Verify IndexedDB is enabled (not disabled in browser settings)
3. Check if private/incognito mode (may have restrictions)
4. Clear browser cache and try again

### Issue: Offline mode not detected

**Solution:**

1. Try using DevTools Network tab throttling
2. Don't use browser's offline mode (use DevTools)
3. Refresh the page after enabling offline mode

### Issue: Data not updating

**Solution:**

1. Click "Refresh Data" button
2. Clear cache in browser DevTools > Application > Clear Storage
3. Restart the dev server

## 📊 Verify Cache in DevTools

### Chrome/Edge:

1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Expand **IndexedDB** > **vayura-cache**
4. Click **districts**
5. You'll see cached district entries

### Firefox:

1. Open DevTools (`F12`)
2. Go to **Storage** tab
3. Expand **IndexedDB** > **vayura-cache**
4. Click **districts**
5. You'll see cached district entries

## ✅ Success Checklist

- [ ] District data loads while online
- [ ] Data is cached in IndexedDB
- [ ] Offline banner appears when offline
- [ ] Cached data displays when offline
- [ ] Cache indicator shows correct status
- [ ] Refresh button works when online
- [ ] Refresh button disabled when offline
- [ ] Stale cache warning appears (>24h)
- [ ] Can navigate to cached districts offline
- [ ] Cannot access non-cached districts offline

## 🎓 Advanced Testing

### Test Cache Cleanup

1. Visit 11+ different districts
2. Check IndexedDB
3. Verify only last 10 are stored

### Test Cache Validity

1. View a district
2. Wait 25 hours (or manipulate timestamp)
3. Return online
4. Should see "stale data" indicator

### Test Error Handling

1. Go offline
2. Try to visit a new district
3. Should see error message
4. Should prompt to go online

---

**Happy Testing! 🚀**

If you encounter any issues, check the console for error messages or refer to `docs/OFFLINE_MODE.md` for more details.
