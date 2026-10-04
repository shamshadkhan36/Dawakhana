/**
 * Dawakhana.com - Interactive Web Application Engine
 * Cart Management, Instant Search, Seamless In-App Checkout, WhatsApp Ordering, Rx Upload & Pincode Checker
 */

(function () {
    'use strict';

    // State
    const DawakhanaApp = {
        cart: [],
        currentPincode: localStorage.getItem('dw_pincode') || '110001',
        currentLocationName: localStorage.getItem('dw_location') || 'Connaught Place, New Delhi',
        checkoutItems: [], // items currently being checked out

        init() {
            this.loadCart();
            this.setupSearch();
            this.setupPincode();
            this.setupPrescriptionUpload();
            this.setupOrderForm();
            this.setupModalsAndEvents();
            this.updateCartUI();
        },

        // --- CART MANAGEMENT ---
        loadCart() {
            try {
                const saved = localStorage.getItem('dw_cart');
                this.cart = saved ? JSON.parse(saved) : [];
            } catch (e) {
                this.cart = [];
            }
        },

        saveCart() {
            localStorage.setItem('dw_cart', JSON.stringify(this.cart));
            this.updateCartUI();
            this.refreshProductCardButtons();
        },

        addToCart(productId, qty = 1) {
            const product = PRODUCTS.find(p => p.id === productId);
            if (!product) return;

            const existing = this.cart.find(item => item.id === productId);
            if (existing) {
                existing.qty += qty;
            } else {
                this.cart.push({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    mrp: product.mrp,
                    packSize: product.packSize,
                    image: product.image,
                    rxRequired: product.rxRequired,
                    qty: qty
                });
            }

            this.saveCart();
            this.showToast(`${product.name} added to cart`, 'success');
        },

        updateCartQty(productId, delta) {
            const index = this.cart.findIndex(item => item.id === productId);
            if (index === -1) return;

            this.cart[index].qty += delta;
            if (this.cart[index].qty <= 0) {
                const removedName = this.cart[index].name;
                this.cart.splice(index, 1);
                this.showToast(`${removedName} removed from cart`, 'info');
            }
            this.saveCart();
        },

        removeFromCart(productId) {
            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCart();
            this.showToast('Item removed from cart', 'info');
        },

        clearCart() {
            this.cart = [];
            this.saveCart();
        },

        getCartTotals(items = this.cart) {
            const count = items.reduce((sum, item) => sum + item.qty, 0);
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const totalMrp = items.reduce((sum, item) => sum + (item.mrp * item.qty), 0);
            const totalSavings = Math.max(0, totalMrp - subtotal);
            const isFreeDelivery = subtotal >= CONFIG.freeDeliveryThreshold;
            const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : CONFIG.deliveryFee);
            const grandTotal = subtotal + deliveryFee;
            const remainingForFree = Math.max(0, CONFIG.freeDeliveryThreshold - subtotal);
            const freeDeliveryProgress = Math.min(100, Math.round((subtotal / CONFIG.freeDeliveryThreshold) * 100));

            return {
                count,
                subtotal: Math.round(subtotal * 100) / 100,
                totalMrp: Math.round(totalMrp * 100) / 100,
                totalSavings: Math.round(totalSavings * 100) / 100,
                isFreeDelivery,
                deliveryFee,
                grandTotal: Math.round(grandTotal * 100) / 100,
                remainingForFree: Math.round(remainingForFree * 100) / 100,
                freeDeliveryProgress
            };
        },

        updateCartUI() {
            const totals = this.getCartTotals();

            // Update badge counts
            document.querySelectorAll('.dw-cart-count-badge').forEach(badge => {
                badge.textContent = totals.count;
                badge.style.display = totals.count > 0 ? 'inline-block' : 'none';
            });

            // Update Cart Drawer Items
            const itemsContainer = document.getElementById('dwCartItemsList');
            const emptyContainer = document.getElementById('dwCartEmptyState');
            const footerContainer = document.getElementById('dwCartFooter');

            if (itemsContainer && emptyContainer && footerContainer) {
                if (this.cart.length === 0) {
                    itemsContainer.innerHTML = '';
                    emptyContainer.classList.remove('d-none');
                    footerContainer.classList.add('d-none');
                } else {
                    emptyContainer.classList.add('d-none');
                    footerContainer.classList.remove('d-none');

                    // Free delivery progress bar
                    const meterMsg = document.getElementById('dwFreeDeliveryMsg');
                    const meterBar = document.getElementById('dwFreeDeliveryProgress');
                    if (meterMsg && meterBar) {
                        if (totals.isFreeDelivery) {
                            meterMsg.innerHTML = `<i class="bi bi-check-circle-fill text-success me-1"></i> <strong>Congratulations!</strong> You qualify for <strong>FREE Delivery</strong>`;
                            meterBar.style.width = '100%';
                        } else {
                            meterMsg.innerHTML = `<i class="bi bi-truck me-1 text-dw-primary"></i> Add <strong>₹${totals.remainingForFree}</strong> more for <strong>FREE Delivery</strong>!`;
                            meterBar.style.width = `${totals.freeDeliveryProgress}%`;
                        }
                    }

                    // Render items list
                    itemsContainer.innerHTML = this.cart.map(item => `
                        <div class="dw-cart-item">
                            <img src="${item.image}" alt="${item.name}" class="dw-cart-item-thumb">
                            <div class="flex-grow-1">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h6 class="mb-0 fs-6 fw-bold">${item.name}</h6>
                                        <small class="text-muted">${item.packSize || item.brand}</small>
                                        ${item.rxRequired ? '<span class="badge bg-danger-subtle text-danger ms-1">Rx</span>' : ''}
                                    </div>
                                    <button class="btn btn-sm text-danger p-0 border-0" onclick="window.DawakhanaApp.removeFromCart('${item.id}')" title="Remove">
                                        <i class="bi bi-trash3"></i>
                                    </button>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mt-2">
                                    <div>
                                        <span class="fw-bold text-dw-primary">₹${(item.price * item.qty).toFixed(2)}</span>
                                        <span class="text-decoration-line-through text-muted small ms-1">₹${(item.mrp * item.qty).toFixed(2)}</span>
                                    </div>
                                    <div class="d-inline-flex align-items-center border rounded-pill px-2 py-0 bg-light">
                                        <button class="btn btn-sm p-0 border-0 text-muted fw-bold" onclick="window.DawakhanaApp.updateCartQty('${item.id}', -1)">−</button>
                                        <span class="px-2 fw-bold small">${item.qty}</span>
                                        <button class="btn btn-sm p-0 border-0 text-dw-primary fw-bold" onclick="window.DawakhanaApp.updateCartQty('${item.id}', 1)">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');

                    // Summary numbers
                    const subtotalEl = document.getElementById('dwCartSubtotal');
                    const savingsEl = document.getElementById('dwCartSavings');
                    const deliveryEl = document.getElementById('dwCartDeliveryFee');
                    const grandTotalEl = document.getElementById('dwCartGrandTotal');

                    if (subtotalEl) subtotalEl.textContent = `₹${totals.subtotal.toFixed(2)}`;
                    if (savingsEl) savingsEl.textContent = `−₹${totals.totalSavings.toFixed(2)}`;
                    if (deliveryEl) deliveryEl.textContent = totals.isFreeDelivery ? 'FREE' : `₹${totals.deliveryFee.toFixed(2)}`;
                    if (grandTotalEl) grandTotalEl.textContent = `₹${totals.grandTotal.toFixed(2)}`;
                }
            }
        },

        // --- PRODUCT CARD GENERATOR ---
        renderProductCard(product) {
            const cartItem = this.cart.find(c => c.id === product.id);
            const qty = cartItem ? cartItem.qty : 0;
            const savings = Math.round(product.mrp - product.price);

            return `
                <div class="col-6 col-md-4 col-lg-3 mb-4">
                    <div class="dw-product-card" data-product-id="${product.id}">
                        <div class="dw-product-badge-wrap">
                            <span class="dw-badge-discount">${product.discount}% OFF</span>
                            ${product.rxRequired ? '<span class="dw-badge-rx"><i class="bi bi-file-earmark-medical me-1"></i>Rx</span>' : ''}
                        </div>
                        <div class="dw-product-img-wrap" onclick="window.DawakhanaApp.openQuickView('${product.id}')">
                            <img src="${product.image}" alt="${product.name}" class="dw-product-img" loading="lazy" onerror="this.src='https://demodekho.in/drugmart/assets/images/products/dolo_650.jpg'">
                        </div>
                        <div class="dw-product-body">
                            <span class="dw-product-brand">${product.brand}</span>
                            <h3 class="dw-product-title" onclick="window.DawakhanaApp.openQuickView('${product.id}')" title="${product.name}">${product.name}</h3>
                            <div class="dw-product-composition">${product.composition}</div>
                            <div class="dw-product-rating">
                                <i class="bi bi-star-fill"></i>
                                <span>${product.rating}</span>
                                <span class="text-muted fw-normal">(${product.reviewsCount})</span>
                            </div>
                            <div class="dw-product-price-row">
                                <span class="dw-price-current">₹${product.price.toFixed(2)}</span>
                                <span class="dw-price-mrp">₹${product.mrp.toFixed(2)}</span>
                                <span class="dw-price-save">Save ₹${savings}</span>
                            </div>
                            
                            <div class="dw-btn-container d-flex flex-column gap-2" id="dwBtnWrap-${product.id}">
                                ${this.renderCardButton(product.id, qty)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        renderCardButton(productId, qty) {
            return `
                <div class="d-flex gap-2">
                    <div class="flex-grow-1">
                        ${qty > 0 ? `
                            <div class="dw-qty-stepper">
                                <button class="dw-qty-btn" onclick="window.DawakhanaApp.updateCartQty('${productId}', -1)">−</button>
                                <span class="dw-qty-val">${qty}</span>
                                <button class="dw-qty-btn" onclick="window.DawakhanaApp.updateCartQty('${productId}', 1)">+</button>
                            </div>
                        ` : `
                            <button class="dw-btn-add w-100" onclick="window.DawakhanaApp.addToCart('${productId}', 1)">
                                <i class="bi bi-cart-plus"></i> Add
                            </button>
                        `}
                    </div>
                    <button class="btn btn-warning btn-sm rounded-pill fw-bold text-dark px-3 shadow-sm text-nowrap" onclick="window.DawakhanaApp.openDirectOrderModal('${productId}')" title="Instant Order">
                        <i class="bi bi-lightning-charge-fill"></i> Order
                    </button>
                </div>
            `;
        },

        refreshProductCardButtons() {
            PRODUCTS.forEach(p => {
                const wrap = document.getElementById(`dwBtnWrap-${p.id}`);
                if (wrap) {
                    const cartItem = this.cart.find(c => c.id === p.id);
                    wrap.innerHTML = this.renderCardButton(p.id, cartItem ? cartItem.qty : 0);
                }
            });
        },

        // --- ORDERING ENGINE ---
        // 1. Direct Order for a single product (Buy Now)
        openDirectOrderModal(productId, qty = 1) {
            const product = PRODUCTS.find(p => p.id === productId);
            if (!product) return;

            this.checkoutItems = [{
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                mrp: product.mrp,
                packSize: product.packSize,
                image: product.image,
                rxRequired: product.rxRequired,
                qty: qty
            }];

            this.renderCheckoutModalContent('Single Product Order');
            const modalEl = document.getElementById('dwOrderModal');
            if (modalEl) {
                bootstrap.Modal.getOrCreateInstance(modalEl).show();
            }
        },

        // 2. Checkout for all cart items
        openCartCheckoutModal() {
            if (this.cart.length === 0) {
                alert('Your cart is empty! Please add some medicines first.');
                return;
            }

            this.checkoutItems = [...this.cart];
            this.renderCheckoutModalContent('Full Cart Checkout');

            // Close cart drawer if open
            const drawerEl = document.getElementById('dwCartDrawer');
            if (drawerEl) {
                const offcanvas = bootstrap.Offcanvas.getInstance(drawerEl);
                if (offcanvas) offcanvas.hide();
            }

            const modalEl = document.getElementById('dwOrderModal');
            if (modalEl) {
                bootstrap.Modal.getOrCreateInstance(modalEl).show();
            }
        },

        renderCheckoutModalContent(title) {
            const itemsListEl = document.getElementById('dwOrderItemsList');
            const subtotalEl = document.getElementById('dwOrderSubtotal');
            const savingsEl = document.getElementById('dwOrderSavings');
            const deliveryEl = document.getElementById('dwOrderDeliveryFee');
            const grandTotalEl = document.getElementById('dwOrderGrandTotal');
            const submitBtn = document.getElementById('dwOrderSubmitBtn');
            const titleEl = document.getElementById('dwOrderModalTitle');

            if (titleEl) titleEl.textContent = title || 'Place Medicine Order';

            const totals = this.getCartTotals(this.checkoutItems);

            if (itemsListEl) {
                itemsListEl.innerHTML = this.checkoutItems.map(item => `
                    <div class="d-flex align-items-center gap-2 py-2 border-bottom">
                        <img src="${item.image}" alt="${item.name}" class="rounded border p-1" style="width: 44px; height: 44px; object-fit: contain;">
                        <div class="flex-grow-1">
                            <div class="fw-bold small text-truncate" style="max-width: 220px;">${item.name}</div>
                            <small class="text-muted">${item.brand} • Qty: ${item.qty}</small>
                            ${item.rxRequired ? '<span class="badge bg-danger-subtle text-danger ms-1" style="font-size: 10px;">Rx Required</span>' : ''}
                        </div>
                        <div class="text-end">
                            <span class="fw-bold text-dw-primary">₹${(item.price * item.qty).toFixed(2)}</span>
                            <div class="text-decoration-line-through text-muted" style="font-size: 11px;">₹${(item.mrp * item.qty).toFixed(2)}</div>
                        </div>
                    </div>
                `).join('');
            }

            if (subtotalEl) subtotalEl.textContent = `₹${totals.subtotal.toFixed(2)}`;
            if (savingsEl) savingsEl.textContent = `−₹${totals.totalSavings.toFixed(2)}`;
            if (deliveryEl) deliveryEl.textContent = totals.isFreeDelivery ? 'FREE' : `₹${totals.deliveryFee.toFixed(2)}`;
            if (grandTotalEl) grandTotalEl.textContent = `₹${totals.grandTotal.toFixed(2)}`;
            if (submitBtn) submitBtn.innerHTML = `<i class="bi bi-bag-check-fill me-1"></i> Place Order (Pay ₹${totals.grandTotal.toFixed(2)})`;

            // Prefill PIN code
            const pinInput = document.getElementById('dwOrderPincode');
            if (pinInput && !pinInput.value) pinInput.value = this.currentPincode;
        },

        setupOrderForm() {
            const form = document.getElementById('dwOrderCheckoutForm');
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                if (this.checkoutItems.length === 0) {
                    alert('No items selected for order.');
                    return;
                }

                const name = document.getElementById('dwOrderName')?.value.trim();
                const phone = document.getElementById('dwOrderPhone')?.value.trim();
                const address = document.getElementById('dwOrderAddress')?.value.trim();
                const pincode = document.getElementById('dwOrderPincode')?.value.trim() || this.currentPincode;
                const paymentMethod = document.querySelector('input[name="dwOrderPayment"]:checked')?.value || 'Cash on Delivery (COD)';
                const notes = document.getElementById('dwOrderNotes')?.value.trim() || '';

                const totals = this.getCartTotals(this.checkoutItems);
                const orderId = 'DW-ORD-' + Math.floor(100000 + Math.random() * 900000);
                const orderDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

                const orderData = {
                    orderId,
                    orderDate,
                    name,
                    phone,
                    address,
                    pincode,
                    paymentMethod,
                    notes,
                    items: this.checkoutItems,
                    totals
                };

                // Save to localStorage order history
                try {
                    const history = JSON.parse(localStorage.getItem('dw_orders') || '[]');
                    history.unshift(orderData);
                    localStorage.setItem('dw_orders', JSON.stringify(history.slice(0, 10)));
                } catch (err) {
                    console.error('Failed to save order to storage:', err);
                }

                // If ordered from cart, clear cart
                const isFromCart = this.cart.length > 0 && this.checkoutItems.length === this.cart.length && this.checkoutItems[0].id === this.cart[0].id;
                if (isFromCart) {
                    this.clearCart();
                }

                // Close checkout modal
                const modalEl = document.getElementById('dwOrderModal');
                if (modalEl) {
                    const bsModal = bootstrap.Modal.getInstance(modalEl);
                    if (bsModal) bsModal.hide();
                }

                // Show Success Modal
                this.showOrderSuccessModal(orderData);
            });
        },

        showOrderSuccessModal(order) {
            const modalEl = document.getElementById('dwOrderSuccessModal');
            if (!modalEl) return;

            const idEl = document.getElementById('dwSuccessOrderId');
            const custEl = document.getElementById('dwSuccessCustomer');
            const addrEl = document.getElementById('dwSuccessAddress');
            const payEl = document.getElementById('dwSuccessPayment');
            const totalEl = document.getElementById('dwSuccessTotal');
            const waBtn = document.getElementById('dwSuccessWhatsAppBtn');

            if (idEl) idEl.textContent = order.orderId;
            if (custEl) custEl.textContent = `${order.name} (${order.phone})`;
            if (addrEl) addrEl.textContent = `${order.address}, PIN: ${order.pincode}`;
            if (payEl) payEl.textContent = order.paymentMethod;
            if (totalEl) totalEl.textContent = `₹${order.totals.grandTotal.toFixed(2)}`;

            // Build WhatsApp order receipt
            let itemsSummary = '';
            order.items.forEach((it, idx) => {
                itemsSummary += `${idx + 1}. *${it.name}* (Qty: ${it.qty}) - ₹${(it.price * it.qty).toFixed(2)}\n`;
            });

            const waText = 
                `*✅ NEW CONFIRMED ORDER - DAWAKHANA.COM*\n` +
                `-----------------------------------------\n` +
                `*Order ID:* ${order.orderId}\n` +
                `*Customer:* ${order.name}\n` +
                `*Mobile:* ${order.phone}\n` +
                `*Delivery Address:* ${order.address}, PIN: ${order.pincode}\n` +
                `*Payment:* ${order.paymentMethod}\n` +
                `-----------------------------------------\n` +
                `*ORDER ITEMS:*\n` +
                itemsSummary +
                `-----------------------------------------\n` +
                `*Subtotal:* ₹${order.totals.subtotal.toFixed(2)}\n` +
                `*Discount Savings (20% Off):* ₹${order.totals.totalSavings.toFixed(2)}\n` +
                `*Delivery Fee:* ${order.totals.isFreeDelivery ? 'FREE (Express 2-Hour)' : '₹' + order.totals.deliveryFee.toFixed(2)}\n` +
                `*Grand Total Payable:* ₹${order.totals.grandTotal.toFixed(2)}\n` +
                `-----------------------------------------\n` +
                `Please dispatch this order. Thank you!`;

            const waUrl = `https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=${encodeURIComponent(waText)}`;
            if (waBtn) {
                waBtn.href = waUrl;
                waBtn.onclick = () => window.open(waUrl, '_blank');
            }

            const bsSuccess = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsSuccess.show();

            // Also open WhatsApp directly
            window.open(waUrl, '_blank');
            this.showToast(`Order ${order.orderId} placed successfully!`, 'success');
        },

        // --- SEARCH ENGINE WITH HIGHLIGHTING ---
        setupSearch() {
            const inputs = document.querySelectorAll('.dw-search-input');
            const dropdowns = document.querySelectorAll('.dw-search-results-dropdown');

            inputs.forEach(input => {
                const parent = input.closest('.dw-search-box');
                const dropdown = parent ? parent.querySelector('.dw-search-results-dropdown') : null;
                const clearBtn = parent ? parent.querySelector('.dw-search-clear') : null;

                input.addEventListener('input', (e) => {
                    const query = e.target.value.trim().toLowerCase();
                    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

                    if (!query || query.length < 2) {
                        if (dropdown) dropdown.style.display = 'none';
                        return;
                    }

                    const matches = PRODUCTS.filter(p => {
                        return p.name.toLowerCase().includes(query) ||
                               p.composition.toLowerCase().includes(query) ||
                               p.brand.toLowerCase().includes(query) ||
                               p.tags.some(t => t.toLowerCase().includes(query));
                    }).slice(0, 6);

                    if (dropdown) {
                        if (matches.length === 0) {
                            dropdown.innerHTML = `
                                <div class="p-3 text-center text-muted">
                                    <i class="bi bi-search me-1"></i> No medicines found for "<strong>${escapeHtml(query)}</strong>"
                                    <div class="mt-2">
                                        <a href="javascript:void(0)" onclick="window.DawakhanaApp.openPrescriptionModal()" class="btn btn-sm btn-outline-success">
                                            <i class="bi bi-upload me-1"></i> Upload Prescription Instead
                                        </a>
                                    </div>
                                </div>
                            `;
                        } else {
                            dropdown.innerHTML = matches.map(m => `
                                <div class="dw-search-item" onclick="window.DawakhanaApp.openQuickView('${m.id}')">
                                    <img src="${m.image}" alt="${m.name}" class="dw-search-item-thumb">
                                    <div class="dw-search-item-info">
                                        <div class="dw-search-item-name">${highlightMatch(m.name, query)}</div>
                                        <div class="dw-search-item-meta">${highlightMatch(m.composition, query)} • <span class="text-muted">${m.brand}</span></div>
                                    </div>
                                    <div class="dw-search-item-price">
                                        ₹${m.price.toFixed(2)}
                                        <div class="text-decoration-line-through text-muted small">₹${m.mrp.toFixed(2)}</div>
                                    </div>
                                </div>
                            `).join('') + `
                                <div class="p-2 bg-light text-center border-top">
                                    <a href="catalogue.html?q=${encodeURIComponent(query)}" class="small fw-bold text-dw-primary">
                                        View all results for "${escapeHtml(query)}" &rarr;
                                    </a>
                                </div>
                            `;
                        }
                        dropdown.style.display = 'block';
                    }
                });

                if (clearBtn) {
                    clearBtn.addEventListener('click', () => {
                        input.value = '';
                        clearBtn.style.display = 'none';
                        if (dropdown) dropdown.style.display = 'none';
                        input.focus();
                    });
                }

                document.addEventListener('click', (e) => {
                    if (!input.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
                        dropdown.style.display = 'none';
                    }
                });
            });
        },

        // --- QUICK VIEW PRODUCT MODAL ---
        openQuickView(productId) {
            const product = PRODUCTS.find(p => p.id === productId);
            if (!product) return;

            const modalEl = document.getElementById('dwQuickViewModal');
            if (!modalEl) return;

            const titleEl = document.getElementById('dwQuickViewTitle');
            const brandEl = document.getElementById('dwQuickViewBrand');
            const compEl = document.getElementById('dwQuickViewComp');
            const imgEl = document.getElementById('dwQuickViewImg');
            const priceEl = document.getElementById('dwQuickViewPrice');
            const mrpEl = document.getElementById('dwQuickViewMrp');
            const discountEl = document.getElementById('dwQuickViewDiscount');
            const descEl = document.getElementById('dwQuickViewDesc');
            const dosageEl = document.getElementById('dwQuickViewDosage');
            const rxWrapEl = document.getElementById('dwQuickViewRxBadge');
            const btnWrapEl = document.getElementById('dwQuickViewActionWrap');

            if (titleEl) titleEl.textContent = product.name;
            if (brandEl) brandEl.textContent = product.brand;
            if (compEl) compEl.textContent = product.composition;
            if (imgEl) imgEl.src = product.image;
            if (priceEl) priceEl.textContent = `₹${product.price.toFixed(2)}`;
            if (mrpEl) mrpEl.textContent = `₹${product.mrp.toFixed(2)}`;
            if (discountEl) discountEl.textContent = `${product.discount}% OFF (Save ₹${Math.round(product.mrp - product.price)})`;
            if (descEl) descEl.textContent = product.description;
            if (dosageEl) dosageEl.textContent = product.dosage;

            if (rxWrapEl) {
                rxWrapEl.innerHTML = product.rxRequired ?
                    `<div class="alert alert-danger py-1 px-2 d-inline-flex align-items-center mb-0 small">
                        <i class="bi bi-file-earmark-medical me-1"></i> Doctor's Prescription (Rx) Required
                    </div>` :
                    `<div class="alert alert-success py-1 px-2 d-inline-flex align-items-center mb-0 small">
                        <i class="bi bi-check-circle me-1"></i> OTC / Direct Order Available
                    </div>`;
            }

            if (btnWrapEl) {
                btnWrapEl.innerHTML = `
                    <button class="btn btn-warning fw-bold text-dark px-4 rounded-pill shadow-sm" onclick="window.DawakhanaApp.openDirectOrderModal('${product.id}'); bootstrap.Modal.getInstance(document.getElementById('dwQuickViewModal')).hide();">
                        <i class="bi bi-lightning-charge-fill me-1"></i> Order Now
                    </button>
                    <button class="btn btn-dw-primary rounded-pill px-4" onclick="window.DawakhanaApp.addToCart('${product.id}', 1); bootstrap.Modal.getInstance(document.getElementById('dwQuickViewModal')).hide();">
                        <i class="bi bi-cart-plus me-1"></i> Add to Cart
                    </button>
                `;
            }

            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        },

        // --- PINCODE & DELIVERY ---
        setupPincode() {
            const locationDisplays = document.querySelectorAll('.dw-pincode-display');
            locationDisplays.forEach(el => {
                el.textContent = `${this.currentLocationName} (${this.currentPincode})`;
            });

            const pincodeForm = document.getElementById('dwPincodeForm');
            if (pincodeForm) {
                pincodeForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const input = document.getElementById('dwPincodeInput');
                    const pin = input ? input.value.trim() : '';

                    if (!/^\d{6}$/.test(pin)) {
                        alert('Please enter a valid 6-digit Indian PIN code.');
                        return;
                    }

                    let city = 'Delhi NCR';
                    if (pin.startsWith('11')) city = 'New Delhi';
                    else if (pin.startsWith('20')) city = 'Noida / Ghaziabad';
                    else if (pin.startsWith('12')) city = 'Gurugram / Faridabad';
                    else if (pin.startsWith('40')) city = 'Mumbai';
                    else if (pin.startsWith('56')) city = 'Bengaluru';
                    else if (pin.startsWith('70')) city = 'Kolkata';
                    else if (pin.startsWith('60')) city = 'Chennai';
                    else city = 'Express Delivery Hub';

                    this.currentPincode = pin;
                    this.currentLocationName = city;
                    localStorage.setItem('dw_pincode', pin);
                    localStorage.setItem('dw_location', city);

                    locationDisplays.forEach(el => {
                        el.textContent = `${city} (${pin})`;
                    });

                    const modalEl = document.getElementById('dwPincodeModal');
                    if (modalEl) {
                        const bsModal = bootstrap.Modal.getInstance(modalEl);
                        if (bsModal) bsModal.hide();
                    }

                    this.showToast(`Delivery location set to ${city} (${pin})`, 'success');
                });
            }
        },

        // --- PRESCRIPTION UPLOAD ---
        setupPrescriptionUpload() {
            const dropzone = document.getElementById('dwRxDropzone');
            const fileInput = document.getElementById('dwRxFileInput');
            const previewWrap = document.getElementById('dwRxPreviewWrap');
            const previewImg = document.getElementById('dwRxPreviewImg');
            const fileNameEl = document.getElementById('dwRxFileName');
            const removeBtn = document.getElementById('dwRxRemoveFileBtn');
            const rxForm = document.getElementById('dwRxUploadForm');

            let selectedFile = null;

            if (dropzone && fileInput) {
                dropzone.addEventListener('click', () => fileInput.click());
                dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
                dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
                dropzone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropzone.classList.remove('dragover');
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
                });
                fileInput.addEventListener('change', () => {
                    if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
                });
            }

            function handleFile(file) {
                selectedFile = file;
                if (fileNameEl) fileNameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
                
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (previewImg) previewImg.src = e.target.result;
                        if (previewWrap) previewWrap.classList.remove('d-none');
                        if (dropzone) dropzone.classList.add('d-none');
                    };
                    reader.readAsDataURL(file);
                } else {
                    if (previewImg) previewImg.src = 'https://demodekho.in/drugmart/assets/images/products/dolo_650.jpg';
                    if (previewWrap) previewWrap.classList.remove('d-none');
                    if (dropzone) dropzone.classList.add('d-none');
                }
            }

            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    selectedFile = null;
                    if (fileInput) fileInput.value = '';
                    if (previewWrap) previewWrap.classList.add('d-none');
                    if (dropzone) dropzone.classList.remove('d-none');
                });
            }

            if (rxForm) {
                rxForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('dwRxName')?.value.trim() || 'Valued Customer';
                    const phone = document.getElementById('dwRxPhone')?.value.trim() || '';
                    const address = document.getElementById('dwRxAddress')?.value.trim() || 'As per doctor prescription';
                    const notes = document.getElementById('dwRxNotes')?.value.trim() || 'Please check dosage & send bill with 20% discount';

                    const leadCode = 'DW-RX-' + Math.floor(100000 + Math.random() * 900000);

                    const waText = 
                        `*📋 NEW PRESCRIPTION ORDER - DAWAKHANA.COM*\n` +
                        `-----------------------------------------\n` +
                        `*Order/Lead ID:* ${leadCode}\n` +
                        `*Patient Name:* ${name}\n` +
                        `*Mobile No:* ${phone}\n` +
                        `*Delivery Address:* ${address}\n` +
                        `*Note:* ${notes}\n` +
                        `*File Uploaded:* ${selectedFile ? selectedFile.name : 'Prescription Photo attached'}\n` +
                        `-----------------------------------------\n` +
                        `Please verify the prescription and send medicine bill with 20% discount. Thank you!`;

                    const waUrl = `https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=${encodeURIComponent(waText)}`;

                    const modalEl = document.getElementById('dwRxModal');
                    if (modalEl) {
                        const bsModal = bootstrap.Modal.getInstance(modalEl);
                        if (bsModal) bsModal.hide();
                    }

                    window.open(waUrl, '_blank');
                    this.showToast('Prescription order initialized! Opening WhatsApp...', 'success');
                });
            }
        },

        openPrescriptionModal() {
            const modalEl = document.getElementById('dwRxModal');
            if (modalEl) {
                bootstrap.Modal.getOrCreateInstance(modalEl).show();
            } else {
                window.location.href = 'prescription.html';
            }
        },

        openCartDrawer() {
            const offcanvasEl = document.getElementById('dwCartDrawer');
            if (offcanvasEl) {
                bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).show();
            }
        },

        // --- TOAST NOTIFICATIONS ---
        showToast(message, type = 'info') {
            let container = document.getElementById('dwToastContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'dwToastContainer';
                container.className = 'position-fixed bottom-0 start-50 translate-middle-x p-3';
                container.style.zIndex = '2000';
                document.body.appendChild(container);
            }

            const bgClass = type === 'success' ? 'bg-success text-white' : (type === 'danger' ? 'bg-danger text-white' : 'bg-dark text-white');
            const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill';

            const toastEl = document.createElement('div');
            toastEl.className = `toast align-items-center ${bgClass} border-0 shadow-lg`;
            toastEl.setAttribute('role', 'alert');
            toastEl.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center gap-2">
                        <i class="bi ${icon}"></i>
                        <span>${escapeHtml(message)}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;

            container.appendChild(toastEl);
            const bsToast = new bootstrap.Toast(toastEl, { delay: 2800 });
            bsToast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        },

        setupModalsAndEvents() {}
    };

    function highlightMatch(text, query) {
        if (!query) return escapeHtml(text);
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return escapeHtml(text).replace(regex, '<span class="bg-warning text-dark px-1 rounded">$1</span>');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.DawakhanaApp = DawakhanaApp;

    document.addEventListener('DOMContentLoaded', () => {
        DawakhanaApp.init();
    });

})();
