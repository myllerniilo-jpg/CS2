# CS2 Skin Creator 🎨

Professional web-based tool for designing Counter-Strike 2 weapon skins. Includes a wide range of tools and the ability to upload finished skins to Steam Workshop.

## 🌟 Features

### 🖌️ Drawing Tools
- **Brush** - Free drawing with adjustable size, opacity, and softness
- **Eraser** - Texture removal
- **Fill** - Color fill for selected area
- **Spray** - Spray effect
- **Gradient** - Gradient tools

### 🎨 Colors & Effects
- Two colors (primary & secondary) with easy switching
- 10 ready-made color palettes
- Free color picker
- Wear, scratch, and rust effects
- Metallic, glow, and blur effects

### 🎭 Patterns & Textures
- Camouflage pattern
- Tiger stripes
- Flames
- Stripes, dots
- Carbon fiber
- Hexagons
- And much more!

### 📋 Layer System
- Multiple individually managed layers
- Layer visibility and opacity control
- Easy layer addition and removal

### 👁️ Preview Modes
- **2D Mode**: Direct texture editing at 2048x2048 resolution
- **3D Mode**: Real-time 3D preview with selected weapon
- **Split View**: Both views simultaneously

### 🔫 Weapon Model Support
Includes 35 weapon models:
- **Pistols**: Glock-18, USP-S, P2000, Desert Eagle, R8 Revolver, etc.
- **Rifles**: AK-47, M4A4, M4A1-S, AWP, etc.
- **SMG**: MP9, MAC-10, P90, MP7, etc.
- **Shotguns**: Nova, XM1014, MAG-7, Sawed-Off
- **Machine Guns**: M249, Negev

### 🎨 Preset Skin Styles
Includes sample legendary skin styles:
- Asiimov
- Redline
- Fade
- Tiger Tooth
- Vulcan
- Neon Rider

### 💾 Download & Save
- **PNG Export**: Download texture as PNG
- **VTF Export**: Instructions for VTF conversion
- **Workshop Package**: All information for Steam Workshop upload

### ⌨️ Keyboard Shortcuts
- `Ctrl + Z` - Undo
- `Ctrl + Y` - Redo
- `Space` - Switch between 2D/3D/Split view
- `Shift + Draw` - Straight lines

## 🚀 Getting Started

1. Open `index.html` in your browser
2. Select a weapon from the list
3. Start designing with the tools!

### Requirements
- Modern browser (Chrome, Firefox, Edge)
- WebGL support for 3D preview
- Recommended resolution: 1920x1080 or higher

## 📖 User Guide

### Basic Drawing
1. Select **Weapon** from dropdown
2. Select **Drawing Tool** (brush, eraser, etc.)
3. Adjust **Size** and **Opacity**
4. Choose **Color**
5. Draw on canvas with mouse or touch

### Adding Effects
1. Draw base colors
2. Select effect (wear, scratches, metallic)
3. Effect is applied to entire texture

### Using Patterns
1. Select pattern from dropdown
2. Click "Add Pattern"
3. Pattern is drawn on active layer

### 3D Preview
1. Click "🎮 3D Preview"
2. Rotate weapon with mouse
3. Zoom with mouse wheel
4. Texture updates in real-time

### Exporting to Steam Workshop
1. Design your skin
2. Click "🚀 Workshop Package"
3. Download PNG file
4. Use **VTFEdit** to convert PNG → VTF
5. Create VMT material file
6. Upload to Steam Workshop

## 🛠️ Technical Implementation

### Technologies
- **HTML5 Canvas** - 2D texture drawing
- **Three.js** - 3D modeling and rendering
- **WebGL** - Hardware-accelerated graphics
- **Vanilla JavaScript** - No external dependencies (except Three.js)

### Project Structure
```
CS2 SKIN CREATOR/
├── index.html          # Main page
├── styles.css          # Styles
├── app.js              # Main application
├── models/             # 3D weapon models (.obj)
│   ├── weapon_rif_ak47.obj
│   ├── weapon_snip_awp.obj
│   └── ... (35 weapons)
└── README.md           # This file
```

### Key Features in Code
- **Layer Management**: Multiple drawing layers with alpha-blending
- **Undo/Redo**: 50-action history
- **Performance**: Optimized for 2048x2048 textures
- **Responsive**: Works on different screen sizes
- **Touch Support**: Works on tablets and touch displays

## 🎯 Planned Features (TODO)

- [ ] Symmetry tool
- [ ] Perspective drawing
- [ ] More preset patterns/decals
- [ ] Enhanced text tool with fonts
- [ ] Project save and load (JSON)
- [ ] UV-mapping editor
- [ ] Batch processing for multiple weapons
- [ ] Community integration (share skins)
- [ ] AI-assisted patterns

## 💡 Tips

### Creating a Good Skin
1. **Start with base color** - Use fill or gradient
2. **Add details** - Use brush with different sizes
3. **Use layers** - Separate different elements on their own layers
4. **Try effects** - Wear and scratch give realistic appearance
5. **Test in 3D** - Check how skin looks on weapon
6. **Use reference** - Study existing legendary skins

### Performance
- 2048x2048 is good resolution for quality work
- Use layers only when needed
- Save regularly (export PNG as backup)
- Close other applications during heavy 3D preview

## 🐛 Known Issues

- VTF export requires external tool (VTFEdit)
- Some weapon models may need UV mapping adjustments
- Large brush sizes may be slow on older machines

## 📝 License

This project was created for hobby and educational use.
- Weapon models belong to Valve Corporation
- Code is freely available for use and modification

## 🤝 Support

If you encounter issues:
1. Update your browser
2. Clear browser cache
3. Check console (F12) for error messages
4. Verify WebGL support: [https://get.webgl.org/](https://get.webgl.org/)

## 🎮 CS2 Workshop Guide

### VTF Conversion
1. Download VTFEdit: [https://nemstools.github.io/pages/VTFLib-Download.html](https://nemstools.github.io/pages/VTFLib-Download.html)
2. Open PNG in VTFEdit
3. Tools → Convert to VTF
4. Save as .vtf file

### Creating VMT File
Create text file `.vmt` e.g. `ak47_custom.vmt`:
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

### Workshop Upload
1. Open CS2
2. Main Menu → Workshop
3. Upload VTF and VMT
4. Fill in description and tags
5. Submit!

---

**Made ❤️ for the CS2 community**

Good luck with your skin designs! 🎨🔫
