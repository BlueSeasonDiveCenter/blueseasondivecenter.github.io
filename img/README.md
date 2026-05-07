# Image Assets — Blue Season Camiguin

All images should be optimized for web (compressed JPEG/WebP). Use tools like TinyPNG or Squoosh before uploading.

## Required Images

### Hero Video & Poster
| Filename | Used On | Format | Description |
|---|---|---|---|
| `hero-video.mp4` | index.html (hero background, desktop only) | MP4 H.264, 10-15s, 720p, **under 3MB** | Looping underwater footage — reef, turtles, or diver in Camiguin waters. No audio needed. |
| `hero-home.jpg` | index.html (hero poster & mobile fallback) | JPEG 1920×1080 | A still frame from the video, or a standalone underwater photo. Shown while video loads and on all mobile devices. |

**Video compression tips:**
- Use HandBrake or FFmpeg: `ffmpeg -i input.mp4 -vf scale=1280:-2 -c:v libx264 -crf 28 -an -movflags +faststart hero-video.mp4`
- `-an` removes audio (not needed), `-crf 28` controls quality vs size, `-movflags +faststart` enables streaming
- Target: 720p, 10-15 seconds, under 3MB

### Open Graph
| Filename | Used On | Suggested Size | Description |
|---|---|---|---|
| `og-home.jpg` | index.html (OG tag) | 1200×630 | Social sharing image — branded or scenic Camiguin underwater shot |
| `og-dive-sites.jpg` | dive-sites.html (OG tag) | 1200×630 | Social sharing — collage or best underwater shot |
| `og-courses.jpg` | courses.html (OG tag) | 1200×630 | Social sharing — instructor with student underwater |
| `og-accommodation.jpg` | accommodation.html (OG tag) | 1200×630 | Social sharing — resort exterior or room |
| `og-contact.jpg` | contact.html (OG tag) | 1200×630 | Social sharing — resort or island scenic shot |

### Dive Sites (6 images)
| Filename | Description | Suggested Size |
|---|---|---|
| `site-mantigue.jpg` | Green sea turtle at Mantigue Island reef | 600×440 |
| `site-burias.jpg` | Pelagic fish / open ocean at Burias Shoal | 600×440 |
| `site-jigdup.jpg` | Cave/swim-through entrance at Jigdup Shoal | 600×440 |
| `site-white-island.jpg` | Black coral or staghorn coral garden at White Island | 600×440 |
| `site-giant-clam.jpg` | Close-up of giant Tridacna clam at Cabuan | 600×440 |
| `site-sunken-cemetery.jpg` | Underwater cross or tombstones at Sunken Cemetery | 600×440 |

### Courses (3 images)
| Filename | Description | Suggested Size |
|---|---|---|
| `course-dsd.jpg` | Instructor with beginner student in water | 600×440 |
| `course-ow.jpg` | Open Water students practicing skills | 600×440 |
| `course-aow.jpg` | Advanced diver on deep reef wall | 600×440 |

### Accommodation (8 images)
| Filename | Description | Suggested Size |
|---|---|---|
| `resort-exterior.jpg` | Resort exterior/beachfront view | 800×600 |
| `room-interior.jpg` | Room interior (general) | 800×500 |
| `room-twin.jpg` | Twin bed room | 600×440 |
| `room-king.jpg` | King bed room | 600×440 |
| `resort-pool.jpg` | Swimming pool | 600×400 |
| `resort-restaurant.jpg` | Restaurant / dining area | 600×400 |
| `resort-beach.jpg` | Beach view from resort | 600×400 |
| `resort-dive-center.jpg` | Dive equipment / dive center area | 600×400 |

### Optional but Recommended
| Filename | Description | Suggested Size |
|---|---|---|
| `logo.png` | Blue Season logo (transparent background) | 200×60 |
| `favicon.ico` | Browser tab icon | 32×32 |
| `favicon.png` | Modern browsers favicon | 180×180 |

## Image Optimization Tips
- Use JPEG for photos, PNG for logos/graphics with transparency
- Consider WebP format for modern browsers (30-50% smaller than JPEG)
- Compress all images: aim for under 200KB per image, hero under 400KB
- Use `loading="lazy"` attribute on images below the fold
- Always include descriptive `alt` text for SEO and accessibility
