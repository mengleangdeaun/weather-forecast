# Smooth Theme Switching & Mobile UX Best Practices Guide

This document explains the root causes and architectural solutions for seamless dark/light theme switching, mobile viewport zooming prevention, and map lifecycle synchronization. These patterns can be referenced and reused across all frontend web and mobile web projects.

---

## Table of Contents
1. [Seamless Dark/Light Theme Switching (No Component Lag)](#1-seamless-darklight-theme-switching)
2. [Preventing Mobile Auto-Zoom on Inputs and Selects](#2-preventing-mobile-auto-zoom-on-inputs-and-selects)
3. [ScrollArea Integration for Lists & Selectors](#3-scrollarea-integration)
4. [MapLibre GL Marker & Popup Lifecycle Synchronization](#4-maplibre-gl-lifecycle-synchronization)

---

## 1. Seamless Dark/Light Theme Switching

### The Problem: Component-by-Component Lag & Flickering
When switching themes, developers frequently observe:
- Some elements fade slowly over 300ms, while others change instantly or over 150ms.
- Components switch colors staggered one after another because different CSS classes have `transition: all`, `transition: background-color`, or no transitions.
- React schedules component re-renders over multiple frames, causing elements to visually "pop" into their new theme at different intervals.

### The Solution: The `.theme-switching` Freeze Pattern
Adopted from enterprise production apps (such as `s_cool_crm`), this pattern temporarily freezes **all CSS transitions across the entire DOM tree** for ~50 milliseconds during the theme toggle.

This forces all colors, borders, shadows, and backgrounds to swap simultaneously in one unified frame. Once the new theme is rendered, transitions are restored for user interactions (e.g., button `:hover`, `:active`, and focus rings).

#### Step 1: Add the CSS Rule (`index.css`)
```css
/* Disable all transitions instantly during theme toggle to eliminate color flickering & component-by-component lag */
.theme-switching,
.theme-switching *,
.theme-switching *::before,
.theme-switching *::after {
    transition: none !important;
}
```

> **Important**: Avoid putting general background-color transition delays on `body`, `.card`, or container wrappers (e.g. avoid `transition-colors duration-300` on the root layout div), as these will create inconsistent lag against other components.

#### Step 2: Implement the Toggle Handler (`App.tsx` or Theme Store)
```tsx
const handleToggleTheme = () => {
  const nextTheme: "light" | "dark" = theme === "dark" ? "light" : "dark";

  // 1. Freeze all transitions across the entire DOM tree
  document.documentElement.classList.add("theme-switching");

  // 2. Synchronously update classes on both <html> and <body>
  if (nextTheme === "dark") {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  }

  // 3. Update React state and persistence
  setTheme(nextTheme);
  localStorage.setItem("theme", nextTheme);

  // 4. Restore normal user-interaction transitions after the new theme has painted
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-switching");
  }, 50);
};
```

#### Step 3: Defaulting to Light Mode
To ensure the application defaults to light mode on first visit:
1. In `index.html`: Do not hardcode `class="dark"` on `<html>`. Use `<html lang="km">`.
2. In your initial theme state:
```tsx
const [theme, setTheme] = useState<"light" | "dark">(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return "light"; // Default to light mode
  }
  return "light";
});
```

---

## 2. Preventing Mobile Auto-Zoom on Inputs and Selects

### The Problem: iOS & Mobile Viewport Jumps
On mobile devices (especially iOS Safari and WebKit browsers), whenever a user taps on an `<input>`, `<select>`, or `<textarea>` whose computed `font-size` is smaller than **16px** (e.g., `text-xs` = 12px or `text-sm` = 14px), the browser automatically zooms and pans the page to center the input. This ruins the responsive mobile UX and causes horizontal overflowing.

### The Solution: Multi-Layer Defense

#### 1. Viewport Meta Tag (`index.html`)
Add `maximum-scale=1.0` and `user-scalable=no` to prevent viewport scale jumps:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

#### 2. Global CSS Font-Size Reset on Mobile (`index.css`)
Ensure that on screens `<= 768px`, all text input fields and select triggers have a minimum font size of `16px`, and disable double-tap zoom via `touch-action: manipulation`:
```css
@layer base {
  /* Prevent page zooming when input or select is focused on mobile screen */
  @media screen and (max-width: 768px) {
    input,
    select,
    textarea,
    [data-slot="input"],
    [data-slot="select-trigger"] {
      font-size: 16px !important;
    }
  }

  /* Prevent unintended double-tap zoom gestures on interactive elements */
  input,
  select,
  textarea,
  button,
  [role="button"] {
    touch-action: manipulation;
  }
}
```

#### 3. Responsive Tailwind Utility on Inputs
On desktop, you can keep compact text, but ensure `text-[16px]` on mobile:
```tsx
<input
  type="text"
  className="w-full text-[16px] sm:text-xs ..."
  placeholder="Search..."
/>
```

---

## 3. ScrollArea Integration

### Why Use `ScrollArea` instead of Native `overflow-y-auto`?
- Standard browser scrollbars on Windows / Linux are bulky and clash with modern rounded glassmorphism designs.
- Native scrollbars cause layout shifting when scrollbars appear or disappear.
- A custom `ScrollArea` provides a slim, translucent Apple-like scroll track with smooth scrolling and responsive fading.

### Usage in List and Selector Components
```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProvinceSelector({ items }: Props) {
  return (
    <div className="rounded-3xl apple-glass p-5">
      {/* Search and Filter Controls */}
      ...

      {/* Chips or Card List inside ScrollArea */}
      <ScrollArea className="h-68 sm:h-72 w-full pr-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1 pb-2">
          {items.map((item) => (
            <button key={item.id} className="apple-press ...">
              {item.name}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

---

## 4. MapLibre GL Lifecycle Synchronization

### The Problem: `Cannot read properties of undefined (reading 'on')`
```
maplibre-gl.js: Uncaught TypeError: Cannot read properties of undefined (reading 'on')
    at uh.addTo
    at Um.togglePopup
    at map.tsx:444:35
```

### Why it Happens
In React, **child component `useEffect` hooks run BEFORE parent component `useEffect` hooks**.
When structuring map components like:
```tsx
<MapMarker longitude={...} latitude={...}>
  <MarkerPopup open={true}>...</MarkerPopup>
</MapMarker>
```
1. `MarkerPopup`'s `useEffect` executes first and calls `marker.togglePopup()`.
2. MapLibre's `togglePopup()` executes `this._popup.addTo(this._map)`.
3. However, `MapMarker`'s `useEffect` (`marker.addTo(map)`) has not executed yet!
4. Therefore, `this._map` is `undefined`, and MapLibre tries calling `undefined.on('move', ...)`, crashing the application.

### The Solution: `useLayoutEffect` + Safety Guard
1. Use `useLayoutEffect` in the parent `MapMarker`. In React, parent `useLayoutEffect` completes before child `useEffect` runs.
2. In `MarkerPopup`, explicitly check that `marker._map` is attached before calling `togglePopup()`.

```tsx
// In MapMarker:
useLayoutEffect(() => {
  if (!map) return;
  if (!(marker as unknown as { _map?: unknown })._map) {
    marker.addTo(map);
  }
  return () => {
    marker.remove();
  };
}, [map, marker]);

// In MarkerPopup:
useEffect(() => {
  if (!map || open === undefined) return;
  if (open) {
    if (!popup.isOpen()) {
      // Ensure marker._map is attached before toggling popup
      if (!(marker as unknown as { _map?: unknown })._map) {
        marker.addTo(map);
      }
      if ((marker as unknown as { _map?: unknown })._map) {
        marker.togglePopup();
      }
    }
  } else {
    if (popup.isOpen()) popup.remove();
  }
}, [map, open, popup, marker]);
```
