Write-Host "Uruchamianie RPG Agent E-commerce System..." -ForegroundColor Gold

# Start Backend in a new window
Write-Host "1. Uruchamianie Backendu na http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Start Frontend in a new window
Write-Host "2. Uruchamianie Frontendu Vite..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Gotowe! Sprawdź otwarte okna terminala." -ForegroundColor Green
Write-Host "Otwórz w przeglądarce adres podany w oknie frontendu (zwykle http://localhost:5173)." -ForegroundColor Yellow
