# Offline Mode with Caching

This document describes the offline mode implementation in Vayura, which allows users to access previously viewed district data even without an internet connection.

## 🎯 Overview

The offline mode feature provides:

- **Smart caching** of district-level data using IndexedDB
- **Automatic offline detection** with visual indicators
- **Cached data serving** when offline or when fresh data is unavailable
- **Manual refresh** option to update cached data
- **Cache management** that keeps the last 10 accessed districts

## 🏗 Architecture

### Core Components

1. **IndexedDB Cache Utility** (`src/lib/utils/indexeddb-cache.ts`)
   - Manages local storage of district data
   - Automatically cleans up old entries (keeps last 10 districts)
   - Provides CRUD operations for cached data

2. **District Cache Manager** (`src/lib/utils/district-cache-manager.ts`)
   - High-level API for fetching district data with cache support
   - Handles online/offline scenarios
   - Manages cache staleness (24-hour validity)

3. **Offline Detection Hook** (`src/lib/hooks/use-online-status.ts`)
   - Monitors browser online/offline events
   - Provides real-time connection status

4. **District Data Hook** (`src/lib/hooks/use-district-data.ts`)
   - React hook for fetching and managing district data
   - Integrates caching and offline detection
   - Provides refresh functionality

5. **UI Components**
   - `OfflineIndicator`: Shows cache status on district pages
   - `OfflineBanner`: Global banner in header when offline
   - `DistrictClientPage`: Client-side district page with offline support

## 📊 Data Flow

### Online Mode

```
User navigates to district page
  ↓
Server fetches initial data (SSR)
  ↓
Client component loads
  ↓
Check cache for freshness
  ↓
If cache is fresh (<24h):
  ├─ Display cached data
  └─ Show "Cached Data" indicator
Else:
  ├─ Fetch fresh data from API
  ├─ Update cache
  └─ Display fresh data
```

### Offline Mode

```
User navigates to district page (offline)
  ↓
Server renders with initial data (if SSR succeeds)
  ↓
Client component loads
  ↓
Detect offline status
  ↓
Check cache for data
  ↓
If cached data exists:
  ├─ Display cached data
  ├─ Show "Offline Mode" indicator
  └─ Disable refresh button
Else:
  └─ Show "No data available" message
```

## 🔧 Usage

### Automatic Caching

District data is automatically cached when:

- User visits a district page
- Fresh data is fetched from the API
- User manually refreshes the data

### Cache Limits

- **Maximum cached districts**: 10
- **Cache validity**: 24 hours
- **Cleanup strategy**: Least recently accessed (LRA)

### Manual Refresh

Users can manually refresh district data by:

1. Clicking the "Refresh Data" button
2. This forces a fresh API call and updates the cache

## 📱 User Experience

### Visual Indicators

1. **Offline Banner** (Global)
   - Appears at the top of the page when offline
   - Shows "You're offline — Viewing cached data only"
   - Amber background for visibility

2. **Offline Indicator** (District Page)
   - Shows cache status and timestamp
   - Color-coded:
     - **Green**: Fresh cached data
     - **Blue**: Stale cached data (>24h)
     - **Amber**: Offline mode

3. **Refresh Button**
   - Disabled when offline
   - Shows loading spinner during refresh
   - Tooltip indicates offline status

### Cache Information

The offline indicator displays:

- Current connection status
- Cache age (e.g., "2 hours ago", "1 day ago")
- Staleness warning for data >24 hours old

## 🛠 Technical Details

### Browser Compatibility

The offline mode uses:

- **IndexedDB** (supported in all modern browsers)
- **Navigator.onLine** API for offline detection
- **Service Worker** ready (not yet implemented)

### Storage Limits

IndexedDB storage limits vary by browser:

- Chrome: Up to 60% of disk space
- Firefox: Up to 50% of disk space
- Safari: Up to 1GB (asks user for more)

For Vayura, storing 10 districts typically uses <5MB.

### Cache Structure

```typescript
interface CachedDistrictData {
  slug: string; // District identifier
  data: DistrictDetail; // Full district data
  timestamp: number; // Cache creation time
  lastAccessed: number; // Last access time (for LRA cleanup)
}
```

## 🔮 Future Enhancements

Potential improvements for offline mode:

1. **Service Worker Integration**
   - Intercept network requests
   - Serve cached assets offline
   - Background sync for data updates

2. **Selective Caching**
   - Allow users to "pin" favorite districts
   - Pre-cache nearby districts

3. **Offline Analytics**
   - Track offline usage patterns
   - Generate reports from cached data

4. **Background Sync**
   - Auto-update cache when connection restored
   - Queue tree contributions for sync

5. **Storage Management**
   - Settings to control cache size
   - Manual cache clearing
   - Cache statistics dashboard

## 🧪 Testing Offline Mode

### Chrome DevTools

1. Open DevTools (F12)
2. Go to "Network" tab
3. Select "Offline" from throttling dropdown
4. Reload the page

### Firefox DevTools

1. Open DevTools (F12)
2. Click "Network" tab
3. Check "Offline" option

### Manual Testing

1. Visit a district page while online
2. Enable offline mode in DevTools
3. Reload or navigate to the same district
4. Verify cached data is displayed
5. Check offline indicators appear
6. Confirm refresh button is disabled

## 📝 Notes

- Server-side rendering (SSR) still provides initial data when possible
- Cache is browser-specific and user-specific
- Clearing browser data will clear the cache
- Private/Incognito mode may have restricted storage

## 🤝 Contributing

When working with offline mode:

1. Always test both online and offline scenarios
2. Verify cache updates correctly
3. Check cache cleanup works as expected
4. Test with stale data (>24 hours)
5. Ensure UI indicators are accurate

## 📚 Related Files

- `/src/lib/utils/indexeddb-cache.ts` - Cache implementation
- `/src/lib/utils/district-cache-manager.ts` - Cache management
- `/src/lib/hooks/use-online-status.ts` - Offline detection
- `/src/lib/hooks/use-district-data.ts` - Data fetching hook
- `/src/components/ui/offline-indicator.tsx` - UI components
- `/src/components/district-client-page.tsx` - Client wrapper
- `/src/app/district/[slug]/page.tsx` - District page
