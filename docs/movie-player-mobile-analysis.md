# Analysis: Movie player “goes back” on mobile after clicking Play

## What happens when you click Play

1. **Play button** (overlay or “Watch Now”) runs `setIsPlayerOpen(true)`.
2. **React re-renders**: the banner/overlay is replaced by the **streaming layout**.
3. **Streaming layout** includes:
   - Breadcrumb at top (Links to **Home** and **Movies**)
   - Adblock notice
   - **Player box**: header with Close (X) and Lights on, then **iframe** with `src={embedUrl}` (e.g. VidSrc).
4. The **iframe** starts loading the embed URL (e.g. `https://vidsrc.xyz/embed/movie/123?autoplay=1`).

So the issue appears **after** the player is open, i.e. after step 2–4.

---

## Likely causes (in order)

### 1. **Iframe redirecting the parent (most likely)**

- By default, an iframe can run **`window.top.location = '...'`** and navigate the **whole page** (your app).
- Many embed/streaming sites do this on mobile to “break out” of the iframe and open their own page or full-screen.
- **Effect**: User taps Play → player opens → iframe loads → embed script runs → **top window navigates** → user sees the app “go away” (feels like “goes back” or “leaves the page”).
- **Why desktop may work**: Some embeds only do this on mobile (e.g. “open in app” or “full page” behavior).

**Fix:** Use the iframe **`sandbox`** attribute **without** `allow-top-navigation`, so the embed cannot change `top.location`. Use something like:  
`sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"`  
and do **not** add `allow-top-navigation`. That keeps normal embed behavior but blocks programmatic top-level redirects.

---

### 2. **“Ghost” or second tap closing the player or hitting a link**

- On mobile, touch can produce **touch + click** or a **delayed/second** event.
- When the overlay unmounts and the streaming layout mounts, the **same gesture** (or a follow-up) might be **re-targeted** to whatever is now under the finger (e.g. Close button or breadcrumb Link).
- **Effect**: Player opens, then immediately **closes** (if Close is hit) or **navigates** (if Home/Movies is hit). User perceives “it goes back.”
- **Why desktop may work**: Mouse click doesn’t usually produce this re-targeting in the same way.

**Fix (if needed):**

- Give the **Close** button `type="button"` and optionally **ignore clicks for ~300ms** after the player opens (e.g. ref + timestamp), so a stray tap from the same gesture doesn’t close the player.
- Ensure breadcrumb Links don’t sit in the exact same spot as the play button on first paint (layout/z-index already avoid the center; this is secondary).

---

### 3. **Breadcrumb Links at the top**

- When the player is open, the **first** thing below the header is the **breadcrumb** with **Home** and **Movies**.
- If the user taps near the top (or a ghost tap lands there), they hit a **Link** and navigate away (“go back”).
- Less likely than (1) if the user is clearly tapping “Play” in the center, but possible if the tap is slightly high or re-targeted.

**Fix:** Already mitigated by layout; can add the same “ignore for 300ms” for these links when the player has just opened if we confirm ghost taps.

---

### 4. **Browser back gesture**

- Some users might **swipe back** by habit; that would navigate away and is unrelated to the player component.
- No `history.pushState` is used when opening the player, so back doesn’t “close” the player; it leaves the page.

---

## Recommended fix (implementation)

1. **Iframe sandbox (primary)**  
   Add to the movie detail page iframe:
   - `sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"`  
   - Do **not** add `allow-top-navigation`.  
   This stops the embed from redirecting your app on mobile (and desktop).

2. **Close button (secondary)**  
   - Use `type="button"`.  
   - Optionally ignore clicks for 300ms after `isPlayerOpen` becomes true so a ghost tap doesn’t close the player.

3. **Re-test**  
   - On a real device: tap Play and see if the page still “goes back” or navigates.  
   - If it stops after (1), the cause was iframe top-navigation.  
   - If it still closes immediately, add the 300ms guard on the Close button and re-test.

---

## Summary

- **Most likely:** The embed inside the iframe is doing **top-level navigation** on mobile (`window.top.location`), which makes your app “go away” right after the player opens.
- **Fix:** Restrict the iframe with **sandbox** and **no** `allow-top-navigation`.
- **Secondary:** Harden the Close button (and optionally top Links) against ghost taps right after open.
