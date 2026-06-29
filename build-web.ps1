# Build web export and fix font filenames for static deployment
npx expo export --platform web

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Copy vercel.json for SPA routing
Copy-Item -Force -LiteralPath "vercel.json" -Destination "dist\vercel.json"

# Copy hashed font files to unhashed names (browser requests unhashed, files on disk have hashes)
$fonts = Get-ChildItem -Recurse -File -LiteralPath "dist\assets" -Filter "*.ttf"
foreach ($font in $fonts) {
    $unhashedName = $font.Name -replace '\.[a-f0-9]{32}', ''
    if ($font.Name -ne $unhashedName) {
        $dest = Join-Path $font.Directory.FullName $unhashedName
        Copy-Item -Force -LiteralPath $font.FullName -Destination $dest
    }
}

# Inject CDN @font-face into dist/index.html for guaranteed icon font loading
$html = Get-Content -LiteralPath "dist\index.html" -Raw
$cdn = "`n    <style>@font-face{font-family:'ionicons';src:url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@15.0.3/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');font-weight:normal;font-style:normal}</style>"
$html = $html -replace '(<link rel="icon" href="/favicon.ico" />)', ('$1' + $cdn)
Set-Content -LiteralPath "dist\index.html" -Value $html -NoNewline

Write-Host "Build complete. dist/ ready for Vercel deployment."
