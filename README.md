# CS2 Skin Creator 🎨

Ammattimainen nettipohjainen työkalu Counter-Strike 2 -aseiden skinien suunnitteluun. Sisältää runsaasti työkaluja ja mahdollisuuden ladata valmiit skinit Steam Workshoppiin.

## 🌟 Ominaisuudet

### 🖌️ Piirtotyökalut
- **Sivellin** - Vapaa piirtäminen säädettävällä koolla, läpinäkyvyydellä ja pehmyydellä
- **Pyyhekumi** - Tekstuurin poisto
- **Täyttö** - Väritäyttö valitulle alueelle
- **Suihke** - Spray-efekti
- **Liukuväri** - Gradient-työkalut

### 🎨 Värit & Efektit
- Kaksi väriä (ensisijainen & toissijainen) helpolla vaihdolla
- 10 valmista väripalettia
- Vapaa värinvalitsin
- Kulumis-, naarmu-, ja ruoste-efektit
- Metallisuus, hehku ja sumennus

### 🎭 Kuviot & Tekstuurit
- Naamiokuvio
- Tiikeri-kuviot
- Liekit
- Raidat, pisteet
- Hiilikuitu
- Kuusikulmiot
- Ja paljon muuta!

### 📋 Tasojärjestelmä
- Useita tasoja erikseen hallittavissa
- Tasojen näkyvyys ja läpinäkyvyys
- Helppo tasojen lisäys ja poisto

### 👁️ Esikatselut
- **2D-tila**: Suora tekstuurin muokkaus 2048x2048 resoluutiolla
- **3D-tila**: Reaaliaikainen 3D-esikatselu valitulla aseella
- **Jaettu näkymä**: Molemmat näkymät yhtä aikaa

### 🔫 Asemallituki
Sisältää 35 ase mallia:
- **Pistolit**: Glock-18, USP-S, P2000, Desert Eagle, R8 Revolver, jne.
- **Kiväärit**: AK-47, M4A4, M4A1-S, AWP, jne.
- **SMG**: MP9, MAC-10, P90, MP7, jne.
- **Haulikot**: Nova, XM1014, MAG-7, Sawed-Off
- **Konekiväärit**: M249, Negev

### 🎨 Valmiit Skin-tyylit
Mukana malliset legendaariset skin-tyylit:
- Asiimov
- Redline
- Fade
- Tiger Tooth
- Vulcan
- Neon Rider

### 💾 Lataa & Tallenna
- **PNG-vienti**: Lataa tekstuuri PNG-muodossa
- **VTF-vienti**: Ohjeet VTF-muunnokseen
- **Workshop-paketti**: Kaikki tiedot Steam Workshop -julkaisuun

### ⌨️ Pikanäppäimet
- `Ctrl + Z` - Kumoa
- `Ctrl + Y` - Tee uudelleen
- `Välilyönti` - Vaihda 2D/3D/Jaettu näkymä
- `Shift + piirto` - Suorat viivat

## 🚀 Käyttöönotto

1. Avaa `index.html` selaimessa
2. Valitse ase listasta
3. Aloita suunnittelu työkaluilla!

### Vaatimukset
- Moderni selain (Chrome, Firefox, Edge)
- WebGL-tuki 3D-näkymää varten
- Suositeltu resoluutio: 1920x1080 tai suurempi

## 📖 Käyttöohjeet

### Peruspiirtäminen
1. Valitse **Ase** pudotusvalikosta
2. Valitse **Piirtotyökalu** (sivellin, pyyhekumi, jne.)
3. Säädä **Koko** ja **Läpinäkyvyys**
4. Valitse **Väri**
5. Piirrä kanvaasille hiirellä tai kosketusnäytöllä

### Efektien lisääminen
1. Piirrä pohjavärit
2. Valitse efekti (kuluminen, naarmut, metallisuus)
3. Efekti lisätään koko tekstuuriin

### Kuvioiden käyttö
1. Valitse kuvio pudotusvalikosta
2. Klikkaa "Lisää kuvio"
3. Kuvio piirretään aktiiviselle tasolle

### 3D-Esikatselu
1. Klikkaa "🎮 3D Esikatselu"
2. Pyöritä ase hiirellä
3. Zoomaa hiiren rullalla
4. Tekstuuri päivittyy reaaliajassa

### Vienti Steam Workshoppiin
1. Suunnittele skini
2. Klikkaa "🚀 Workshop-paketti"
3. Lataa PNG-tiedosto
4. Käytä **VTFEdit** muuntaaksesi PNG → VTF
5. Luo VMT-materiaali-tiedosto
6. Lataa Steam Workshoppiin

## 🛠️ Tekninen toteutus

### Teknologiat
- **HTML5 Canvas** - 2D tekstuurin piirtäminen
- **Three.js** - 3D-mallinnus ja renderöinti
- **WebGL** - Laitteistokiihdytetty grafiikka
- **Vanilla JavaScript** - Ei ulkoisia riippuvuuksia (paitsi Three.js)

### Rakenne
```
CS2 SKIN CREATOR/
├── index.html          # Pääsivu
├── styles.css          # Tyylit
├── app.js              # Pääsovellus
├── models/             # 3D asemallit (.obj)
│   ├── weapon_rif_ak47.obj
│   ├── weapon_snip_awp.obj
│   └── ... (35 asetta)
└── README.md           # Tämä tiedosto
```

### Ominaisuudet koodissa
- **Tasojen hallinta**: Useita piirrostasoja alpha-blendingilla
- **Undo/Redo**: 50 toiminnon historia
- **Suorituskyky**: Optimoitu 2048x2048 tekstuureille
- **Responsiivinen**: Toimii eri näyttöko'oilla
- **Touch-tuki**: Toimii tableteilla ja kosketusnäytöillä

## 🎯 Tulevat ominaisuudet (TODO)

- [ ] Symmetria-työkalu
- [ ] Perspektiivipiirtäminen
- [ ] Lisää valmiita taroja/tarroja
- [ ] Tekstityökalu parannettu fonteilla
- [ ] Projektin tallennus ja lataus (JSON)
- [ ] UV-mapping editori
- [ ] Batch-käsittely useille aseille
- [ ] Yhteisöintegraatio (jaa skinit)
- [ ] AI-avusteiset kuviot

## 💡 Vinkit

### Hyvän Skinin luominen
1. **Aloita pohjaväristä** - Käytä täyttöä tai liukuväriä
2. **Lisää yksityiskohtia** - Käytä siveltimen eri kokoja
3. **Käytä tasoja** - Erota eri elementit omille tasoilleen
4. **Kokeile efektejä** - Wear ja scratch antavat realistisen ilmeen
5. **Testaa 3D:ssä** - Tarkista, miltä skini näyttää aseessa
6. **Käytä viitettä** - Tutki olemassa olevia legendary-skinejä

### Suorituskyky
- 2048x2048 on hyvä resoluutio laadukkaalle työlle
- Käytä tasoja vain tarvittaessa
- Tallenna välillä (vie PNG varmuuskopioksi)
- Sulje muut sovellukset raskaassa 3D-esikatslussa

## 🐛 Tiedossa olevat ongelmat

- VTF-vienti vaatii ulkoisen työkalun (VTFEdit)
- Jotkiasemallit saattavat tarvita UV-mappingin säätöä
- Suuret siveltimen koot voivat olla hitaita vanhemmilla koneilla

## 📝 Lisenssi

Tämä projekti on tehty harrastuksena ja opetuskäyttöön. 
- Asemallit kuuluvat Valve Corporationille
- Koodi on vapaasti käytettävissä ja muokattavissa

## 🤝 Tuki

Jos kohtaat ongelmia:
1. Päivitä selain
2. Tyhjennä selaimen välimuisti
3. Tarkista konsoli (F12) virheviestit
4. Varmista että WebGL toimii: [https://get.webgl.org/](https://get.webgl.org/)

## 🎮 CS2 Workshop-ohjeet

### VTF-muunnos
1. Lataa VTFEdit: [https://nemstools.github.io/pages/VTFLib-Download.html](https://nemstools.github.io/pages/VTFLib-Download.html)
2. Avaa PNG VTFEditissä
3. Tools → Convert to VTF
4. Tallenna .vtf-tiedostona

### VMT-tiedoston luonti
Luo tekstitiedosto `.vmt` esim. `ak47_custom.vmt`:
```
"VertexLitGeneric"
{
    "$basetexture" "models/weapons/customization/paints/ak47_custom"
    "$phong" "1"
    "$phongboost" "8"
    "$phongexponent" "128"
    "$phongfresnelranges" "[0.5 0.5 1]"
}
```

### Workshop-lähetys
1. Avaa CS2
2. Päävalikko → Workshop
3. Lataa VTF ja VMT
4. Täytä kuvaus ja tagit
5. Lähetä!

---

**Tehty ❤️:llä CS2-yhteisölle**

Onnea skinien suunnitteluun! 🎨🔫
