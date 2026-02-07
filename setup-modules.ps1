# Auto Parts POS - Module Setup Script
# This script creates the remaining module structures

Write-Host "Creating remaining module structures..." -ForegroundColor Green

# Define modules to create
$modules = @(
    "users",
    "roles",
    "products",
    "stock",
    "orders",
    "customers",
    "notifications",
    "email",
    "stock-alerts"
)

foreach ($module in $modules) {
    $modulePath = "src/modules/$module"
    
    # Create module directory if it doesn't exist
    if (!(Test-Path $modulePath)) {
        New-Item -ItemType Directory -Path $modulePath -Force | Out-Null
        Write-Host "Created $modulePath" -ForegroundColor Yellow
    }
    
    # Create dto subdirectory
    if (!(Test-Path "$modulePath/dto")) {
        New-Item -ItemType Directory -Path "$modulePath/dto" -Force | Out-Null
    }
}

Write-Host "Module structure created successfully!" -ForegroundColor Green
Write-Host "Note: Individual module files will be generated in the next step."
