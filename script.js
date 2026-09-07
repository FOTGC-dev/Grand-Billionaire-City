// Default items array if storage is empty
const defaultItems = [
    {
        title: "Porsche 911 Turbo S White",
        price: "34",
        tag: "STOCK 5 • 10% OFF",
        image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80",
        desc: "Game Value: 75M • Ratio pricing applied"
    },
    {
        title: "Bugatti Chiron Super Sport",
        price: "63",
        tag: "STOCK 5 • 10% OFF",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
        desc: "Game Value: 140M • Ratio pricing applied"
    }
];

// Load items from localStorage or fallback to default
function getItems() {
    const saved = localStorage.getItem('gbc_marketplace_items');
    return saved ? JSON.parse(saved) : defaultItems;
}

// Render Marketplace items onto marketplace.html
function renderMarketplace() {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return; // Exit if not on the marketplace page
    
    const items = getItems();
    grid.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img class="card-img" src="${item.image}" alt="${item.title}">
            <div class="card-body">
                <span class="badge-tag">${item.tag}</span>
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
                <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 12px;">${item.price} GC</div>
                <button class="btn-primary btn-danger">ADD TO CART - ${item.price} GC</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Handle item upload from panel.html form
function handleItemUpload(event) {
    event.preventDefault();
    
    const newItem = {
        title: document.getElementById('itemTitle').value,
        price: document.getElementById('itemPrice').value,
        tag: document.getElementById('itemTag').value,
        image: document.getElementById('itemImage').value,
        desc: document.getElementById('itemDesc').value
    };

    const items = getItems();
    items.unshift(newItem); // Add new upload to the top
    localStorage.setItem('gbc_marketplace_items', JSON.stringify(items));

    alert('Item uploaded successfully! Redirecting to marketplace...');
    document.getElementById('uploadForm').reset();
    window.location.href = 'marketplace.html';
}
