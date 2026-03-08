# 🔧 Ongelmanratkaisu - CS2 Skin Creator

## Yleisimmät ongelmat ja ratkaisut

---

## 🖥️ Sovellus ei lataudu

### Ongelma: Sivu on tyhjä tai lataa loputtomasti

**Ratkaisut:**

1. **Tarkista selain**
   - ✅ Käytä modernia selainta: Chrome, Firefox, Edge
   - ❌ Internet Explorer EI toimi
   - Päivitä selain uusimpaan versioon

2. **Tyhjennä välimuisti**
   ```
   Chrome: Ctrl + Shift + Delete
   Firefox: Ctrl + Shift + Delete
   Edge: Ctrl + Shift + Delete
   ```
   - Valitse "Cached images and files"
   - Klikkaa "Clear data"

3. **Tarkista konsoli**
   - Paina `F12`
   - Avaa "Console" -välilehti
   - Etsi punaiset virheviestit
   - Screenshot ja raportoi virhe

4. **Tarkista tiedostopolut**
   - Varmista että kaikki tiedostot ovat oikeissa paikoissa:
   ```
   CS2 SKIN CREATOR/
   ├── index.html
   ├── styles.css
   ├── app.js
   └── models/
       └── [.obj tiedostot]
   ```

---

## 3️⃣ 3D-näkymä ei toimi

### Ongelma: Musta ruutu tai "WebGL not supported"

**Ratkaisut:**

1. **Testaa WebGL-tuki**
   - Avaa: https://get.webgl.org/
   - Jos näet pyörivän kuution → WebGL toimii
   - Jos ei → jatka alla oleviin ratkaisuihin

2. **Päivitä näytönohjaimet**
   - Windows: Device Manager → Display adapters → Update
   - Tai lataa uusimmat ajurit valmistajan sivuilta:
     - NVIDIA: https://www.nvidia.com/drivers
     - AMD: https://www.amd.com/drivers
     - Intel: https://www.intel.com/content/www/us/en/download-center/home.html

3. **Aktivoi laitteistokiihdytys**
   
   **Chrome:**
   - Settings → Advanced → System
   - Aktivoi "Use hardware acceleration when available"
   - Käynnistä Chrome uudelleen

   **Firefox:**
   - about:config
   - Etsi `webgl.force-enabled`
   - Aseta `true`

4. **Kokeile toista selainta**
   - Jos Chrome ei toimi, kokeile Firefoxia
   - Tai päinvastoin

---

## 🖌️ Piirtäminen ei toimi

### Ongelma: Hiiri ei piirrä tai viivat ovat oudon näköisiä

**Ratkaisut:**

1. **Valitse oikea työkalu**
   - Varmista että sivellin (🖌️) on valittuna
   - Se pitäisi olla oranssi/korostettu

2. **Tarkista siveltimen koko**
   - Jos koko on 1px → todella pieni
   - Nosta kokoa 20-50px

3. **Tarkista läpinäkyvyys**
   - Jos läpinäkyvyys on 0% → et näe mitään
   - Nosta 100%:iin

4. **Päivitä sivu**
   - `F5` tai `Ctrl + R`
   - Kokeile uudelleen

5. **Testaa eri alueella**
   - Kokeile piirtää eri paikassa
   - Joskus näyttö saattaa olla zoomattuna

---

## 🔫 Asemalli ei lataudu

### Ongelma: 3D-näkymässä ei näy asetta

**Ratkaisut:**

1. **Tarkista models-kansio**
   - Varmista että `models/` kansio on olemassa
   - Siellä pitäisi olla 35 `.obj` tiedostoa

2. **Purkitko ZIP-tiedoston?**
   - Tarkista että `cs2_weapon_model_geometry.zip` on purettu
   - PowerShell komento:
   ```powershell
   Expand-Archive -Path "cs2_weapon_model_geometry.zip" -DestinationPath "models"
   ```

3. **Tarkista konsolista virheviesti**
   - `F12` → Console
   - Etsi "Error loading weapon" tai "404" virheitä

4. **Kokeile toista asetta**
   - Valitse eri ase valikosta
   - Jos jokin toimii, ongelma on tietyssä mallissa

5. **Tarkista tiedostopolut**
   - Aseiden tulisi olla:
   ```
   models/weapon_rif_ak47.obj
   models/weapon_snip_awp.obj
   jne...
   ```

---

## 💾 Tallennus/Lataus ei toimi

### Ongelma: "Lataa PNG" ei tee mitään

**Ratkaisut:**

1. **Salli lataukset**
   - Selain saattaa estää automaattiset lataukset
   - Klikkaa "Salli" selaimen yläpalkissa

2. **Tarkista lataukset-kansio**
   - Tiedosto saattaa olla ladannut automaattisesti
   - Windows: `C:\Users\[käyttäjä]\Downloads`

3. **Kokeila oikealla klikkauksella**
   - Piirrä jotain kanvaasille
   - Oikea klikkaus kanvaasilla → "Save Image As"

4. **Canvas on tyhjä**
   - Jos et ole piirtänyt mitään
   - Tai taso on läpinäkyvä
   - PNG voi olla täysin tyhjä/läpinäkyvä

---

## 🎨 Värit eivät näy oikein

### Ongelma: Väri näyttää erilaiselta kuin valittu

**Ratkaisut:**

1. **Tarkista läpinäkyvyys**
   - Matala läpinäkyvyys tekee väristä vaaleamman
   - Nosta 100%:iin

2. **Tarkista taustaväri**
   - Jos tausta on sama väri kuin piirrät
   - Vaihda taustaväriä nähdäksesi paremmin

3. **Tarkista näytön kalibrointi**
   - Tietokoneen näyttö voi näyttää värit eri tavalla
   - Vertaa toisella laitteella/näytöllä

4. **3D vs 2D värieroavaisuus**
   - Värit näyttävät eri 3D-varjostuksen vuoksi
   - Tämä on normaalia
   - Säädä phong/lighting asetuksia VMT-tiedostossa

---

## ⚡ Sovellus on hidas

### Ongelma: Piirtäminen lagaa tai näyttö päivittyy hitaasti

**Ratkaisut:**

1. **Pienennä siveltimen kokoa**
   - Suuret sivellinkoot (80-100px) ovat raskaampia
   - Käytä 20-50px päivittäiseen piirtämiseen

2. **Sulje ylimääräiset välilehdet**
   - Selainessa vain CS2 Skin Creator
   - Sulje muut ohjelmat

3. **Vähennä tasojen määrää**
   - Yhdistä tasot jos mahdollista
   - Poista tyhjät tasot

4. **2D-tila on nopeampi**
   - Jos 3D-tila lagaa
   - Työskentele 2D:ssä
   - Tarkista 3D:ssä vain tarvittaessa

5. **Päivitä sivu säännöllisesti**
   - `F5` tyhjentää muistin
   - Tallenna PNG ensin!

6. **Pienennä resoluutiota (ei suositella)**
   - Voit muokata `app.js` tiedostossa
   - Vaihda 2048 → 1024
   - Huom: pienempi laatu

---

## 🔄 Undo/Redo ei toimi

### Ongelma: Kumoa ei peru muutosta

**Ratkaisut:**

1. **Tarkista historia**
   - Undo toimii vain 50 viimeiseen muutokseen
   - Jos teit enemmän, vanhimmat unohtuvat

2. **Käytä näppäimistöä**
   - `Ctrl + Z` kumoa
   - `Ctrl + Y` tee uudelleen
   - Nappien klikkaus saattaa bugata

3. **Tallenna PNG varmuuskopioksi**
   - Tee näin usein!
   - Voit aina ladata takaisin

---

## 📱 Touch/kosketusnäyttö ei toimi

### Ongelma: Tabletti/touch-screen ei piirrä

**Ratkaisut:**

1. **Päivitä selain**
   - Uusimmat versiot tukevat paremmin touchissa

2. **Kokeile touch-tilaa**
   - Chrome DevTools (F12)
   - Toggle device toolbar
   - Valitse tablet/mobile

3. **Käytä USB-hiirtä**
   - Yhdistä hiiri tablettiisi
   - Toimii varmemmin

---

## 🖼️ VMT/VTF -ongelmat

### Ongelma: Skini ei näy CS2:ssa

**Ratkaisut:**

1. **Tarkista VMT-polku**
   ```
   "$basetexture" "models/weapons/customization/paints/custom/NIMI"
   ```
   - NIMI ilman .vtf päätettä!

2. **Tiedostojen nimet täsmää**
   - Jos VTF: `ak47_myskin.vtf`
   - VMT: `ak47_myskin.vmt`
   - VMT:ssä: `ak47_myskin` (ilman päätettä)

3. **Tiedostopolku oikein**
   ```
   csgo/materials/models/weapons/customization/paints/custom/
   ```

4. **Päivitä materiaalit**
   - CS2 konsolissa:
   ```
   mat_reloadallmaterials
   ```

5. **Testaa yksinkertainen VMT ensin**
   ```vmt
   "VertexLitGeneric"
   {
       "$basetexture" "models/weapons/customization/paints/custom/myskin"
   }
   ```

---

## 🌐 Workshop-julkaisu epäonnistuu

### Ongelma: Steam Workshop ei hyväksy

**Ratkaisut:**

1. **Tarkista tiedostokoko**
   - VTF ei saa olla liian suuri (max 2048x2048)
   - Pakkaa jos tarvis (DXT5)

2. **Tarkista tiedostomuoto**
   - Pitää olla .vtf ja .vmt
   - Ei PNG:itä suoraan!

3. **Lue virheilmoitus**
   - Steam näyttää tarkan virheen
   - Googlaa virhekoodi

4. **Tarkista Workshop-oikeudet**
   - Steam-tili pitää olla vahvistettu
   - Ei VAC-banneja

---

## 🆘 Mitään ei toimi!

### Äärimmäiset toimenpiteet:

1. **Aloita alusta**
   - Lataa kaikki tiedostot uudelleen
   - Pura ZIP uudelleen
   - Avaa selaimessa

2. **Kokeile eri tietokoneella**
   - Saattaa olla laitteistorajoite
   - Vanha kone/näytönohjain

3. **Kysy apua**
   - Reddit: r/CS2
   - Discord: CS2 -yhteisöt
   - Steam-foorumit

4. **Raportoi bugi**
   - Ota screenshot virheestä
   - Kopioi konsolin virheviestit (F12)
   - Kerro mitä yritit tehdä

---

## 📊 Diagnostiikka-tarkistuslista

Jos mikään ei toimi, käy läpi tämä lista:

```
[ ] Selain on ajantasalla
[ ] WebGL toimii (https://get.webgl.org/)
[ ] JavaScript on aktivoitu
[ ] Laitteistokiihdytys on päällä
[ ] Näytönohjaimet päivitetty
[ ] Tiedostot ovat oikeissa paikoissa
[ ] models/ kansio sisältää .obj tiedostoja
[ ] Konsoli (F12) ei näytä virheitä
[ ] Kokeillut päivittää sivun (F5)
[ ] Kokeillut tyhjentää välimuistin
[ ] Kokeillut eri selainta
[ ] Ei virustorjunta estämässä
[ ] Ei palomuuri estämässä
```

---

## 💡 Hyödyllisiä komentoja

### Selain-konsoli (F12):

**Tarkista sovelluksen tila:**
```javascript
console.log(window.cs2app);
```

**Pakko-päivitä tekstuuri:**
```javascript
window.cs2app.update3DTexture();
```

**Testaa että Three.js latautui:**
```javascript
console.log(THREE);
```

---

## 📞 Mistä saa lisäapua?

### Dokumentaatio:
- README.md - Kattava ohje
- PIKAOPAS.md - Pika-aloitus
- WORKSHOP_OPAS.md - Workshop-julkaisu

### Yhteisöt:
- **Reddit**: r/GlobalOffensive, r/CS2
- **Discord**: Etsi "CS2 Skin Design" servereitä
- **Steam**: CS2 Workshop Discussion

### Tekniset resurssit:
- **Three.js Docs**: https://threejs.org/docs/
- **WebGL Troubleshooting**: https://get.webgl.org/troubleshooting/
- **VTFEdit Guide**: https://developer.valvesoftware.com/wiki/VTFEdit

---

## ⚠️ Rajoitukset

Asioita joita sovellus **EI voi** tehdä:

- ❌ Muokata 3D-geometriaa (vain tekstuurit)
- ❌ Generaa automaattisesti wear-tasoja
- ❌ Ladata suoraan Steameamiin (pitää tehdä manuaalisesti)
- ❌ Kuvata .obj -tiedostoihin muutoksia
- ❌ Toimia ilman WebGL-tukea
- ❌ Toimia IE:ssä tai vanhassa selaimessa

---

**Jos ongelma jatkuu tämänkin oppaan jälkeen, ota screenshot virheestä ja kysy apua CS2-yhteisöltä! 💪**
