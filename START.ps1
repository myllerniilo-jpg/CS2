# CS2 Skin Creator - Käynnistys
# Tämä skripti käynnistää paikallisen web-serverin ja avaa sovelluksen

Write-Host "🎨 CS2 Skin Creator - Käynnistys" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Tarkista Python
$pythonInstalled = Get-Command python -ErrorAction SilentlyContinue

if ($pythonInstalled) {
    Write-Host "✅ Python löytyi! Käynnistetään web-serveri..." -ForegroundColor Green
    Write-Host ""
    Write-Host "📡 Palvelin käynnissä osoitteessa: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "🌐 Avaa selaimessa: http://localhost:8000/index.html" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Paina Ctrl+C lopettaaksesi serverin" -ForegroundColor Gray
    Write-Host ""
    
    # Avaa selain automaattisesti
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000/index.html"
    
    # Käynnistä Python HTTP-serveri
    python -m http.server 8000
} else {
    Write-Host "⚠️  Python ei ole asennettu" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vaihtoehto 1: Avaa suoraan selaimessa (voi toimia tai ei)" -ForegroundColor Cyan
    Write-Host "  - Tuplaklikkaa: index.html" -ForegroundColor White
    Write-Host ""
    Write-Host "Vaihtoehto 2: Asenna Python" -ForegroundColor Cyan
    Write-Host "  - Lataa: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "  - Asenna ja käynnistä tämä skripti uudelleen" -ForegroundColor White
    Write-Host ""
    Write-Host "Vaihtoehto 3: Käytä Node.js" -ForegroundColor Cyan
    Write-Host "  - npm install -g http-server" -ForegroundColor White
    Write-Host "  - http-server -p 8000" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Haluatko avata index.html suoraan selaimessa? (k/e)"
    if ($response -eq "k") {
        Start-Process "index.html"
        Write-Host "✅ Avattu selaimessa!" -ForegroundColor Green
        Write-Host "Jos 3D ei toimi, käytä web-serveriä (ks. yllä)" -ForegroundColor Yellow
    }
}
