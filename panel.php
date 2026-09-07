<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GBC - Secure Staff Console</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>

    <nav>
        <div class="nav-brand">
            <span class="brand-badge">STAFF</span>
            <span class="brand-title" id="welcomeUserBanner">Loading Console...</span>
        </div>
        <div class="nav-actions">
            <button class="btn-nav btn-danger" onclick="sessionStorage.removeItem('gbc_logged_in_user'); window.location.href='staff-login.php';">LOGOUT</button>
        </div>
    </nav>

    <div class="page-view" style="max-width: 900px; margin-top: 30px;">
        <!-- Dynamic Level Tabs -->
        <div class="tab-selector" style="margin-bottom: 25px; flex-wrap: wrap;">
            <button class="tab-btn active" onclick="switchPanelTab('support', this)"><i class="fa-solid fa-headset"></i> Support Desk</button>
            <button class="tab-btn" id="tabOrdersBtn" style="display:none;" onclick="switchPanelTab('orders', this)"><i class="fa-solid fa-receipt"></i> Orders</button>
            <button class="tab-btn" id="tabHomepageBtn" style="display:none;" onclick="switchPanelTab('homepage', this)"><i class="fa-solid fa-house-laptop"></i> Homepage Content</button>
            <button class="tab-btn" id="tabPlayersBtn" style="display:none;" onclick="switchPanelTab('players', this)"><i class="fa-solid fa-users"></i> Players</button>
            <button class="tab-btn" id="tabAdminsBtn" style="display:none;" onclick="switchPanelTab('admins', this)"><i class="fa-solid fa-shield-halved"></i> Admins List</button>
            <button class="tab-btn" id="tabBankBtn" style="display:none;" onclick="switchPanelTab('bank', this)"><i class="fa-solid fa-university"></i> Bank Account</button>
            <button class="tab-btn" id="tabStaffApprovalBtn" style="display:none;" onclick="switchPanelTab('staff', this)"><i class="fa-solid fa-user-gear"></i> Owner Staff Control</button>
        </div>

        <!-- Support Desk (Level 1+) -->
        <div class="panel-section" id="panelTab-support">
            <div class="admin-form-container" style="max-width: 100%;">
                <h3>Live Customer Support Desk</h3>
                <div id="adminChatLog" style="height: 300px; background: #0a0a0a; border: 1px solid var(--card-border); border-radius: 8px; padding: 15px; overflow-y: auto; margin-bottom: 15px;"></div>
            </div>
        </div>

        <!-- HOMEPAGE & STORE CONTROL (Level 4+) -->
        <div class="panel-section" id="panelTab-homepage" style="display: none;">
            <div class="admin-form-container" style="max-width: 100%; margin-bottom: 20px;">
                <h3>Add New Homepage / Store Item</h3>
                <form id="addItemForm" onsubmit="handleAddHomepageItem(event)">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="itemCategorySelect" style="width:100%; padding:10px; background:#0a0a0a; color:white; border:1px solid var(--card-border); border-radius:6px;">
                            <option value="coins">Coins</option>
                            <option value="vehicles">Vehicles</option>
                            <option value="properties">Properties</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Item Title</label>
                        <input type="text" id="itemTitleInput" required placeholder="e.g. Bugatti Chiron">
                    </div>
                    <div class="form-group">
                        <label>Price</label>
                        <input type="text" id="itemPriceInput" required placeholder="e.g. 50 GC">
                    </div>
                    <div class="form-group">
                        <label>Tag Badge</label>
                        <input type="text" id="itemTagInput" placeholder="e.g. LIMITED">
                    </div>
                    <div class="form-group">
                        <label>Description / Details</label>
                        <input type="text" id="itemDescInput" placeholder="e.g. Top tier hypercar">
                    </div>
                    <button type="submit" class="btn-primary">PUBLISH TO HOMEPAGE</button>
                </form>
            </div>

            <div class="admin-form-container" style="max-width: 100%;">
                <h3>Manage / Delete Existing Homepage Items</h3>
                <div id="homepageItemsContainer" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>
            </div>
        </div>

        <!-- Players Directory (Level 5+) -->
        <div class="panel-section" id="panelTab-players" style="display: none;">
            <div class="admin-form-container" style="max-width: 100%;">
                <h3>Registered Players Directory</h3>
                <div id="playersDirectoryContainer" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>
            </div>
        </div>

        <!-- Admins List (Level 6+) -->
        <div class="panel-section" id="panelTab-admins" style="display: none;">
            <div class="admin-form-container" style="max-width: 100%;">
                <h3>Active Administrators Ranks</h3>
                <div id="adminsDirectoryContainer" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>
            </div>
        </div>

        <!-- Bank Account Info (Level 7+) -->
        <div class="panel-section" id="panelTab-bank" style="display: none;">
            <div class="admin-form-container" style="max-width: 100%;">
                <h3>Bank Account & Payment Configuration</h3>
                <div class="form-group">
                    <label>Bank Instructions / Details</label>
                    <textarea id="bankInfoInput" rows="4" placeholder="Bank Name, Account Number, etc."></textarea>
                </div>
                <button class="btn-primary" onclick="saveBankAccountInfo()">SAVE BANK DETAILS</button>
            </div>
        </div>

        <!-- Owner Staff Control (Level 8 Only) -->
        <div class="panel-section" id="panelTab-staff" style="display: none;">
            <div class="admin-form-container" style="max-width: 100%; margin-bottom: 20px;">
                <h3>Pending Staff Applications</h3>
                <div id="pendingStaffContainer" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>
            </div>
            <div class="admin-form-container" style="max-width: 100%;">
                <h3>Manage Staff Ranks & Assign Level 8 Owners</h3>
                <div id="activeStaffContainer" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;"></div>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
    <script>
        window.onload = () => {
            const user = sessionStorage.getItem('gbc_logged_in_user');
            if(!user) { window.location.href = 'staff-login.php'; return; }
            initializeStaffPanel(user);
        };
    </script>
</body>
    </html>
    
