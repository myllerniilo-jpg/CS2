# 🔧 Troubleshooting - CS2 Skin Creator

## Common Issues and Solutions

---

## 🖥️ Application Won't Load

### Issue: Page is blank or loading continuously

**Solutions:**

1. **Check your browser**
   - ✅ Use modern browser: Chrome, Firefox, Edge
   - ❌ Internet Explorer does NOT work
   - Update browser to latest version

2. **Clear cache**
   ```
   Chrome: Ctrl + Shift + Delete
   Firefox: Ctrl + Shift + Delete
   Edge: Ctrl + Shift + Delete
   ```
   - Select "Cached images and files"
   - Click "Clear data"

3. **Check console**
   - Press `F12` (Developer Tools)
   - Open "Console" tab
   - Look for red error messages
   - Take screenshot and report error

4. **Check file paths**
   - Verify all files are in correct locations:
   ```
   CS2 SKIN CREATOR/
   ├── index.html
   ├── styles.css
   ├── app.js
   └── models/
       └── [.obj files]
   ```

---

## 3️⃣ 3D Preview Not Working

### Issue: Black screen or "WebGL not supported"

**Solutions:**

1. **Test WebGL support**
   - Open: https://get.webgl.org/
   - If you see rotating cube → WebGL works
   - If not → continue below

2. **Update graphics drivers**
   - Windows: Device Manager → Display adapters → Update
   - Or download latest from manufacturer:
     - NVIDIA: https://www.nvidia.com/drivers
     - AMD: https://www.amd.com/drivers
     - Intel: https://www.intel.com/content/www/us/en/download-center/home.html

3. **Enable hardware acceleration**
   
   **Chrome:**
   - Settings → Advanced → System
   - Enable "Use hardware acceleration when available"
   - Restart Chrome

   **Firefox:**
   - about:config
   - Search `webgl.force-enabled`
   - Set to `true`

4. **Try different browser**
   - If Chrome doesn't work, try Firefox
   - Or vice versa

---

## 🖌️ Drawing Not Working

### Issue: Brush doesn't draw or lines look strange

**Solutions:**

1. **Select correct tool**
   - Verify brush (🖌️) is selected
   - Should be highlighted/orange

2. **Check if you're in 2D mode**
   - Click "🖼️ 2D Texture" mode
   - 3D preview mode doesn't allow drawing

3. **Check layer selection**
   - Verify correct layer is selected in layer panel
   - Hidden layers can't be drawn on

4. **Try resetting brush**
   - Select different tool then back to brush
   - Adjust brush size slider

5. **Clear browser cache**
   - Ctrl + Shift + Delete
   - May help with drawing issues

---

## 🎨 Colors Not Appearing

### Issue: Colors don't show or appear wrong

**Solutions:**

1. **Check opacity**
   - Brush opacity might be set to 0%
   - Adjust opacity slider to 50-100%

2. **Check color selection**
   - Verify you've selected a color from picker
   - Try clicking the color preview box again

3. **Try different colors**
   - Some colors might not be visible on dark textures
   - Try bright colors (white, yellow) for testing

4. **Check layer opacity**
   - Verify layer isn't transparent
   - Adjust layer opacity to 100%

---

## 📥 Can't Download Skin

### Issue: Download button doesn't work or file corrupted

**Solutions:**

1. **Verify texture exists**
   - Draw something in 2D mode first
   - Can't download empty texture

2. **Check browser security**
   - Some browsers block downloads from file://
   - Try using web server (see below)

3. **Try different browser**
   - Chrome, Firefox, Edge all support downloads

4. **Use Local Web Server** (recommended)
   
   **Python:**
   ```bash
   cd "C:\CS2 SKIN CREATOR"
   python -m http.server 8000
   ```
   Open: http://localhost:8000

   **Node.js:**
   ```bash
   cd "C:\CS2 SKIN CREATOR"
   npx http-server -p 8000
   ```

---

## 🎮 Weapon Model Not Loading

### Issue: Weapon preview shows nothing or errors

**Solutions:**

1. **Wait for loading**
   - 3D models take time to load
   - Wait 2-3 seconds after selecting weapon
   - Check browser console (F12) for loading status

2. **Verify model files exist**
   ```
   Check models/ folder contains:
   ├── weapon_rif_ak47.obj
   ├── weapon_snip_awp.obj
   └── ... (other .obj files)
   ```

3. **Check console for errors**
   - Press F12 → Console
   - Look for 404 errors (missing files)
   - Look for CORS errors (web server needed)

4. **Use web server**
   - Local file access (file://) may block model loading
   - Use local web server as described above

---

## ⚠️ Application Freezing/Slow

### Issue: App hangs, freezes, or runs slowly

**Solutions:**

1. **Close other applications**
   - Free up RAM
   - Close browser tabs

2. **Reduce brush size**
   - Large brushes require more processing
   - Try smaller sizes (1-50px)

3. **Disable layer effects**
   - Effects can be computationally heavy
   - Try simple colors first

4. **Use simpler patterns**
   - Complex patterns take longer to render
   - Avoid too many patterns at once

5. **Restart application**
   - Close browser tab
   - Open index.html again
   - Fresh start often helps

6. **Clear browser cache**
   - Ctrl + Shift + Delete
   - Old cached data can cause slowness

---

## 📱 Touch/Tablet Issues

### Issue: Drawing with touch doesn't work or is inaccurate

**Solutions:**

1. **Enable touch input**
   - Touch support should work automatically
   - Try with another app to verify touch works

2. **Use stylus if available**
   - Stylus often more accurate than finger
   - Some tablets work better with stylus

3. **Disable zoom on touch**
   - Some tablets zoom on two-finger touch
   - Check browser settings

4. **Use web server**
   - Touch sometimes better with web server
   - See "Use Local Web Server" section above

---

## 🌐 Steam Workshop Upload Issues

### Issue: Can't upload to Workshop or VTF conversion fails

**Solutions:**

1. **Install VTFEdit**
   - Download: https://nemstools.github.io/pages/VTFLib-Download.html
   - Must be installed for VTF conversion

2. **Check PNG format**
   - Verify PNG is valid image
   - Try opening in image viewer

3. **Name files correctly**
   - VTF and VMT must have SAME name
   - Example: `ak47_skin.vtf` and `ak47_skin.vmt`

4. **Check VMT syntax**
   - VMT file must be valid text format
   - Check quotes and brackets are correct

5. **Steam requirements**
   - Requires CS2 to be installed
   - Requires active Steam account
   - Requires Workshop access enabled

---

## 🐛 Still Not Working?

**Debug Steps:**

1. Open browser console: Press `F12`
2. Click "Console" tab
3. Look for error messages (red text)
4. Copy full error message
5. Check what step fails:
   - Application initialization
   - Weapon loading
   - Drawing operation
   - Export/download

**Debug Messages Should Show:**
```
✅ Application initialized successfully
✅ 3D viewer initialized
✅ Weapon loaded
✅ Canvas ready for drawing
```

If you see ❌ errors, the message will indicate what failed.

---

## 📞 Getting Help

**Before reporting issues, verify:**
- [ ] Browser is up to date
- [ ] Cache is cleared
- [ ] WebGL works (https://get.webgl.org/)
- [ ] All files are in correct location
- [ ] Console shows error details (F12)

**When reporting:**
- Include browser name and version
- Include exact error messages from console
- Describe what you were doing when error occurred
- Include screenshot if applicable
