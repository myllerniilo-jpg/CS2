# 🚀 Steam Workshop -julkaisuopas

## Täydellinen opas skinisi julkaisemiseen CS2 Steam Workshopissa

---

## 📋 Vaihe 1: Valmistelu

### Tarvitset:
- ✅ Valmis PNG-tekstuuri (ladattu CS2 Skin Creatorista)
- ✅ VTFEdit-ohjelma
- ✅ Steam-tili
- ✅ Counter-Strike 2 peli
- ✅ Tekstieditori (Notepad++)

---

## 🛠️ Vaihe 2: Lataa tarvittavat työkalut

### VTFEdit
**Lataa:** https://nemstools.github.io/pages/VTFLib-Download.html

**Asennus:**
1. Lataa VTFEdit 1.3.3 (tai uudempi)
2. Asenna ohjelma
3. Käynnistä VTFEdit

### Notepad++ (valinnainen mutta suositeltava)
**Lataa:** https://notepad-plus-plus.org/

---

## 🎨 Vaihe 3: PNG → VTF muunnos

### VTFEditissä:

1. **Avaa PNG-tekstuuri**
   - File → Open
   - Valitse CS2 Skin Creatorista ladattu PNG

2. **Muunna VTF:ksi**
   - File → Save As
   - Tallenna nimellä esim: `ak47_mycustomskin.vtf`
   - Valitse sijainti (esim. Desktop)

3. **VTF-asetukset** (suositellut):
   ```
   Format: DXT5
   Mipmap: Auto Generate
   Size: 2048 x 2048 (tai alkuperäinen koko)
   Quality: High
   ```

4. **Tallenna**
   - Klikkaa "Save"
   - VTF-tiedosto on nyt valmis!

---

## 📝 Vaihe 4: VMT-tiedoston luonti

VMT (Valve Material Type) määrittää miten tekstuuri renderöidään pelissä.

### Perus VMT-pohja:

Luo uusi tekstitiedosto ja nimeä se samalla nimellä kuin VTF, mutta `.vmt` päätteellä.

**Esimerkki: `ak47_mycustomskin.vmt`**

```vmt
"VertexLitGeneric"
{
    "$basetexture" "models/weapons/customization/paints/custom/ak47_mycustomskin"
    
    "$phong" "1"
    "$phongboost" "8"
    "$phongexponent" "128"
    "$phongfresnelranges" "[0.5 0.5 1]"
    "$phongalbedoboost" "20"
    
    "$rimlight" "1"
    "$rimlightexponent" "4"
    "$rimlightboost" ".5"
}
```

### VMT-parametrit selitetty:

| Parametri | Kuvaus | Arvo |
|-----------|--------|------|
| `$basetexture` | Polku tekstuuriin | Tekstuurin nimi ilman .vtf |
| `$phong` | Phong-varjostus | 0 tai 1 |
| `$phongboost` | Kirkkauden määrä | 0-50 |
| `$phongexponent` | Kiillon määrä | 1-256 |
| `$phongfresnelranges` | Kulmariippuvainen kiilto | [min mid max] |
| `$rimlight` | Reunavalo | 0 tai 1 |
| `$rimlightboost` | Reunavalon voimakkuus | 0-10 |

### Erilaisia VMT-tyylejä:

**Matala kiilto (Worn-look):**
```vmt
"VertexLitGeneric"
{
    "$basetexture" "models/weapons/customization/paints/custom/myskin"
    "$phong" "1"
    "$phongboost" "2"
    "$phongexponent" "32"
    "$phongfresnelranges" "[0.3 0.6 1]"
}
```

**Korkea kiilto (Factory New):**
```vmt
"VertexLitGeneric"
{
    "$basetexture" "models/weapons/customization/paints/custom/myskin"
    "$phong" "1"
    "$phongboost" "25"
    "$phongexponent" "255"
    "$phongfresnelranges" "[0.7 0.8 1]"
    "$rimlight" "1"
    "$rimlightexponent" "10"
    "$rimlightboost" "2"
}
```

**Metallic:**
```vmt
"VertexLitGeneric"
{
    "$basetexture" "models/weapons/customization/paints/custom/myskin"
    "$phong" "1"
    "$phongboost" "15"
    "$phongexponent" "128"
    "$phongfresnelranges" "[0.5 0.5 1]"
    "$envmap" "env_cubemap"
    "$envmaptint" "[.3 .3 .3]"
}
```

---

## 📦 Vaihe 5: Tiedostojen organisointi

### Luo kansiorakenne:

```
MyCS2Skin/
├── materials/
│   └── models/
│       └── weapons/
│           └── customization/
│               └── paints/
│                   └── custom/
│                       ├── ak47_mycustomskin.vtf
│                       └── ak47_mycustomskin.vmt
└── scripts/
    └── ak47_mycustomskin.txt (valinnainen)
```

---

## 🎮 Vaihe 6: Testaus CS2:ssa

### Paikallinen testaus:

1. **Kopioi tiedostot:**
   ```
   Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/
   ```

2. **Käynnistä CS2**

3. **Avaa konsoli** (` tai ~)

4. **Lataa skin:**
   ```
   sv_cheats 1
   mp_drop_knife_enable 1
   give weapon_ak47
   ```

5. **Jos ei näy, kokeile:**
   ```
   mat_reloadallmaterials
   ```

---

## 🚀 Vaihe 7: Workshop-julkaisu

### Steam Workshop Tool -käyttö:

1. **Avaa CS2**

2. **Päävalikko → Workshop**

3. **"Lähetä uusi kohde"** 

4. **Täytä tiedot:**
   - **Nimi:** Skinisi nimi (esim. "AK-47 | Dragon Fire")
   - **Kuvaus:** Kerro skinistä
   - **Esikatselukuva:** Ota screenshot 3D-näkymästä
   - **Tyyppi:** Weapon Finish
   - **Ase:** Valitse ase

5. **Lisää tiedostot:**
   - Valitse VTF-tiedosto
   - Valitse VMT-tiedosto

6. **Tagit:**
   - Lisää kuvaavia tageja (esim. "colorful", "minimal", "military")

7. **Käyttöehdot:**
   - Hyväksy Steamin käyttöehdot
   - Vahvista että skini on oma luomuksesi

8. **Julkaise!**
   - Klikkaa "Submit"
   - Skini näkyy nyt Workshopissa!

---

## 📸 Vaihe 8: Parhaat esikatselukuvat

### Vinkit hyvään esikatselukuvaan:

1. **Käytä 3D-näkymää**
   - Pyöritä ase parhaaseen kulmaan
   - Varmista että tekstuuri näkyy hyvin

2. **Valaistus**
   - Valitse "Studio" tai "Bright" valaistus
   - Muuta tausta tummaksi kontrastia varten

3. **Screenshot**
   - Paina `F12` Steamissa ottaaksesi kuvan
   - Tai käytä `PrintScreen` → Liitä Paint/Photoshop

4. **Muokkaus (valinnainen)**
   - Rajaa kuva
   - Lisää logo tai teksti
   - Suositeltava koko: 512x512 tai 1920x1080

---

## 💡 Workshop-optimointi

### Näkyvyyden parantaminen:

**Hyvä otsikko:**
- ❌ Huono: "my skin"
- ✅ Hyvä: "AK-47 | Crimson Dragon - Battle-Scarred"

**Kuvaava teksti:**
```markdown
# AK-47 | Crimson Dragon

Fierce red and black dragon design with metallic accents.

**Features:**
- High-quality 2048x2048 texture
- Custom wear patterns
- Phong shading for realistic look
- Available in all wear levels

**Inspiration:**
Inspired by traditional Asian dragon art combined with modern 
military aesthetics.

Rate and favorite if you like it! ⭐
```

**Tagit (max 4-5):**
- Värit: `red`, `black`, `gold`, `purple`
- Tyyli: `minimal`, `colorful`, `military`, `fantasy`
- Teema: `dragon`, `tiger`, `flames`, `camo`

---

## 📊 Vaihe 9: Mainostaminen

### Jaa skini:

1. **Reddit**
   - r/GlobalOffensive
   - r/CS2
   - Muista lue säännöt!

2. **Twitter/X**
   - Hashtags: #CS2 #SteamWorkshop #CSGOSkins

3. **Discord**
   - CS2-yhteisöt
   - Skin design -ryhmät

4. **YouTube**
   - Tee showcase-video
   - Näytä skin pelitilanteissa

---

## ⚠️ Tärkeät muistutukset

### ❌ ÄLÄ:
- Kopioi muiden skinejä
- Käytä copyrightatuja kuvia/logoja
- Lähetä keskeneräisiä töitä
- Spämmiä Workshoppia

### ✅ TEE:
- Luo originaali sisältö
- Testaa ennen julkaisua
- Päivitä parannuksia
- Vastaa kommentteihin
- Ole kärsivällinen - hyvät skinit vievät aikaa!

---

## 🏆 Millaisista skineistä Valve tykkää?

### Ominaisuudet jotka lisäävät hyväksymisen todennäköisyyttä:

1. **Originaliteit**
   - Ainutlaatuinen idea
   - Ei kopioita olemassa olevista

2. **Laatu**
   - Korkearesoluutioiset tekstuurit
   - Huolellinen suunnittelu
   - Toimii kaikissa wear-tasoissa

3. **Teema**
   - Sopii CS2:n estetiikkaan
   - Johdonmukainen värimaailma
   - Hyvä kontrasti

4. **Tekninen toteutus**
   - Toimiva VMT
   - Oikea UV-mapping
   - Optimoidut tiedostokoot

---

## 📈 Tilastot ja seuranta

### Workshop-sivullasi näet:

- **Näyttökerrat** - Kuinka monta käynyt
- **Favoritesin** - Kuinka moni tykkäsi
- **Kommentit** - Palaute yhteisöltä
- **Arviot** - Tähtiarvostelut

### Päivitä regulaarisesti:
- Vastaa palautteeseen
- Korjaa bugeja
- Lisää parempia kuvia
- Päivitä kuvausta

---

## 🎯 Tavoitteet

### Realistiset tavoitteet:

**Viikko 1:**
- 100-500 näyttökertaa
- 10-50 favoritea
- Muutamia kommentteja

**Kuukausi 1:**
- 1,000+ näyttökertaa
- 100+ favoritea
- Aktiivista keskustelua

**Jos skini on todella hyvä:**
- 10,000+ näyttökertaa
- 1,000+ favoritea
- Mahdollisuus pelin lisäämiseen!

---

## 🎊 Jos skini pääsee peliin!

Jos Valve valitsee skinisi:
1. Saat sähköpostin
2. Allekirjoitat sopimuksen
3. Saat royaltyja jokaisesta myynnistä
4. Skinisi on nyt virallisesti CS2:ssa!

**Keskimääräiset tulot:**
- Suosituista skineistä: $10,000 - $100,000+
- Covert/Legendary-skineistä: $100,000+
- Knife-skineistä: $500,000+

---

## 📚 Lisäresurssit

### Oppaat:
- CS2 Workshop FAQ: https://steamcommunity.com/workshop/discussions/?appid=730
- Valve Developer Wiki: https://developer.valvesoftware.com/

### Yhteisö:
- r/CSWorkshop
- GameBanana CS2
- Polycount Forums

### Inspiraatio:
- Top-rated Workshop-skinit
- Community Cases
- Operation-kokoelmat

---

## ✅ Tarkistuslista ennen julkaisua

```
[ ] PNG-tekstuuri valmis ja testattu CS2 Skin Creatorissa
[ ] VTF-tiedosto luotu VTFEditillä
[ ] VMT-tiedosto kirjoitettu oikein
[ ] Tiedostorakenne oikea
[ ] Testattu paikallisesti CS2:ssa
[ ] Screenshot/esikatselukuva otettu
[ ] Otsikko ja kuvaus kirjoitettu
[ ] Tagit valittu
[ ] Varmistettu originaliteetti
[ ] Luettu Workshop-säännöt
[ ] Valmis julkaisuun!
```

---

**Onnea skinisi kanssa! Toivottavasti se pääsee peliin! 🎮✨**

*Tehty CS2 Skin Creator -työkalulla | 2024*
