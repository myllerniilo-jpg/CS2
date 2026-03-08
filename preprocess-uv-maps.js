/**
 * UV Map Preprocessor
 * Analyzes UV map images and creates pre-calculated mask data for each weapon part
 * Run this once: node preprocess-uv-maps.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Weapon parts we want to identify
const WEAPON_PARTS = ['barrel', 'magazine', 'body', 'stock', 'grip', 'sight', 'suppressor'];

// UV map filenames to process (matching weapon keys to UV files)
const WEAPON_UV_MAP = {
    'ak47': 'ak-47.png',
    'm4a4': 'm4a4.png',
    'm4a1s': 'm4a1-s.png',
    'awp': 'awp.png',
    'deagle': 'desert_eagle.png',
    'glock': 'glock-18.png',
    'usp': 'usp-s.png',
    'aug': 'aug.png',
    'bizon': 'bizon.png',
    'cz75': 'cz_75.png',
    'famas': 'famas.png',
    'fiveseven': 'five-seven.png',
    'g3sg1': 'g3sg1.png',
    'galil': 'galil_ar.png',
    'm249': 'm249.png',
    'mac10': 'mac-10.png',
    'mag7': 'mag-7.png',
    'mp5sd': 'mp5sd.png',
    'mp7': 'mp7.png',
    'mp9': 'mp9.png',
    'negev': 'negev.png',
    'nova': 'nova.png',
    'p2000': 'p2000.png',
    'p250': 'p250.png',
    'p90': 'p90.png',
    'revolver': 'revolver.png',
    'sawedoff': 'sawed-off.png',
    'scar20': 'scar-20.png',
    'sg553': 'sg_553.png',
    'ssg08': 'ssg_08.png',
    'tec9': 'tec-9.png',
    'ump45': 'ump-45.png',
    'xm1014': 'xm1014.png',
    'dualberettas': 'dual_berettas.png'
};

// Helper: Convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return [h * 360, s * 100, l * 100];
}

// Analyze which weapon part a pixel belongs to based on position and color
function identifyWeaponPart(x, y, width, height, r, g, b) {
    const normX = x / width;
    const normY = y / height;
    const [h, s, l] = rgbToHsl(r, g, b);
    
    // Skip completely black/transparent pixels
    if (l < 5) return null;
    
    // Part identification based on normalized position (UV coordinates)
    // These are optimized heuristics based on typical CS2 weapon UV layouts
    
    // Barrel - typically right side, horizontally aligned
    if (normX > 0.55 && normY > 0.35 && normY < 0.75) {
        return 'barrel';
    }
    
    // Stock - typically left side
    if (normX < 0.35 && normY > 0.35 && normY < 0.80) {
        return 'stock';
    }
    
    // Magazine - bottom center, often darker
    if (normX > 0.25 && normX < 0.60 && normY < 0.45 && l < 50) {
        return 'magazine';
    }
    
    // Sight - top center, often has metallic/bright areas
    if (normX > 0.40 && normX < 0.70 && normY > 0.70 && normY < 0.98) {
        return 'sight';
    }
    
    // Suppressor - far right, lighter tones
    if (normX > 0.80 && normY > 0.40 && normY < 0.70 && l > 40) {
        return 'suppressor';
    }
    
    // Grip - lower middle
    if (normX > 0.35 && normX < 0.55 && normY > 0.25 && normY < 0.50 && l > 20 && l < 65) {
        return 'grip';
    }
    
    // Body - center mass, everything else in middle region
    if (normX > 0.25 && normX < 0.75 && normY > 0.30 && normY < 0.85) {
        return 'body';
    }
    
    return 'body'; // Default to body if no specific match
}

// Compress mask data using Run-Length Encoding (RLE)
function compressMask(maskData, width, height) {
    const compressed = {};
    
    for (const part of WEAPON_PARTS) {
        const runs = [];
        let currentRun = null;
        
        for (let i = 0; i < maskData.length; i++) {
            const hasPart = maskData[i] === part;
            
            if (currentRun === null) {
                currentRun = { start: i, length: 1, value: hasPart };
            } else if (currentRun.value === hasPart) {
                currentRun.length++;
            } else {
                if (currentRun.value) {
                    runs.push([currentRun.start, currentRun.length]);
                }
                currentRun = { start: i, length: 1, value: hasPart };
            }
        }
        
        // Push last run
        if (currentRun && currentRun.value) {
            runs.push([currentRun.start, currentRun.length]);
        }
        
        if (runs.length > 0) {
            compressed[part] = runs;
        }
    }
    
    return compressed;
}

// Process a single UV map image
async function processUVMap(weaponKey, uvFileName) {
    console.log(`\n📋 Processing ${weaponKey} (${uvFileName})...`);
    
    const uvPath = path.join(__dirname, 'UVSheets', uvFileName);
    
    if (!fs.existsSync(uvPath)) {
        console.log(`  ⚠️  UV map not found: ${uvPath}`);
        return null;
    }
    
    try {
        const image = await loadImage(uvPath);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const pixels = imageData.data;
        
        console.log(`  📐 Image size: ${image.width}x${image.height}`);
        
        // Create mask array - store which part each pixel belongs to
        const maskData = new Array(image.width * image.height).fill(null);
        let pixelsCounted = 0;
        
        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const i = (y * image.width + x) * 4;
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];
                
                // Skip fully transparent pixels
                if (a < 10) continue;
                
                const part = identifyWeaponPart(x, y, image.width, image.height, r, g, b);
                if (part) {
                    maskData[y * image.width + x] = part;
                    pixelsCounted++;
                }
            }
        }
        
        console.log(`  ✅ Analyzed ${pixelsCounted} pixels`);
        
        // Compress the mask data
        const compressed = compressMask(maskData, image.width, image.height);
        
        // Calculate statistics
        const stats = {};
        for (const part of WEAPON_PARTS) {
            const count = maskData.filter(p => p === part).length;
            if (count > 0) {
                stats[part] = count;
            }
        }
        
        console.log(`  📊 Part distribution:`, stats);
        
        return {
            weapon: weaponKey,
            width: image.width,
            height: image.height,
            masks: compressed,
            stats: stats,
            generated: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`  ❌ Error processing ${weaponKey}:`, error.message);
        return null;
    }
}

// Main processing function
async function main() {
    console.log('🚀 CS2 Skin Creator - UV Map Preprocessor');
    console.log('==========================================\n');
    
    // Create masks directory
    const masksDir = path.join(__dirname, 'masks');
    if (!fs.existsSync(masksDir)) {
        fs.mkdirSync(masksDir);
        console.log('📁 Created masks/ directory\n');
    }
    
    let processed = 0;
    let skipped = 0;
    
    // Process each weapon
    for (const [weaponKey, uvFileName] of Object.entries(WEAPON_UV_MAP)) {
        const result = await processUVMap(weaponKey, uvFileName);
        
        if (result) {
            // Save mask data as JSON
            const outputPath = path.join(masksDir, `${weaponKey}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
            console.log(`  💾 Saved: masks/${weaponKey}.json`);
            processed++;
        } else {
            skipped++;
        }
    }
    
    console.log('\n==========================================');
    console.log(`✅ Preprocessing complete!`);
    console.log(`  Processed: ${processed} weapons`);
    console.log(`  Skipped: ${skipped} weapons`);
    console.log(`\n💡 Mask files saved to: ${masksDir}`);
    console.log(`\n🎯 Next step: Restart the app to use pre-calculated masks`);
}

main().catch(console.error);
