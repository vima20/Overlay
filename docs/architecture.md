# Arkkitehtuuri - FIFA Karsinta-ottelut JA Veikkausliiga Overlay

## Yleiskuvaus

Projekti koostuu kahdesta osasta:
1. **Chrome Extension** - Desktop
2. **React App (PWA)** - Mobiili

## Chrome Extension

### Komponentit:
- `content.js` - Injektoi overlay:n sivulle
- `background.js` - Taustaprosessi
- `manifest.json` - Extension-konfiguraatio

### Toiminta:
- Toimii Yle Areena -sivulla
- Näppäinkomento: Ctrl+J
- Käyttää fallback-dataa

## React App (PWA)

### Komponentit:
- `App.js` - Pääkomponentti
- `App.css` - Tyylit
- `manifest.json` - PWA-konfiguraatio

### Toiminta:
- Toimii kaikilla laitteilla
- PWA-tuki
- Offline-toiminta

## Data Flow

### Chrome Extension:
```
Yle Areena → content.js → background.js → fallback data
```

### React App:
```
Browser → App.js → local data → overlay
```

## Deployment

### Vercel:
- React App → Vercel
- Automaattinen build
- PWA-tuki

### Chrome Web Store:
- Extension → paketoi
- Julkaise Chrome Web Store
- Käyttäjät voivat asentaa

## Arkkitehtuurin kuvaus

```
┌─────────────────┐    ┌─────────────────┐
│   CHROME EXT    │    │  REACT APP      │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ content.js  │ │    │ │   App.js    │ │
│ │ (Yle Areena)│ │    │ │ (localhost) │ │
│ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │background.js│ │    │ │   CSS       │ │
│ │ (fallback)  │ │    │ │ (responsive)│ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   YLE ARENA     │    │   VERCEL URL    │
│   (areena.yle.fi)│    │ (overlay.vercel.app)│
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Sivu      │ │    │ │   Sivu      │ │
│ │   Lataus    │ │    │ │   Lataus    │ │
│ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Extension  │ │    │ │  React      │ │
│ │  Injektoi   │ │    │ │  Render     │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   OVERLAY       │    │   OVERLAY        │
│   (Ctrl+J)      │    │   (Ctrl+K)       │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Matches   │ │    │ │   Matches   │ │
│ │   Display   │ │    │ │   Display   │ │
│ └─────────────┘ │    │ └─────────────┘ │
│        │        │    │        │        │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Stats     │ │    │ │   Stats     │ │
│ │   Links     │ │    │ │   Links     │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
```

## Tekninen toteutus

### Frontend-only arkkitehtuuri:
- **Ei serveriä** → kaikki client-puolella
- **Local data** → hardcoded ottelut
- **No API** → ei backend:ä
- **PWA** → voidaan asentaa kännykkään

### Client-softa:
- **Chrome Extension** → toimii käyttäjän laitteella
- **React App** → toimii selaimessa
- **Offline** → toimii ilman internettiä
- **Fast** → nopea toiminta
