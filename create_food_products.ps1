# Script to create 20 food products
$baseUrl = "http://localhost:3000/api/products"
$token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4MWI0NWJjMi1jOTJjLTRmYTgtYTYyYS1hN2JkNjk5ODlmNDEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTUxNjI2OTAsImV4cCI6MTc1NTc2NzQ5MCwiYXVkIjoiaW52ZW50b3J5LXVzZXJzIiwiaXNzIjoiaW52ZW50b3J5LXN5c3RlbSJ9.ajJDYhWUr3Sb9jXlebqPpfD_0emSZ6L36FkuPVRBOT0"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
# Define 20 food products
$products = @(
    @{
        name = "Phở Bò Hà Nội"
        description = "Phở bò truyền thống Hà Nội, gói 500g"
        sku = "PHO001"
        price = 25000
        currency = "VND"
        category = "instant-noodles"
        tags = @("Vina Acecook", "Traditional")
        specification = "500g"
    },
    @{
        name = "Bánh Mì Sandwich"
        description = "Bánh mì sandwich kẹp thịt nguội"
        sku = "BM001"
        price = 15000
        currency = "VND"
        category = "bakery"
        tags = @("Fresh", "Sandwich")
        specification = "1 cái"
    },
    @{
        name = "Cơm Tấm Sài Gòn"
        description = "Cơm tấm đặc sản Sài Gòn, hộp 350g"
        sku = "CT001"
        price = 35000
        currency = "VND"
        category = "rice-dish"
        tags = @("Saigon", "Traditional")
        specification = "350g"
    },
    @{
        name = "Bún Bò Huế"
        description = "Bún bò Huế cay nồng, gói 400g"
        sku = "BBH001"
        price = 28000
        currency = "VND"
        category = "instant-noodles"
        tags = @("Hue", "Spicy")
        specification = "400g"
    },
    @{
        name = "Bánh Chưng Truyền Thống"
        description = "Bánh chưng lá dong, 500g"
        sku = "BCH001"
        price = 45000
        currency = "VND"
        category = "traditional-cake"
        tags = @("Tet", "Traditional")
        specification = "500g"
    },
    @{
        name = "Gỏi Cuốn Tôm Thịt"
        description = "Gỏi cuốn tươi tôm thịt, 4 cuốn"
        sku = "GC001"
        price = 20000
        currency = "VND"
        category = "fresh-roll"
        tags = @("Fresh", "Healthy")
        specification = "4 cuốn"
    },
    @{
        name = "Bánh Xèo Miền Tây"
        description = "Bánh xèo đặc sản miền Tây, 2 cái"
        sku = "BX001"
        price = 30000
        currency = "VND"
        category = "pancake"
        tags = @("Mekong Delta", "Traditional")
        specification = "2 cái"
    },
    @{
        name = "Chả Cá Lã Vọng"
        description = "Chả cá Hà Nội nổi tiếng, 300g"
        sku = "CC001"
        price = 55000
        currency = "VND"
        category = "fish-cake"
        tags = @("Hanoi", "Famous")
        specification = "300g"
    },
    @{
        name = "Nem Nướng Nha Trang"
        description = "Nem nướng đặc sản Nha Trang, 250g"
        sku = "NN001"
        price = 40000
        currency = "VND"
        category = "grilled-meat"
        tags = @("Nha Trang", "Grilled")
        specification = "250g"
    },
    @{
        name = "Bánh Căn Phan Thiết"
        description = "Bánh căn đặc sản Phan Thiết, 10 cái"
        sku = "BCA001"
        price = 18000
        currency = "VND"
        category = "small-cake"
        tags = @("Phan Thiet", "Street Food")
        specification = "10 cái"
    },
    @{
        name = "Hủ Tiếu Nam Vang"
        description = "Hủ tiếu Nam Vang truyền thống, gói 300g"
        sku = "HT001"
        price = 22000
        currency = "VND"
        category = "instant-noodles"
        tags = @("Cambodia Style", "Traditional")
        specification = "300g"
    },
    @{
        name = "Bánh Tráng Nướng"
        description = "Bánh tráng nướng Đà Lạt, 5 cái"
        sku = "BTN001"
        price = 12000
        currency = "VND"
        category = "grilled-cake"
        tags = @("Da Lat", "Crispy")
        specification = "5 cái"
    },
    @{
        name = "Cà Phê Phin Việt Nam"
        description = "Cà phê phin truyền thống, gói 250g"
        sku = "CP001"
        price = 85000
        currency = "VND"
        category = "beverage"
        tags = @("Trung Nguyen", "Traditional")
        specification = "250g"
    },
    @{
        name = "Bánh Đậu Xanh"
        description = "Bánh đậu xanh Hải Dương, hộp 300g"
        sku = "BDX001"
        price = 35000
        currency = "VND"
        category = "mung-bean-cake"
        tags = @("Hai Duong", "Traditional")
        specification = "300g"
    },
    @{
        name = "Mì Quảng"
        description = "Mì Quảng đặc sản miền Trung, gói 400g"
        sku = "MQ001"
        price = 26000
        currency = "VND"
        category = "instant-noodles"
        tags = @("Quang Nam", "Traditional")
        specification = "400g"
    },
    @{
        name = "Bánh Ít Lá Gai"
        description = "Bánh ít lá gai Huế, 6 cái"
        sku = "BIT001"
        price = 24000
        currency = "VND"
        category = "traditional-cake"
        tags = @("Hue", "Green Leaf")
        specification = "6 cái"
    },
    @{
        name = "Chả Lụa Hà Nội"
        description = "Chả lụa Hà Nội truyền thống, 400g"
        sku = "CL001"
        price = 48000
        currency = "VND"
        category = "pork-roll"
        tags = @("Hanoi", "Traditional")
        specification = "400g"
    },
    @{
        name = "Bánh Pía Sóc Trăng"
        description = "Bánh pía đậu xanh Sóc Trăng, hộp 4 cái"
        sku = "BP001"
        price = 32000
        currency = "VND"
        category = "moon-cake"
        tags = @("Soc Trang", "Mung Bean")
        specification = "4 cái"
    },
    @{
        name = "Nem Chua Thanh Hóa"
        description = "Nem chua đặc sản Thanh Hóa, 300g"
        sku = "NCH001"
        price = 38000
        currency = "VND"
        category = "fermented-pork"
        tags = @("Thanh Hoa", "Fermented")
        specification = "300g"
    },
    @{
        name = "Bánh Tét Miền Tây"
        description = "Bánh tét lá chuối miền Tây, 2 cái"
        sku = "BT001"
        price = 42000
        currency = "VND"
        category = "traditional-cake"
        tags = @("Mekong Delta", "Banana Leaf")
        specification = "2 cái"
    }
)

Add-Type -AssemblyName System.Net.Http

$client = New-Object System.Net.Http.HttpClient
# set Authorization header
$client.DefaultRequestHeaders.Remove("Authorization") | Out-Null
$client.DefaultRequestHeaders.Add("Authorization", $token)

$successCount = 0
$errorCount = 0

Write-Host "Starting to create $($products.Count) food products..." -ForegroundColor Green

foreach ($product in $products) {
    try {
        $json = $product | ConvertTo-Json -Depth 10

        # StringContent với encoding UTF8 (không BOM) và media-type application/json
        $content = New-Object System.Net.Http.StringContent($json, [System.Text.Encoding]::UTF8, 'application/json')

        $task = $client.PostAsync($baseUrl, $content)
        $task.Wait()
        $resp = $task.Result
        $respContent = $resp.Content.ReadAsStringAsync().Result

        if ($resp.IsSuccessStatusCode) {
            Write-Host "✅ Created: $($product.name) (SKU: $($product.sku))" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ Failed to create: $($product.name) - Status: $($resp.StatusCode) - Body: $respContent" -ForegroundColor Red
            $errorCount++
        }

        Start-Sleep -Milliseconds 150
    } catch {
        Write-Host "❌ Error creating $($product.name): $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

$client.Dispose()

Write-Host ""
Write-Host "========== SUMMARY ==========" -ForegroundColor Cyan
Write-Host "✅ Successfully created: $successCount products" -ForegroundColor Green
Write-Host "❌ Failed: $errorCount products" -ForegroundColor Red
Write-Host "============================" -ForegroundColor Cyan
