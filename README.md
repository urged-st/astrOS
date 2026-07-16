# astrOS
 
a personal web OS built for Hack Club Stardance's WebOS missions. dark space theme, draggable windows, the works.
 
by [urged-st](https://github.com/urged-st)
 
## what is this
 
astrOS is a fullscreen, browser-based desktop environment — boot screen, top bar with a live clock, draggable/closable/minimisable windows, a taskbar, and a right-click context menu.
 
## features
 
* boot screen with fullscreen launch on enter
* draggable windows — close, minimise to taskbar, restore
* window snapping to screen edges — drag to corners or sides for half/quarter-screen layouts
* right-click context menu — about, github link, AstroLab
* taskbar with icon-only minimised window buttons
* Sky Map — custom canvas-based real-time star chart using your location (geolocation requested up front). coordinates hidden by default with a show/hide toggle for privacy. drag to rotate the view.
* Mission Log — notepad with localStorage persistence across sessions
* NGC Catalogue — searchable deep-sky object browser, live data from Datastro API with offline fallback
* APOD Viewer — NASA's Astronomy Picture of the Day, cached per calendar day
* ISS Tracker — live International Space Station position with reference cities and distance calculation
* Stargazing Conditions — local weather + moon phase + seeing score (0-10 scale) to help plan observing sessions
* Solar System Live — interactive Keplerian orbit simulator, clickable planets show current distance and orbital period
* Meteor Shower Tracker — year-round meteor shower schedule with active/upcoming status and ZHR ratings
* Wallpaper Changer — six preset space-themed backgrounds, selection persists in localStorage
* Did You Know notifications — random space facts ping every 1–2 minutes

 
## how it works
 
**window management** uses a z-index stack and drag tracking on the header. **minimise** animates the window down and shrinks it, then adds a taskbar button to restore. **snap** watches for window edges near screen corners/sides and previews a half or quarter-tile layout; release snaps it into place.
 
**Sky Map** calculates local sidereal time (LST) from the current Julian date and your longitude, then converts each star's RA/Dec to alt-az for your location. the canvas rotates as you drag. stars are from the Yale Bright Star Catalogue.
 
**ISS Tracker** polls the wheretheiss.at API every 5 seconds, keeps a 20-point trail, and projects lat/lon onto an equirectangular canvas with reference cities and gridlines. the haversine formula calculates distance to your position.
 
**Meteor Shower Tracker** stores absolute peak dates for 11 major showers, then works out active windows and countdowns entirely client-side. correctly handles year-boundary showers (Quadrantids, Ursids) without breaking. sorts active showers first, then by soonest peak.
 
**Solar System** uses J2000 Keplerian orbital elements and the Newton-Raphson solver to compute each planet's position, then renders them sqrt-scaled so Neptune stays visible. clicking a planet shows current distance in AU and orbital period.
 

## credits
 
star data adapted from the Yale Bright Star Catalogue (public domain). orbit data sourced from NASA JPL. meteor shower dates from International Meteor Organization. wallpaper gradients inspired by deep-space imaging.
