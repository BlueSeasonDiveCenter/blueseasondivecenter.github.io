# Blue Season Camiguin — Official Website

Dive center website for Blue Season Camiguin, located in Anito, Mambajao, Camiguin Island, Philippines.

**Live site:** [www.camiguindiver.com](https://www.camiguindiver.com)

## Deployment

Hosted on **GitHub Pages** from this repo (`blueseasondivecenter.github.io`). Any push to `main` auto-deploys within ~1 minute. The custom domain is set via the `CNAME` file.

## Local Preview

No build step required.

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just double-click `index.html` to open in a browser.

## Project Structure

```
.
├── index.html              # Homepage
├── dive-sites.html         # 6 dive sites with detailed descriptions
├── courses.html            # PADI courses
├── prices.html             # Pricing details
├── accommodation.html      # Resort rooms, amenities
├── contact.html            # Contact info, WhatsApp, map
├── css/style.css           # All styles
├── js/main.js              # Interactions (navbar, mobile menu, scroll reveal)
├── img/                    # All images
├── favicon.svg / favicon.png / apple-touch-icon.png
├── sitemap.xml             # XML sitemap
├── robots.txt              # Crawler instructions
└── CNAME                   # Custom domain (www.camiguindiver.com)
```

## Tech Stack

Pure HTML5 + CSS3 + vanilla JS. No framework, no build step. Google Fonts (Playfair Display + DM Sans). Responsive at 480 / 768 / 1024 px breakpoints. SEO-ready with semantic HTML, structured data (LocalBusiness, FAQPage), Open Graph, and sitemap.
