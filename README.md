
NewBlueSeason

# Blue Season Camiguin — Official Website

Dive Center website for Blue Season Camiguin, located in Anito, Mambajao, Camiguin Island, Philippines.

**Live domain:** camiguindiver.com

## Project Structure

```
NewBlueSeason/
├── index.html              # Homepage
├── dive-sites.html         # 6 dive sites with detailed descriptions
├── courses.html            # PADI courses & fun dive pricing
├── accommodation.html      # Resort rooms, amenities, pricing
├── contact.html            # Contact form, WhatsApp, map
├── css/
│   └── style.css           # All styles (responsive, glass effects, animations)
├── js/
│   └── main.js             # Navbar scroll, mobile menu, scroll reveal, form handler
├── img/
│   └── README.md           # Full list of required images with sizes
├── sitemap.xml             # XML sitemap for search engines
├── robots.txt              # Crawler instructions
└── README.md               # This file
```

## Tech Stack

- **Pure HTML5 + CSS3 + vanilla JS** — no frameworks, no build step
- **Google Fonts** — Playfair Display (headings) + DM Sans (body)
- **Responsive** — mobile-first breakpoints at 480px, 768px, 1024px
- **SEO ready** — semantic HTML, structured data, Open Graph, sitemap

## Local Preview

No build tools needed. Just open the files or use a local server:

```bash
# Option 1: Open directly
open index.html

# Option 2: Python local server (recommended)
cd NewBlueSeason
python3 -m http.server 8000
# Then visit http://localhost:8000

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

## Before Going Live

### 1. Replace Images
All image positions are marked with placeholder blocks labeled "Replace with XXX photo". See `img/README.md` for the full list of required images with recommended sizes.

### 2. Add Favicon
Place `favicon.ico` (32×32) and `favicon.png` (180×180) in the root directory, then add to each HTML `<head>`:
```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/favicon.png">
```

### 3. Update Google Maps Embed
The current map in `contact.html` points to the general Mambajao area. To get your exact location:
1. Go to Google Maps and find your exact resort location
2. Click Share → Embed a map → Copy HTML
3. Replace the iframe `src` in `contact.html`

### 4. Connect Contact Form (Optional)
The form currently opens WhatsApp with the message. If you want a proper form backend:
- **Free:** Formspree.io, Getform.io, or Google Forms embed
- **Simple:** Netlify Forms (auto-detects if deployed on Netlify)

## Deployment

### Recommended: Cloudflare Pages (Free)
1. Push this folder to a GitHub repository
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Connect your GitHub repo
4. Set build command to empty, output directory to `/`
5. Add custom domain: camiguindiver.com
6. Free SSL is automatic

### Alternative: Netlify (Free)
1. Push to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import your repo — no build settings needed
4. Add custom domain and enable HTTPS

### Alternative: Direct Upload
Both Cloudflare Pages and Netlify allow drag-and-drop folder upload without GitHub.

## SEO Checklist After Launch

- [ ] **Google Search Console** — verify domain ownership, submit sitemap.xml
- [ ] **Google Business Profile** — register as a local business with photos, hours, reviews
- [ ] **Bing Webmaster Tools** — submit sitemap for Bing/DuckDuckGo
- [ ] **Facebook Business Page** — ensure the linked Facebook page has consistent NAP (name, address, phone)
- [ ] **TripAdvisor** — create a listing for Blue Season Camiguin
- [ ] **PADI Directory** — ensure your listing links to camiguindiver.com
- [ ] **Blog (future)** — add a `/blog` section with dive trip reports, marine life guides, Camiguin travel tips — this is the #1 way to grow organic traffic over time
- [ ] **Schema markup** — LocalBusiness schema is included on the homepage; consider adding FAQ schema to courses.html
- [ ] **Image alt texts** — all placeholders have descriptive alt text ready; keep them when adding real images
- [ ] **Page speed** — after adding images, test with PageSpeed Insights and optimize as needed
