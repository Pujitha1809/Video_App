# Virtual environment activation wrapper
$venvPath = ".\.venv\Scripts"
$env:Path = "$((Resolve-Path $venvPath).Path);$env:Path"
$env:VIRTUAL_ENV = (Resolve-Path ".\.venv").Path
$prompt = "(.venv) PS "
function prompt { Write-Host $prompt -NoNewline; return "> " }
Write-Host "Virtual environment activated" -ForegroundColor Green
