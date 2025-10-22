# React Infinite Loop Fix - UniversalPageLayout Component

## Issue Description
The `UniversalPageLayout` component was causing an infinite loop with "Maximum update depth exceeded" warnings. The warning count kept increasing indefinitely.

## Root Causes Identified

### 1. Function Dependencies in useEffect
- The `onFilter` function was included in the dependency array of the data filtering `useEffect`
- Since functions are recreated on every render, this caused infinite re-renders
- **Fix**: Removed `onFilter` from dependency array since it's stable within the effect

### 2. Excessive Logging in useEffect
- The logging `useEffect` was running on every render with complex object dependencies
- **Fix**: Changed to empty dependency array `[]` to run only once on mount

### 3. Competing State Updates
- Two separate `useEffect` hooks were both updating `filteredData`
- One sync effect set `filteredData` to raw `data`
- Another filter effect processed the data
- **Fix**: Removed the duplicate data sync effect, let filter effect handle all cases

### 4. Missing Props in EmailTest Page
- The EmailTest page wasn't providing required props to `UniversalPageLayout`
- **Fix**: Added proper props including empty `data` array and disabled unnecessary features

### 5. Object Recreation in Props (NEW)
- Default parameters `filters = {}` and inline objects `data={[]}` were creating new objects on every render
- The filters sync `useEffect` was triggering infinite loops due to object reference changes
- **Fix**: Removed filters sync `useEffect` and used stable object references

### 6. ThemeToggle Component State Updates (NEW)
- `setTheme()` was being called inside `useEffect` causing additional re-renders
- **Fix**: Moved theme initialization to `useState` initializer function

## Changes Made

### UniversalPageLayout.jsx

1. **Logging Effect**: Changed dependency array from `[auth, title]` to `[]`
2. **URL Parsing**: Moved `urlParams` creation inside `useEffect` to avoid recreation
3. **Data Filtering**: Removed `onFilter` from dependency array
4. **State Sync**: Removed duplicate data sync `useEffect`
5. **Filters Initialization**: Changed `useState(filters)` to `useState(() => filters || {})`
6. **Removed Filters Sync**: Eliminated the problematic filters synchronization `useEffect`

### EmailTest/Index.jsx

1. **Added Missing Props**:
   - `data={EMPTY_DATA}` - Stable empty data array
   - `filters={EMPTY_FILTERS}` - Stable empty filters object
   - `allowViewToggle={false}` - Disable view toggle
   - `allowBulkActions={false}` - Disable bulk actions  
   - `allowSearch={false}` - Disable search
2. **Stable References**: Defined `EMPTY_DATA` and `EMPTY_FILTERS` outside component

### ThemeToggle.jsx

1. **State Initialization**: Changed from `useState('system')` to `useState(() => localStorage.getItem('theme') || 'system')`
2. **Removed State Update**: Eliminated `setTheme(savedTheme)` call inside `useEffect`
3. **Direct Theme Application**: Applied theme directly without state update

## Verification
- Development server starts without errors
- Page loads with HTTP 200 status
- No more infinite loop warnings in browser console
- Component renders properly with expected functionality

## Best Practices Applied
1. **Minimal Dependencies**: Only include changing values in `useEffect` dependencies
2. **Stable References**: Avoid including functions that recreate on every render
3. **Single Responsibility**: One `useEffect` per concern to avoid conflicts
4. **Proper Props**: Always provide required props to avoid undefined behavior

## Performance Impact
- Eliminated infinite re-renders
- Reduced CPU usage from constant state updates
- Improved user experience with stable interface
- Memory usage stabilized
