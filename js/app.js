import { auth, db, appId, onAuthStateChanged } from './firebase-init.js';
import { collection, addDoc, onSnapshot, serverTimestamp, doc, updateDoc, increment, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global App States
let currentUser = null;
let allProducts = []; 
let cart = [];        

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log("User logged in:", user.uid);
        
        // Start listening to their custom profile data!
        window.listenToProfile(user.uid); 
        
        const path = window.location.pathname;
        if (path.includes('sales.html')) {
            window.fetchSales(user.uid);
            window.listenToProducts(user.uid); 
        } else if (path.includes('products.html')) {
            window.fetchProducts(user.uid); 
        } else if (path.includes('dashboard.html') || path.length === 1 || path.endsWith('/')) {
            window.fetchDashboardData(user.uid); 
        }
    } else {
        const path = window.location.pathname;
        if (path.includes('dashboard') || path.includes('products') || path.includes('sales')) {
            window.location.href = 'login.html';
        }
    }
});

// ==========================================
// GLOBAL UI FUNCTIONS 
// ==========================================

window.navigate = function(event, url) {
    event.preventDefault();
    try { window.location.href = url; } catch(e) { console.log(`Navigating to ${url}`); }
};

window.toggleModal = function(modalID) {
    const modal = document.getElementById(modalID);
    if (modal) modal.classList.toggle('hidden');
};

window.toggleDrawer = function() {
    const drawer = document.getElementById('salesDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (drawer && overlay) {
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
    }
};

// ==========================================
// INVENTORY / PRODUCTS LOGIC
// ==========================================

window.openProductModal = function(isEdit = false) {
    document.getElementById('productModal').classList.remove('hidden');
    if (!isEdit) {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('modalTitle').innerText = 'Add New Product';
    }
};

window.closeProductModal = function() {
    document.getElementById('productModal').classList.add('hidden');
};

// Handle Create and Update
window.saveProduct = async function(event) {
    event.preventDefault();
    if (!currentUser) return alert("Must be logged in!");

    const id = document.getElementById('productId').value;
    const name = document.getElementById('prodName').value;
    const sku = document.getElementById('prodSku').value;
    const category = document.getElementById('prodCategory').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const stock = parseInt(document.getElementById('prodStock').value);

    const productData = { name, sku, category, price, stock, emoji: '📦' };

    try {
        if (id) {
            // Update existing product
            const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'products', id);
            await updateDoc(docRef, productData);
        } else {
            // Create new product
            const colRef = collection(db, 'artifacts', appId, 'users', currentUser.uid, 'products');
            await addDoc(colRef, { ...productData, createdAt: serverTimestamp() });
        }
        closeProductModal();
    } catch (e) {
        console.error(e);
        alert("Error saving product");
    }
};

// Handle Delete
window.deleteProduct = async function(id) {
    if(!confirm("Are you sure you want to delete this product?")) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'products', id));
    } catch (e) {
        console.error("Error deleting product:", e);
        alert("Error deleting product");
    }
};

// Handle Edit (Populates the form)
window.editProduct = function(id) {
    const prod = allProducts.find(p => p.id === id);
    if(!prod) return;

    document.getElementById('productId').value = prod.id;
    document.getElementById('prodName').value = prod.name;
    document.getElementById('prodSku').value = prod.sku;
    document.getElementById('prodCategory').value = prod.category;
    document.getElementById('prodPrice').value = prod.price;
    document.getElementById('prodStock').value = prod.stock;
    
    document.getElementById('modalTitle').innerText = 'Edit Product';
    openProductModal(true);
};

// Fetch real data and paint the HTML table
window.fetchProducts = function(userId) {
    const productsRef = collection(db, 'artifacts', appId, 'users', userId, 'products');
    
    onSnapshot(productsRef, (snapshot) => {
        allProducts = []; 
        const tbody = document.getElementById('productsTableBody');
        if(!tbody) return;

        tbody.innerHTML = '';
        snapshot.forEach(doc => {
            const p = { id: doc.id, ...doc.data() };
            allProducts.push(p); // Keep array synced for editing

            // Determine stock pill color
            let statusHtml = p.stock > 10 ? `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">In Stock</span>` :
                             p.stock > 0 ? `<span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">Low Stock</span>` :
                             `<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">Out of Stock</span>`;

            tbody.innerHTML += `
                <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 flex items-center">
                        <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl mr-3 border border-gray-200">${p.emoji || '📦'}</div>
                        <div>
                            <p class="font-semibold text-gray-800">${p.name}</p>
                            <p class="text-xs text-gray-500">SKU: ${p.sku}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-600">${p.category || 'N/A'}</td>
                    <td class="px-6 py-4 font-bold text-gray-800">$${parseFloat(p.price).toFixed(2)}</td>
                    <td class="px-6 py-4 font-medium ${p.stock <= 0 ? 'text-red-500' : 'text-gray-800'}">${p.stock} Units</td>
                    <td class="px-6 py-4">${statusHtml}</td>
                    <td class="px-6 py-4">
                        <div class="flex space-x-2">
                            <button onclick="editProduct('${p.id}')" class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"><i class="ph ph-pencil-simple text-lg"></i></button>
                            <button onclick="deleteProduct('${p.id}')" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><i class="ph ph-trash text-lg"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        if (allProducts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">No products found. Add one to your database!</td></tr>`;
        }
    });
};

// ==========================================
// FIRESTORE SALES & CART LOGIC
// ==========================================

window.listenToProducts = function(userId) {
    const productsRef = collection(db, 'artifacts', appId, 'users', userId, 'products');
    onSnapshot(productsRef, (snapshot) => {
        allProducts = [];
        snapshot.forEach((doc) => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });
    });
};

window.searchAndAddProduct = function(query) {
    if (!query.trim()) return;
    
    const product = allProducts.find(p => 
        p.name?.toLowerCase().includes(query.toLowerCase()) || 
        p.sku?.toLowerCase() === query.toLowerCase().trim()
    );

    if (!product) {
        alert("Product not found! Make sure you added it in the Products tab first.");
        return; 
    }
    
    if (parseInt(product.stock) <= 0) {
        alert(`${product.name} is out of stock!`);
        return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        if (existingItem.quantity >= parseInt(product.stock)) {
            alert(`Cannot add more. Only ${product.stock} items left in inventory.`);
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            emoji: product.emoji || '📦',
            quantity: 1,
            maxStock: parseInt(product.stock)
        });
    }

    const searchInput = document.getElementById('productSearchInput');
    if(searchInput) searchInput.value = '';
    window.renderCart();
};

window.updateCartQty = function(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId); 
    } else if (item.quantity > item.maxStock) {
        alert(`Only ${item.maxStock} items available in stock.`);
        item.quantity = item.maxStock;
    }
    window.renderCart();
};

window.renderCart = function() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;

    container.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-gray-400 text-sm">Cart is empty. Search for items above!</div>`;
    }

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        container.innerHTML += `
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between mt-3">
                <div class="flex items-center flex-1">
                    <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl mr-3 border border-gray-100">${item.emoji}</div>
                    <div>
                        <h4 class="font-bold text-gray-800 text-sm">${item.name}</h4>
                        <p class="text-brand font-semibold text-sm">$${item.price.toFixed(2)}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button onclick="updateCartQty('${item.id}', -1)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded transition-all"><i class="ph ph-minus"></i></button>
                    <span class="text-sm font-bold w-4 text-center">${item.quantity}</span>
                    <button onclick="updateCartQty('${item.id}', 1)" class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded transition-all"><i class="ph ph-plus"></i></button>
                </div>
            </div>
        `;
    });

    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    if(subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if(totalEl) totalEl.innerText = `$${subtotal.toFixed(2)}`;
};

window.completeSale = async function() {
    if (!currentUser) return alert("You must be logged in to complete a sale.");
    if (cart.length === 0) return alert("Your cart is empty! Add products before checking out.");

    try {
        let totalAmount = 0;
        let itemsCount = 0;
        
        cart.forEach(item => {
            totalAmount += item.price * item.quantity;
            itemsCount += item.quantity;
        });

        for (const item of cart) {
            const productDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'products', item.id);
            await updateDoc(productDocRef, { stock: increment(-item.quantity) });
        }

        const salesRef = collection(db, 'artifacts', appId, 'users', currentUser.uid, 'sales');
        await addDoc(salesRef, {
            invoiceId: `#INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
            totalAmount: totalAmount,
            itemsCount: itemsCount,
            status: 'Paid',
            createdAt: serverTimestamp()
        });

        alert("Sale logged and inventory adjusted successfully!");
        cart = []; 
        window.renderCart(); 
        window.toggleDrawer(); 
        
    } catch (error) {
        console.error(error);
        alert("Failed to complete sale transaction.");
    }
};

window.fetchSales = function(userId) {
    if (!userId) return;
    const salesRef = collection(db, 'artifacts', appId, 'users', userId, 'sales');
    
    onSnapshot(salesRef, (snapshot) => {
        const tableBody = document.getElementById('salesTableBody');
        if (!tableBody) return; 

        tableBody.innerHTML = ''; 
        
        snapshot.forEach((doc) => {
            const sale = doc.data();
            const dateStr = sale.createdAt ? new Date(sale.createdAt.toDate()).toLocaleString() : 'Just now';

            tableBody.innerHTML += `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-semibold text-gray-800">${sale.invoiceId}</td>
                    <td class="px-6 py-4 text-gray-500">${dateStr}</td>
                    <td class="px-6 py-4">Walk-in Customer</td>
                    <td class="px-6 py-4">${sale.itemsCount} Items</td>
                    <td class="px-6 py-4 font-bold text-gray-800">$${sale.totalAmount.toFixed(2)}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">${sale.status}</span>
                    </td>
                </tr>
            `;
        });
    });
};

// ==========================================
// DASHBOARD LOGIC (UPDATED)
// ==========================================

window.fetchDashboardData = function(userId) {
    if (!userId) return;
    
    // 1. Calculate Sales & Revenue
    const salesRef = collection(db, 'artifacts', appId, 'users', userId, 'sales');
    onSnapshot(salesRef, (snapshot) => {
        let totalRevenue = 0;
        let totalSalesCount = 0;

        snapshot.forEach((doc) => {
            totalRevenue += parseFloat(doc.data().totalAmount || 0);
            totalSalesCount += 1;
        });

        // Find the HTML elements
        const revenueEl = document.getElementById('dashboardRevenue');
        const countEl = document.getElementById('dashboardSalesCount');
        
        // Inject the math
        if (revenueEl) revenueEl.innerText = `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (countEl) countEl.innerText = totalSalesCount.toLocaleString();
    });

    // 2. Calculate Products & Low Stock
    const productsRef = collection(db, 'artifacts', appId, 'users', userId, 'products');
    onSnapshot(productsRef, (snapshot) => {
        let totalProducts = 0;
        let lowStockCount = 0;

        snapshot.forEach((doc) => {
            totalProducts += 1;
            const stock = parseInt(doc.data().stock || 0);
            if (stock <= 5) { // Any product with 5 or less is considered Low Stock
                lowStockCount += 1;
            }
        });

        // Find the HTML elements
        const productsEl = document.getElementById('dashboardProductsCount');
        const lowStockEl = document.getElementById('dashboardLowStock');
        
        // Inject the math
        if (productsEl) productsEl.innerText = totalProducts.toLocaleString();
        if (lowStockEl) lowStockEl.innerText = lowStockCount.toLocaleString();
    });
};

// ==========================================
// PROFILE EDITING LOGIC
// ==========================================

window.openProfileModal = function() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('hidden');
    
    // Attempt to pre-fill the form with current values if the elements exist
    const navName = document.getElementById('navUserName');
    const navAvatar = document.getElementById('navAvatar');
    
    if (navName) document.getElementById('editUserName').value = navName.innerText;
    if (navAvatar) document.getElementById('editUserAvatar').value = navAvatar.innerText.trim();
};

window.closeProfileModal = function() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('hidden');
};

window.saveProfile = async function(event) {
    event.preventDefault();
    if (!currentUser) return alert("Must be logged in!");

    const newName = document.getElementById('editUserName').value;
    const newAvatar = document.getElementById('editUserAvatar').value;

    try {
        // Save to Firebase using setDoc (creates or overwrites the profile doc)
        const profileRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'settings', 'profile');
        await setDoc(profileRef, { name: newName, avatar: newAvatar }, { merge: true });
        
        closeProfileModal();
    } catch (e) {
        console.error("Error saving profile:", e);
        alert("Failed to save profile.");
    }
};

// Listen for profile changes in real-time
window.listenToProfile = function(userId) {
    const profileRef = doc(db, 'artifacts', appId, 'users', userId, 'settings', 'profile');
    onSnapshot(profileRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Update the Top Nav Bar across any page that has these IDs
            const navName = document.getElementById('navUserName');
            const navAvatar = document.getElementById('navAvatar');
            
            if (navName && data.name) navName.innerText = data.name;
            if (navAvatar && data.avatar) navAvatar.innerText = data.avatar;

            // Optional: Update the "Welcome back!" message specifically on the dashboard
            const welcomeMsg = document.querySelector('h1.text-2xl.font-bold');
            if (welcomeMsg && data.name && welcomeMsg.innerText.includes('Welcome back')) {
                welcomeMsg.innerText = `Welcome back, ${data.name.split(' ')[0]}! 👋`;
            }
        }
    });
};