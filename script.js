// ═══════════════════════════════════════════════════════════
// Sri Saravana Chidambaram Fancy Covering — Core Logic
// ═══════════════════════════════════════════════════════════

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

const DEFAULT_PRODUCTS = [
    { id: 'p1', name: 'Royal Kundan Bridal Set', category: 'bridal', price: 4500, image: 'necklace.png', description: 'Exquisite kundan bridal necklace set with matching earrings. Intricate meenakari work with ruby and emerald stones.' },
    { id: 'p2', name: 'Temple Gold Chain', category: 'chains', price: 1800, image: 'chain.png', description: 'Traditional temple design gold chain with ornate pendant featuring ruby stone accents.' },
    { id: 'p3', name: 'Designer Jhumka Earrings', category: 'earrings', price: 1200, image: 'earrings.png', description: 'Elegant jhumka earrings with pearl and emerald drops. Intricate gold filigree craftsmanship.' },
    { id: 'p4', name: 'Classic Gold Bangles Set', category: 'bangles', price: 2800, image: 'bangles.png', description: 'Set of 4 gold bangles with intricate floral engravings and stone inlays. Premium micro-plating.' },
    { id: 'p5', name: 'Diamond Cut Ring', category: 'rings', price: 950, image: 'rings.png', description: 'Elegant diamond-cut gold ring with CZ stone setting. Available in all sizes.' },
    { id: 'p6', name: 'Lakshmi Long Necklace', category: 'necklaces', price: 5200, image: 'necklace.png', description: 'Goddess Lakshmi motif long haram necklace. Temple jewelry tradition with 24k gold plating.' }
];

const DEFAULT_PHONE = '919843132245';

// ─── STATE ───
function getProducts() {
    const stored = localStorage.getItem('sscc_products');
    if (!stored) {
        localStorage.setItem('sscc_products', JSON.stringify(DEFAULT_PRODUCTS));
        return [...DEFAULT_PRODUCTS];
    }
    return JSON.parse(stored);
}

function saveProducts(products) {
    localStorage.setItem('sscc_products', JSON.stringify(products));
}

function getPhone() {
    return localStorage.getItem('sscc_phone') || DEFAULT_PHONE;
}

function setPhone(phone) {
    localStorage.setItem('sscc_phone', phone);
}

function isLoggedIn() {
    return sessionStorage.getItem('sscc_admin') === 'true';
}

function login(user, pass) {
    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('sscc_admin', 'true');
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('sscc_admin');
    window.location.href = 'admin.html';
}

// ─── WHATSAPP ───
function bookViaWhatsApp(product) {
    const phone = getPhone();
    const msg = `🛒 *Order Enquiry — Sri Saravana Covering*\n\n📦 Item: ${product.name}\n💰 Price: ₹${product.price.toLocaleString('en-IN')}\n🏷️ Category: ${product.category}\n📋 ID: ${product.id}\n\nI would like to book this item. Please confirm availability.`;
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// ─── RENDER PRODUCTS ───
function renderProducts(containerId, products, showAdmin = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div style="text-align:center;grid-column:1/-1;padding:60px 20px;"><p style="color:var(--text-secondary);font-size:1.1rem;">No products found</p></div>';
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card animate-in">
            <div class="card-img-wrap">
                <img class="card-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x300/111128/D4AF37?text=No+Image'">
                <span class="card-badge">${p.category}</span>
            </div>
            <div class="card-body">
                <h3>${p.name}</h3>
                <p class="category-tag">${p.category}</p>
                <p class="price">₹${p.price.toLocaleString('en-IN')}</p>
                <p class="desc">${p.description}</p>
                <div class="card-actions">
                    <button class="btn btn-whatsapp" onclick='bookViaWhatsApp(${JSON.stringify(p).replace(/'/g, "\\'")})'>
                        📱 WhatsApp Book
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    observeAnimations();
}

// ─── RENDER ADMIN PRODUCT LIST ───
function renderAdminProducts(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const products = getProducts();

    if (products.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:30px;">No products yet. Add your first product above!</p>';
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="admin-item">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/100/111128/D4AF37?text=No+Img'">
            <div class="admin-item-info">
                <h4>${p.name}</h4>
                <span class="cat">${p.category}</span>
                <p class="price">₹${p.price.toLocaleString('en-IN')}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn-edit" onclick="editProduct('${p.id}')">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteProduct('${p.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

// ─── FILE TO BASE64 ───
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ─── ADMIN CRUD ───
async function addProduct(e) {
    e.preventDefault();
    const form = e.target;
    const fileInput = document.getElementById('pimage');
    let imageData = 'necklace.png';

    if (fileInput.files && fileInput.files[0]) {
        imageData = await readFileAsBase64(fileInput.files[0]);
    }

    const products = getProducts();
    const newProduct = {
        id: 'p' + Date.now(),
        name: form.pname.value.trim(),
        category: form.pcategory.value,
        price: parseInt(form.pprice.value),
        image: imageData,
        description: form.pdesc.value.trim()
    };
    products.push(newProduct);
    saveProducts(products);
    form.reset();
    const preview = document.getElementById('pimage-preview');
    if (preview) preview.style.display = 'none';
    renderAdminProducts('admin-products');
    showToast('Product added successfully!');
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    let products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
    renderAdminProducts('admin-products');
    showToast('Product deleted');
}

function editProduct(id) {
    const products = getProducts();
    const p = products.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('editModal');
    if (!modal) return;

    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-category').value = p.category;
    document.getElementById('edit-price').value = p.price;
    document.getElementById('edit-desc').value = p.description;

    // Show current image preview
    const preview = document.getElementById('edit-image-preview');
    if (preview) { preview.src = p.image; preview.style.display = 'block'; }

    // Clear file input
    document.getElementById('edit-image').value = '';

    modal.classList.add('active');
}

async function saveEdit(e) {
    e.preventDefault();
    const products = getProducts();
    const id = document.getElementById('edit-id').value;
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;

    const fileInput = document.getElementById('edit-image');
    let imageData = products[idx].image; // keep existing image

    // Only update image if a new file was selected
    if (fileInput.files && fileInput.files[0]) {
        imageData = await readFileAsBase64(fileInput.files[0]);
    }

    products[idx] = {
        ...products[idx],
        name: document.getElementById('edit-name').value.trim(),
        category: document.getElementById('edit-category').value,
        price: parseInt(document.getElementById('edit-price').value),
        image: imageData,
        description: document.getElementById('edit-desc').value.trim()
    };
    saveProducts(products);
    document.getElementById('editModal').classList.remove('active');
    renderAdminProducts('admin-products');
    showToast('Product updated!');
}

function updatePhone() {
    const input = document.getElementById('phone-input');
    if (!input) return;
    const val = input.value.trim().replace(/\D/g, '');
    if (val.length < 10) { alert('Enter a valid phone number'); return; }
    setPhone(val.startsWith('91') ? val : '91' + val);
    showToast('WhatsApp number updated!');
}

// ─── FILTERING & SEARCH ───
function filterProducts(category) {
    const products = getProducts();
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    renderProducts('products-grid', filtered);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === category);
    });
}

function searchProducts(query) {
    const products = getProducts();
    const q = query.toLowerCase();
    const results = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    renderProducts('products-grid', results);
}

// ─── UTILITIES ───
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function observeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

// ─── HAMBURGER MENU ───
function toggleMenu() {
    document.querySelector('.nav-links')?.classList.toggle('open');
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) hamburger.addEventListener('click', toggleMenu);

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-links')?.classList.remove('open');
        });
    });

    // Scroll animations
    observeAnimations();

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.background = window.scrollY > 50 ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)';
        }
    });

    // Image preview for Add form
    const addFileInput = document.getElementById('pimage');
    if (addFileInput) {
        addFileInput.addEventListener('change', function() {
            const preview = document.getElementById('pimage-preview');
            if (this.files && this.files[0] && preview) {
                const reader = new FileReader();
                reader.onload = (e) => { preview.src = e.target.result; preview.style.display = 'block'; };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // Image preview for Edit form
    const editFileInput = document.getElementById('edit-image');
    if (editFileInput) {
        editFileInput.addEventListener('change', function() {
            const preview = document.getElementById('edit-image-preview');
            if (this.files && this.files[0] && preview) {
                const reader = new FileReader();
                reader.onload = (e) => { preview.src = e.target.result; preview.style.display = 'block'; };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
});
