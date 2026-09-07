<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GBC - Marketplace & Store</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

    <nav>
        <div class="nav-brand">
            <span class="brand-badge">GBC</span>
            <span class="brand-title">STOREFRONT</span>
        </div>
        <div class="nav-actions">
            <a href="index.php" class="btn-nav">HOME PORTAL</a>
        </div>
    </nav>

    <div class="page-view" style="max-width: 900px; margin-top: 30px;">
        <h2 style="color: var(--accent-gold); margin-bottom: 20px; text-align: center;">Grand Billionaire City Marketplace</h2>
        <div id="liveMarketplaceGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 15px;">
            <!-- Dynamically populated from script.js store data -->
        </div>
    </div>

    <script src="script.js"></script>
    <script>
        window.onload = () => {
            renderMarketplaceStorefront();
        };
    </script>
</body>
</html>
