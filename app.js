// CS2 Skin Creator - Main Application
// Uses THREE from global scope (loaded via CDN)

class CS2SkinCreator {
    constructor() {
        console.log('CS2SkinCreator constructor called');
        
        this.canvas = document.getElementById('textureCanvas');
        if (!this.canvas) {
            console.error('textureCanvas element not found!');
            alert('Error: texture canvas was not found. Refresh the page (F5).');
            throw new Error('Canvas not found');
        }
        
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        // State
        this.currentTool = 'brush';
        this.currentColor = '#ff0000';
        this.secondaryColor = '#0000ff';
        this.brushSize = 20;
        this.opacity = 1;
        this.hardness = 0.5;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.cursorOverlay = null;
        this.lastPointerX = null;
        this.lastPointerY = null;
        this.compositeBaseColor = '#808080';
        this.zoomLevel = 1;
        this.minZoomLevel = 0.25;
        this.maxZoomLevel = 128;
        this.baseCanvasDisplaySize = 0;
        this.customPatternImage = null;
        this.customPatternScale = 100;
        this.minPatternScale = 1;
        this.maxPatternScale = 2000;
        this.customPatternOffsetX = 0;
        this.customPatternOffsetY = 0;
        this.minPatternOffset = -4096;
        this.maxPatternOffset = 4096;
        this.customPatternRotation = 0;
        this.minPatternRotation = -180;
        this.maxPatternRotation = 180;
        this.customPatternBlendMode = 'source-over';
        this.patternTargetAreas = []; // Array of selected parts (multi-select)
        this.patternInvertMask = false; // Invert the mask
        this.updatingCheckboxes = false; // Flag to prevent recursive checkbox updates
        this.weaponPreset = 'generic'; // Which weapon model is loaded
        this.currentWeapon = 'weapon_rif_ak47';
        
        // Image placement system (simple image overlay on canvas)
        this.placedImage = null; // Current image being placed
        this.placedImageX = 0; // X position on canvas
        this.placedImageY = 0; // Y position on canvas
        this.placedImageWidth = 0; // Width on canvas (scaled)
        this.placedImageHeight = 0; // Height on canvas (scaled)
        this.placedImageName = '';
        this.placedImageRotation = 0; // Rotation in degrees
        this.isDraggingImage = false; // Is user dragging the image
        this.isResizingImage = false; // Is user resizing the image
        this.resizeHandle = null; // Which handle: tl, tr, bl, br, t, r, b, l
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragStartImageX = 0;
        this.dragStartImageY = 0;
        this.dragStartWidth = 0;
        this.dragStartHeight = 0;
        this.appliedImages = []; // Non-destructive placed images that remain editable
        this.appliedImageIdCounter = 0;
        this.editingAppliedImageId = null;
        this.drawOnPlacedImages = false;
        this.eraserAffectsPlacedImages = false;
        this.eraserAffectsPatternLayers = false;

        // 3D drawing state
        this.is3DDrawing = false;
        this.has3DLastPoint = false;
        this.max3DUVJump = 28;
        this.last3DHitPoint = null;
        this.last3DHitNormal = null;
        this.max3DWorldJump = 0.2;
        this.min3DNormalDot = 0.2;
        
        this.currentLanguage = 'en';
        this.viewMode = '2D';
        this.drawModeEnabled = false;

        this.roughness = 0.5;
        this.metalness = 0;
        this.brightness = 0;
        this.contrast = 0;
        this.saturation = 0;

        this.maxHistory = 50;
        this.history = [];
        this.historyStep = -1;

        this.uvSheetVisible = false;
        this.uvSheetCanvas = null;
        this.uvSheetOpacity = 0.35;
        this.uvSheetDisplayMode = 'both'; // 'above', 'below', or 'both'
        this.textureFlipY = false;
        
        // Pattern library - multiple patterns
        this.patternLibrary = []; // Array of {id, name, image, targetAreas, scale, offsetX, offsetY, rotation, blendMode, invertMask}
        this.currentPatternId = null; // Currently selected pattern for editing
        this.patternIdCounter = 0; // For generating unique IDs
        
        // Pre-calculated mask system for accurate pattern targeting
        this.maskCache = {}; // Cache for loaded pre-calculated mask JSON files
        this.currentMask = null; // Currently active mask data for the loaded weapon

        // Legacy UV helpers are still used in debug/utility flows.
        this.uvMapImage = null;
        this.uvMapCanvas = document.createElement('canvas');
        this.uvMapCtx = this.uvMapCanvas.getContext('2d', { willReadFrequently: true });
        this.uvMapCache = {};
        this.weaponUVSheets = {
            ak47: 'ak-47.png',
            m4a4: 'm4a4.png',
            m4a1s: 'm4a1-s.png',
            awp: 'awp.png',
            deagle: 'desert_eagle.png',
            glock: 'glock-18.png',
            usp: 'usp-s.png'
        };

        this.translations = {
            en: {
                switchToFinnish: 'Suomi',
                switchToEnglish: 'English',
                drawModeOn: 'Draw Mode (ON)',
                drawModeOff: 'Draw Mode (OFF)',
                layerLabel: 'Layer',
                deleteShort: 'Delete',
                workshopWeapon: 'Weapon',
                workshopResolution: 'Resolution'
            },
            fi: {
                switchToFinnish: 'Suomi',
                switchToEnglish: 'English',
                drawModeOn: 'Piirtotila (ON)',
                drawModeOff: 'Piirtotila (OFF)',
                layerLabel: 'Taso',
                deleteShort: 'Poista',
                workshopWeapon: 'Ase',
                workshopResolution: 'Resoluutio'
            }
        };

        this.palette = this.loadPalette();
        this.layers = [this.createLayer()];
        this.currentLayer = 0;
        
        // Weapon preset UV bounds (normalized coordinates based on weapon analysis)
        // Format: {part: {minU, maxU, minV, maxV, lengthRange, heightRange}}
        // Improved coordinates for better targeting accuracy
        this.weaponPresets = {
            'ak47': {
                barrel: { lengthRange: [0.60, 1.0], heightRange: [0.40, 0.68] },
                magazine: { lengthRange: [0.28, 0.52], heightRange: [0.0, 0.38] },
                body: { lengthRange: [0.30, 0.72], heightRange: [0.42, 0.78] },
                stock: { lengthRange: [0.0, 0.28], heightRange: [0.44, 0.74] },
                grip: { lengthRange: [0.38, 0.56], heightRange: [0.32, 0.44] },
                sight: { lengthRange: [0.45, 0.64], heightRange: [0.75, 0.92] },
                suppressor: { lengthRange: [0.82, 1.0], heightRange: [0.46, 0.64] }
            },
            'm4a4': {
                barrel: { lengthRange: [0.62, 1.0], heightRange: [0.42, 0.66] },
                magazine: { lengthRange: [0.32, 0.54], heightRange: [0.0, 0.40] },
                body: { lengthRange: [0.28, 0.70], heightRange: [0.44, 0.78] },
                stock: { lengthRange: [0.0, 0.26], heightRange: [0.46, 0.74] },
                grip: { lengthRange: [0.36, 0.54], heightRange: [0.34, 0.46] },
                sight: { lengthRange: [0.48, 0.66], heightRange: [0.76, 0.92] },
                suppressor: { lengthRange: [0.84, 1.0], heightRange: [0.48, 0.64] }
            },
            'm4a1s': {
                barrel: { lengthRange: [0.64, 1.0], heightRange: [0.42, 0.66] },
                magazine: { lengthRange: [0.32, 0.54], heightRange: [0.0, 0.40] },
                body: { lengthRange: [0.28, 0.72], heightRange: [0.44, 0.78] },
                stock: { lengthRange: [0.0, 0.26], heightRange: [0.46, 0.74] },
                grip: { lengthRange: [0.36, 0.54], heightRange: [0.34, 0.46] },
                sight: { lengthRange: [0.48, 0.66], heightRange: [0.76, 0.92] },
                suppressor: { lengthRange: [0.78, 1.0], heightRange: [0.48, 0.64] }
            },
            'awp': {
                    barrel: { lengthRange: [0.50, 1.0], heightRange: [0.40, 0.70] },
                    magazine: { lengthRange: [0.42, 0.60], heightRange: [0.10, 0.36] },
                    body: { lengthRange: [0.34, 0.66], heightRange: [0.44, 0.80] },
                    stock: { lengthRange: [0.0, 0.32], heightRange: [0.46, 0.78] },
                    grip: { lengthRange: [0.38, 0.56], heightRange: [0.36, 0.48] },
                    sight: { lengthRange: [0.42, 0.68], heightRange: [0.74, 0.96] },
                    suppressor: { lengthRange: [0.84, 1.0], heightRange: [0.46, 0.66] }
                },
                'deagle': {
                    barrel: { lengthRange: [0.54, 1.0], heightRange: [0.43, 0.70] },
                    magazine: { lengthRange: [0.34, 0.50], heightRange: [0.0, 0.36] },
                    body: { lengthRange: [0.28, 0.62], heightRange: [0.40, 0.74] },
                    grip: { lengthRange: [0.32, 0.48], heightRange: [0.22, 0.43] },
                    sight: { lengthRange: [0.50, 0.70], heightRange: [0.66, 0.90] }
                },
                'glock': {
                    barrel: { lengthRange: [0.56, 1.0], heightRange: [0.44, 0.68] },
                    magazine: { lengthRange: [0.34, 0.50], heightRange: [0.0, 0.38] },
                    body: { lengthRange: [0.30, 0.66], heightRange: [0.42, 0.72] },
                    grip: { lengthRange: [0.34, 0.50], heightRange: [0.20, 0.42] },
                    sight: { lengthRange: [0.52, 0.72], heightRange: [0.64, 0.86] }
                },
                'usp': {
                    barrel: { lengthRange: [0.54, 1.0], heightRange: [0.43, 0.67] },
                    magazine: { lengthRange: [0.32, 0.46], heightRange: [0.0, 0.36] },
                    body: { lengthRange: [0.28, 0.62], heightRange: [0.41, 0.71] },
                    grip: { lengthRange: [0.32, 0.48], heightRange: [0.20, 0.41] },
                    sight: { lengthRange: [0.50, 0.70], heightRange: [0.64, 0.88] }
                },
                'generic': {
                    barrel: { lengthRange: [0.55, 1.0], heightRange: [0.40, 0.70] },
                    magazine: { lengthRange: [0.30, 0.55], heightRange: [0.0, 0.40] },
                    body: { lengthRange: [0.25, 0.75], heightRange: [0.35, 0.80] },
                    stock: { lengthRange: [0.0, 0.30], heightRange: [0.40, 0.75] },
                    grip: { lengthRange: [0.35, 0.55], heightRange: [0.25, 0.45] },
                    sight: { lengthRange: [0.45, 0.70], heightRange: [0.70, 0.95] },
                    suppressor: { lengthRange: [0.80, 1.0], heightRange: [0.42, 0.68] }
                }
            };
        
        console.log('Calling init()...');
        this.init();
    }
    
    createLayer() {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = this.canvas.width;
        layerCanvas.height = this.canvas.height;
        return {
            canvas: layerCanvas,
            ctx: layerCanvas.getContext('2d'),
            visible: true,
            opacity: 1,
            blendMode: 'source-over',
            patternApplied: false,
            metallic: 0,
            roughness: 0.5
        };
    }
    
    init() {
        console.log('init() called');
        this.setupEventListeners();
        this.syncPatternScaleInputs();
        this.applyLanguage();
        this.init2DZoomControls();
        this.clearCanvas('#808080'); // Gray default

        // Initialize history with the gray base state as the first undo point.
        this.history = [];
        this.historyStep = -1;
        this.saveState();
        
        // Save base layer data for material adjustments
        this.saveBaseLayerData();

        this.init3DViewer();
        console.log('Loading initial weapon...');
        
        // Set weaponPreset based on currentWeapon
        const presetKey = this.getWeaponPresetKey(this.currentWeapon);
        if (presetKey) {
            this.weaponPreset = presetKey;
            const presetSelect = document.getElementById('weaponPreset');
            if (presetSelect && presetSelect.querySelector(`option[value="${presetKey}"]`)) {
                presetSelect.value = presetKey;
            }
        }
        
        // Load mask for initial weapon
        this.loadMaskForWeapon(this.weaponPreset).then(mask => {
            if (mask) {
                console.log('✅ Initial weapon mask loaded:', this.weaponPreset);
            } else {
                console.log('⚠️ No mask available for initial weapon:', this.weaponPreset);
            }
        });
        
        this.loadWeapon(this.currentWeapon);
        this.renderPalette();
        this.renderPlacedImagesLibrary();
        
        // Start animation loop for image placement preview
        this.startAnimationLoop();

        // Setup collapsible sections
        this.setupCollapsibleSections();

        // Setup UV display toggle
        this.setupUVDisplayToggle();

        console.log('Initialization complete!');
    }
    
    startAnimationLoop() {
        const animate = () => {
            // Always redraw when image is being placed - no throttle
            if (this.placedImage) {
                this.composeLayers();
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    setupCollapsibleSections() {
        document.querySelectorAll('.section-toggle[data-target]').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const content = document.getElementById(targetId);
                if (!content) return;
                toggle.classList.toggle('collapsed');
                content.classList.toggle('collapsed');
            });
        });
    }

    setupUVDisplayToggle() {
        const toggleContainer = document.getElementById('uvDisplayToggle');
        if (!toggleContainer) return;

        toggleContainer.querySelectorAll('.toggle-btn[data-uv-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleContainer.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.uvSheetDisplayMode = btn.getAttribute('data-uv-mode');
                this.composeLayers();
            });
        });
    }
    
    saveBaseLayerData() {
        const layer = this.layers[this.currentLayer];
        const imageData = layer.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.baseLayerData = new Uint8ClampedArray(imageData.data);
    }
    
    // Palette system functions
    loadPalette() {
        const saved = localStorage.getItem('cs2skinPalette');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading palette:', e);
            }
        }
        // Default palette
        return [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
            '#00ffff', '#ffffff', '#000000', '#ffa500', '#800080'
        ];
    }
    
    savePalette() {
        localStorage.setItem('cs2skinPalette', JSON.stringify(this.palette));
    }
    
    addColorToPalette(color) {
        // Avoid duplicates
        if (!this.palette.includes(color)) {
            this.palette.unshift(color); // Add to beginning
        }
        this.savePalette();
        this.renderPalette();
    }
    
    removeColorFromPalette(color) {
        this.palette = this.palette.filter(c => c !== color);
        this.savePalette();
        this.renderPalette();
    }
    
    clearPalette() {
        this.palette = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff',
            '#00ffff', '#ffffff', '#000000', '#ffa500', '#800080'
        ];
        this.savePalette();
        this.renderPalette();
    }
    
    renderPalette() {
        const container = document.getElementById('colorPresets');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Update color count
        const countEl = document.getElementById('paletteCount');
        if (countEl) {
            const count = this.palette.length;
            countEl.textContent = `${count} color${count !== 1 ? 's' : ''}`;
        }
        
        this.palette.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'preset-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.dataset.color = color;
            colorDiv.title = `${color} (Right-click to remove)`;
            
            // Click to select
            colorDiv.addEventListener('click', () => {
                this.currentColor = color;
                const primaryColor = document.getElementById('primaryColor');
                if (primaryColor) {
                    primaryColor.value = this.currentColor;
                }
            });
            
                // Right-click to remove
                colorDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.removeColorFromPalette(color);
                });
            
                container.appendChild(colorDiv);
            });
    }
    
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Helper function for safe event listener addition
        const safeAddListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Element not found: ${id}`);
            }
        };
        
        // Check if canvas exists
        if (!this.canvas) {
            console.error('Canvas not available for event listeners');
            return;
        }

        const drawableTools = new Set(['brush', 'eraser', 'spray', 'fill']);
        const canDrawOnCanvas = () => {
            return this.drawModeEnabled &&
                drawableTools.has(this.currentTool) &&
                (!this.placedImage || this.drawOnPlacedImages);
        };
        
        // UNIFIED MOUSE DOWN HANDLER - Priority switches with draw-over-images option.
        this.canvas.addEventListener('mousedown', (e) => {
            if (canDrawOnCanvas()) {
                this.startDrawing(e);
                return;
            }

            if (this.placedImage) {
                e.preventDefault();
                e.stopPropagation();
                this.startDraggingImage(e);
            }
        });
        
        // UNIFIED MOUSE MOVE HANDLER
        this.canvas.addEventListener('mousemove', (e) => {
            // Priority 1: Handle image dragging/resizing
            if (this.placedImage && (this.isDraggingImage || this.isResizingImage)) {
                e.preventDefault();
                e.stopPropagation();
                this.dragImage(e);
            }
            // Priority 2: Handle drawing (includes draw-over-placed-images mode)
            else if (canDrawOnCanvas() && this.isDrawing) {
                this.draw(e);
            }
            // Priority 2: Update cursor for image placement
            else if (this.placedImage && !this.drawOnPlacedImages && !this.isDraggingImage && !this.isResizingImage) {
                const coords = this.getCanvasCoords(e);
                const mouseX = coords.x;
                const mouseY = coords.y;
                const handle = this.getResizeHandleAtPoint(mouseX, mouseY);
                
                if (handle) {
                    if (handle === 'tl' || handle === 'br') {
                        this.canvas.style.cursor = 'nwse-resize';
                    } else if (handle === 'tr' || handle === 'bl') {
                        this.canvas.style.cursor = 'nesw-resize';
                    } else if (handle === 't' || handle === 'b') {
                        this.canvas.style.cursor = 'ns-resize';
                    } else if (handle === 'l' || handle === 'r') {
                        this.canvas.style.cursor = 'ew-resize';
                    }
                } else if (mouseX >= this.placedImageX && mouseX <= this.placedImageX + this.placedImageWidth &&
                           mouseY >= this.placedImageY && mouseY <= this.placedImageY + this.placedImageHeight) {
                    this.canvas.style.cursor = 'move';
                } else {
                    this.canvas.style.cursor = 'default';
                }
            }

            // Always update cursor position display
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) * (this.canvas.width / rect.width));
            const y = Math.floor((e.clientY - rect.top) * (this.canvas.height / rect.height));
            const cursorPos = document.getElementById('cursorPos');
            if (cursorPos) {
                cursorPos.textContent = `X: ${x}, Y: ${y}`;
            }
            
            // Update brush cursor
            if (!this.placedImage || this.drawOnPlacedImages) {
                this.updateBrushCursor(e);
            }
        });
        
        // UNIFIED MOUSE UP HANDLER
        this.canvas.addEventListener('mouseup', () => {
            if (this.isDraggingImage || this.isResizingImage) {
                this.isDraggingImage = false;
                this.isResizingImage = false;
            }

            if (this.drawModeEnabled && this.isDrawing) {
                this.stopDrawing();
            }
        });
        
        // MOUSE OUT HANDLER
        this.canvas.addEventListener('mouseout', () => {
            if (this.isDraggingImage || this.isResizingImage) {
                // Stop resizing/dragging when mouse leaves canvas
                this.isDraggingImage = false;
                this.isResizingImage = false;
                this.canvas.style.cursor = 'default';
            }

            if (this.drawModeEnabled && this.isDrawing) {
                this.stopDrawing();
            }
        });
        
        // Brush cursor handlers
        this.initBrushCursor();
        this.canvas.addEventListener('mouseenter', (e) => {
            if (!this.placedImage || this.drawOnPlacedImages) {
                this.showBrushCursor(e);
            }
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.hideBrushCursor();
        });
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.hideBrushCursor();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.hideBrushCursor();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.hideBrushCursor();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        const canvasContainer = document.getElementById('canvasContainer');
        if (canvasContainer) {
            // Wheel zoom in 2D mode with cursor-focused zooming.
            canvasContainer.addEventListener('wheel', (e) => this.handle2DZoomWheel(e), { passive: false });
            canvasContainer.addEventListener('scroll', () => this.refreshBrushCursor());
            canvasContainer.addEventListener('dblclick', (e) => {
                if (this.viewMode === '2D') {
                    e.preventDefault();
                    this.reset2DZoom();
                }
            });
        }

        window.addEventListener('resize', () => {
            this.update2DCanvasDisplay();
            this.updateCanvasInfo();
            this.refreshBrushCursor();
        });
        
        // Tools
        document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTool(btn.dataset.tool);
            });
        });
        

        
        // Color pickers
        safeAddListener('primaryColor', 'change', (e) => {
            this.currentColor = e.target.value;
            this.refreshBrushCursor();
        });
        
        safeAddListener('secondaryColor', 'change', (e) => {
            this.secondaryColor = e.target.value;
        });
        
        safeAddListener('swapColors', 'click', () => {
            [this.currentColor, this.secondaryColor] = [this.secondaryColor, this.currentColor];
            const primary = document.getElementById('primaryColor');
            const secondary = document.getElementById('secondaryColor');
            if (primary) primary.value = this.currentColor;
            if (secondary) secondary.value = this.secondaryColor;
            this.refreshBrushCursor();
        });
        
        // Palette buttons
        safeAddListener('addToPalette', 'click', () => {
            this.addColorToPalette(this.currentColor);
        });
        
        safeAddListener('clearPalette', 'click', () => {
            if (confirm('Reset palette to defaults?')) {
                this.clearPalette();
            }
        });
        
        // Brush settings
        safeAddListener('brushSize', 'input', (e) => {
            this.brushSize = parseInt(e.target.value);
            const display = document.getElementById('brushSizeValue');
            if (display) display.textContent = this.brushSize;
            this.refreshBrushCursor();
        });
        
        safeAddListener('opacity', 'input', (e) => {
            this.opacity = parseInt(e.target.value) / 100;
            const display = document.getElementById('opacityValue');
            if (display) display.textContent = e.target.value;
        });
        
        safeAddListener('hardness', 'input', (e) => {
            this.hardness = parseInt(e.target.value) / 100;
        });

        safeAddListener('drawOverPlacedImages', 'change', (e) => {
            this.drawOnPlacedImages = e.target.checked;
            if (!this.drawOnPlacedImages && this.isDrawing) {
                this.stopDrawing();
            }
            this.refreshBrushCursor();
        });

        safeAddListener('eraserAffectsPlacedImages', 'change', (e) => {
            this.eraserAffectsPlacedImages = e.target.checked;
        });

        safeAddListener('eraserAffectsPatternLayers', 'change', (e) => {
            this.eraserAffectsPatternLayers = e.target.checked;
        });
        
        // Material properties - use 'input' for UI feedback, 'change' for expensive calculations
        safeAddListener('roughness', 'input', (e) => {
            const val = parseInt(e.target.value);
            this.roughness = val / 100;
            const valueInput = document.getElementById('roughnessValue');
            if (valueInput) valueInput.value = val;
            this.updateMaterial();
        });
        
        safeAddListener('roughnessValue', 'change', (e) => {
            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 50));
            this.roughness = val / 100;
            const slider = document.getElementById('roughness');
            if (slider) slider.value = val;
            this.updateMaterial();
        });
        
        safeAddListener('metalness', 'input', (e) => {
            const val = parseInt(e.target.value);
            this.metalness = val / 100;
            const valueInput = document.getElementById('metalnessValue');
            if (valueInput) valueInput.value = val;
            this.updateMaterial();
        });
        
        safeAddListener('metalnessValue', 'change', (e) => {
            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
            this.metalness = val / 100;
            const slider = document.getElementById('metalness');
            if (slider) slider.value = val;
            this.updateMaterial();
        });
        
        // Only apply on change (when user releases slider) for smooth performance
        // Material properties with input fields and reset buttons
        safeAddListener('brightness', 'input', (e) => {
            const val = parseInt(e.target.value);
            this.brightness = val;
            const valueInput = document.getElementById('brightnessValue');
            if (valueInput) valueInput.value = val;
        });
        
        safeAddListener('brightness', 'change', (e) => {
            this.brightness = parseInt(e.target.value);
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('brightnessValue', 'change', (e) => {
            const val = Math.min(100, Math.max(-100, parseInt(e.target.value) || 0));
            this.brightness = val;
            const slider = document.getElementById('brightness');
            if (slider) slider.value = val;
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('brightnessReset', 'click', () => {
            this.brightness = 0;
            document.getElementById('brightness').value = 0;
            document.getElementById('brightnessValue').value = 0;
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('contrast', 'input', (e) => {
            const val = parseInt(e.target.value);
            this.contrast = val;
            const valueInput = document.getElementById('contrastValue');
            if (valueInput) valueInput.value = val;
        });
        
        safeAddListener('contrast', 'change', (e) => {
            this.contrast = parseInt(e.target.value);
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('contrastValue', 'change', (e) => {
            const val = Math.min(100, Math.max(-100, parseInt(e.target.value) || 0));
            this.contrast = val;
            const slider = document.getElementById('contrast');
            if (slider) slider.value = val;
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('contrastReset', 'click', () => {
            this.contrast = 0;
            document.getElementById('contrast').value = 0;
            document.getElementById('contrastValue').value = 0;
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('saturation', 'input', (e) => {
            const val = parseInt(e.target.value);
            this.saturation = val;
            const valueInput = document.getElementById('saturationValue');
            if (valueInput) valueInput.value = val;
        });
        
        safeAddListener('saturation', 'change', (e) => {
            this.saturation = parseInt(e.target.value);
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('saturationValue', 'change', (e) => {
            const val = Math.min(100, Math.max(-100, parseInt(e.target.value) || 0));
            this.saturation = val;
            const slider = document.getElementById('saturation');
            if (slider) slider.value = val;
            this.applyMaterialAdjustments();
        });
        
        safeAddListener('saturationReset', 'click', () => {
            this.saturation = 0;
            document.getElementById('saturation').value = 0;
            document.getElementById('saturationValue').value = 0;
            this.applyMaterialAdjustments();
        });
        
        // Actions
        safeAddListener('undo', 'click', () => this.undo());
        safeAddListener('redo', 'click', () => this.redo());
        safeAddListener('clear', 'click', () => {
            if (confirm(this.t('confirmClear'))) {
                this.clearCanvas();
                this.saveState();
            }
        });
        safeAddListener('reset', 'click', () => {
            if (confirm(this.t('confirmReset'))) {
                this.clearCanvas('#808080');
                this.saveState();
            }
        });
        
        // Weapon selection
        safeAddListener('weaponSelect', 'change', (e) => {
            this.currentWeapon = e.target.value;
            
            // Update weaponPreset based on selected weapon
            const presetKey = this.getWeaponPresetKey(this.currentWeapon);
            if (presetKey) {
                this.weaponPreset = presetKey;
                const presetSelect = document.getElementById('weaponPreset');
                if (presetSelect && presetSelect.querySelector(`option[value="${presetKey}"]`)) {
                    presetSelect.value = presetKey;
                }
            } else {
                this.weaponPreset = 'generic';
                const presetSelect = document.getElementById('weaponPreset');
                if (presetSelect) {
                    presetSelect.value = 'generic';
                }
            }
            
            // Load mask for the new weapon
            this.loadMaskForWeapon(this.weaponPreset).then(mask => {
                if (mask) {
                    console.log('✅ Mask loaded for weapon:', this.weaponPreset);
                } else {
                    console.log('⚠️ No mask available for weapon:', this.weaponPreset);
                }
            });
            
            this.loadWeapon(this.currentWeapon, () => {
                // Keep UV guide aligned when switching weapons while guide is enabled.
                if (this.uvSheetVisible) {
                    this.loadUVSheet(this.currentWeapon);
                }
            });
            // Auto-switch to 3D view to see the weapon
            if (this.viewMode === '2D') {
                setTimeout(() => {
                    this.setViewMode('3D');
                }, 500);
            }
        });
        
        // View modes
        safeAddListener('view2D', 'click', () => this.setViewMode('2D'));
        safeAddListener('view3D', 'click', () => this.setViewMode('3D'));
        safeAddListener('viewSplit', 'click', () => this.setViewMode('split'));
        
        // Draw mode toggle
        safeAddListener('toggleDrawMode', 'click', () => this.toggleDrawMode());

        // Language toggle
        safeAddListener('languageToggle', 'click', () => this.toggleLanguage());

        // Quick actions near canvas/3D view
        safeAddListener('quickUndo', 'click', (e) => {
            e.preventDefault();
            this.undo();
        });
        safeAddListener('quickRedo', 'click', (e) => {
            e.preventDefault();
            this.redo();
        });
        safeAddListener('quickBrush', 'click', (e) => {
            e.preventDefault();
            this.setTool('brush');
        });
        safeAddListener('quickEraser', 'click', (e) => {
            e.preventDefault();
            this.setTool('eraser');
        });
        
        // Drag and drop for custom pattern images
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.addEventListener('click', () => {
                const patternUpload = document.getElementById('patternUpload');
                if (patternUpload) {
                    patternUpload.click();
                }
            });

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('drag-over');
            });
            
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('drag-over');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.loadPatternImage(files[0]);
                }
            });
        }
        
        // Pattern preview updates when settings change
        const updatePatternPreview = (saveState = false) => {
            if (this.customPatternImage) {
                this.applyPatternImageToLayer(saveState);
            }
        };

        safeAddListener('patternScale', 'input', (e) => {
            this.customPatternScale = this.clampPatternScale(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(false);
        });

        safeAddListener('patternScale', 'change', (e) => {
            this.customPatternScale = this.clampPatternScale(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternScaleValue', 'change', (e) => {
            this.customPatternScale = this.clampPatternScale(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternOffsetX', 'input', (e) => {
            this.customPatternOffsetX = this.clampPatternOffset(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(false);
        });

        safeAddListener('patternOffsetX', 'change', (e) => {
            this.customPatternOffsetX = this.clampPatternOffset(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternOffsetXValue', 'change', (e) => {
            this.customPatternOffsetX = this.clampPatternOffset(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternOffsetY', 'input', (e) => {
            this.customPatternOffsetY = this.clampPatternOffset(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(false);
        });

        safeAddListener('patternOffsetY', 'change', (e) => {
            this.customPatternOffsetY = this.clampPatternOffset(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternOffsetYValue', 'change', (e) => {
            this.customPatternOffsetY = this.clampPatternOffset(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternRotation', 'input', (e) => {
            this.customPatternRotation = this.clampPatternRotation(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(false);
        });

        safeAddListener('patternRotation', 'change', (e) => {
            this.customPatternRotation = this.clampPatternRotation(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternRotationValue', 'change', (e) => {
            this.customPatternRotation = this.clampPatternRotation(e.target.value);
            this.syncPatternScaleInputs();
            updatePatternPreview(true);
        });

        safeAddListener('patternBlendMode', 'change', (e) => {
            this.customPatternBlendMode = this.normalizePatternBlendMode(e.target.value);
            this.layers[this.currentLayer].blendMode = this.customPatternBlendMode;
            this.syncPatternScaleInputs();
            this.updateCurrentPatternSettings();

            if (this.customPatternImage) {
                this.applyPatternImageToLayer(true);
            } else {
                this.composeLayers();
            }
        });

        // Weapon preset selection
        safeAddListener('weaponPreset', 'change', (e) => {
            this.weaponPreset = e.target.value;
            console.log('Weapon preset changed to:', this.weaponPreset);
            
                // Load mask for new weapon preset
                this.loadMaskForWeapon(this.weaponPreset).then(mask => {
                    if (mask) {
                        console.log('✅ Mask loaded for preset:', this.weaponPreset);
                    } else {
                        console.log('⚠️ No mask available for preset:', this.weaponPreset);
                    }
                });
            
            updatePatternPreview(true);
        });

        // Pattern invert mask checkbox
        safeAddListener('patternInvertMask', 'change', (e) => {
            this.patternInvertMask = e.target.checked;
            this.updateCurrentPatternSettings();
            updatePatternPreview(true);
        });

        // Target areas removed - using image placement system instead

        // Add new pattern button
        safeAddListener('addNewPattern', 'click', () => {
            const fileInput = document.getElementById('patternUpload');
            if (fileInput) {
                fileInput.click();
            }
        });

        // Pattern upload - now supports multiple files
        safeAddListener('patternUpload', 'change', (e) => {
            if (e.target.files.length > 0) {
                Array.from(e.target.files).forEach(file => {
                    this.addPatternToLibrary(file);
                });
                e.target.value = '';
            }
        });

        safeAddListener('applyPatternScale', 'click', () => {
            updatePatternPreview(true);
        });

        safeAddListener('applyAllPatterns', 'click', () => {
            this.applyAllPatterns();
        });
        
        // File upload - use new image placement system
        safeAddListener('fileUpload', 'change', (e) => {
            if (e.target.files.length > 0) {
                this.loadPatternImage(e.target.files[0]);
                e.target.value = '';
            }
        });
        
        // UV Sheet
        safeAddListener('uvSheetSelect', 'change', (e) => {
            // Just update selection, don't load yet
        });
        
        safeAddListener('loadUVSheet', 'click', () => {
            const select = document.getElementById('uvSheetSelect');
            if (!select || !select.value) {
                alert('Please select a weapon first');
                return;
            }
            this.loadUVSheet(select.value);
        });
        
        safeAddListener('disableUVSheet', 'click', () => {
            this.disableUVSheet();
        });
        
        // Export
        safeAddListener('exportPNG', 'click', () => this.exportPNG());
        safeAddListener('exportVTF', 'click', () => this.exportVTF());
        safeAddListener('exportWorkshop', 'click', () => this.exportWorkshop());
        
        // Preset skins
        document.querySelectorAll('.preset-item').forEach(item => {
            item.addEventListener('click', () => {
                this.applyPreset(item.dataset.preset);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleView();
            }
        });
        
        // Layers
        safeAddListener('addLayer', 'click', () => this.addLayer());
        
        // Make this available globally for debugging
        window.creator = this;
        
        // Debug helper for console
        window.debugUVSheet = () => {
            console.log('=== UV Sheet Debug Info ===');
            console.log('uvSheetVisible:', window.creator.uvSheetVisible);
            console.log('uvSheetCanvas:', window.creator.uvSheetCanvas);
            console.log('uvSheetCtx:', window.creator.uvSheetCtx);
            console.log('uvSheetOpacity:', window.creator.uvSheetOpacity);
            console.log('canvas size:', window.creator.canvas.width, 'x', window.creator.canvas.height);
            console.log('===========================');
        };
        
        window.testLoadUVSheet = (weaponId = 'weapon_rif_ak47') => {
            console.log('Loading UV sheet for:', weaponId);
            window.creator.loadUVSheet(weaponId);
        };
        
        console.log('💡 Debug: Use window.testLoadUVSheet() to load AK-47 UV sheet');
        console.log('💡 Debug: Use window.debugUVSheet() to see UV sheet info');
        this.setTool(this.currentTool);
        
        console.log('Event listeners set up successfully');
    }

    setTool(toolName) {
        this.currentTool = toolName;

        document.querySelectorAll('.tool-btn[data-tool]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tool === toolName);
        });

        const quickBrush = document.getElementById('quickBrush');
        const quickEraser = document.getElementById('quickEraser');
        if (quickBrush) {
            quickBrush.classList.toggle('active', toolName === 'brush');
        }
        if (quickEraser) {
            quickEraser.classList.toggle('active', toolName === 'eraser');
        }

        const textTools = document.getElementById('textTools');
        if (textTools) {
            textTools.classList.toggle('hidden', toolName !== 'text');
        }

        this.refreshBrushCursor();
    }

    init2DZoomControls() {
        const container = document.getElementById('canvasContainer');
        if (container && this.viewMode === '2D') {
            container.style.overflow = 'auto';
        }

        this.update2DCanvasDisplay();
        this.updateCanvasInfo();
    }

    updateCanvasInfo() {
        const canvasInfo = document.getElementById('canvasInfo');
        if (!canvasInfo) {
            return;
        }

        const zoomPct = Math.round(this.zoomLevel * 100);
        if (this.currentLanguage === 'fi') {
            canvasInfo.textContent = `Koko: ${this.canvas.width}x${this.canvas.height} | Zoom: ${zoomPct}%`;
        } else {
            canvasInfo.textContent = `Size: ${this.canvas.width}x${this.canvas.height} | Zoom: ${zoomPct}%`;
        }
    }

    getBaseCanvasDisplaySize() {
        const container = document.getElementById('canvasContainer');
        if (!container) {
            return this.canvas.width;
        }

        return Math.max(64, Math.min(container.clientWidth, container.clientHeight));
    }

    update2DCanvasDisplay() {
        const container = document.getElementById('canvasContainer');
        if (!container) {
            return;
        }

        this.baseCanvasDisplaySize = this.getBaseCanvasDisplaySize();
        const displaySize = Math.max(16, this.baseCanvasDisplaySize * this.zoomLevel);

        this.canvas.style.width = `${displaySize}px`;
        this.canvas.style.height = `${displaySize}px`;
        this.canvas.style.maxWidth = 'none';
        this.canvas.style.maxHeight = 'none';
    }

    reset2DZoom() {
        this.zoomLevel = 1;
        this.update2DCanvasDisplay();

        const container = document.getElementById('canvasContainer');
        if (container) {
            container.scrollLeft = 0;
            container.scrollTop = 0;
        }

        this.updateCanvasInfo();
        this.refreshBrushCursor();
    }

    handle2DZoomWheel(e) {
        if (this.viewMode !== '2D') {
            return;
        }

        // Zoom only when Ctrl is held; otherwise allow normal container scrolling.
        if (!e.ctrlKey) {
            return;
        }

        e.preventDefault();
        const container = document.getElementById('canvasContainer');
        if (!container) {
            return;
        }

        const oldZoom = this.zoomLevel;
        const zoomFactor = e.deltaY < 0 ? 1.2 : (1 / 1.2);
        const nextZoom = Math.min(this.maxZoomLevel, Math.max(this.minZoomLevel, oldZoom * zoomFactor));

        if (Math.abs(nextZoom - oldZoom) < 0.0001) {
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const oldBase = this.getBaseCanvasDisplaySize();
        const oldDisplaySize = oldBase * oldZoom;

        const mouseContentX = (e.clientX - containerRect.left) + container.scrollLeft;
        const mouseContentY = (e.clientY - containerRect.top) + container.scrollTop;

        const relX = oldDisplaySize > 0 ? mouseContentX / oldDisplaySize : 0.5;
        const relY = oldDisplaySize > 0 ? mouseContentY / oldDisplaySize : 0.5;

        this.zoomLevel = nextZoom;
        this.update2DCanvasDisplay();

        const newDisplaySize = this.baseCanvasDisplaySize * this.zoomLevel;
        const viewportX = e.clientX - containerRect.left;
        const viewportY = e.clientY - containerRect.top;

        container.scrollLeft = (relX * newDisplaySize) - viewportX;
        container.scrollTop = (relY * newDisplaySize) - viewportY;

        this.updateCanvasInfo();
        this.refreshBrushCursor();
    }

    initBrushCursor() {
        if (this.cursorOverlay) {
            return;
        }

        const container = document.getElementById('canvasContainer');
        if (!container) {
            return;
        }

        this.cursorOverlay = document.createElement('div');
        this.cursorOverlay.id = 'brushCursor';
        this.cursorOverlay.className = 'brush-cursor hidden';
        container.appendChild(this.cursorOverlay);
    }

    showBrushCursor(e) {
        if (this.viewMode !== '2D') {
            return;
        }

        this.updateBrushCursor(e);
        if (this.cursorOverlay) {
            this.cursorOverlay.classList.remove('hidden');
        }
    }

    hideBrushCursor() {
        if (this.cursorOverlay) {
            this.cursorOverlay.classList.add('hidden');
        }
    }

    refreshBrushCursor() {
        if (this.lastPointerX === null || this.lastPointerY === null) {
            return;
        }

        this.updateBrushCursorPosition(this.lastPointerX, this.lastPointerY);
    }

    updateBrushCursor(e) {
        if (!e) {
            return;
        }

        this.updateBrushCursorPosition(e.clientX, e.clientY);
    }

    updateBrushCursorPosition(clientX, clientY) {
        if (!this.cursorOverlay || this.viewMode !== '2D') {
            return;
        }

        const canvasRect = this.canvas.getBoundingClientRect();
        const insideCanvas = (
            clientX >= canvasRect.left &&
            clientX <= canvasRect.right &&
            clientY >= canvasRect.top &&
            clientY <= canvasRect.bottom
        );

        if (!insideCanvas) {
            this.hideBrushCursor();
            return;
        }

        const container = document.getElementById('canvasContainer');
        if (!container) {
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const scaleX = canvasRect.width / this.canvas.width;
        const scaleY = canvasRect.height / this.canvas.height;
        const displaySize = Math.max(8, this.brushSize * Math.min(scaleX, scaleY));

        const x = clientX - containerRect.left + container.scrollLeft;
        const y = clientY - containerRect.top + container.scrollTop;

        // Use transform for GPU-accelerated positioning (avoids layout thrashing)
        this.cursorOverlay.style.width = `${displaySize}px`;
        this.cursorOverlay.style.height = `${displaySize}px`;
        this.cursorOverlay.style.transform = `translate(${x - displaySize / 2}px, ${y - displaySize / 2}px)`;

        if (this.currentTool === 'eraser') {
            this.cursorOverlay.style.borderStyle = 'dashed';
            this.cursorOverlay.style.borderColor = '#ffffff';
            this.cursorOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        } else if (this.currentTool === 'spray') {
            this.cursorOverlay.style.borderStyle = 'dotted';
            this.cursorOverlay.style.borderColor = '#18b8ff';
            this.cursorOverlay.style.backgroundColor = 'rgba(24, 184, 255, 0.12)';
        } else {
            this.cursorOverlay.style.borderStyle = 'solid';
            this.cursorOverlay.style.borderColor = this.currentColor;
            this.cursorOverlay.style.backgroundColor = 'transparent';
        }

        this.cursorOverlay.classList.remove('hidden');

        this.lastPointerX = clientX;
        this.lastPointerY = clientY;
    }

    t(key) {
        const translations = this.translations && typeof this.translations === 'object'
            ? this.translations
            : { en: {}, fi: {} };
        const language = this.currentLanguage === 'fi' ? 'fi' : 'en';
        const selected = translations[language] || translations.en || {};
        const english = translations.en || {};
        return selected[key] || english[key] || key;
    }

    applyLanguage() {
        const translations = this.translations && typeof this.translations === 'object'
            ? this.translations
            : { en: {}, fi: {} };
        const language = this.currentLanguage === 'fi' ? 'fi' : 'en';
        const selected = translations[language] || translations.en || {};
        document.documentElement.lang = language;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.dataset.i18n;
            if (selected[key]) {
                el.textContent = selected[key];
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.dataset.i18nTitle;
            if (selected[key]) {
                el.setAttribute('title', selected[key]);
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.dataset.i18nPlaceholder;
            if (selected[key]) {
                el.setAttribute('placeholder', selected[key]);
            }
        });

        document.querySelectorAll('[data-i18n-label]').forEach((el) => {
            const key = el.dataset.i18nLabel;
            if (selected[key]) {
                el.setAttribute('label', selected[key]);
            }
        });

        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.textContent = language === 'en' ? this.t('switchToFinnish') : this.t('switchToEnglish');
        }

        this.updateDrawModeButton();
        this.updateLayersList();
        this.updateCanvasInfo();
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'fi' : 'en';
        this.applyLanguage();
    }

    updateDrawModeButton() {
        const btn = document.getElementById('toggleDrawMode');
        if (!btn) return;

        if (this.drawModeEnabled) {
            btn.textContent = this.t('drawModeOn');
            btn.style.backgroundColor = '#0f8d62';
            btn.style.color = 'white';
        } else {
            btn.textContent = this.t('drawModeOff');
            btn.style.backgroundColor = '';
            btn.style.color = '';
        }
    }
    
    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const coords = this.getCanvasCoords(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        if (this.currentTool === 'fill') {
            this.floodFill(coords.x, coords.y);
            this.stopDrawing();
            return;
        }

        if (this.currentTool === 'brush' || this.currentTool === 'eraser' || this.currentTool === 'spray') {
            this.draw(e);
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const coords = this.getCanvasCoords(e);
        const layer = this.layers[this.currentLayer];
        const spacingFactor = this.currentTool === 'spray' ? 0.32 : 0.18;
        const strokePoints = this.buildStrokePoints(this.lastX, this.lastY, coords.x, coords.y, spacingFactor);

        const canPaintPlacedImages = this.drawOnPlacedImages && (this.currentTool === 'brush' || this.currentTool === 'spray');
        const canErasePlacedImages = this.currentTool === 'eraser' && this.eraserAffectsPlacedImages;

        let touchedPlacedImages = false;
        if (canPaintPlacedImages || canErasePlacedImages) {
            touchedPlacedImages = this.applyStrokeToPlacedImages(strokePoints, this.currentTool);
        }
        
        switch (this.currentTool) {
            case 'brush':
                if (!touchedPlacedImages && layer) {
                    this.drawBrush(layer.ctx, coords.x, coords.y, strokePoints);
                }
                break;
            case 'eraser':
                if ((!touchedPlacedImages || !canErasePlacedImages) && layer) {
                    this.drawEraserOnTargetLayers(coords.x, coords.y, strokePoints);
                }
                break;
            case 'spray':
                if (!touchedPlacedImages && layer) {
                    this.drawSpray(layer.ctx, coords.x, coords.y, strokePoints);
                }
                break;
        }
        
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.composeLayers();
        this.update3DTexture();
    }

    buildStrokePoints(fromX, fromY, toX, toY, spacingFactor = 0.18) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.hypot(dx, dy);
        const spacing = Math.max(1, this.brushSize * spacingFactor);
        const steps = Math.max(1, Math.ceil(distance / spacing));
        const points = [];

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            points.push({
                x: fromX + dx * t,
                y: fromY + dy * t
            });
        }

        return points;
    }

    stampBrushPoint(ctx, x, y, radius = this.brushSize / 2) {
        const safeRadius = Math.max(1, radius);

        if (this.hardness < 1) {
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, safeRadius);
            gradient.addColorStop(0, this.currentColor);
            gradient.addColorStop(this.hardness, this.currentColor);
            gradient.addColorStop(1, this.currentColor + '00');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.currentColor;
        }

        ctx.beginPath();
        ctx.arc(x, y, safeRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    stampEraserPoint(ctx, x, y, radius = this.brushSize / 2) {
        const safeRadius = Math.max(1, radius);
        ctx.beginPath();
        ctx.arc(x, y, safeRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    stampSprayPoint(ctx, x, y, radius = this.brushSize / 2) {
        const safeRadius = Math.max(1, radius);
        const particles = Math.max(14, Math.round(safeRadius * 1.8));
        const dotRadius = Math.max(0.5, safeRadius * 0.07);

        for (let i = 0; i < particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.sqrt(Math.random()) * safeRadius;
            const sprayX = x + Math.cos(angle) * distance;
            const sprayY = y + Math.sin(angle) * distance;

            ctx.beginPath();
            ctx.arc(sprayX, sprayY, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    drawBrush(ctx, x, y, strokePoints = null) {
        const points = strokePoints || this.buildStrokePoints(this.lastX, this.lastY, x, y, 0.18);

        ctx.save();
        ctx.globalAlpha = this.opacity;
        points.forEach((point) => {
            this.stampBrushPoint(ctx, point.x, point.y);
        });
        ctx.restore();
    }
    
    drawEraser(ctx, x, y, strokePoints = null, alphaOverride = 1) {
        const points = strokePoints || this.buildStrokePoints(this.lastX, this.lastY, x, y, 0.18);
        const eraserAlpha = Math.max(0, Math.min(1, alphaOverride));

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = eraserAlpha;
        points.forEach((point) => {
            this.stampEraserPoint(ctx, point.x, point.y);
        });
        ctx.restore();
    }
    
    drawSpray(ctx, x, y, strokePoints = null) {
        const points = strokePoints || this.buildStrokePoints(this.lastX, this.lastY, x, y, 0.32);

        ctx.save();
        ctx.globalAlpha = this.opacity * 0.12;
        ctx.fillStyle = this.currentColor;
        points.forEach((point) => {
            this.stampSprayPoint(ctx, point.x, point.y);
        });
        ctx.restore();
    }

    getEraserTargetLayers() {
        const currentLayer = this.layers[this.currentLayer];
        if (!currentLayer) {
            return [];
        }

        if (!this.eraserAffectsPatternLayers) {
            return [currentLayer];
        }

        const targets = [currentLayer];
        this.layers.forEach((layer) => {
            if (layer !== currentLayer && layer.patternApplied) {
                targets.push(layer);
            }
        });

        return targets;
    }

    ensureEditableCanvasFromImage(imageSource) {
        if (!imageSource) {
            return null;
        }

        if (typeof HTMLCanvasElement !== 'undefined' && imageSource instanceof HTMLCanvasElement) {
            return imageSource;
        }

        const sourceWidth = imageSource.naturalWidth || imageSource.width;
        const sourceHeight = imageSource.naturalHeight || imageSource.height;
        if (!sourceWidth || !sourceHeight) {
            return null;
        }

        const editableCanvas = document.createElement('canvas');
        editableCanvas.width = sourceWidth;
        editableCanvas.height = sourceHeight;
        const editableCtx = editableCanvas.getContext('2d');
        if (!editableCtx) {
            return null;
        }

        editableCtx.drawImage(imageSource, 0, 0, sourceWidth, sourceHeight);
        return editableCanvas;
    }

    cloneImageToCanvas(imageSource) {
        const editableSource = this.ensureEditableCanvasFromImage(imageSource);
        if (!editableSource) {
            return null;
        }

        const clone = document.createElement('canvas');
        clone.width = editableSource.width;
        clone.height = editableSource.height;
        const cloneCtx = clone.getContext('2d');
        if (!cloneCtx) {
            return null;
        }

        cloneCtx.drawImage(editableSource, 0, 0);
        return clone;
    }

    getPlacedImageStrokeTargets() {
        const targets = [];

        if (this.placedImage && this.placedImageWidth > 0 && this.placedImageHeight > 0) {
            const editablePreview = this.ensureEditableCanvasFromImage(this.placedImage);
            if (editablePreview) {
                if (editablePreview !== this.placedImage) {
                    this.placedImage = editablePreview;
                }

                targets.push({
                    canvas: this.placedImage,
                    x: this.placedImageX,
                    y: this.placedImageY,
                    width: this.placedImageWidth,
                    height: this.placedImageHeight,
                    rotation: this.placedImageRotation || 0
                });
            }
        }

        this.appliedImages.forEach((item) => {
            if (!item || !item.image || item.width <= 0 || item.height <= 0) {
                return;
            }

            if (this.placedImage && this.editingAppliedImageId !== null && item.id === this.editingAppliedImageId) {
                return;
            }

            const editableImage = this.ensureEditableCanvasFromImage(item.image);
            if (!editableImage) {
                return;
            }

            if (editableImage !== item.image) {
                item.image = editableImage;
            }

            targets.push({
                canvas: item.image,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                rotation: item.rotation || 0
            });
        });

        return targets;
    }

    mapCanvasPointToPlacedImage(target, canvasX, canvasY) {
        const centerX = target.x + target.width / 2;
        const centerY = target.y + target.height / 2;
        const radians = (-target.rotation * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        const dx = canvasX - centerX;
        const dy = canvasY - centerY;
        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        if (
            localX < -target.width / 2 ||
            localX > target.width / 2 ||
            localY < -target.height / 2 ||
            localY > target.height / 2
        ) {
            return null;
        }

        const normalizedX = (localX + target.width / 2) / target.width;
        const normalizedY = (localY + target.height / 2) / target.height;

        return {
            x: normalizedX * target.canvas.width,
            y: normalizedY * target.canvas.height,
            scaleX: target.canvas.width / Math.max(1, target.width),
            scaleY: target.canvas.height / Math.max(1, target.height)
        };
    }

    applyStrokeToPlacedImages(strokePoints, mode) {
        if (!strokePoints || strokePoints.length === 0) {
            return false;
        }

        const targets = this.getPlacedImageStrokeTargets();
        if (targets.length === 0) {
            return false;
        }

        let touchedAny = false;

        targets.forEach((target) => {
            const targetCtx = target.canvas.getContext('2d');
            if (!targetCtx) {
                return;
            }

            let touchedTarget = false;
            targetCtx.save();

            if (mode === 'eraser') {
                targetCtx.globalCompositeOperation = 'destination-out';
                targetCtx.globalAlpha = 1;
            } else if (mode === 'brush') {
                targetCtx.globalAlpha = this.opacity;
            } else if (mode === 'spray') {
                targetCtx.globalAlpha = this.opacity * 0.12;
                targetCtx.fillStyle = this.currentColor;
            }

            strokePoints.forEach((point) => {
                const mappedPoint = this.mapCanvasPointToPlacedImage(target, point.x, point.y);
                if (!mappedPoint) {
                    return;
                }

                touchedTarget = true;

                const scale = (mappedPoint.scaleX + mappedPoint.scaleY) / 2;
                const radius = Math.max(1, (this.brushSize / 2) * scale);

                if (mode === 'brush') {
                    this.stampBrushPoint(targetCtx, mappedPoint.x, mappedPoint.y, radius);
                } else if (mode === 'eraser') {
                    this.stampEraserPoint(targetCtx, mappedPoint.x, mappedPoint.y, radius);
                } else if (mode === 'spray') {
                    this.stampSprayPoint(targetCtx, mappedPoint.x, mappedPoint.y, radius);
                }
            });

            targetCtx.restore();

            if (touchedTarget) {
                touchedAny = true;
            }
        });

        return touchedAny;
    }

    drawEraserOnTargetLayers(x, y, strokePoints) {
        const targetLayers = this.getEraserTargetLayers();
        targetLayers.forEach((layer) => {
            this.drawEraser(layer.ctx, x, y, strokePoints, 1);
        });
    }
    
    floodFill(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        
        const layer = this.layers[this.currentLayer];
        const imageData = layer.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const targetColor = this.getPixelColor(imageData, x, y);
        const fillColor = this.hexToRgb(this.currentColor);
        
        if (this.colorsMatch(targetColor, fillColor)) return;
        
        const stack = [[x, y]];
        const visited = new Set();
        
        while (stack.length) {
            const [cx, cy] = stack.pop();
            const key = `${cx},${cy}`;
            
            if (visited.has(key)) continue;
            if (cx < 0 || cx >= this.canvas.width || cy < 0 || cy >= this.canvas.height) continue;
            
            const currentColor = this.getPixelColor(imageData, cx, cy);
            if (!this.colorsMatch(currentColor, targetColor)) continue;
            
            visited.add(key);
            this.setPixelColor(imageData, cx, cy, fillColor);
            
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        
        layer.ctx.putImageData(imageData, 0, 0);
        this.composeLayers();
        this.saveState();
    }
    
    getPixelColor(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }
    
    setPixelColor(imageData, x, y, color) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = 255;
    }
    
    colorsMatch(c1, c2, tolerance = 10) {
        return Math.abs(c1.r - c2.r) <= tolerance &&
               Math.abs(c1.g - c2.g) <= tolerance &&
               Math.abs(c1.b - c2.b) <= tolerance;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    applyMaterialAdjustments() {
        // Apply brightness, contrast, saturation adjustments to the current layer
        // Always start from baseLayerData to avoid data loss
        if (!this.baseLayerData) {
            console.warn('Base layer data not available');
            return;
        }
        
        const layer = this.layers[this.currentLayer];
        // Create new image data from base
        const imageData = layer.ctx.createImageData(this.canvas.width, this.canvas.height);
        // Copy base layer data
        imageData.data.set(this.baseLayerData);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Apply brightness
            if (this.brightness !== 0) {
                const brightnessFactor = 1 + (this.brightness / 100);
                r = Math.min(255, r * brightnessFactor);
                g = Math.min(255, g * brightnessFactor);
                b = Math.min(255, b * brightnessFactor);
            }
            
            // Apply contrast
            if (this.contrast !== 0) {
                const contrastFactor = (this.contrast / 100) + 1;
                const intercept = 128 * (1 - contrastFactor);
                r = Math.min(255, Math.max(0, r * contrastFactor + intercept));
                g = Math.min(255, Math.max(0, g * contrastFactor + intercept));
                b = Math.min(255, Math.max(0, b * contrastFactor + intercept));
            }
            
            // Apply saturation
            if (this.saturation !== 0) {
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                const saturationFactor = 1 + (this.saturation / 100);
                r = Math.min(255, Math.max(0, gray + (r - gray) * saturationFactor));
                g = Math.min(255, Math.max(0, gray + (g - gray) * saturationFactor));
                b = Math.min(255, Math.max(0, gray + (b - gray) * saturationFactor));
            }
            
            data[i] = Math.round(r);
            data[i + 1] = Math.round(g);
            data[i + 2] = Math.round(b);
        }
        
        layer.ctx.putImageData(imageData, 0, 0);
        this.composeLayers();
    }
    

    
    gaussianBlur(imageData, radius) {
        // Simple box blur implementation
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const output = new Uint8ClampedArray(data);
        
        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                let r = 0, g = 0, b = 0, count = 0;
                
                for (let ky = -radius; ky <= radius; ky++) {
                    for (let kx = -radius; kx <= radius; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        r += data[idx];
                        g += data[idx + 1];
                        b += data[idx + 2];
                        count++;
                    }
                }
                
                const idx = (y * width + x) * 4;
                output[idx] = r / count;
                output[idx + 1] = g / count;
                output[idx + 2] = b / count;
            }
        }
        
        return new ImageData(output, width, height);
    }
    

    
    applyPreset(preset) {
        const layer = this.layers[this.currentLayer];
        const ctx = layer.ctx;
        
        switch (preset) {
            case 'asiimov':
                this.applyAsiimov(ctx);
                break;
            case 'redline':
                this.applyRedline(ctx);
                break;
            case 'fade':
                this.applyFade(ctx);
                break;
            case 'tiger':
                this.applyTigerTooth(ctx);
                break;
            case 'vulcan':
                this.applyVulcan(ctx);
                break;
            case 'neon':
                this.applyNeonRider(ctx);
                break;
        }
        
        this.composeLayers();
        this.saveState();
    }
    
    applyAsiimov(ctx) {
        // White base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Orange accents
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(0, 0, this.canvas.width / 3, this.canvas.height);
        
        // Black details
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.canvas.width;
            ctx.fillRect(x, 0, 50, this.canvas.height);
        }
    }
    
    applyRedline(ctx) {
        // Black base
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Red lines
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 10;
        
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(0, (i / 20) * this.canvas.height);
            ctx.lineTo(this.canvas.width, (i / 20) * this.canvas.height);
            ctx.stroke();
        }
    }
    
    applyFade(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#ff00ff');
        gradient.addColorStop(0.5, '#8800ff');
        gradient.addColorStop(1, '#0088ff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    applyTigerTooth(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, '#ffaa00');
        gradient.addColorStop(0.5, '#ffdd00');
        gradient.addColorStop(1, '#ffaa00');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    applyVulcan(ctx) {
        // Dark blue/black base
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Orange/red geometric accents
        ctx.fillStyle = '#ff4400';
        for (let i = 0; i < 30; i++) {
            ctx.fillRect(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                50, 5
            );
        }
    }
    
    applyNeonRider(ctx) {
        // Purple base
        ctx.fillStyle = '#4400aa';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Neon green lines
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 5;
        
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            ctx.lineTo(Math.random() * this.canvas.width, Math.random() * this.canvas.height);
            ctx.stroke();
        }
    }
    
    composeLayers() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Keep composed texture opaque so erased transparent pixels do not appear black in 3D.
        this.ctx.fillStyle = this.compositeBaseColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw UV sheet below textures (if mode is 'below' or 'both')
        if (this.uvSheetVisible && this.uvSheetCanvas && (this.uvSheetDisplayMode === 'below' || this.uvSheetDisplayMode === 'both')) {
            this.ctx.globalAlpha = this.uvSheetOpacity;
            this.ctx.drawImage(this.uvSheetCanvas, 0, 0);
            this.ctx.globalAlpha = 1;
        }

        // Draw layers on top
        for (let i = 0; i < this.layers.length; i++) {
            if (this.layers[i].visible) {
                this.ctx.globalAlpha = this.layers[i].opacity;
                this.ctx.globalCompositeOperation = this.layers[i].blendMode || 'source-over';
                this.ctx.drawImage(this.layers[i].canvas, 0, 0);
            }
        }

        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';

        // Draw UV sheet above textures (if mode is 'above' or 'both')
        if (this.uvSheetVisible && this.uvSheetCanvas && (this.uvSheetDisplayMode === 'above' || this.uvSheetDisplayMode === 'both')) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.drawImage(this.uvSheetCanvas, 0, 0);
            this.ctx.globalAlpha = 1;
        }

        // Draw committed placed images (editable image library entries)
        if (this.appliedImages.length > 0) {
            this.appliedImages.forEach((item) => {
                // When editing an existing entry, draw only the live preview for that entry.
                if (item.id === this.editingAppliedImageId && this.placedImage) {
                    return;
                }

                this.drawPlacedImageToContext(
                    this.ctx,
                    item.image,
                    item.x,
                    item.y,
                    item.width,
                    item.height,
                    item.rotation,
                    1
                );
            });
        }
        
        // Draw placed image preview if active
        if (this.placedImage) {
            const ctx = this.ctx;
            ctx.save();
            
            // Draw image preview with current rotation
            this.drawPlacedImageToContext(
                ctx,
                this.placedImage,
                this.placedImageX,
                this.placedImageY,
                this.placedImageWidth,
                this.placedImageHeight,
                this.placedImageRotation,
                0.7
            );
            
            // Draw border
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00e5ff';
            ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
            ctx.shadowBlur = 10;
            ctx.strokeRect(this.placedImageX, this.placedImageY,
                          this.placedImageWidth, this.placedImageHeight);
            ctx.shadowBlur = 0;
            
            // Draw resize handles - LARGE and VISIBLE
            const handleSize = 14;
            const x = this.placedImageX;
            const y = this.placedImageY;
            const w = this.placedImageWidth;
            const h = this.placedImageHeight;
            
            // Draw handles with strong glow effect
            ctx.fillStyle = '#00e5ff';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
            ctx.shadowBlur = 12;
            
            // Corner handles
            ctx.beginPath();
            ctx.arc(x, y, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + w, y, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + w, y + h, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y + h, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            
            // Edge handles
            ctx.beginPath();
            ctx.arc(x + w/2, y, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + w, y + h/2, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + w/2, y + h, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y + h/2, handleSize/2, 0, Math.PI * 2);
                        ctx.stroke();
            ctx.fill();
            
            ctx.shadowBlur = 0;
            
            ctx.restore();
        }

        // Always refresh 3D map when canvas composition changes (undo/redo/clear/etc.)
        // BUT NOT during image placement (too slow)
        if (this.weaponMesh && !this.placedImage) {
            this.update3DTexture();
        }
    }
    
    addLayer() {
        this.layers.push(this.createLayer());
        this.currentLayer = this.layers.length - 1;
        this.customPatternBlendMode = this.normalizePatternBlendMode(this.layers[this.currentLayer].blendMode);
        this.syncPatternScaleInputs();
        this.updateLayersList();
    }
    
    updateLayersList() {
        const list = document.getElementById('layersList');
        if (!list) return;
        list.innerHTML = '';
        
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const div = document.createElement('div');
            div.className = 'layer-item' + (i === this.currentLayer ? ' active' : '');
            div.dataset.layer = i;
            div.innerHTML = `
                <span>${this.t('layerLabel')} ${i + 1}</span>
                <button class="btn-tiny" data-action="delete" data-layer="${i}">${this.t('deleteShort')}</button>
            `;
            
            div.addEventListener('click', (e) => {
                if (e.target.dataset.action !== 'delete') {
                    this.currentLayer = parseInt(div.dataset.layer);
                    this.customPatternBlendMode = this.normalizePatternBlendMode(this.layers[this.currentLayer].blendMode);
                    this.syncPatternScaleInputs();
                    this.updateLayersList();
                }
            });
            
            div.querySelector('[data-action="delete"]')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.layers.length > 1) {
                    this.layers.splice(i, 1);
                    if (this.currentLayer >= this.layers.length) {
                        this.currentLayer = this.layers.length - 1;
                    }
                    this.customPatternBlendMode = this.normalizePatternBlendMode(this.layers[this.currentLayer].blendMode);
                    this.syncPatternScaleInputs();
                    this.updateLayersList();
                    this.composeLayers();
                }
            });
            
            list.appendChild(div);
        }
    }
    
    clearCanvas(color = 'transparent') {
        const layer = this.layers[this.currentLayer];
        if (color === 'transparent') {
            layer.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Track base composite color from explicit base fills on layer 0.
            if (this.currentLayer === 0) {
                this.compositeBaseColor = color;
            }
            layer.ctx.fillStyle = color;
            layer.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        layer.patternApplied = false;
        this.composeLayers();
        this.saveBaseLayerData();
    }
    
    loadImage(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const layer = this.layers[this.currentLayer];
                layer.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                this.composeLayers();
                this.saveBaseLayerData();
                this.saveState();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    clampPatternScale(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return this.customPatternScale;
        }

        return Math.min(this.maxPatternScale, Math.max(this.minPatternScale, Math.round(numeric)));
    }

    clampPatternOffset(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return 0;
        }

        return Math.min(this.maxPatternOffset, Math.max(this.minPatternOffset, Math.round(numeric)));
    }

    clampPatternRotation(value) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
            return 0;
        }

        return Math.min(this.maxPatternRotation, Math.max(this.minPatternRotation, Math.round(numeric)));
    }

    normalizePatternBlendMode(value) {
        const allowedModes = ['source-over', 'multiply', 'overlay', 'screen'];
        return allowedModes.includes(value) ? value : 'source-over';
    }

    normalizePatternTargetArea(value) {
        const allowedAreas = ['all', 'barrel', 'magazine', 'body', 'stock', 'grip', 'sight', 'suppressor'];
        return allowedAreas.includes(value) ? value : 'all';
    }

    syncPatternScaleInputs() {
        this.customPatternScale = this.clampPatternScale(this.customPatternScale);
        this.customPatternOffsetX = this.clampPatternOffset(this.customPatternOffsetX);
        this.customPatternOffsetY = this.clampPatternOffset(this.customPatternOffsetY);
        this.customPatternRotation = this.clampPatternRotation(this.customPatternRotation);
        this.customPatternBlendMode = this.normalizePatternBlendMode(this.customPatternBlendMode);

        const slider = document.getElementById('patternScale');
        const valueInput = document.getElementById('patternScaleValue');
        const offsetXSlider = document.getElementById('patternOffsetX');
        const offsetXValue = document.getElementById('patternOffsetXValue');
        const offsetYSlider = document.getElementById('patternOffsetY');
        const offsetYValue = document.getElementById('patternOffsetYValue');
        const rotationSlider = document.getElementById('patternRotation');
        const rotationValue = document.getElementById('patternRotationValue');
        const blendModeSelect = document.getElementById('patternBlendMode');
        const invertMaskCheckbox = document.getElementById('patternInvertMask');
        const weaponPresetSelect = document.getElementById('weaponPreset');

        if (slider) {
            slider.value = String(this.customPatternScale);
        }

        if (valueInput) {
            valueInput.value = String(this.customPatternScale);
        }

        if (offsetXSlider) {
            offsetXSlider.value = String(this.customPatternOffsetX);
        }

        if (offsetXValue) {
            offsetXValue.value = String(this.customPatternOffsetX);
        }

        if (offsetYSlider) {
            offsetYSlider.value = String(this.customPatternOffsetY);
        }

        if (offsetYValue) {
            offsetYValue.value = String(this.customPatternOffsetY);
        }

        if (rotationSlider) {
            rotationSlider.value = String(this.customPatternRotation);
        }

        if (rotationValue) {
            rotationValue.value = String(this.customPatternRotation);
        }

        if (blendModeSelect) {
            blendModeSelect.value = this.customPatternBlendMode;
        }

        if (invertMaskCheckbox) {
            invertMaskCheckbox.checked = this.patternInvertMask;
        }

        if (weaponPresetSelect) {
            weaponPresetSelect.value = this.weaponPreset;
        }

        // Update checkboxes for target areas
        const patternTargetAreasDiv = document.getElementById('patternTargetAreas');
        if (patternTargetAreasDiv) {
            patternTargetAreasDiv.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = this.patternTargetAreas.includes(checkbox.value);
            });
        }
    }

    loadPatternImage(file) {
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Disable draw mode when image is loaded
                this.drawModeEnabled = false;
                this.updateDrawModeButton();
                
                // Store image for placement
                this.placedImage = this.cloneImageToCanvas(img);
                if (!this.placedImage) {
                    console.error('Failed to prepare placed image for editing');
                    return;
                }
                this.placedImageName = file.name || `Image ${Date.now()}`;
                this.editingAppliedImageId = null;
                
                // Set default size (fit to canvas or reasonable default)
                const maxW = this.canvas.width * 0.6;
                const maxH = this.canvas.height * 0.6;
                const scale = Math.min(maxW / img.width, maxH / img.height, 1);
                
                this.placedImageWidth = img.width * scale;
                this.placedImageHeight = img.height * scale;
                this.placedImageX = (this.canvas.width - this.placedImageWidth) / 2;
                this.placedImageY = (this.canvas.height - this.placedImageHeight) / 2;
                this.placedImageRotation = 0;
                
                // Show controls
                this.showImagePlacementControls();
                
                // Draw preview
                this.composeLayers();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    showImagePlacementControls() {
        const controlsDiv = document.getElementById('imagePlacementControls');
        if (!controlsDiv) {
            console.warn('⚠️ imagePlacementControls div not found in HTML');
            return;
        }

        const isEditing = this.editingAppliedImageId !== null;
        const rotationValue = Math.round(this.placedImageRotation || 0);
        
        controlsDiv.innerHTML = `
            <h4>📍 Place & Scale Image</h4>
            <p style="font-size: 0.85rem; color: #8ea3be; margin-bottom: 8px;">
                Drag to move • Drag corners/edges to resize
            </p>
            
            <label>Rotation: <span id="imagePlacementRotationValue">${rotationValue}°</span></label>
            <input type="range" id="imagePlacementRotation" min="0" max="360" value="${rotationValue}" 
                   style="margin: 6px 0;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px;">
                <button id="applyImage" class="btn-success">${isEditing ? '✓ Update Image' : '✓ Save Image'}</button>
                <button id="cancelImage" class="btn">✕ Cancel</button>
            </div>
        `;
        
        controlsDiv.style.display = 'block';
        
        // Add event listeners
        document.getElementById('imagePlacementRotation').addEventListener('input', (e) => {
            this.placedImageRotation = parseInt(e.target.value);
            document.getElementById('imagePlacementRotationValue').textContent = e.target.value + '°';
            this.composeLayers();
        });
        
        document.getElementById('applyImage').addEventListener('click', () => {
            this.applyPlacedImage();
        });
        
        document.getElementById('cancelImage').addEventListener('click', () => {
            this.cancelImagePlacement();
        });
    }
    
    applyPlacedImage() {
        if (!this.placedImage) return;

        const committedImage = this.cloneImageToCanvas(this.placedImage);
        if (!committedImage) {
            return;
        }

        const isEditing = this.editingAppliedImageId !== null;
        const imageId = isEditing ? this.editingAppliedImageId : ++this.appliedImageIdCounter;
        const imageName = this.placedImageName || `Image ${imageId}`;

        const entry = {
            id: imageId,
            name: imageName,
            image: committedImage,
            x: this.placedImageX,
            y: this.placedImageY,
            width: this.placedImageWidth,
            height: this.placedImageHeight,
            rotation: this.placedImageRotation
        };

        if (isEditing) {
            const index = this.appliedImages.findIndex((item) => item.id === imageId);
            if (index >= 0) {
                this.appliedImages[index] = entry;
            } else {
                this.appliedImages.push(entry);
            }
        } else {
            this.appliedImages.push(entry);
        }

        this.resetPlacementState();
        this.renderPlacedImagesLibrary();
        this.composeLayers();
        this.saveState();
    }
    
    cancelImagePlacement() {
        this.resetPlacementState();
        this.renderPlacedImagesLibrary();
        this.composeLayers();
    }

    resetPlacementState() {
        this.placedImage = null;
        this.placedImageName = '';
        this.editingAppliedImageId = null;
        this.isResizingImage = false;
        this.isDraggingImage = false;
        this.resizeHandle = null;
        
        // Reset cursor
        this.canvas.style.cursor = 'crosshair';
        
        const controlsDiv = document.getElementById('imagePlacementControls');
        if (controlsDiv) controlsDiv.style.display = 'none';
    }

    renderPlacedImagesLibrary() {
        const library = document.getElementById('placedImagesLibrary');
        if (!library) {
            return;
        }

        library.innerHTML = '';

        if (this.appliedImages.length === 0) {
            library.innerHTML = '<p class="field-hint" style="text-align:center; padding:10px;">No placed images yet</p>';
            return;
        }

        const visibleItems = [...this.appliedImages].reverse();
        visibleItems.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'pattern-item' + (item.id === this.editingAppliedImageId ? ' active' : '');

            const thumb = document.createElement('canvas');
            thumb.width = 50;
            thumb.height = 50;
            thumb.className = 'pattern-thumbnail';
            const thumbCtx = thumb.getContext('2d');
            thumbCtx.clearRect(0, 0, 50, 50);
            thumbCtx.drawImage(item.image, 0, 0, 50, 50);

            const info = document.createElement('div');
            info.className = 'pattern-info';

            const name = document.createElement('div');
            name.className = 'pattern-name';
            name.textContent = item.name;

            const meta = document.createElement('div');
            meta.className = 'pattern-parts';
            meta.textContent = `${Math.round(item.width)}x${Math.round(item.height)} • ${Math.round(item.rotation)}°`;

            info.appendChild(name);
            info.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'pattern-actions';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                this.editPlacedImage(item.id);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'delete';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deletePlacedImage(item.id);
            };

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            row.appendChild(thumb);
            row.appendChild(info);
            row.appendChild(actions);
            row.onclick = () => this.editPlacedImage(item.id);

            library.appendChild(row);
        });
    }

    editPlacedImage(imageId) {
        const item = this.appliedImages.find((entry) => entry.id === imageId);
        if (!item) {
            return;
        }

        const editableCopy = this.cloneImageToCanvas(item.image);
        if (!editableCopy) {
            return;
        }

        this.placedImage = editableCopy;
        this.placedImageName = item.name;
        this.placedImageX = item.x;
        this.placedImageY = item.y;
        this.placedImageWidth = item.width;
        this.placedImageHeight = item.height;
        this.placedImageRotation = item.rotation;
        this.editingAppliedImageId = item.id;
        this.isDraggingImage = false;
        this.isResizingImage = false;

        this.showImagePlacementControls();
        this.renderPlacedImagesLibrary();
        this.composeLayers();
    }

    deletePlacedImage(imageId) {
        const index = this.appliedImages.findIndex((entry) => entry.id === imageId);
        if (index === -1) {
            return;
        }

        this.appliedImages.splice(index, 1);
        if (this.editingAppliedImageId === imageId) {
            this.resetPlacementState();
        }

        this.renderPlacedImagesLibrary();
        this.composeLayers();
        this.saveState();
    }

    drawPlacedImageToContext(ctx, image, x, y, width, height, rotation, alpha = 1) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(centerX, centerY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
        ctx.restore();
    }

    // Get resize handle at point (returns: 'tl', 'tr', 'br', 'bl', 't', 'r', 'b', 'l', or null)
    getResizeHandleAtPoint(x, y) {
        if (!this.placedImage) return null;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleToCanvas = Math.max(this.canvas.width / rect.width, this.canvas.height / rect.height);
        const handleRadius = Math.max(12, 12 * scaleToCanvas);
        const left = this.placedImageX;
        const right = this.placedImageX + this.placedImageWidth;
        const top = this.placedImageY;
        const bottom = this.placedImageY + this.placedImageHeight;
        const midX = (left + right) / 2;
        const midY = (top + bottom) / 2;
        
        // Helper to check if point is within distance of center
        const isNear = (px, py, cx, cy, r) => {
            const dx = px - cx;
            const dy = py - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist <= r;
        };
        
        // Corner handles
        if (isNear(x, y, left, top, handleRadius)) return 'tl';
        if (isNear(x, y, right, top, handleRadius)) return 'tr';
        if (isNear(x, y, right, bottom, handleRadius)) return 'br';
        if (isNear(x, y, left, bottom, handleRadius)) return 'bl';
        
        // Edge handles
        if (isNear(x, y, midX, top, handleRadius)) return 't';
        if (isNear(x, y, right, midY, handleRadius)) return 'r';
        if (isNear(x, y, midX, bottom, handleRadius)) return 'b';
        if (isNear(x, y, left, midY, handleRadius)) return 'l';
        
        return null;
    }
    
    startDraggingImage(e) {
        if (!this.placedImage) return;
        
        const coords = this.getCanvasCoords(e);
        const mouseX = coords.x;
        const mouseY = coords.y;
        
        // Check if clicking on resize handle
        const handle = this.getResizeHandleAtPoint(mouseX, mouseY);
        
        if (handle) {
            // Start resizing
            this.isResizingImage = true;
            this.isDraggingImage = false;
            this.resizeHandle = handle;
            this.dragStartX = mouseX;
            this.dragStartY = mouseY;
            this.dragStartWidth = this.placedImageWidth;
            this.dragStartHeight = this.placedImageHeight;
            this.dragStartImageX = this.placedImageX;
            this.dragStartImageY = this.placedImageY;
        } else if (mouseX >= this.placedImageX &&
                   mouseX <= this.placedImageX + this.placedImageWidth &&
                   mouseY >= this.placedImageY &&
                   mouseY <= this.placedImageY + this.placedImageHeight) {
            // Start dragging
            this.isDraggingImage = true;
            this.isResizingImage = false;
            this.dragStartX = mouseX;
            this.dragStartY = mouseY;
            this.dragStartImageX = this.placedImageX;
            this.dragStartImageY = this.placedImageY;
        } else {
            // Clicked outside the image and handles
            this.isDraggingImage = false;
            this.isResizingImage = false;
        }
    }
    
    dragImage(e) {
        if (!this.placedImage) return;
        
        const coords = this.getCanvasCoords(e);
        const currentX = coords.x;
        const currentY = coords.y;
        
        const deltaX = currentX - this.dragStartX;
        const deltaY = currentY - this.dragStartY;
        
        if (this.isResizingImage && this.resizeHandle) {
            // FREE RESIZE (no aspect ratio lock) - allows changing proportions
            const handle = this.resizeHandle;
            
            let newWidth = this.dragStartWidth;
            let newHeight = this.dragStartHeight;
            let newX = this.dragStartImageX;
            let newY = this.dragStartImageY;
            
            // CORNER HANDLES - resize both width and height independently
            if (handle === 'br') {
                // Bottom-right: expand both dimensions
                newWidth = this.dragStartWidth + deltaX;
                newHeight = this.dragStartHeight + deltaY;
            } else if (handle === 'tr') {
                // Top-right: expand width, shrink from top
                newWidth = this.dragStartWidth + deltaX;
                newHeight = this.dragStartHeight - deltaY;
                newY = this.dragStartImageY + deltaY;
            } else if (handle === 'bl') {
                // Bottom-left: shrink from left, expand height
                newWidth = this.dragStartWidth - deltaX;
                newHeight = this.dragStartHeight + deltaY;
                newX = this.dragStartImageX + deltaX;
            } else if (handle === 'tl') {
                // Top-left: shrink from both top and left
                newWidth = this.dragStartWidth - deltaX;
                newHeight = this.dragStartHeight - deltaY;
                newX = this.dragStartImageX + deltaX;
                newY = this.dragStartImageY + deltaY;
            } 
            // EDGE HANDLES - resize single dimension only
            else if (handle === 'r') {
                // Right edge: only change width
                newWidth = this.dragStartWidth + deltaX;
            } else if (handle === 'l') {
                // Left edge: only change width
                newWidth = this.dragStartWidth - deltaX;
                newX = this.dragStartImageX + deltaX;
            } else if (handle === 'b') {
                // Bottom edge: only change height
                newHeight = this.dragStartHeight + deltaY;
            } else if (handle === 't') {
                // Top edge: only change height
                newHeight = this.dragStartHeight - deltaY;
                newY = this.dragStartImageY + deltaY;
            }
            
            // Apply min size constraint
            if (newWidth > 20 && newHeight > 20) {
                this.placedImageWidth = newWidth;
                this.placedImageHeight = newHeight;
                this.placedImageX = newX;
                this.placedImageY = newY;
            }
        } else if (this.isDraggingImage) {
            // Move image
            this.placedImageX = this.dragStartImageX + deltaX;
            this.placedImageY = this.dragStartImageY + deltaY;
        }
        
        // No need to call composeLayers() - animation loop handles it
    }
    
    scaleImage(e) {
        // No longer needed - scaling via drag handles instead
        e.preventDefault();
    }

    addPatternToLibrary(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Target areas removed - patterns now use simple image placement
                const patternId = ++this.patternIdCounter;
                const pattern = {
                    id: patternId,
                    name: file.name,
                    image: img,
                    targetAreas: [], // No longer used
                    scale: 100,
                    offsetX: 0,
                    offsetY: 0,
                    rotation: 0,
                    blendMode: 'source-over',
                    invertMask: false
                };
                
                this.patternLibrary.push(pattern);
                this.renderPatternLibrary();
                // Automatically select and apply the newly added pattern
                this.selectPattern(patternId);
                this.applyPattern(patternId);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Load UV map for the current weapon preset
    loadUVMapForWeapon(weaponKey) {
        console.log('🎯 Loading UV map for weapon:', weaponKey);
        
        if (!weaponKey || weaponKey === 'generic') {
            console.log('⚠️ Generic weapon selected, no UV map');
            this.uvMapImage = null;
            return;
        }
        
        // Check cache first
        if (this.uvMapCache[weaponKey]) {
            console.log('✅ UV map loaded from cache');
            this.uvMapImage = this.uvMapCache[weaponKey];
            this.processUVMap();
            return;
        }
        
        const uvSheetFilename = this.weaponUVSheets[weaponKey];
        if (!uvSheetFilename) {
            console.warn('❌ No UV sheet found for weapon:', weaponKey);
            this.uvMapImage = null;
            return;
        }
        
        const uvMapPath = `UVSheets/${uvSheetFilename}`;
        console.log('📁 Loading UV map from:', uvMapPath);
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            console.log('✅ UV map loaded successfully:', img.width, 'x', img.height);
            this.uvMapImage = img;
            this.uvMapCache[weaponKey] = img;
            this.processUVMap();
        };
        img.onerror = (err) => {
            console.error('❌ Failed to load UV map:', uvMapPath, err);
            this.uvMapImage = null;
        };
        img.src = uvMapPath;
    }
    
    // Process UV map and prepare for mask extraction
    processUVMap() {
        if (!this.uvMapImage) {
            console.log('⚠️ No UV map to process');
            return;
        }
        
        // Set canvas to match texture dimensions
        this.uvMapCanvas.width = this.canvas.width;
        this.uvMapCanvas.height = this.canvas.height;
        
        // Draw UV map scaled to texture size
        this.uvMapCtx.clearRect(0, 0, this.uvMapCanvas.width, this.uvMapCanvas.height);
        this.uvMapCtx.drawImage(this.uvMapImage, 0, 0, this.uvMapCanvas.width, this.uvMapCanvas.height);
        
        console.log('✅ UV map processed and ready for mask extraction');
    }
    
    // Create a mask from UV map based on target areas
    // UV maps typically have different brightness levels for different weapon parts
    createUVMask(targetAreas) {
        if (!this.uvMapImage || !targetAreas || targetAreas.length === 0) {
            return null;
        }
        
        console.log('🎨 Creating UV mask for areas:', targetAreas);
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = this.canvas.width;
        maskCanvas.height = this.canvas.height;
        const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
        
        // Get UV map pixel data
        const uvData = this.uvMapCtx.getImageData(0, 0, this.uvMapCanvas.width, this.uvMapCanvas.height);
        const maskData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
        
        // Define color/brightness ranges for each weapon part
        // This is a heuristic - UV maps often use different brightness levels or colors
        const partRanges = {
            'barrel': { hue: [0, 60], saturation: [0, 100], lightness: [40, 100] },
            'magazine': { hue: [0, 360], saturation: [0, 100], lightness: [0, 30] },
            'body': { hue: [30, 100], saturation: [0, 100], lightness: [30, 70] },
            'stock': { hue: [0, 30], saturation: [0, 50], lightness: [20, 50] },
            'grip': { hue: [0, 40], saturation: [0, 100], lightness: [35, 65] },
            'sight': { hue: [180, 240], saturation: [0, 100], lightness: [50, 100] },
            'suppressor': { hue: [0, 360], saturation: [0, 30], lightness: [60, 100] }
        };
        
        // Go through each pixel and determine if it belongs to selected areas
        for (let i = 0; i < uvData.data.length; i += 4) {
            const r = uvData.data[i];
            const g = uvData.data[i + 1];
            const b = uvData.data[i + 2];
            const a = uvData.data[i + 3];
            
            // Skip transparent pixels
            if (a < 10) {
                maskData.data[i + 3] = 0;
                continue;
            }
            
            // Convert RGB to HSL for better part detection
            const hsl = this.rgbToHsl(r, g, b);
            
            let inTargetArea = false;
            
            // Simple brightness-based segmentation as fallback
            // Most UV maps use brightness to indicate different areas
            const brightness = (r + g + b) / 3;
            
            for (const area of targetAreas) {
                // For now, use a simple heuristic based on pixel position and brightness
                // This can be refined based on actual UV map structure
                let matches = false;
                
                switch(area) {
                    case 'barrel':
                        // Typically right side of texture, lighter colors
                        matches = brightness > 100 && (i / 4) % this.uvMapCanvas.width > this.uvMapCanvas.width * 0.5;
                        break;
                    case 'magazine':
                        // Typically bottom-left, darker
                        matches = brightness < 80 && (i / 4) % this.uvMapCanvas.width < this.uvMapCanvas.width * 0.5 && 
                                 Math.floor((i / 4) / this.uvMapCanvas.width) > this.uvMapCanvas.height * 0.5;
                        break;
                    case 'body':
                        // Middle section, medium brightness
                        matches = brightness > 60 && brightness < 180 && 
                                 (i / 4) % this.uvMapCanvas.width > this.uvMapCanvas.width * 0.3 &&
                                 (i / 4) % this.uvMapCanvas.width < this.uvMapCanvas.width * 0.7;
                        break;
                    case 'stock':
                        // Left side
                        matches = (i / 4) % this.uvMapCanvas.width < this.uvMapCanvas.width * 0.3;
                        break;
                    case 'grip':
                        // Lower middle section
                        matches = brightness > 50 && brightness < 120 &&
                                 (i / 4) % this.uvMapCanvas.width > this.uvMapCanvas.width * 0.4 &&
                                 (i / 4) % this.uvMapCanvas.width < this.uvMapCanvas.width * 0.6 &&
                                 Math.floor((i / 4) / this.uvMapCanvas.width) > this.uvMapCanvas.height * 0.4;
                        break;
                    case 'sight':
                        // Top middle, often brighter or bluer
                        matches = Math.floor((i / 4) / this.uvMapCanvas.width) < this.uvMapCanvas.height * 0.3 &&
                                 (i / 4) % this.uvMapCanvas.width > this.uvMapCanvas.width * 0.4 &&
                                 (i / 4) % this.uvMapCanvas.width < this.uvMapCanvas.width * 0.65;
                        break;
                    case 'suppressor':
                        // Far right, typically lighter
                        matches = brightness > 120 && (i / 4) % this.uvMapCanvas.width > this.uvMapCanvas.width * 0.8;
                        break;
                }
                
                if (matches) {
                    inTargetArea = true;
                    break;
                }
            }
            
            // Set mask pixel
            if (inTargetArea) {
                maskData.data[i] = 255;     // R
                maskData.data[i + 1] = 255; // G
                maskData.data[i + 2] = 255; // B
                maskData.data[i + 3] = 255; // A
            } else {
                maskData.data[i + 3] = 0; // Transparent
            }
        }
        
        maskCtx.putImageData(maskData, 0, 0);
        console.log('✅ UV mask created');
        
        return maskCanvas;
    }
    
    // Helper: Convert RGB to HSL
    rgbToHsl(r, g, b) {
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
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    // Convert weapon model name to preset key for UV map loading
    getWeaponPresetKey(weaponName) {
        const mapping = {
            'weapon_rif_ak47': 'ak47',
            'weapon_rif_m4a4': 'm4a4',
            'weapon_rif_m4a1_silencer': 'm4a1s',
            'weapon_snip_awp': 'awp',
            'weapon_pist_deagle': 'deagle',
            'weapon_pist_glock18': 'glock',
            'weapon_pist_usp_silencer': 'usp',
            'weapon_pist_p250': 'p250',
            'weapon_pist_hkp2000': 'p2000',
            'weapon_pist_fiveseven': 'fiveseven',
            'weapon_pist_cz75a': 'cz75',
            'weapon_pist_tec9': 'tec9',
            'weapon_pist_elite': 'dualberettas',
            'weapon_pist_revolver': 'revolver',
            'weapon_smg_mac10': 'mac10',
            'weapon_smg_mp9': 'mp9',
            'weapon_smg_mp7': 'mp7',
            'weapon_smg_mp5sd': 'mp5sd',
            'weapon_smg_ump45': 'ump45',
            'weapon_smg_p90': 'p90',
            'weapon_smg_bizon': 'bizon',
            'weapon_rif_galilar': 'galil',
            'weapon_rif_famas': 'famas',
            'weapon_rif_aug': 'aug',
            'weapon_rif_sg556': 'sg553',
            'weapon_snip_ssg08': 'ssg08',
            'weapon_snip_g3sg1': 'g3sg1',
            'weapon_snip_scar20': 'scar20',
            'weapon_shot_nova': 'nova',
            'weapon_shot_xm1014': 'xm1014',
            'weapon_shot_sawedoff': 'sawedoff',
            'weapon_shot_mag7': 'mag7',
            'weapon_mach_m249': 'm249',
            'weapon_mach_negev': 'negev'
        };
        
        return mapping[weaponName] || null;
    }

    renderPatternLibrary() {
        const library = document.getElementById('patternLibrary');
        if (!library) return;

        library.innerHTML = '';

        if (this.patternLibrary.length === 0) {
            library.innerHTML = '<p class="field-hint" style="text-align: center; padding: 20px;">No patterns added yet</p>';
            return;
        }

        this.patternLibrary.forEach(pattern => {
            const item = document.createElement('div');
            item.className = 'pattern-item';
            if (pattern.id === this.currentPatternId) {
                item.classList.add('active');
            }

            // Create thumbnail canvas
            const canvas = document.createElement('canvas');
            canvas.width = 50;
            canvas.height = 50;
            canvas.className = 'pattern-thumbnail';
            const ctx = canvas.getContext('2d');
            ctx.drawImage(pattern.image, 0, 0, 50, 50);
            
            const info = document.createElement('div');
            info.className = 'pattern-info';
            
            const name = document.createElement('div');
            name.className = 'pattern-name';
            name.textContent = pattern.name;
            
            const parts = document.createElement('div');
            parts.className = 'pattern-parts';
            if (pattern.targetAreas.length === 0) {
                parts.textContent = 'All parts';
            } else {
                parts.textContent = pattern.targetAreas.join(', ');
            }
            if (pattern.invertMask) {
                parts.textContent += ' (inverted)';
            }
            
            info.appendChild(name);
            info.appendChild(parts);
            
            const actions = document.createElement('div');
            actions.className = 'pattern-actions';
            
            const applyBtn = document.createElement('button');
            applyBtn.textContent = 'Apply';
            applyBtn.onclick = (e) => {
                e.stopPropagation();
                this.applyPattern(pattern.id);
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'delete';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deletePattern(pattern.id);
            };
            
            actions.appendChild(applyBtn);
            actions.appendChild(deleteBtn);
            
            item.appendChild(canvas);
            item.appendChild(info);
            item.appendChild(actions);
            
            item.onclick = () => this.selectPattern(pattern.id);
            
            library.appendChild(item);
        });
    }

    selectPattern(patternId) {
        console.log('🖱️ selectPattern called with id:', patternId);
        console.log('📋 Before selectPattern, patternTargetAreas:', this.patternTargetAreas);
        this.currentPatternId = patternId;
        const pattern = this.patternLibrary.find(p => p.id === patternId);
        
        if (pattern) {
            // Load pattern settings into UI
            this.customPatternScale = pattern.scale;
            this.customPatternOffsetX = pattern.offsetX;
            this.customPatternOffsetY = pattern.offsetY;
            this.customPatternRotation = pattern.rotation;
            this.customPatternBlendMode = pattern.blendMode;
            this.patternTargetAreas = [...pattern.targetAreas];
            this.patternInvertMask = pattern.invertMask;
            console.log('📋 Set patternTargetAreas to pattern value:', this.patternTargetAreas);
            
            // Update UI controls
            this.syncPatternScaleInputs();
        }
        
        console.log('📋 Before renderPatternLibrary, targetAreas:', this.patternTargetAreas);
        this.renderPatternLibrary();
        console.log('📋 After renderPatternLibrary, targetAreas:', this.patternTargetAreas);
    }

    updateCurrentPatternSettings() {
        if (this.currentPatternId === null) return;
        
        const pattern = this.patternLibrary.find(p => p.id === this.currentPatternId);
        if (pattern) {
            pattern.scale = this.customPatternScale;
            pattern.offsetX = this.customPatternOffsetX;
            pattern.offsetY = this.customPatternOffsetY;
            pattern.rotation = this.customPatternRotation;
            pattern.blendMode = this.customPatternBlendMode;
            pattern.targetAreas = [...this.patternTargetAreas];
            pattern.invertMask = this.patternInvertMask;
            
            this.renderPatternLibrary();
        }
    }

    applyPattern(patternId) {
        console.log('🎨 applyPattern called with id:', patternId);
        const pattern = this.patternLibrary.find(p => p.id === patternId);
        if (!pattern) {
            console.log('🎨 Pattern not found!');
            return;
        }
        
        console.log('🎨 Before assignment - targetAreas:', this.patternTargetAreas, 'pattern.targetAreas:', pattern.targetAreas);
        this.customPatternImage = pattern.image;
        this.customPatternScale = pattern.scale;
        this.customPatternOffsetX = pattern.offsetX;
        this.customPatternOffsetY = pattern.offsetY;
        this.customPatternRotation = pattern.rotation;
        this.customPatternBlendMode = pattern.blendMode;
        this.patternTargetAreas = [...pattern.targetAreas];
        this.patternInvertMask = pattern.invertMask;
        console.log('🎨 After assignment - targetAreas:', this.patternTargetAreas);
        
        this.syncPatternScaleInputs();
        console.log('🎨 After syncPatternScaleInputs - targetAreas:', this.patternTargetAreas);
        this.applyPatternImageToLayer(true);
        console.log('🎨 After applyPatternImageToLayer - targetAreas:', this.patternTargetAreas);
    }

    applyAllPatterns() {
        // Apply all patterns in the library sequentially
        if (this.patternLibrary.length === 0) return;
        
        // Save current state
        const originalImage = this.customPatternImage;
        const originalScale = this.customPatternScale;
        const originalOffsetX = this.customPatternOffsetX;
        const originalOffsetY = this.customPatternOffsetY;
        const originalRotation = this.customPatternRotation;
        const originalBlendMode = this.customPatternBlendMode;
        const originalTargetAreas = [...this.patternTargetAreas];
        const originalInvertMask = this.patternInvertMask;
        
        // Apply each pattern
        this.patternLibrary.forEach((pattern, index) => {
            this.customPatternImage = pattern.image;
            this.customPatternScale = pattern.scale;
            this.customPatternOffsetX = pattern.offsetX;
            this.customPatternOffsetY = pattern.offsetY;
            this.customPatternRotation = pattern.rotation;
            this.customPatternBlendMode = pattern.blendMode;
            this.patternTargetAreas = [...pattern.targetAreas];
            this.patternInvertMask = pattern.invertMask;
            
            // Only save state on the last pattern
            this.applyPatternImageToLayer(index === this.patternLibrary.length - 1);
        });
        
        // Restore original state (for UI)
        this.customPatternImage = originalImage;
        this.customPatternScale = originalScale;
        this.customPatternOffsetX = originalOffsetX;
        this.customPatternOffsetY = originalOffsetY;
        this.customPatternRotation = originalRotation;
        this.customPatternBlendMode = originalBlendMode;
        this.patternTargetAreas = originalTargetAreas;
        this.patternInvertMask = originalInvertMask;
    }

    deletePattern(patternId) {
        const index = this.patternLibrary.findIndex(p => p.id === patternId);
        if (index === -1) return;
        
        this.patternLibrary.splice(index, 1);
        
        if (this.currentPatternId === patternId) {
            this.currentPatternId = null;
        }
        
        this.renderPatternLibrary();
    }
    
        // Load pre-calculated mask for weapon
        async loadMaskForWeapon(weaponKey) {
            console.log('🎭 Loading pre-calculated mask for weapon:', weaponKey);
        
            // Check cache first
            if (this.maskCache[weaponKey]) {
                console.log('✅ Mask loaded from cache');
                this.currentMask = this.maskCache[weaponKey];
                return this.currentMask;
            }
        
            const maskPath = `masks/${weaponKey}.json`;
            console.log('📁 Loading mask from:', maskPath);
        
            try {
                const response = await fetch(maskPath);
                if (!response.ok) {
                    console.log('⚠️ No pre-calculated mask found for weapon:', weaponKey);
                    this.currentMask = null;
                    return null;
                }
            
                const maskData = await response.json();
                console.log('✅ Mask loaded:', maskData.width, 'x', maskData.height);
                console.log('📊 Available parts:', Object.keys(maskData.masks));
            
                this.maskCache[weaponKey] = maskData;
                this.currentMask = maskData;
                return maskData;
            
            } catch (error) {
                console.error('❌ Failed to load mask:', maskPath, error);
                this.currentMask = null;
                return null;
            }
        }
    
        // Create canvas mask from pre-calculated mask data
        createCanvasMask(targetAreas, invertMask = false) {
            if (!this.currentMask || !targetAreas || targetAreas.length === 0) {
                return null;
            }
        
            console.log('🎨 Creating canvas mask for areas:', targetAreas);
        
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = this.canvas.width;
            maskCanvas.height = this.canvas.height;
            const ctx = maskCanvas.getContext('2d');
        
            // Create ImageData for the mask
            const imageData = ctx.createImageData(maskCanvas.width, maskCanvas.height);
            const data = imageData.data;
        
            // Calculate scale factors (mask might be different size than canvas)
            const scaleX = this.currentMask.width / maskCanvas.width;
            const scaleY = this.currentMask.height / maskCanvas.height;
            
            console.log(`📏 Scale factors: ${scaleX.toFixed(2)}x${scaleY.toFixed(2)} (mask ${this.currentMask.width}x${this.currentMask.height} -> canvas ${maskCanvas.width}x${maskCanvas.height})`);
            
            let totalPixels = 0;
        
            // Process each target area
            for (const part of targetAreas) {
                const runs = this.currentMask.masks[part];
                if (!runs) {
                    console.warn(`⚠️ No mask data found for part: ${part}`);
                    continue;
                }
                
                console.log(`🔍 Processing part "${part}" with ${runs.length} RLE runs`);
            
                // Decode RLE and mark pixels
                for (const [start, length] of runs) {
                    for (let i = 0; i < length; i++) {
                        const maskIdx = start + i;
                        const maskX = maskIdx % this.currentMask.width;
                        const maskY = Math.floor(maskIdx / this.currentMask.width);
                    
                        // Scale to canvas coordinates
                        const canvasX = Math.floor(maskX / scaleX);
                        const canvasY = Math.floor(maskY / scaleY);
                    
                        if (canvasX >= maskCanvas.width || canvasY >= maskCanvas.height) continue;
                    
                        const canvasIdx = (canvasY * maskCanvas.width + canvasX) * 4;
                        data[canvasIdx] = 255;     // R
                        data[canvasIdx + 1] = 255; // G
                        data[canvasIdx + 2] = 255; // B
                        data[canvasIdx + 3] = 255; // A
                        totalPixels++;
                    }
                }
            }
            
            console.log(`✅ Mask created with ${totalPixels} pixels marked`);
        
            // Apply invert if needed
            if (invertMask) {
                for (let i = 3; i < data.length; i += 4) {
                    data[i] = data[i] > 0 ? 0 : 255;
                }
            }
        
            ctx.putImageData(imageData, 0, 0);
            console.log('✅ Canvas mask created');
        
            return maskCanvas;
        }


    getPatternTargetKeywords(targetArea) {
        const keywordsByArea = {
            barrel: ['barrel', 'muzzle', 'tube', 'piippu'],
            magazine: ['magazine', 'mag', 'clip', 'lipas'],
            body: ['body', 'receiver', 'frame', 'runko'],
            stock: ['stock', 'butt', 'pera'],
            grip: ['grip', 'handle', 'kahva'],
            sight: ['sight', 'scope', 'optic', 'rail', 'tahtain'],
            suppressor: ['suppressor', 'silencer', 'vaimennin']
        };

        return keywordsByArea[targetArea] || [];
    }

    matchesPatternTarget(mesh, targetArea) {
        if (targetArea === 'all') {
            return true;
        }

        const keywords = this.getPatternTargetKeywords(targetArea);
        if (keywords.length === 0) {
            return false;
        }

        const labels = [mesh.name, mesh.parent?.name];
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
            if (material && material.name) {
                labels.push(material.name);
            }
        });

        const searchable = labels.filter(Boolean).join(' ').toLowerCase();
        if (!searchable) {
            return false;
        }

        return keywords.some((keyword) => searchable.includes(keyword));
    }

    getPatternTargetBounds() {
        if (!this.weaponMesh) {
            return null;
        }

        this.weaponMesh.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(this.weaponMesh);
        const size = bounds.getSize(new THREE.Vector3());

        const axisOrder = ['x', 'y', 'z'].sort((a, b) => size[b] - size[a]);
        let lengthAxis = axisOrder[0];
        const heightAxis = 'y';

        if (lengthAxis === heightAxis) {
            lengthAxis = axisOrder.find((axis) => axis !== heightAxis) || 'z';
        }

        const depthAxis = axisOrder.find((axis) => axis !== lengthAxis && axis !== heightAxis) || 'z';

        return {
            min: bounds.min,
            size,
            lengthAxis,
            heightAxis,
            depthAxis
        };
    }

    normalizeAxisValue(value, min, size) {
        const safeSize = Math.max(0.0001, size);
        return (value - min) / safeSize;
    }

    matchesPatternTargetByGeometry(lengthPos, heightPos, depthPos, targetArea) {
        switch (targetArea) {
            case 'barrel':
                return lengthPos >= 0.66 && heightPos >= 0.18 && heightPos <= 0.82;
            case 'magazine':
                return lengthPos >= 0.2 && lengthPos <= 0.78 && heightPos <= 0.42;
            case 'body':
                return lengthPos >= 0.24 && lengthPos <= 0.78 && heightPos >= 0.22 && heightPos <= 0.88;
            case 'stock':
                return lengthPos <= 0.34;
            case 'grip':
                return lengthPos >= 0.3 && lengthPos <= 0.67 && heightPos <= 0.6;
            case 'sight':
                return lengthPos >= 0.18 && lengthPos <= 0.9 && heightPos >= 0.63;
            case 'suppressor':
                return lengthPos >= 0.88 && heightPos >= 0.2 && heightPos <= 0.8 && depthPos >= 0.2 && depthPos <= 0.8;
            default:
                return false;
        }
    }

    appendGeometryTrianglesByHeuristic(ctx, child, bounds, targetArea) {
        const geometry = child.geometry;
        if (!geometry || !geometry.attributes || !geometry.attributes.uv || !geometry.attributes.position) {
            return 0;
        }

        const uvAttr = geometry.attributes.uv;
        const posAttr = geometry.attributes.position;
        if (uvAttr.count < 3 || posAttr.count < 3) {
            return 0;
        }

        const indices = geometry.index ? geometry.index.array : null;
        const matrixWorld = child.matrixWorld;
        const pointA = new THREE.Vector3();
        const pointB = new THREE.Vector3();
        const pointC = new THREE.Vector3();
        const centroid = new THREE.Vector3();
        let matched = 0;

        const appendIfMatched = (a, b, c) => {
            if (a >= uvAttr.count || b >= uvAttr.count || c >= uvAttr.count) {
                return;
            }

            if (a >= posAttr.count || b >= posAttr.count || c >= posAttr.count) {
                return;
            }

            pointA.fromBufferAttribute(posAttr, a).applyMatrix4(matrixWorld);
            pointB.fromBufferAttribute(posAttr, b).applyMatrix4(matrixWorld);
            pointC.fromBufferAttribute(posAttr, c).applyMatrix4(matrixWorld);

            centroid.copy(pointA).add(pointB).add(pointC).multiplyScalar(1 / 3);

            const lengthPos = this.normalizeAxisValue(
                centroid[bounds.lengthAxis],
                bounds.min[bounds.lengthAxis],
                bounds.size[bounds.lengthAxis]
            );
            const heightPos = this.normalizeAxisValue(
                centroid[bounds.heightAxis],
                bounds.min[bounds.heightAxis],
                bounds.size[bounds.heightAxis]
            );
            const depthPos = this.normalizeAxisValue(
                centroid[bounds.depthAxis],
                bounds.min[bounds.depthAxis],
                bounds.size[bounds.depthAxis]
            );

            if (!this.matchesPatternTargetByGeometry(lengthPos, heightPos, depthPos, targetArea)) {
                return;
            }

            const ax = this.uvToCanvasX(uvAttr.getX(a), this.canvas.width);
            const ay = this.uvToCanvasY(uvAttr.getY(a), this.canvas.height);
            const bx = this.uvToCanvasX(uvAttr.getX(b), this.canvas.width);
            const by = this.uvToCanvasY(uvAttr.getY(b), this.canvas.height);
            const cx = this.uvToCanvasX(uvAttr.getX(c), this.canvas.width);
            const cy = this.uvToCanvasY(uvAttr.getY(c), this.canvas.height);

            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.lineTo(cx, cy);
            ctx.lineTo(ax, ay);
            matched++;
        };

        if (indices && indices.length >= 3) {
            for (let i = 0; i < indices.length; i += 3) {
                appendIfMatched(indices[i], indices[i + 1], indices[i + 2]);
            }
        } else {
            for (let i = 0; i + 2 < uvAttr.count; i += 3) {
                appendIfMatched(i, i + 1, i + 2);
            }
        }

        return matched;
    }

    applyPatternTargetClip(ctx, targetAreas, invertMask = false) {
        if ((!targetAreas || targetAreas.length === 0) && !invertMask) {
            return false; // No clipping needed - apply to all
        }

        if (!this.weaponMesh) {
            return false;
        }
        
            // **NEW: Use pre-calculated mask if available**
            if (this.currentMask && targetAreas && targetAreas.length > 0) {
                console.log('🎭 Using pre-calculated mask for clipping');
                const maskCanvas = this.createCanvasMask(targetAreas, invertMask);
                if (maskCanvas) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.drawImage(maskCanvas, 0, 0);
                    ctx.restore();
                    console.log('✅ Applied pre-calculated mask clipping');
                    return true;
                } else {
                    console.warn('⚠️ Failed to create canvas mask, falling back to geometry');
                }
            }
        
            // **FALLBACK: Old geometry-based clipping if no mask available**
            console.log('📐 Using geometry-based clipping (fallback)');

        const candidateMeshes = [];
        this.weaponMesh.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) {
                return;
            }

            const geometry = child.geometry;
            if (!geometry || !geometry.attributes || !geometry.attributes.uv) {
                return;
            }

            candidateMeshes.push(child);
        });

        if (candidateMeshes.length === 0) {
            return false;
        }

        // Collect all paths for selected areas
        const clipPath = new Path2D();
        let hasUVPath = false;

        if (!targetAreas || targetAreas.length === 0) {
            // If no specific areas selected and invertMask is true, clip everything (empty result)
            if (invertMask) {
                ctx.beginPath();
                ctx.rect(0, 0, 0, 0);
                ctx.clip();
                return true;
            }
            return false;
        }

        targetAreas.forEach(targetArea => {
            const namedMatches = candidateMeshes.filter((mesh) => this.matchesPatternTarget(mesh, targetArea));
            
            if (namedMatches.length > 0) {
                namedMatches.forEach((mesh) => {
                    const uvAttr = mesh.geometry.attributes.uv;
                    const indices = mesh.geometry.index ? mesh.geometry.index.array : null;
                    this.appendUVTrianglesToPath(clipPath, uvAttr, indices, this.canvas.width, this.canvas.height);
                    hasUVPath = true;
                });
            } else {
                // Try weapon preset first, then fall back to heuristic
                const bounds = this.getPatternTargetBoundsForArea(targetArea);
                if (bounds) {
                    candidateMeshes.forEach((mesh) => {
                        const matchCount = this.appendGeometryTrianglesByBounds(clipPath, mesh, bounds);
                        if (matchCount > 0) hasUVPath = true;
                    });
                }
            }
        });

        if (hasUVPath) {
            if (invertMask) {
                // Create full canvas rectangle, then subtract the selected areas
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, this.canvas.width, this.canvas.height);
                ctx.clip();
                
                // Now subtract the selected parts
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = 'black';
                ctx.fill(clipPath);
                ctx.globalCompositeOperation = 'source-over';
                ctx.restore();
                
                // Set final clipping
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, this.canvas.width, this.canvas.height);
                ctx.clip();
                
                return true;
            } else {
                ctx.save();
                ctx.clip(clipPath);
                return true;
            }
        }

        return false;
    }

    appendUVTrianglesToPath(path, uvAttr, indices, canvasWidth, canvasHeight) {
        const triangleCount = indices ? indices.length / 3 : uvAttr.count / 3;

        for (let i = 0; i < triangleCount; i++) {
            const i0 = indices ? indices[i * 3] : i * 3;
            const i1 = indices ? indices[i * 3 + 1] : i * 3 + 1;
            const i2 = indices ? indices[i * 3 + 2] : i * 3 + 2;

            const u0 = uvAttr.getX(i0);
            const v0 = uvAttr.getY(i0);
            const u1 = uvAttr.getX(i1);
            const v1 = uvAttr.getY(i1);
            const u2 = uvAttr.getX(i2);
            const v2 = uvAttr.getY(i2);

            const x0 = u0 * canvasWidth;
            const y0 = (1 - v0) * canvasHeight;
            const x1 = u1 * canvasWidth;
            const y1 = (1 - v1) * canvasHeight;
            const x2 = u2 * canvasWidth;
            const y2 = (1 - v2) * canvasHeight;

            path.moveTo(x0, y0);
            path.lineTo(x1, y1);
            path.lineTo(x2, y2);
            path.closePath();
        }
    }

    getPatternTargetBoundsForArea(targetArea) {
        // First try to use weapon preset
        if (this.weaponPreset !== 'generic' && this.weaponPresets[this.weaponPreset]) {
            const presetBounds = this.weaponPresets[this.weaponPreset][targetArea];
            if (presetBounds) {
                return presetBounds;
            }
        }

        // Fall back to generic bounds
        return this.getPatternTargetBoundsGeneric(targetArea);
    }

    getPatternTargetBoundsGeneric(targetArea) {
        // Generic heuristic bounds (same as before)
        const boundsMap = {
            barrel: { lengthRange: [0.66, 1.0], heightRange: [0.42, 0.65] },
            magazine: { lengthRange: [0.35, 0.55], heightRange: [0.0, 0.42] },
            body: { lengthRange: [0.35, 0.75], heightRange: [0.45, 0.75] },
            stock: { lengthRange: [0.0, 0.32], heightRange: [0.46, 0.72] },
            grip: { lengthRange: [0.42, 0.58], heightRange: [0.38, 0.48] },
            sight: { lengthRange: [0.48, 0.62], heightRange: [0.72, 0.88] },
            suppressor: { lengthRange: [0.85, 1.0], heightRange: [0.48, 0.62] }
        };

        return boundsMap[targetArea] || null;
    }

    appendGeometryTrianglesByBounds(path, mesh, bounds) {
        const geometry = mesh.geometry;
        const uvAttr = geometry.attributes.uv;
        const posAttr = geometry.attributes.position;
        const indices = geometry.index ? geometry.index.array : null;

        if (!posAttr) {
            return 0;
        }

        const weaponBounds = this.getWeaponBounds();
        if (!weaponBounds) {
            return 0;
        }

        const triangleCount = indices ? indices.length / 3 : posAttr.count / 3;
        let matchCount = 0;

        for (let i = 0; i < triangleCount; i++) {
            const i0 = indices ? indices[i * 3] : i * 3;
            const i1 = indices ? indices[i * 3 + 1] : i * 3 + 1;
            const i2 = indices ? indices[i * 3 + 2] : i * 3 + 2;

            const x0 = posAttr.getX(i0);
            const y0 = posAttr.getY(i0);
            const z0 = posAttr.getZ(i0);
            const x1 = posAttr.getX(i1);
            const y1 = posAttr.getY(i1);
            const z1 = posAttr.getZ(i1);
            const x2 = posAttr.getX(i2);
            const y2 = posAttr.getY(i2);
            const z2 = posAttr.getZ(i2);

            const cx = (x0 + x1 + x2) / 3;
            const cy = (y0 + y1 + y2) / 3;
            const cz = (z0 + z1 + z2) / 3;

            const lengthPos = (cx - weaponBounds.xMin) / (weaponBounds.xMax - weaponBounds.xMin);
            const heightPos = (cy - weaponBounds.yMin) / (weaponBounds.yMax - weaponBounds.yMin);

            if (lengthPos >= bounds.lengthRange[0] && lengthPos <= bounds.lengthRange[1] &&
                heightPos >= bounds.heightRange[0] && heightPos <= bounds.heightRange[1]) {
                
                const u0 = uvAttr.getX(i0);
                const v0 = uvAttr.getY(i0);
                const u1 = uvAttr.getX(i1);
                const v1 = uvAttr.getY(i1);
                const u2 = uvAttr.getX(i2);
                const v2 = uvAttr.getY(i2);

                const px0 = u0 * this.canvas.width;
                const py0 = (1 - v0) * this.canvas.height;
                const px1 = u1 * this.canvas.width;
                const py1 = (1 - v1) * this.canvas.height;
                const px2 = u2 * this.canvas.width;
                const py2 = (1 - v2) * this.canvas.height;

                path.moveTo(px0, py0);
                path.lineTo(px1, py1);
                path.lineTo(px2, py2);
                path.closePath();

                matchCount++;
            }
        }

        return matchCount;
    }

    getWeaponBounds() {
        if (!this.weaponMesh) return null;

        let xMin = Infinity, xMax = -Infinity;
        let yMin = Infinity, yMax = -Infinity;
        let zMin = Infinity, zMax = -Infinity;

        this.weaponMesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry && child.geometry.attributes.position) {
                const posAttr = child.geometry.attributes.position;
                for (let i = 0; i < posAttr.count; i++) {
                    const x = posAttr.getX(i);
                    const y = posAttr.getY(i);
                    const z = posAttr.getZ(i);
                    xMin = Math.min(xMin, x);
                    xMax = Math.max(xMax, x);
                    yMin = Math.min(yMin, y);
                    yMax = Math.max(yMax, y);
                    zMin = Math.min(zMin, z);
                    zMax = Math.max(zMax, z);
                }
            }
        });

        if (xMin === Infinity) return null;

        return { xMin, xMax, yMin, yMax, zMin, zMax };
    }

    fillPatternWithTransform(ctx, pattern) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.fillStyle = pattern;

        if (typeof pattern.setTransform === 'function' && typeof DOMMatrix !== 'undefined') {
            const matrix = new DOMMatrix();
            matrix.translateSelf(this.customPatternOffsetX, this.customPatternOffsetY);
            matrix.rotateSelf(this.customPatternRotation);
            pattern.setTransform(matrix);
            ctx.fillRect(0, 0, width, height);
            return;
        }

        const rotationRadians = (this.customPatternRotation * Math.PI) / 180;
        ctx.save();
        ctx.translate(this.customPatternOffsetX, this.customPatternOffsetY);
        ctx.rotate(rotationRadians);

        const fillSpan = Math.ceil(Math.hypot(width, height) * 2);
        ctx.fillRect(-fillSpan, -fillSpan, fillSpan * 2, fillSpan * 2);
        ctx.restore();
    }

    applyPatternImageToLayer(saveState = true) {
        if (!this.customPatternImage) {
            return;
        }

        const layer = this.layers[this.currentLayer];
        if (!layer) {
            return;
        }

        layer.blendMode = this.customPatternBlendMode;

        const scaleRatio = this.customPatternScale / 100;
        const maxTileDimension = 4096;
        const tileWidth = Math.min(
            maxTileDimension,
            Math.max(1, Math.round(this.customPatternImage.naturalWidth * scaleRatio))
        );
        const tileHeight = Math.min(
            maxTileDimension,
            Math.max(1, Math.round(this.customPatternImage.naturalHeight * scaleRatio))
        );

        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileWidth;
        tileCanvas.height = tileHeight;
        const tileCtx = tileCanvas.getContext('2d');
        if (!tileCtx) {
            return;
        }

        tileCtx.clearRect(0, 0, tileWidth, tileHeight);
        tileCtx.drawImage(this.customPatternImage, 0, 0, tileWidth, tileHeight);

        const pattern = layer.ctx.createPattern(tileCanvas, 'repeat');
        if (!pattern) {
            return;
        }

        // Replace current layer pixels with transformed tiled pattern.
        layer.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        layer.ctx.save();

        console.log('🎯 Applying pattern with target areas:', this.patternTargetAreas);
        console.log('🎭 Current mask available:', !!this.currentMask);
        console.log('🔄 Invert mask:', this.patternInvertMask);
        
        const hasClip = this.applyPatternTargetClip(layer.ctx, this.patternTargetAreas, this.patternInvertMask);
        if (!hasClip && this.patternTargetAreas.length > 0) {
            console.warn(`Pattern target areas did not match mesh names. Applying to full texture.`);
        }

        this.fillPatternWithTransform(layer.ctx, pattern);
        layer.ctx.restore();
        layer.patternApplied = true;

        this.composeLayers();

        if (saveState) {
            this.saveState();
        } else {
            this.saveBaseLayerData();
        }
    }
    
    ensureUVSheetCanvas() {
        if (!this.uvSheetCanvas) {
            this.uvSheetCanvas = document.createElement('canvas');
            this.uvSheetCanvas.width = this.canvas.width;
            this.uvSheetCanvas.height = this.canvas.height;
            this.uvSheetCtx = this.uvSheetCanvas.getContext('2d');
        }
    }

    traceUVTriangles(ctx, uvAttr, indices, width, height) {
        if (indices && indices.length >= 3) {
            for (let i = 0; i < indices.length; i += 3) {
                const a = indices[i];
                const b = indices[i + 1];
                const c = indices[i + 2];

                const ax = this.uvToCanvasX(uvAttr.getX(a), width);
                const ay = this.uvToCanvasY(uvAttr.getY(a), height);
                const bx = this.uvToCanvasX(uvAttr.getX(b), width);
                const by = this.uvToCanvasY(uvAttr.getY(b), height);
                const cx = this.uvToCanvasX(uvAttr.getX(c), width);
                const cy = this.uvToCanvasY(uvAttr.getY(c), height);

                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.lineTo(cx, cy);
                ctx.lineTo(ax, ay);
            }
        } else {
            for (let i = 0; i + 2 < uvAttr.count; i += 3) {
                const ax = this.uvToCanvasX(uvAttr.getX(i), width);
                const ay = this.uvToCanvasY(uvAttr.getY(i), height);
                const bx = this.uvToCanvasX(uvAttr.getX(i + 1), width);
                const by = this.uvToCanvasY(uvAttr.getY(i + 1), height);
                const cx = this.uvToCanvasX(uvAttr.getX(i + 2), width);
                const cy = this.uvToCanvasY(uvAttr.getY(i + 2), height);

                ctx.moveTo(ax, ay);
                ctx.lineTo(bx, by);
                ctx.lineTo(cx, cy);
                ctx.lineTo(ax, ay);
            }
        }
    }

    generateUVSheetFromWeaponMesh() {
        if (!this.weaponMesh) {
            return false;
        }

        this.ensureUVSheetCanvas();
        const ctx = this.uvSheetCtx;
        const width = this.uvSheetCanvas.width;
        const height = this.uvSheetCanvas.height;
        let hasUVData = false;

        ctx.clearRect(0, 0, width, height);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        this.weaponMesh.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) {
                return;
            }

            const geometry = child.geometry;
            if (!geometry || !geometry.attributes || !geometry.attributes.uv) {
                return;
            }

            const uvAttr = geometry.attributes.uv;
            if (uvAttr.count < 3) {
                return;
            }

            hasUVData = true;
            const indices = geometry.index ? geometry.index.array : null;

            ctx.beginPath();
            this.traceUVTriangles(ctx, uvAttr, indices, width, height);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            this.traceUVTriangles(ctx, uvAttr, indices, width, height);
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        return hasUVData;
    }

    loadUVSheetFromFile(weaponId) {
        // Map weapon IDs to UV sheet file names
        const filesMap = {
            'weapon_pist_glock18': 'glock-18.png',
            'weapon_pist_usp_silencer': 'usp-s.png',
            'weapon_pist_hkp2000': 'p2000.png',
            'weapon_pist_p250': 'p250.png',
            'weapon_pist_tec9': 'tec-9.png',
            'weapon_pist_fiveseven': 'five-seven.png',
            'weapon_pist_cz75a': 'cz_75.png',
            'weapon_pist_deagle': 'desert_eagle.png',
            'weapon_pist_revolver': 'revolver.png',
            'weapon_pist_elite': 'dual_berettas.png',
            'weapon_rif_ak47': 'ak-47.png',
            'weapon_rif_m4a4': 'm4a4.png',
            'weapon_rif_m4a1_silencer': 'm4a1-s.png',
            'weapon_rif_famas': 'famas.png',
            'weapon_rif_galilar': 'galil_ar.png',
            'weapon_rif_aug': 'aug.png',
            'weapon_rif_sg556': 'sg_553.png',
            'weapon_smg_mp9': 'mp9.png',
            'weapon_smg_mac10': 'mac-10.png',
            'weapon_smg_mp5sd': 'mp5sd.png',
            'weapon_smg_mp7': 'mp7.png',
            'weapon_smg_ump45': 'ump-45.png',
            'weapon_smg_p90': 'p90.png',
            'weapon_smg_bizon': 'bizon.png',
            'weapon_shot_nova': 'nova.png',
            'weapon_shot_xm1014': 'xm1014.png',
            'weapon_shot_mag7': 'mag-7.png',
            'weapon_shot_sawedoff': 'sawed-off.png',
            'weapon_snip_awp': 'awp.png',
            'weapon_snip_ssg08': 'ssg_08.png',
            'weapon_snip_scar20': 'scar-20.png',
            'weapon_snip_g3sg1': 'g3sg1.png',
            'weapon_mach_m249': 'm249.png',
            'weapon_mach_negev': 'negev.png'
        };

        const fileName = filesMap[weaponId];
        if (!fileName) {
            console.warn('No UV sheet found for weapon:', weaponId);
            return;
        }

        const filePath = `UVSheets/${fileName}`;
        console.log('Loading UV sheet from:', filePath);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            console.log('✓ UV sheet loaded:', fileName);

            this.ensureUVSheetCanvas();
            this.uvSheetCtx.clearRect(0, 0, this.uvSheetCanvas.width, this.uvSheetCanvas.height);
            this.uvSheetCtx.drawImage(img, 0, 0, this.uvSheetCanvas.width, this.uvSheetCanvas.height);
            this.uvSheetVisible = true;
            this.updateUVSheetButtons();
            this.composeLayers();
        };

        img.onerror = () => {
            console.error('✗ Failed to load UV sheet:', filePath);
        };

        img.src = filePath;
    }

    loadUVSheet(weaponId) {
        console.log('Loading UV sheet for:', weaponId);

        // Keep selected UV sheet and 3D model weapon synced for accurate mapping.
        if (weaponId && weaponId !== this.currentWeapon) {
            this.currentWeapon = weaponId;

            const weaponSelect = document.getElementById('weaponSelect');
            if (weaponSelect) {
                weaponSelect.value = weaponId;
            }

            this.loadWeapon(weaponId, () => this.loadUVSheet(weaponId));
            return;
        }

        // Prefer generating the guide from model UVs so painted areas match 3D exactly.
        if (this.generateUVSheetFromWeaponMesh()) {
            console.log('✓ UV sheet generated from model UVs:', weaponId || this.currentWeapon);
            this.uvSheetVisible = true;
            this.updateUVSheetButtons();
            this.composeLayers();
            return;
        }

        // Fallback to static files if geometry UVs are not available.
        this.loadUVSheetFromFile(weaponId || this.currentWeapon);
    }
    
    disableUVSheet() {
        console.log('disableUVSheet called');
        this.uvSheetVisible = false;
        this.updateUVSheetButtons();
        this.composeLayers();
    }
    
    updateUVSheetButtons() {
        const loadBtn = document.getElementById('loadUVSheet');
        const disableBtn = document.getElementById('disableUVSheet');
        const uvToggle = document.getElementById('uvDisplayToggle');

        if (this.uvSheetVisible) {
            if (loadBtn) {
                loadBtn.style.backgroundColor = '#0f8d62';
                loadBtn.style.color = '#fff';
            }
            if (disableBtn) {
                disableBtn.style.backgroundColor = '#0f8d62';
                disableBtn.style.color = '#fff';
            }
            if (uvToggle) {
                uvToggle.style.display = '';
            }
        } else {
            if (loadBtn) {
                loadBtn.style.backgroundColor = '';
                loadBtn.style.color = '';
            }
            if (disableBtn) {
                disableBtn.style.backgroundColor = '';
                disableBtn.style.color = '';
            }
            if (uvToggle) {
                uvToggle.style.display = 'none';
            }
        }
    }
    
    saveState() {
        if (!Array.isArray(this.history)) {
            this.history = [];
            this.historyStep = -1;
        }

        if (!Array.isArray(this.layers) || !this.layers[this.currentLayer]) {
            return;
        }

        // Remove any states after current step
        this.history = this.history.slice(0, this.historyStep + 1);
        
        // Save current state
        const layer = this.layers[this.currentLayer];
        this.history.push(layer.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        
        // Update base layer data for material adjustments
        this.saveBaseLayerData();
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyStep++;
        }
    }
    
    undo() {
        if (this.historyStep > 0) {
            this.historyStep--;
            const layer = this.layers[this.currentLayer];
            layer.ctx.putImageData(this.history[this.historyStep], 0, 0);
            this.composeLayers();
            this.saveBaseLayerData();
        }
    }
    
    redo() {
        if (this.historyStep < this.history.length - 1) {
            this.historyStep++;
            const layer = this.layers[this.currentLayer];
            layer.ctx.putImageData(this.history[this.historyStep], 0, 0);
            this.composeLayers();
            this.saveBaseLayerData();
        }
    }
    
    updateMaterial() {
        if (!this.weaponMesh) {
            return;
        }

        this.weaponMesh.traverse((child) => {
            if (!(child instanceof THREE.Mesh) || !child.material) {
                return;
            }

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                if (!material) {
                    return;
                }

                if ('roughness' in material) {
                    material.roughness = this.roughness;
                }

                if ('metalness' in material) {
                    material.metalness = this.metalness;
                }

                material.needsUpdate = true;
            });
        });
    }

    updateMaterialProperty(prop, value) {
        if (prop === 'roughness' || prop === 'metalness') {
            this[prop] = value / 100;
            this.updateMaterial();
            return;
        }

        if (['brightness', 'contrast', 'saturation'].includes(prop)) {
            this[prop] = value;
            this.applyMaterialAdjustments();
        }
    }
    
    applyImageAdjustment(prop, value) {
        const layer = this.layers[this.currentLayer];
        const imageData = layer.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            if (prop === 'brightness') {
                data[i] = Math.max(0, Math.min(255, data[i] + value));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + value));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + value));
            }
        }
        
        layer.ctx.putImageData(imageData, 0, 0);
        this.composeLayers();
    }
    
    // === 3D VIEWER ===
    
    init3DViewer() {
        try {
            const container = document.getElementById('threeContainer');
            
            if (!container) {
                console.error('❌ threeContainer element not found');
                return;
            }
            
            console.log('✅ Initializing 3D viewer...');
            console.log('Container:', container);
            
            // Initialize 3D drawing tools
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x2a2a2a);
            console.log('✅ Scene created');
            
            // Camera
            const width = container.clientWidth || 800;
            const height = container.clientHeight || 600;
            console.log('Container dimensions:', width, 'x', height);
            
            this.camera = new THREE.PerspectiveCamera(
                75,
                width / height,
                0.1,
                1000
            );
            this.camera.position.set(0, 0, 3);
            console.log('✅ Camera created');
            
            // Renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(width, height);
            container.appendChild(this.renderer.domElement);
            console.log('✅ Renderer created and attached');
            
            // Controls
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.target.set(0, 0, 0);
            this.controls.update();
            console.log('✅ Controls created');
            
            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 5, 5);
            this.scene.add(directionalLight);
            
            const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
            directionalLight2.position.set(-5, -5, -5);
            this.scene.add(directionalLight2);
            console.log('✅ Lights added');
            
            // Grid
            const gridHelper = new THREE.GridHelper(10, 10);
            this.scene.add(gridHelper);
            console.log('✅ Grid added');
            
            console.log('✅✅✅ 3D viewer initialized successfully');
            
            // 3D Drawing events
            this.renderer.domElement.addEventListener('mousedown', (e) => {
                if (this.drawModeEnabled && (this.viewMode === '3D' || this.viewMode === 'split')) {
                    const intersection = this.getClosestWeaponIntersection(e);
                    if (intersection) {
                        this.start3DDrawing(intersection);
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
            
            this.renderer.domElement.addEventListener('mousemove', (e) => {
                if (this.is3DDrawing && (this.viewMode === '3D' || this.viewMode === 'split')) {
                    e.preventDefault();
                    this.draw3D(e);
                }
            });
            
            this.renderer.domElement.addEventListener('mouseup', () => {
                if (this.is3DDrawing) {
                    this.stop3DDrawing();
                }
            });
            
            this.renderer.domElement.addEventListener('mouseout', () => {
                if (this.is3DDrawing) {
                    this.stop3DDrawing();
                }
            });
            
            // Animation loop
            this.animate3D();
            
            // Handle resize
            window.addEventListener('resize', () => {
                if (this.viewMode !== '2D' && this.camera && this.renderer) {
                    const width = container.clientWidth;
                    const height = container.clientHeight;
                    this.camera.aspect = width / height;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(width, height);
                }
            });
        } catch (error) {
            console.error('Error initializing 3D viewer:', error);
        }
    }
    
    loadWeapon(weaponName, onLoaded = null) {
        if (!this.scene) {
            console.warn('⚠️ Scene not initialized yet, skipping weapon load');
            return;
        }
        
        console.log('🔫 Loading weapon:', weaponName);
        
        // Check if OBJLoader is available
        if (!THREE.OBJLoader) {
            console.error('❌ THREE.OBJLoader is not defined! Check if OBJLoader.js is loaded.');
            console.log('Available THREE methods:', Object.keys(THREE).filter(k => k.includes('Loader')));
            return;
        }
        
        const loader = new THREE.OBJLoader();
        const path = `models/${weaponName}.obj`;
        console.log('📁 Path:', path);
        
        loader.load(
            path,
            (obj) => {
                console.log('✅ Weapon loaded successfully!', obj);
                
                // Remove old weapon
                if (this.weaponMesh) {
                    this.scene.remove(this.weaponMesh);
                    console.log('🗑️ Removed old weapon');
                }
                
                // Create texture from canvas
                const texture = new THREE.CanvasTexture(this.canvas);
                texture.flipY = this.textureFlipY;
                texture.needsUpdate = true;
                console.log('🎨 Texture created from canvas');
                
                // Apply material
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: this.roughness,
                    metalness: this.metalness
                });
                
                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });
                console.log('✅ Material applied to all meshes');
                
                // Remove old weapon
                if (this.weaponMesh) {
                    this.scene.remove(this.weaponMesh);
                }
                
                this.weaponMesh = obj;
                this.scene.add(obj);
                console.log('✅✅ Weapon added to scene!');
                console.log('Scene children count:', this.scene.children.length);
                console.log('WeaponMesh:', this.weaponMesh);
                
                // Calculate bounding box AFTER adding to scene
                const box = new THREE.Box3().setFromObject(obj);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                console.log('📏 Bounding box - Size:', size, 'MaxDim:', maxDim);
                
                // Scale first
                const scale = 2.0 / maxDim;
                obj.scale.setScalar(scale);
                console.log('🔄 Scaled to:', scale);
                
                // Recalculate box after scaling
                box.setFromObject(obj);
                box.getCenter(center);
                
                // Center the object by moving it opposite to its center
                obj.position.x = obj.position.x - center.x;
                obj.position.y = obj.position.y - center.y + 0.3; // Lift slightly above grid
                obj.position.z = obj.position.z - center.z;
                console.log('📍 Position:', obj.position);
                
                // Reset camera and controls
                this.camera.position.set(0, 0, 3);
                this.controls.target.set(0, 0, 0);
                this.controls.update();
                console.log('📷 Camera reset');

                this.updateMaterial();
                
                console.log('✅✅✅ Weapon fully loaded and positioned!');

                if (typeof onLoaded === 'function') {
                    onLoaded(obj);
                }
            },
            (xhr) => {
                console.log('⏳ Loading: ' + (xhr.loaded / xhr.total * 100).toFixed(1) + '%');
            },
            (error) => {
                console.error('❌ Error loading weapon:', weaponName);
                console.error('❌ Error details:', error);
                console.error('❌ Path attempted:', path);
            }
        );
    }
    
    update3DTexture() {
        if (this.weaponMesh) {
            this.weaponMesh.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material.map) {
                    child.material.map.needsUpdate = true;
                }
            });
        }
    }

    uvToCanvasX(u, width = this.canvas.width) {
        return u * width;
    }

    uvToCanvasY(v, height = this.canvas.height) {
        return (this.textureFlipY ? (1 - v) : v) * height;
    }

    getIntersectionWorldNormal(hit) {
        if (!hit || !hit.face || !hit.object) {
            return null;
        }

        return hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
    }

    getClosestWeaponIntersection(e) {
        if (!this.weaponMesh || !this.camera || !this.renderer || !this.raycaster || !this.mouse) {
            return null;
        }

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Intersect the full weapon hierarchy and prefer front-facing UV hits.
        const intersections = this.raycaster.intersectObject(this.weaponMesh, true);
        const uvHits = intersections.filter((hit) => !!hit.uv);
        if (uvHits.length === 0) {
            return null;
        }

        let frontFacingHit = null;
        for (let i = 0; i < uvHits.length; i++) {
            const hit = uvHits[i];
            const worldNormal = this.getIntersectionWorldNormal(hit);
            if (!worldNormal) {
                continue;
            }

            const facingDot = worldNormal.dot(this.raycaster.ray.direction);
            // Negative dot means face normal points towards camera/ray origin.
            if (facingDot < -0.05) {
                frontFacingHit = hit;
                break;
            }
        }

        const defaultHit = frontFacingHit || uvHits[0];

        // While drawing, keep the stroke locked close to the previous hit to prevent UV jumps.
        if (!this.is3DDrawing || !this.last3DHitPoint) {
            return defaultHit;
        }

        let bestHit = null;
        let bestScore = Infinity;
        const candidateCount = Math.min(16, uvHits.length);

        for (let i = 0; i < candidateCount; i++) {
            const hit = uvHits[i];
            const worldDistance = hit.point.distanceTo(this.last3DHitPoint);
            const worldNormal = this.getIntersectionWorldNormal(hit);
            let score = worldDistance;

            if (worldNormal && this.last3DHitNormal) {
                const normalDot = worldNormal.dot(this.last3DHitNormal);
                if (normalDot < this.min3DNormalDot) {
                    score += (this.min3DNormalDot - normalDot) * 0.8;
                }
            }

            if (worldNormal) {
                const facingDot = worldNormal.dot(this.raycaster.ray.direction);
                if (facingDot >= -0.02) {
                    score += 0.25;
                }
            }

            if (score < bestScore) {
                bestScore = score;
                bestHit = hit;
            }
        }

        if (!bestHit) {
            return defaultHit;
        }

        const bestDistance = bestHit.point.distanceTo(this.last3DHitPoint);
        if (bestDistance <= this.max3DWorldJump) {
            return bestHit;
        }

        return defaultHit;
    }

    paint3DAtUV(x, y, stampOnly = false) {
        const layer = this.layers[this.currentLayer];
        const ctx = layer.ctx;
        const stampPoints = [{ x, y }];

        switch (this.currentTool) {
            case 'brush':
                if (stampOnly) {
                    this.drawBrush(ctx, x, y, stampPoints);
                } else {
                    this.drawBrush(ctx, x, y);
                }
                break;
            case 'eraser':
                if (stampOnly) {
                    this.drawEraserOnTargetLayers(x, y, stampPoints);
                } else {
                    this.drawEraserOnTargetLayers(x, y, null);
                }
                break;
            case 'spray':
                if (stampOnly) {
                    this.drawSpray(ctx, x, y, stampPoints);
                } else {
                    this.drawSpray(ctx, x, y);
                }
                break;
        }
    }
    
    start3DDrawing(intersection) {
        if (!intersection || !intersection.uv) {
            return;
        }

        this.is3DDrawing = true;

        this.lastX = this.uvToCanvasX(intersection.uv.x);
        this.lastY = this.uvToCanvasY(intersection.uv.y);
        this.has3DLastPoint = true;
        this.last3DHitPoint = intersection.point ? intersection.point.clone() : null;

        const hitNormal = this.getIntersectionWorldNormal(intersection);
        this.last3DHitNormal = hitNormal ? hitNormal.clone() : null;

        // Start stroke with a stamp to avoid connecting from stale UV coordinates.
        this.paint3DAtUV(this.lastX, this.lastY, true);
        this.composeLayers();
        this.update3DTexture();
    }
    
    draw3D(e) {
        const intersection = this.getClosestWeaponIntersection(e);
        if (!intersection || !intersection.uv) {
            return;
        }

        const x = this.uvToCanvasX(intersection.uv.x);
        const y = this.uvToCanvasY(intersection.uv.y);
        const uvJump = Math.hypot(x - this.lastX, y - this.lastY);
        const jumpThreshold = Math.max(this.max3DUVJump, this.brushSize * 1.6);
        const worldJump = this.last3DHitPoint ? intersection.point.distanceTo(this.last3DHitPoint) : 0;
        const worldJumpThreshold = Math.max(this.max3DWorldJump, (this.brushSize / this.canvas.width) * 6);

        const hitNormal = this.getIntersectionWorldNormal(intersection);
        const normalDot = hitNormal && this.last3DHitNormal
            ? hitNormal.dot(this.last3DHitNormal)
            : 1;
        const sharpNormalChange = hitNormal && this.last3DHitNormal && normalDot < this.min3DNormalDot;

        const stampOnly = !this.has3DLastPoint ||
            uvJump > jumpThreshold ||
            worldJump > worldJumpThreshold ||
            sharpNormalChange;

        // If UV or world coordinates jump too far, stamp instead of drawing a connecting line.
        this.paint3DAtUV(x, y, stampOnly);

        this.lastX = x;
        this.lastY = y;
        this.has3DLastPoint = true;
        this.last3DHitPoint = intersection.point ? intersection.point.clone() : null;
        this.last3DHitNormal = hitNormal ? hitNormal.clone() : null;

        this.composeLayers();
        this.update3DTexture();
    }
    
    stop3DDrawing() {
        if (this.is3DDrawing) {
            this.is3DDrawing = false;
            this.has3DLastPoint = false;
            this.last3DHitPoint = null;
            this.last3DHitNormal = null;
            this.saveState();
        }
    }
    
    animate3D() {
        requestAnimationFrame(() => this.animate3D());
        
        if (this.controls) {
            this.controls.update();
        }
        
        if (this.renderer && this.scene && this.camera) {
            try {
                this.renderer.render(this.scene, this.camera);
            } catch (error) {
                console.error('Render error:', error);
            }
        }
    }
    
    setViewMode(mode) {
        console.log('🔄 Setting view mode to:', mode);
        this.viewMode = mode;
        
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`view${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add('active');
        
        document.getElementById('textureCanvas').classList.toggle('hidden', mode !== '2D');
        document.getElementById('threeContainer').classList.toggle('hidden', mode !== '3D');
        document.getElementById('splitView').classList.toggle('hidden', mode !== 'split');
        
        console.log('👁️ Visibility - Canvas:', mode === '2D', 'ThreeContainer:', mode === '3D', 'SplitView:', mode === 'split');

        const canvasContainer = document.getElementById('canvasContainer');
        if (canvasContainer) {
            canvasContainer.style.overflow = mode === '2D' ? 'auto' : 'hidden';
        }

        if (mode !== '2D') {
            this.hideBrushCursor();
        } else {
            this.update2DCanvasDisplay();
            this.updateCanvasInfo();
            this.refreshBrushCursor();
        }
        
        if (mode === '3D' || mode === 'split') {
            console.log('📐 Resizing renderer for 3D/split view...');
            setTimeout(() => {
                const container = document.getElementById('threeContainer');
                if (!container) {
                    console.error('❌ threeContainer not found in setViewMode');
                    return;
                }
                console.log('Container dimensions:', container.clientWidth, 'x', container.clientHeight);
                this.renderer.setSize(container.clientWidth, container.clientHeight);
                this.camera.aspect = container.clientWidth / container.clientHeight;
                this.camera.updateProjectionMatrix();
                console.log('✅ Renderer resized');
            }, 100);
        }
    }
    
    toggleView() {
        const modes = ['2D', '3D', 'split'];
        const currentIndex = modes.indexOf(this.viewMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        this.setViewMode(nextMode);
    }
    
    toggleDrawMode() {
        this.drawModeEnabled = !this.drawModeEnabled;

        if (this.controls) {
            this.controls.enabled = !this.drawModeEnabled;
        }

        this.updateDrawModeButton();
        console.log('Draw mode:', this.drawModeEnabled ? 'ON' : 'OFF');
    }
    
    // === EXPORT ===
    
    exportPNG() {
        const link = document.createElement('a');
        link.download = `cs2_skin_${this.currentWeapon}_${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
    
    exportVTF() {
        alert(this.t('vtfExportHelp'));
        this.exportPNG();
    }
    
    exportWorkshop() {
        // Create a zip-like package info
        const workshopData = {
            weapon: this.currentWeapon,
            texture: this.canvas.toDataURL('image/png'),
            timestamp: new Date().toISOString(),
            resolution: `${this.canvas.width}x${this.canvas.height}`
        };
        
        // Download the image
        this.exportPNG();
        
        // Show instructions
        alert(`${this.t('workshopReady')}\n\n` +
              `1. ${this.t('workshopStep1')}\n` +
              `2. ${this.t('workshopStep2')}\n` +
              `3. ${this.t('workshopStep3')}\n` +
              `4. ${this.t('workshopStep4')}\n\n` +
              `${this.t('workshopWeapon')}: ${this.currentWeapon}\n` +
              `${this.t('workshopResolution')}: ${this.canvas.width}x${this.canvas.height}`);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM already loaded
    initApp();
}

function initApp() {
    console.log('Initializing CS2 Skin Creator...');
    console.log('DOM ready:', document.readyState);
    
    // Check for required elements
    const required = ['textureCanvas', 'threeContainer', 'weaponSelect'];
    const missing = required.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
        console.error('Missing required elements:', missing);
        alert('Error: App cannot start. Missing elements: ' + missing.join(', '));
        return;
    }
    
    // Check for THREE.js
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
        alert('Error: Three.js is not loaded. Check your internet connection.');
        return;
    }
    
    console.log('All requirements met');
    
    try {
        const app = new CS2SkinCreator();
        window.cs2app = app; // Make accessible for debugging
        console.log('CS2 Skin Creator initialized successfully');
        console.log('Tip: Select a weapon and switch to 3D view to preview it.');
    } catch (error) {
        console.error('Error during initialization:', error);
        alert('Startup error: ' + error.message);
    }
}
