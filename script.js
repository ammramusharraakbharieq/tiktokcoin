document.addEventListener('DOMContentLoaded', () => {
    // Top state
    let savedCoins = localStorage.getItem('tiktokCoinBalance');
    let initialCoins = savedCoins ? parseInt(savedCoins, 10) : 3500;
    
    let loggedInUser = {
        username: 'llivepersibbandung2026',
        name: 'llivepersibbandung2026',
        coins: initialCoins
    };
    
    // Update initial display
    document.querySelector('.balance-amount').innerText = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(loggedInUser.coins);

    // Transfer/Topup State
    let targetRecipient = null; // null means we are topping up for ourselves (kaklin), or set to object if searching
    let selectedCoins = 30;
    let selectedPrice = 6000;

    // Elements
    const packages = document.querySelectorAll('.pkg-box:not(.custom-pkg)');
    const customPackageBtn = document.getElementById('customPackageBtn');
    const buyBtn = document.getElementById('buyBtn');
    const buyBtnText = document.getElementById('buyBtnText');
    
    // Username Elements
    const usernameInput = document.getElementById('tiktokUsername');
    const userPreview = document.getElementById('userProfilePreview');
    const previewAvatar = document.getElementById('previewAvatar');
    const previewName = document.getElementById('previewName');
    const previewUsername = document.getElementById('previewUsername');

    // Modals
    const loadingOverlay = document.getElementById('loadingOverlay');
    const receiptModal = document.getElementById('receiptModal');

    // Format Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const parseCurrency = (str) => {
        return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    };

    // Edit Coin Logic
    const editCoinBtn = document.getElementById('editCoinBtn');
    const editCoinModal = document.getElementById('editCoinModal');
    const newCoinInput = document.getElementById('newCoinInput');
    const cancelEditCoinBtn = document.getElementById('cancelEditCoinBtn');
    const saveEditCoinBtn = document.getElementById('saveEditCoinBtn');

    editCoinBtn.addEventListener('click', () => {
        newCoinInput.value = formatCurrency(loggedInUser.coins);
        editCoinModal.classList.remove('hidden');
    });

    cancelEditCoinBtn.addEventListener('click', () => {
        editCoinModal.classList.add('hidden');
    });

    newCoinInput.addEventListener('input', (e) => {
        let val = parseCurrency(e.target.value);
        e.target.value = val > 0 ? formatCurrency(val) : '';
    });

    saveEditCoinBtn.addEventListener('click', () => {
        let newBal = parseCurrency(newCoinInput.value);
        loggedInUser.coins = newBal;
        localStorage.setItem('tiktokCoinBalance', loggedInUser.coins.toString());
        document.querySelector('.balance-amount').innerText = formatCurrency(loggedInUser.coins);
        editCoinModal.classList.add('hidden');
    });

    // 1. Package Selection Logic
    packages.forEach(pkg => {
        pkg.addEventListener('click', () => {
            // Remove active from all
            packages.forEach(p => p.classList.remove('active'));
            customPackageBtn.classList.remove('active');
            
            // Add active to clicked
            pkg.classList.add('active');
            
            // Get data
            selectedCoins = parseInt(pkg.getAttribute('data-coins'), 10);
            selectedPrice = parseInt(pkg.getAttribute('data-price'), 10);
            
            // Update Buy Button
            buyBtnText.innerText = `Beli seharga Rp${formatCurrency(selectedPrice)}`;
        });
    });

    const customBottomSheet = document.getElementById('customBottomSheet');
    const closeBsBtn = document.getElementById('closeBsBtn');
    const customCoinDisplay = document.getElementById('customCoinDisplay');
    const bsTotalValue = document.getElementById('bsTotalValue');
    const bsBuyBtn = document.getElementById('bsBuyBtn');
    
    let currentCustomInput = "";

    customPackageBtn.addEventListener('click', () => {
        customBottomSheet.classList.remove('hidden');
        currentCustomInput = "";
        updateCustomDisplay();
    });

    closeBsBtn.addEventListener('click', () => {
        customBottomSheet.classList.add('hidden');
    });

    customBottomSheet.addEventListener('click', (e) => {
        if(e.target === customBottomSheet) customBottomSheet.classList.add('hidden');
    });

    document.querySelectorAll('.key-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnEl = e.currentTarget;
            let val = btnEl.innerText.trim();
            const isBackspace = btnEl.id === 'keyBackspace' || btnEl.querySelector('.fa-backspace');
            
            if (isBackspace) {
                currentCustomInput = currentCustomInput.slice(0, -1);
            } else {
                if (currentCustomInput === "" && (val === "0" || val === "000")) return;
                currentCustomInput += val;
                if (parseInt(currentCustomInput, 10) > 2500000) {
                    currentCustomInput = "2500000";
                }
            }
            updateCustomDisplay();
        });
    });

    const updateCustomDisplay = () => {
        if (!currentCustomInput) {
            customCoinDisplay.innerText = "";
            bsTotalValue.innerText = "Rp0";
            bsBuyBtn.disabled = true;
        } else {
            const coins = parseInt(currentCustomInput, 10);
            customCoinDisplay.innerText = formatCurrency(coins);
            const price = coins * 200;
            bsTotalValue.innerText = `Rp${formatCurrency(price)}`;
            
            if (coins >= 30) {
                bsBuyBtn.disabled = false;
            } else {
                bsBuyBtn.disabled = true;
            }
        }
    };

    bsBuyBtn.addEventListener('click', () => {
        const coins = parseInt(currentCustomInput, 10);
        if (coins >= 30) {
            selectedCoins = coins;
            selectedPrice = coins * 200;
            customBottomSheet.classList.add('hidden');
            
            loadingOverlay.classList.remove('hidden');
            setTimeout(() => {
                processPurchase();
            }, 2000);
        }
    });

    // 2. User Search Logic (Similar to before)
    usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            const cleanUsername = val.startsWith('@') ? val.substring(1) : val;

            if (cleanUsername.length > 2) {
                userPreview.classList.remove('hidden');
                previewAvatar.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="%23FE2C55" stroke-width="4" stroke-dasharray="31.4 31.4"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/></circle></svg>';
                previewName.innerText = 'Mencari Akun...';
                previewUsername.innerText = `@${cleanUsername}`;
                targetRecipient = null;

                showUserPreview(cleanUsername);
            }
        }
    });

    usernameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val.length <= 2) {
            userPreview.classList.add('hidden');
            targetRecipient = null;
        }
    });

    const showUserPreview = async (username) => {
        let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=FE2C55&color=fff&size=128&bold=true`;
        let actualName = username;

        try {
            // STRATEGI 1: TikWM Direct API
            const apiUrl = `https://www.tikwm.com/api/user/info?unique_id=${username}`;
            const apiRes = await fetch(apiUrl);

            if (apiRes.ok) {
                const data = await apiRes.json();
                if (data && data.code === 0 && data.data && data.data.user) {
                    const user = data.data.user;
                    if (user.avatarLarger || user.avatarMedium || user.avatarThumb) {
                        const rawImage = user.avatarLarger || user.avatarMedium || user.avatarThumb;
                        avatarUrl = `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp`;
                    }
                    if (user.nickname) {
                        actualName = user.nickname;
                    }
                }
            }

            // STRATEGI 2: Fallback AllOrigins if name unchanged
            if (actualName === username) {
                const urlBypass = `https://www.tiktok.com/@${username}?_t=${Date.now()}`;
                const htmlProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlBypass)}`;

                const htmlRes = await fetch(htmlProxyUrl);
                const htmlData = await htmlRes.json();
                const html = htmlData.contents;

                if (html) {
                    const matchImg = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
                    if (matchImg && matchImg[1] && !matchImg[1].includes('tiktok_logo')) {
                        const rawImage = matchImg[1].replace(/&amp;/g, '&');
                        avatarUrl = `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp`;
                    }
                    const matchTitle = html.match(/<title>([^<]+)<\/title>/i);
                    if (matchTitle && matchTitle[1]) {
                        const titleStr = matchTitle[1];
                        const namePart = titleStr.split(' (@')[0];
                        if (namePart && namePart !== 'TikTok' && !namePart.includes('Watch') && !namePart.includes('Grup')) {
                            actualName = namePart;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Gagal menarik profil:", e);
        }

        targetRecipient = {
            username: `@${username}`,
            name: actualName,
            avatar: avatarUrl
        };

        previewAvatar.onerror = function () {
            this.onerror = null;
            this.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetRecipient.name)}&background=FE2C55&color=fff&size=128&bold=true`;
        };

        previewAvatar.referrerPolicy = "no-referrer";
        previewAvatar.src = targetRecipient.avatar;
        previewName.innerText = targetRecipient.name;
        previewUsername.innerText = targetRecipient.username;
    };

    // 3. Checkout / Buy Logic
    buyBtn.addEventListener('click', () => {
        // Show Loading
        loadingOverlay.classList.remove('hidden');

        setTimeout(() => {
            processPurchase();
        }, 2000); // 2 second loading
    });

    const processPurchase = () => {
        // Cek saldo koin cukup atau tidak
        if (loggedInUser.coins < selectedCoins) {
            loadingOverlay.classList.add('hidden');
            alert("Maaf, saldo koin Anda tidak mencukupi untuk topup ini.");
            return;
        }

        // Selalu kurangi saldo koin pengguna
        loggedInUser.coins -= selectedCoins;
        localStorage.setItem('tiktokCoinBalance', loggedInUser.coins.toString());
        document.querySelector('.balance-amount').innerText = formatCurrency(loggedInUser.coins);

        // Hide loading
        loadingOverlay.classList.add('hidden');

        // Populate Receipt Data
        document.getElementById('receiptPrice').innerText = `Rp${formatCurrency(selectedPrice)}`;

        const now = new Date();
        const formatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        document.getElementById('receiptDate').innerText = formatter.format(now).replace(',', ' •');
        
        // Generate random ID DANA like "0813••••8278"
        const randEnd = Math.floor(1000 + Math.random() * 9000);
        document.getElementById('receiptDanaId').innerText = `ID DANA 0813••••${randEnd}`;

        // Verify recipient
        const finalRecipient = targetRecipient ? targetRecipient : loggedInUser;
        document.getElementById('receiptToName').innerText = finalRecipient.name;

        // Show Receipt
        receiptModal.classList.remove('hidden');

        // Reset search field context
        if (targetRecipient) {
            usernameInput.value = '';
            userPreview.classList.add('hidden');
            targetRecipient = null;
        }
    };

    // Receipt Close
    document.getElementById('closeReceiptBtn').addEventListener('click', () => {
        receiptModal.classList.add('hidden');
    });
});
