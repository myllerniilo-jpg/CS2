# UV Mask Preprocessing

## Yleiskatsaus (Overview)

Tämä järjestelmä laskee aseiden UV maskit **etukäteen** Python-skriptillä, jotta selain ei jumita suurten kuvien prosessoinnissa.

This system pre-calculates weapon UV masks using a Python script so the browser doesn't freeze when processing large images.

## Miten se toimii (How it works)

### 1. UV Sheet Analysis
- Python-skripti lukee UV map PNG-tiedostot `UVSheets/` kansiosta
- Analysoi jokaisen pikselin sijainnin ja värin
- Tunnistaa mihin aseen osaan kukin pikseli kuuluu (piippu, lipas, runko, jne.)

### 2. Run-Length Encoding (RLE)
- Tiivistää maskidatan tehokkaammin
- Tallentaa vain alueet joissa sama osa jatkuu
- Esim: `[1469673, 1]` = pikseli 1469673, pituus 1
- Esim: `[1469891, 41]` = pikseli 1469891, pituus 41

### 3. JSON Output
- Tallentaa maskit `masks/` kansioon JSON-muodossa
- Jokainen ase saa oman tiedoston (esim. `ak47.json`, `m4a4.json`)
- Selainsovellus lataa nämä suoraan ilman raskasta prosessointia

## Käyttö (Usage)

### Generointi (Generate masks)

```bash
# Asenna Pillow (ensimmäisellä kerralla)
python -m pip install Pillow

# Aja preprocessing-skripti
python preprocess-uv-maps.py
```

Skripti:
- Prosessoi kaikki UV mapit `UVSheets/` kansiosta
- Luo `masks/` kansion jos sitä ei ole
- Tallentaa JSON-tiedostot jokaiselle aseelle

### Sovelluksen käyttö (Using in app)

1. Käynnistä sovellus normaalisti: `START.bat`
2. Lataa ase 3D Previewiin
3. Valitse "Weapon Preset" jos automaattitunnistus ei toimi
4. Valitse "Target Areas" (Barrel, Magazine, Body, jne.)
5. Käytä Custom Pattern -toimintoa

**Järjestelmä:**
- Lataa automaattisesti oikean maskin kun ase ladataan
- Käyttää valmiiksi laskettuja maskeja pikselintarkasti
- EI jumita selainta (kaikki raskaat laskut tehty etukäteen)

## Tekninen rakenne (Technical structure)

### Mask JSON Format
```json
{
  "weapon": "ak47",
  "width": 2048,
  "height": 2048,
  "masks": {
    "barrel": [[1469673, 1], [1469685, 1], ...],
    "magazine": [[...], ...],
    "body": [[...], ...]
  },
  "stats": {
    "barrel": 145023,
    "magazine": 89456,
    "body": 234512
  }
}
```

### Aseen osien tunnistus (Part detection)

**Position-based heuristics:**
- **Barrel** - Oikea puoli (normX > 0.55)
- **Stock** - Vasen puoli (normX < 0.35)
- **Magazine** - Alakeskusta (normY < 0.45)
- **Sight** - Yläkeskusta (normY > 0.70)
- **Suppressor** - Oikea reuna (normX > 0.80)
- **Grip** - Alakeskusta (0.35 < normX < 0.55)
- **Body** - Keskialue (default)

## Edut (Benefits)

✅ **Nopea** - Ei raskasta prosessointia selaimessa
✅ **Tarkka** - Pikselintarkka maskaus UV mappeista
✅ **Skaalautuva** - Toimii kaikilla tekstuurikooilla
✅ **Välimuistitettu** - Maskit ladataan vain kerran
✅ **Offline** - Ei verkkoyhteyttä tarvita maskeille

## Lisää aseita (Add more weapons)

1. Lisää UV map PNG `UVSheets/` kansioon
2. Päivitä `preprocess-uv-maps.py` → `WEAPON_UV_MAP` dictionary
3. Aja `python preprocess-uv-maps.py` uudestaan
4. Uusi maski ilmestyy `masks/` kansioon automaattisesti

## Vianmääritys (Troubleshooting)

**"No pre-calculated mask found"**
- Ase ei ole listattu `WEAPON_UV_MAP` dictionaryssa
- UV map PNG puuttuu `UVSheets/` kansiosta
- Aja preprocessing-skripti uudestaan

**"Pattern goes to wrong areas"**
- Tarkista että oikea weapon preset on valittu
- Heuristiset säännöt eivät ehkä sovi tälle aseelle
- Säädä `identify_weapon_part()` funktiota scriptissä

**"Mask not loading"**
- Tarkista konsoli virheille
- Varmista että `masks/` kansio on oikeassa paikassa
- Tarkista että HTTP server on käynnissä (`START.bat`)

## Suorituskyky (Performance)

| Vanha järjestelmä | Uusi järjestelmä |
|-------------------|------------------|
| 4.2M pikseliä prosessoitavana | JSON-lataus ~100KB |
| Selain jäätyy 2-5 sekunniksi | Instant (<100ms) |
| RGB→HSL konversio per pikseli | Valmis RLE data |
| Geometry-based arvaus | Pikselintarkka maski |

## Tiedostot (Files)

- `preprocess-uv-maps.py` - Preprocessing-skripti
- `preprocess-uv-maps.js` - Node.js versio (ei toimi Windowsilla)
- `UVSheets/` - UV map PNG-tiedostot (input)
- `masks/` - Genroidut JSON-maskit (output)
- `app.js:loadMaskForWeapon()` - Maskin lataus sovelluksessa
- `app.js:createCanvasMask()` - RLE-datan purku canvakselle
- `app.js:applyPatternTargetClip()` - Maskin käyttö clippaukseen

---

**Muista:** Aja `python preprocess-uv-maps.py` aina kun lisäät uusia UV mappeja!
