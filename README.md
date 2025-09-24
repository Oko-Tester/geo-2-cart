# 🌍 Geo2Cart - WGS84 ⇄ ECEF Koordinatenkonverter

Eine moderne, minimalistische Web-Anwendung zur bidirektionalen Konvertierung zwischen geodätischen WGS84-Koordinaten und kartesischen ECEF (Earth-Centered, Earth-Fixed) Koordinaten.

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🔄 **Bidirektionale Konvertierung**: Geodätisch → Cartesian3 und Cartesian3 → Geodätisch
- 🎯 **WGS84-Standard**: Präzise Berechnungen mit offiziellen WGS84-Ellipsoid-Parametern
- 📐 **Flexible Eingabe**: Unterstützung für Grad und Radiant
- 📊 **Einstellbare Genauigkeit**: 3, 6 oder 9 Nachkommastellen
- 📋 **JSON-Export**: Ein-Klick-Kopieren der Ergebnisse
- 🎨 **Modernes UI**: Responsives, barrierefreies Design
- ⚡ **Schnell & Leichtgewichtig**: Keine externen Abhängigkeiten außer React
- 🧮 **Numerisch stabil**: Bowring-Methode für robuste Rückkonvertierung

## 🚀 Live Demo

[🌐 Geo2Cart Live](https://Oko-Tester.github.io/geo2cart)

## 📦 Installation

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Lokale Installation

```bash
# Repository klonen
git clone https://github.com/Oko-Tester/geo-2-cart.git
cd geo2cart

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung läuft dann unter `http://localhost:5173`

## 🛠️ Verfügbare Scripts

```bash
npm run dev      # Startet Entwicklungsserver
npm run build    # Erstellt Production Build
npm run preview  # Vorschau des Production Builds
npm run lint     # ESLint Code-Überprüfung
```

## 📐 Mathematische Grundlagen

### WGS84 Parameter

- **Semi-major axis (a)**: 6378137.0 m
- **Flattening (f)**: 1/298.257223563
- **First eccentricity² (e²)**: 2f - f²

### Konvertierungsformeln

#### Geodätisch → ECEF

```
N = a / √(1 - e² × sin²(φ))
x = (N + h) × cos(φ) × cos(λ)
y = (N + h) × cos(φ) × sin(λ)
z = ((1 - e²) × N + h) × sin(φ)
```

#### ECEF → Geodätisch (Bowring-Methode)

Iterative Lösung für verbesserte numerische Stabilität, besonders nahe der Pole.

## 🎯 Verwendung

### Geodätisch → Cartesian3

1. Wähle den Modus "Geodätisch → Cartesian3"
2. Gib Latitude, Longitude und Höhe ein
3. Optional: Aktiviere "Eingaben in Radiant"
4. Klicke "Umrechnen"

### Cartesian3 → Geodätisch

1. Wähle den Modus "Cartesian3 → Geodätisch"
2. Gib X, Y, Z Koordinaten in Metern ein
3. Klicke "Umrechnen"

### Preset-Buttons

- **Nullpunkt**: (0°, 0°, 0m) - Äquator/Nullmeridian
- **Neuburg**: (48.7823°, 11.9601°, 400m) - Beispielkoordinaten

## 🧪 Testfälle

| Geodätisch                | ECEF                                  |
| ------------------------- | ------------------------------------- |
| lat=0°, lon=0°, h=0m      | x=6378137.0, y=0, z=0                 |
| lat=90°, lon=0°, h=0m     | x≈0, y≈0, z=6356752.3                 |
| lat=45°, lon=45°, h=1000m | x=3194469.1, y=3194469.1, z=4487419.1 |

## 🌐 Deployment

### GitHub Pages

```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --dir=dist --prod
```

## 🏗️ Technologie-Stack

- **Frontend**: React 19.1.1 mit TypeScript
- **Build Tool**: Vite 7.1.7
- **Styling**: Inline CSS (keine externen CSS-Frameworks)
- **Mathematik**: Native JavaScript Math-Funktionen
- **Icons**: Inline SVG

## 📝 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei

## 🤝 Contributing

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue für Verbesserungsvorschläge.

1. Fork das Projekt
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 🐛 Bekannte Einschränkungen

- Extreme Höhenwerte (>100km) können zu leichten Ungenauigkeiten führen
- Die Anwendung nutzt das WGS84-Ellipsoid; andere Referenzsysteme werden nicht unterstützt

## 📚 Weiterführende Ressourcen

- [WGS84 Wikipedia](https://de.wikipedia.org/wiki/World_Geodetic_System_1984)
- [ECEF Koordinatensystem](https://de.wikipedia.org/wiki/ECEF)
- [Geodätische Koordinaten](https://de.wikipedia.org/wiki/Geographische_Koordinaten)

## 👤 Autor

**[Oko-Tester]**

- GitHub: [@Oko-Tester](https://github.com/Oko-Tester)
- Webseite: [Geo2Cart](https://geo2cart.okotester.de)

## 🙏 Danksagungen

- WGS84 Standard durch das National Geospatial-Intelligence Agency
- React Team für das großartige Framework
- Vite für blitzschnelles Build-Tooling

---

⭐ Wenn dir dieses Projekt gefällt, gib ihm einen Stern auf GitHub!
