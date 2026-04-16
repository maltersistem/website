# Malter Sistem d.o.o. — Web Sajt

Statički prezentacioni sajt za firmu Malter Sistem d.o.o. koja se bavi mašinskim malterisanjem.

**Tech stack:** HTML + CSS + vanilla JavaScript
**Eksterni zavisnosti:** Nula. Bez framework-a, bez CDN-a, bez Google Fonts-a, bez build alata.
Sajt radi potpuno offline i može se deployovati na bilo koji statički hosting.

---

## Brzi start

```bash
# Pokreni lokalni server
python3 -m http.server 8080

# Otvori u browseru
# http://localhost:8080
```

Alternativno: VS Code Live Server, `npx serve`, ili bilo koji statički server.

> **Napomena:** Sajt mora da se servira preko HTTP servera (ne `file://`) jer galerija koristi `fetch()` za učitavanje JSON-a.

---

## Struktura projekta

```
WEB/
├── index.html              # Glavna (jedina) HTML stranica
│
├── css/
│   ├── reset.css           # CSS reset (box-sizing, margine)
│   ├── variables.css       # CSS custom properties (boje, fontovi, spacing)
│   ├── base.css            # Tipografija, utility klase, section osnove
│   ├── layout.css          # Grid helperi
│   ├── components.css      # Navbar, dugmad, kartice, forma, footer
│   ├── sections.css        # Stilovi za svaku sekciju + lightbox
│   └── animations.css      # Scroll-reveal, reduced-motion
│
├── js/
│   └── main.js             # Sav JavaScript (nav, scroll, galerija, forma...)
│
├── img/
│   ├── logo.png            # Zvaničan logo firme (koristi se kao favicon, navbar, hero, footer)
│   ├── gallery/            # Slike i video za galeriju
│   │   └── gallery.json    # Manifest galerije (generisan skriptom ili ručno)
│   └── about/              # Slike za "O nama" sekciju
│
└── scripts/
    ├── build-gallery.sh    # Generiše gallery.json iz fajlova u img/gallery/
    └── optimize-images.sh  # Optimizuje slike (resize, kompresija, WebP)
```

---

## Kako menjati sadržaj

### Tekstovi i kontakt podaci

Sve je u **`index.html`**. Otvorite fajl i pretražite:

| Šta menjate | Gde u fajlu |
|---|---|
| Naslov/podnaslov na hero-u | `<section id="hero">` — `<h1>` i `<p class="hero__subtitle">` |
| Tekst "O nama" | `<section id="about">` — `<p class="about__desc">` paragrafi |
| Statistike (brojevi) | `<span class="counter" data-target="20">` — menjajte `data-target` vrednost |
| Usluge (naziv + opis) | `<section id="services">` — svaki `<article class="card">` |
| Telefon | Pretražite `+381 60 123 4567` — pojavljuje se u nav, kontakt sekciji i footeru |
| Email | Pretražite `info@maltersistem.rs` |
| Adresa | Pretražite `Beograd, Srbija` |
| Radno vreme | `Pon — Pet: 07:00 — 17:00` u kontakt sekciji |
| Copyright godina | Footer — `&copy; 2026` |

### Logo

Logo se učitava iz **`img/logo.png`**. Koristi se na 4 mesta:
- Favicon (browser tab)
- Navbar (gornji levi ugao)
- Hero sekcija (centralno iznad naslova)
- Footer

Da zamenite logo: stavite novi `logo.png` u `img/` folder (preporučena veličina ~300-400px).

### Boje i fontovi

Sve boje i stilske varijable su u **`css/variables.css`**:

```css
--accent: #e8841a;         /* Glavna narandžasta boja */
--bg-primary: #0f0f0f;     /* Tamna pozadina */
--bg-secondary: #1a1a1a;   /* Alternativna pozadina */
```

Fontovi koriste system font stack (bez eksternih zavisnosti):
```css
--font-heading: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
--font-body: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
```

---

## Galerija — dodavanje slika i videa

Galerija se dinamički učitava iz `img/gallery/gallery.json`. Podržava slike i video fajlove.

### Korak 1: Pripremite fajlove

**Imenovanje** (obavezno):
```
kategorija-opis-redni-broj.ekstenzija

Slike:
  malterisanje-stambeni-objekat-01.jpg
  fasade-poslovna-zgrada-01.jpg
  sanacije-vlaga-podrum-01.jpg
  dekorativne-veneziano-dnevna-01.jpg

Video:
  malterisanje-rad-na-terenu-01.mp4
  fasade-proces-izrade-01.mp4
```

**Validne kategorije:** `malterisanje`, `fasade`, `sanacije`, `dekorativne`, `priprema`
Ako ime ne počinje validnom kategorijom, biće svrstano u "ostalo".

**Video thumbnail** (opciono ali preporučeno):
Za svaki video stavite sliku istog imena sa `.thumb` sufiksom:
```
malterisanje-rad-01.mp4           ← video
malterisanje-rad-01.thumb.jpg     ← thumbnail koji se prikazuje u gridu
```

### Korak 2: Stavite fajlove u folder

```bash
cp vaše-slike/*.jpg img/gallery/
cp vaši-videi/*.mp4 img/gallery/
```

### Korak 3: Optimizujte slike (opciono ali preporučeno)

```bash
# Instalacija alata (jednom)
sudo apt install imagemagick webp

# Optimizacija — resize na max 1200px, kompresija, WebP konverzija
./scripts/optimize-images.sh

# Samo pregled šta bi uradio (bez promena)
./scripts/optimize-images.sh --dry-run
```

### Korak 4: Generišite gallery.json

```bash
./scripts/build-gallery.sh
```

Skript skenira `img/gallery/` folder i kreira JSON manifest. Sajt automatski čita ovaj fajl i prikazuje sve fajlove.

### Korak 5: Dodajte opise (opciono)

Otvorite `img/gallery/gallery.json` i popunite opise:

```json
[
  {
    "src": "img/gallery/malterisanje-stambeni-objekat-01.jpg",
    "title": "Malterisanje stambeni objekat",
    "description": "Kompletno mašinsko malterisanje trosobnog stana u Novom Beogradu",
    "category": "malterisanje"
  },
  {
    "src": "img/gallery/malterisanje-rad-01.mp4",
    "thumbnail": "img/gallery/malterisanje-rad-01.thumb.jpg",
    "title": "Proces malterisanja",
    "description": "Video snimak mašinskog nanošenja maltera",
    "category": "malterisanje"
  }
]
```

### gallery.json format

| Polje | Obavezno | Opis |
|---|---|---|
| `src` | Da | Putanja do slike ili videa |
| `title` | Da | Naslov koji se prikazuje na hover i u lightbox-u |
| `description` | Ne | Kratak opis ispod naslova |
| `category` | Da | Kategorija za filter dugmad |
| `thumbnail` | Ne | Samo za video — putanja do slike koja se prikazuje u gridu |

---

## Priprema slika — vodič za profesionalan izgled

### Fotografisanje

- **Osvetljenje:** Slikajte danju sa što više prirodnog svetla. Upalite sva svetla u prostoriji. Izbegavajte blic.
- **Ugao:** Slikajte zidove iz ugla (ne frontalno) da se vidi dubina i ravnost površine. Za fasade, slikajte sa malo udaljenosti da se vidi celina.
- **Pre/posle:** Uvek slikajte istu površinu PRE i POSLE rada — to je najubedljiviji dokaz kvaliteta.
- **Rezolucija:** Minimum 1200px širina. Telefon sa dobrom kamerom je sasvim dovoljan.
- **Čistoća kadra:** Sklonite alat i šut iz kadra pre slikanja. Čista slika = profesionalan utisak.

### Snimanje videa

- **Trajanje:** 15-60 sekundi je idealno. Kratki, fokusirani klipovi.
- **Orijentacija:** Uvek horizontalno (landscape), nikad vertikalno.
- **Stabilnost:** Koristite obema rukama ili oslonite telefon na nešto. Tresenje = neprofesionalno.
- **Rezolucija:** 1080p je dovoljno. 4K fajlovi su preveliki za web.
- **Format:** `.mp4` (H.264) je univerzalno podržan na svim browserima.
- **Thumbnail:** Slikajte jedan dobar kadar iste scene za thumbnail sliku.

### Tehničke preporuke

| Parametar | Slike | Video |
|---|---|---|
| Format | `.jpg` ili `.webp` | `.mp4` (H.264) |
| Maks. širina | 1200px | 1920px (1080p) |
| Aspect ratio | 4:3 (horizontalne) | 16:9 |
| Kvalitet/bitrate | 80-85% | 2-5 Mbps |
| Maks. veličina | ~200KB po slici | ~10MB po klipu |

### Šta radi optimize skript

1. **Resize** — smanjuje slike šire od 1200px (galerija) / 800px (o nama)
2. **Kompresija** — kvalitet na 82% (neprimetno oku, drastično manja veličina)
3. **Strip metadata** — uklanja EXIF podatke (lokacija, kamera info)
4. **Progressive JPEG** — slika se učitava postepeno
5. **WebP konverzija** — ~30% manja od JPG

> Skript ne optimizuje video fajlove. Za kompresiju videa koristite [HandBrake](https://handbrake.fr/) (besplatan) ili `ffmpeg`.

---

## Deploy (postavljanje na internet)

### Opcija 1: Netlify (preporučeno, besplatno)

1. Napravite nalog na [netlify.com](https://www.netlify.com)
2. Prevucite `WEB/` folder na Netlify dashboard (drag & drop)
3. Gotovo! Dobijate URL tipa `vaš-sajt.netlify.app`
4. Povežite custom domenu ako je imate

**Ažuriranje:** Ponovo prevucite folder ili povežite sa Git repozitorijumom.

### Opcija 2: GitHub Pages (besplatno)

```bash
cd WEB
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/vaš-username/malter-sistem.git
git push -u origin main
```

Settings > Pages > Source: `main` branch.

### Opcija 3: Vercel (besplatno)

```bash
npx vercel --prod
```

Ili povežite GitHub repo na [vercel.com](https://vercel.com).

### Opcija 4: Tradicionalni hosting (cPanel, FTP)

Uploadujte sve fajlove iz `WEB/` foldera u `public_html/` na hostingu putem FTP-a ili cPanel File Managera.

---

## Čest workflow za ažuriranje

### Dodavanje novih slika/videa u galeriju

```bash
# 1. Kopirajte fajlove (pravilno imenovane)
cp nove-slike/*.jpg img/gallery/
cp novi-videi/*.mp4 img/gallery/

# 2. Optimizujte slike
./scripts/optimize-images.sh

# 3. Regenerišite manifest
./scripts/build-gallery.sh

# 4. (Opciono) Uredite opise u gallery.json

# 5. Testirajte lokalno
python3 -m http.server 8080

# 6. Deploy
```

### Promena teksta

```
1. Editujte index.html
2. Testirajte lokalno
3. Deploy
```

### Promena boja/stila

```
1. Editujte css/variables.css za globalne promene
2. Editujte css/sections.css za specifične sekcije
3. Testirajte lokalno
4. Deploy
```

### Zamena logo-a

```
1. Stavite novi logo.png u img/ folder (preporučeno ~300-400px)
2. Testirajte lokalno — logo se automatski ažurira svuda
3. Deploy
```

---

## Koji fajl za šta — brzi referentni vodič

| Želim da promenim... | Fajl |
|---|---|
| Tekst bilo gde na sajtu | `index.html` |
| Boje, fontove, spacing | `css/variables.css` |
| Izgled dugmadi, kartica, forme | `css/components.css` |
| Izgled hero-a, sekcija, galerije | `css/sections.css` |
| Navigaciju (linkovi, logo stil) | `css/components.css` |
| Animacije, efekte | `css/animations.css` |
| JavaScript ponašanje | `js/main.js` |
| Slike/video u galeriji | `img/gallery/` + `gallery.json` |
| Logo firme | `img/logo.png` |
| Meta tagove (SEO, social sharing) | `index.html` `<head>` |

---

## Tehnički detalji

- **Zero dependencies** — nema npm paketa, nema eksternih CDN-ova, nema Google servisa
- **Responsive** — mobile-first, breakpoints na 768px i 1024px
- **Performanse** — lazy loading slika/videa, passive scroll listeneri, CSS transform animacije
- **Pristupačnost** — semantički HTML, aria atributi, skip link, `prefers-reduced-motion`, fokus stilovi
- **Galerija** — dinamičko učitavanje iz JSON-a, filter po kategoriji, lightbox sa strelicama, podrška za video
- **Browser podrška** — svi moderni browseri (Chrome, Firefox, Safari, Edge). IE nije podržan.
- **Fontovi** — system font stack (bez eksternih zahteva, najbrže moguće učitavanje)
