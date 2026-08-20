# Destin To Relax - destintorelax.com

Direct marketing site for **Destin To Relax**, a 7-bedroom lakefront vacation estate in the gated Destiny East community, Destin, FL. Sleeps 14. All booking CTAs link to the RealJoy Vacations listing.

- Live: https://destintorelax.com (GitHub Pages, custom domain)
- Fallback: https://gberry747-lab.github.io/destin-to-relax/
- Booking: https://www.realjoy.com/beach-rentals/destin-to-relax

## Stack

Pure static HTML/CSS/JS - no build step, no dependencies. Google Fonts (Fraunces + Inter). 86 listing photos in `images/full` (1800px) and `images/thumb` (640px), hero variants at 2400px.

## Editing

- Content: `index.html`
- Styles: `css/styles.css`
- Gallery photos/captions/categories: `js/gallery-data.js` (fields: `n` file number, `c` category, `t` caption)
- Behavior (nav, reveals, lightbox, filters): `js/main.js`

Append `?static=1` to the URL to disable animations and reveal all content (used for QA screenshots).

## House facts (keep consistent)

- 7 bedrooms, 5.5 baths, sleeps 14 in real beds (3 kings, 3 queens, 2 twins); max occupancy 18 once TWO pullout couches are added - update sitewide when they're in
- NO pets (site policy - RealJoy listing incorrectly says pets allowed as of Aug 2026)
- Guests must be 25+ to book
- Private heated pool (seasonal fee) + spa, private elevator, two kitchens
