"""
UV Map Preprocessor for CS2 Skin Creator
Analyzes UV map images and creates pre-calculated mask data for each weapon part
Run: python preprocess-uv-maps.py
"""

import os
import json
from PIL import Image
from datetime import datetime
import colorsys

# Weapon parts to identify
WEAPON_PARTS = ['barrel', 'magazine', 'body', 'stock', 'grip', 'sight', 'suppressor']

# UV map filenames (matching weapon keys to UV files)
WEAPON_UV_MAP = {
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
}

def rgb_to_hsl(r, g, b):
    """Convert RGB to HSL color space"""
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s * 100, l * 100

def identify_weapon_part(x, y, width, height, r, g, b, a):
    """Identify which weapon part a pixel belongs to based on position and color"""
    
    # Skip transparent pixels
    if a < 10:
        return None
    
    norm_x = x / width
    norm_y = y / height
    h, s, l = rgb_to_hsl(r, g, b)
    
    # Skip very dark pixels (likely background)
    if l < 5:
        return None
    
    # Part identification based on normalized UV coordinates
    # These heuristics match typical CS2 weapon UV layouts
    
    # Barrel - typically right side, horizontally aligned
    if norm_x > 0.55 and 0.35 < norm_y < 0.75:
        return 'barrel'
    
    # Stock - typically left side
    if norm_x < 0.35 and 0.35 < norm_y < 0.80:
        return 'stock'
    
    # Magazine - bottom center, often darker
    if 0.25 < norm_x < 0.60 and norm_y < 0.45 and l < 50:
        return 'magazine'
    
    # Sight - top center, often metallic/bright
    if 0.40 < norm_x < 0.70 and 0.70 < norm_y < 0.98:
        return 'sight'
    
    # Suppressor - far right
    if norm_x > 0.80 and 0.40 < norm_y < 0.70 and l > 40:
        return 'suppressor'
    
    # Grip - lower middle
    if 0.35 < norm_x < 0.55 and 0.25 < norm_y < 0.50 and 20 < l < 65:
        return 'grip'
    
    # Body - center mass, default for middle region
    if 0.25 < norm_x < 0.75 and 0.30 < norm_y < 0.85:
        return 'body'
    
    return 'body'  # Default

def compress_mask_rle(mask_data, width, height):
    """Compress mask data using Run-Length Encoding"""
    compressed = {}
    
    for part in WEAPON_PARTS:
        runs = []
        current_run = None
        
        for i, pixel_part in enumerate(mask_data):
            has_part = (pixel_part == part)
            
            if current_run is None:
                current_run = {'start': i, 'length': 1, 'value': has_part}
            elif current_run['value'] == has_part:
                current_run['length'] += 1
            else:
                if current_run['value']:
                    runs.append([current_run['start'], current_run['length']])
                current_run = {'start': i, 'length': 1, 'value': has_part}
        
        # Add last run
        if current_run and current_run['value']:
            runs.append([current_run['start'], current_run['length']])
        
        if runs:
            compressed[part] = runs
    
    return compressed

def process_uv_map(weapon_key, uv_filename):
    """Process a single UV map image"""
    print(f"\n📋 Processing {weapon_key} ({uv_filename})...")
    
    uv_path = os.path.join('UVSheets', uv_filename)
    
    if not os.path.exists(uv_path):
        print(f"  ⚠️  UV map not found: {uv_path}")
        return None
    
    try:
        img = Image.open(uv_path).convert('RGBA')
        width, height = img.size
        pixels = img.load()
        
        print(f"  📐 Image size: {width}x{height}")
        
        # Create mask array
        mask_data = [None] * (width * height)
        pixels_counted = 0
        
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                
                part = identify_weapon_part(x, y, width, height, r, g, b, a)
                if part:
                    mask_data[y * width + x] = part
                    pixels_counted += 1
        
        print(f"  ✅ Analyzed {pixels_counted:,} pixels")
        
        # Compress mask data
        compressed = compress_mask_rle(mask_data, width, height)
        
        # Calculate statistics
        stats = {}
        for part in WEAPON_PARTS:
            count = mask_data.count(part)
            if count > 0:
                stats[part] = count
        
        print(f"  📊 Part distribution: {stats}")
        
        return {
            'weapon': weapon_key,
            'width': width,
            'height': height,
            'masks': compressed,
            'stats': stats,
            'generated': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"  ❌ Error processing {weapon_key}: {e}")
        return None

def main():
    print('🚀 CS2 Skin Creator - UV Map Preprocessor')
    print('=' * 50)
    print()
    
    # Create masks directory
    masks_dir = 'masks'
    if not os.path.exists(masks_dir):
        os.makedirs(masks_dir)
        print(f'📁 Created {masks_dir}/ directory\n')
    
    processed = 0
    skipped = 0
    
    # Process each weapon
    for weapon_key, uv_filename in WEAPON_UV_MAP.items():
        result = process_uv_map(weapon_key, uv_filename)
        
        if result:
            # Save mask data as JSON
            output_path = os.path.join(masks_dir, f'{weapon_key}.json')
            with open(output_path, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"  💾 Saved: {output_path}")
            processed += 1
        else:
            skipped += 1
    
    print('\n' + '=' * 50)
    print(f'✅ Preprocessing complete!')
    print(f'  Processed: {processed} weapons')
    print(f'  Skipped: {skipped} weapons')
    print(f'\n💡 Mask files saved to: {masks_dir}/')
    print(f'\n🎯 Next: Restart app to use pre-calculated masks')

if __name__ == '__main__':
    main()
