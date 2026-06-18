# astrOS

a personal web OS built for Hack Club Stardance's WebOS missions. dark space theme, draggable windows, the works.

by [urged-st](https://github.com/urged-st)

## what is this

astrOS is a fullscreen, browser-based desktop environment — boot screen, top bar with a live clock, draggable/closable/minimisable windows, a taskbar, and a right-click context menu. built entirely in vanilla HTML, CSS, and JS, no frameworks.

## features

- **boot screen** with fullscreen launch on enter
- **draggable windows** — close, minimise to taskbar, restore
- **right-click context menu** — about, github link
- **taskbar** with icon-only minimised window buttons
- **Sky Map** — a custom canvas-based real-time star chart using your actual location (geolocation requested up front so it doesn't kick you out of fullscreen). coordinates are hidden by default with a show/hide toggle for privacy. drag to rotate the view.
- **Mission Log** — simple in-session notepad, no persistence by design
- **About astrOS** window — links to GitHub and AstroLab

## file structure

```
astros/
├── index.html       — everything lives here, no page navigation
├── style.css         — all styling
├── script.js         — window management, drag, taskbar, sky map logic
├── assets/
│   └── bg.jpg         — desktop wallpaper
└── devlog.md          — build log
```

single-file architecture (`index.html`) was a deliberate choice — switching pages drops fullscreen mode in every browser, so the boot screen and desktop both live in one document and are toggled with CSS classes instead.

## guide differentiators

built following Hack Club's WebOS Jam guide, but diverges with:

- fully custom canvas sky map (not a library) with real star positions calculated from local sidereal time
- minimise-to-taskbar with shrink animation
- right-click context menu
- privacy-conscious coordinate hiding on the sky map
- single-document fullscreen architecture instead of multi-page navigation



## credits

star data adapted from the Yale Bright Star Catalogue (public domain).
