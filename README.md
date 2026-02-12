# ⚽ Mládež KP App

Moderní trenérská webová aplikace pro mládežnický fotbal.

Aplikace je postavena jako **PWA (Progressive Web App)**, funguje online i offline a umožňuje trenérům pracovat s taktikou, sestavami, poznámkami a cvičeními.

🌐 Live verze:
[https://faltas76-prog.github.io/mladez-kp-app/](https://faltas76-prog.github.io/mladez-kp-app/)

---

# 🚀 Funkce aplikace

## 🏠 Hlavní stránka

* Přehled navigace
* Odkaz na TacticalPad
* Odkaz na Match Lineup
* Odkaz na Offline klienta

---

## 🎯 TacticalPad

Interaktivní kreslení tréninkových cvičení.

Funkce:

* Kreslení (tužka)
* Mazání
* Přidávání objektů (hráči, kužely, míče, branky)
* Responzivní hřiště
* Reset plochy
* Uložení cvičení

---

## ⚽ Match Lineup (Rozestavení)

Grafické vytváření zápasové sestavy.

Funkce:

* Výběr rozestavení (1-4-4-2, 1-4-3-3, 1-4-2-3-1 atd.)
* Automatické vytvoření 11 hráčů (včetně GK)
* Drag & drop hráčů po hřišti
* Lavička náhradníků
* Editace jména hráče přes modal okno
* Uložení sestavy (localStorage)
* Export PNG
* Export PDF
* Responzivní zobrazení (PC / tablet / mobil)

---

## 📦 Offline klient

Slouží pro ukládání:

* Tréninkových cvičení
* Poznámek trenéra

Technologie:

* IndexedDB
* Offline-first architektura

---

# 📱 PWA Podpora

Aplikace je plně instalovatelná.

Funkce:

* Instalace do mobilu (Android / iOS)
* Instalace do desktopu
* Offline režim
* Service Worker cache
* Manifest.json konfigurace

Instalace:

1. Otevřít aplikaci v prohlížeči
2. Zvolit „Install App“ nebo „Přidat na plochu“

---

# 🧠 Použité technologie

* HTML5
* CSS3 (responzivní layout, aspect-ratio)
* Vanilla JavaScript
* IndexedDB
* LocalStorage
* Service Worker
* Manifest.json
* html2canvas (export PNG)
* jsPDF (export PDF)

---

# 📂 Struktura projektu

```
mladez-kp-app/
│
├── index.html
├── tactical.html
├── lineup.html
├── manifest.json
├── sw.js
│
├── js/
│   ├── tactical.js
│   └── lineup.js (pokud oddělen)
│
├── offline/
│   ├── index.html
│   ├── db.js
│   └── sync.js
│
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

# 💾 Ukládání dat

| Funkce          | Úložiště       |
| --------------- | -------------- |
| Sestava         | localStorage   |
| Offline cvičení | IndexedDB      |
| Cache aplikace  | Service Worker |

---

# 🔄 Aktualizace PWA

Při změně kódu je nutné:

1. Změnit verzi v `sw.js`

```
const CACHE_NAME = "mladez-kp-app-vX";
```

2. Pushnout změny na GitHub
3. Hard refresh (Ctrl + Shift + R)

---

# 🛠 Budoucí rozšíření

* Přihlášení trenérů (Firebase Auth)
* Cloud sync sestav
* Sdílení sestav
* Statistiky hráčů
* Export s logem klubu
* Taktické šipky a animace

---

# 👤 Autor

Projekt vytvořen pro trenérské využití mládeže KP.

---

# 📄 Licence

Projekt je určen pro vzdělávací a trenérské účely.

---

⚽ "Moderní nástroj pro moderní trenéry."
