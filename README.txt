SOUND SAFARI
============
Articulation speech-sound games for therapists, OTs & schools.
Free to play, R50/month unlocks the full safari via an unlock code.

WHAT'S IN HERE
--------------
index.html   - the website (home, game, resources, pricing/unlock)
promo.html   - self-playing narrated promo. Open it, click play.
               Screen-record it to share, or just send the link.
styles.css   - look & feel
app.js       - game logic + unlock system
data.js      - the speech-sound word banks
codes.js     - the list of valid unlock codes (edit to add/remove)
CODES.txt    - your stock list of codes to hand out (tick them off)

PRICE: R200 once-off, lifetime access on one device. No monthly fees.

HOW THE MONEY FLOW WORKS
------------------------
1. Customer taps "Contact us to pay" -> opens WhatsApp to 083 655 3095.
2. You arrange the once-off R200 payment however suits (EFT, etc.).
3. You give them ONE unused code (and note who it's for).
4. They paste it on the Pricing page -> full safari unlocks for good
   on that device.

TWO MODES (you choose)
----------------------
A) SIMPLE / HONESTY MODE (works right now, nothing to set up)
   Codes are in codes.js. Any valid code unlocks any device. Easy, but
   one code could be shared with many phones. Fine to launch with.

B) DEVICE-BOUND MODE (recommended once you have paying customers)
   Each code locks to the FIRST device that uses it - can't be shared.
   You also get a kill switch and a new-phone reset. It's free (Google
   Sheet + Apps Script). Full guide in SETUP-BACKEND.txt.
   To switch it on: follow SETUP-BACKEND.txt, then paste your web-app URL
   into BACKEND_URL at the top of app.js.

The 150 codes = up to 150 different customers. Give a different code to
each one so you can track who's who.

TWO THINGS TO DO BEFORE YOU SHARE IT
------------------------------------
1. Yoco link:
   - In your Yoco dashboard make a Payment Link / Payment Page for R50.
   - Copy that link.
   - Open app.js, line near the top: YOCO_PAYMENT_LINK = "https://pay.yoco.com/REPLACE-ME"
   - Paste your real link between the quotes. Save.
   (Use a Payment LINK, not the embed/popup code - the embed needs a
    server and that's why it wasn't working for you.)

2. Contact details:
   - In app.js, CONTACT_HINT, put your actual WhatsApp number/handle.

NOTES
-----
- Codes give 30 days on the device they're entered on (browser localStorage).
  Same code can be reused/renewed - simple and honest for launch.
- "Recurring" billing isn't automatic (Yoco links are once-off). Each month
  they pay again and you send a code, OR you just trust regulars.
- The game speaks words aloud and lets kids record themselves - this needs
  a modern browser (Chrome/Safari/Edge) and microphone permission.

PUTTING IT ONLINE (free, like your other sites)
-----------------------------------------------
Drop this whole folder into a GitHub repo and turn on GitHub Pages, the
same way Orbit and Aleph are hosted. Want me to do that? Just say so.
