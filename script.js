const firebaseConfig = {
  apiKey: "AIzaSyC6y29soPwx4f7uuntiOiaJkEzT11KDIP4",
  authDomain: "readorasite.firebaseapp.com",
  projectId: "readorasite",
  storageBucket: "readorasite.firebasestorage.app",
  messagingSenderId: "658127627603",
  appId: "1:658127627603:web:cffb0636c0a94313d3eda6",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

/** '' on home, '../' under /pages/, so redirects and URLs work locally from subpages */
(function applyAuthHint() {
  const cachedUserStr = localStorage.getItem("ra-user");

  function applyUI() {
    const authBtns = document.getElementById("auth-btns");
    const userBtnWrap = document.getElementById("user-btn-wrap");
    const avatarBtn = document.getElementById("user-avatar-btn");
    const navSettingsBtn = document.getElementById("nav-settings-btn");
    const mobLoggedOut = document.getElementById("mob-logged-out-view");
    const mobLoggedIn = document.getElementById("mob-logged-in-view");
    const mobUserAvatar = document.getElementById("mob-user-avatar");
    const mobUserName = document.getElementById("mob-user-name");
    const mobUserEmail = document.getElementById("mob-user-email");
    const udName = document.getElementById("ud-name");
    const udEmail = document.getElementById("ud-email");

    if (cachedUserStr) {
      try {
        const u = JSON.parse(cachedUserStr);
        if (authBtns) authBtns.style.display = "none";
        if (userBtnWrap) userBtnWrap.style.display = "block";
        if (navSettingsBtn) navSettingsBtn.style.display = "none";
        if (mobLoggedOut) mobLoggedOut.style.display = "none";
        if (mobLoggedIn) mobLoggedIn.style.display = "flex";

        const dicebearUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(u.email)}&backgroundColor=c0392b`;
        const avatarHTML = `<img src="${dicebearUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;" onerror="this.style.display='none'; this.parentNode.innerHTML='${u.initials}'">`;
        if (avatarBtn) avatarBtn.innerHTML = avatarHTML;
        if (mobUserAvatar) mobUserAvatar.innerHTML = avatarHTML;

        const udAvatar = document.getElementById("ud-avatar");
        if (udAvatar) udAvatar.innerHTML = avatarHTML;

        if (mobUserName) mobUserName.textContent = u.name;
        if (mobUserEmail) mobUserEmail.textContent = u.email;
        if (udName) udName.textContent = u.name;
        if (udEmail) udEmail.textContent = u.email;
      } catch (e) { }
    } else {
      if (authBtns) authBtns.style.display = "flex";
      if (navSettingsBtn) navSettingsBtn.style.display = "flex";
      if (mobLoggedOut) mobLoggedOut.style.display = "block";
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener("DOMContentLoaded", applyUI);
  } else {
    applyUI();
  }
})();

function pathToStore() {
  // index.html is at root, subpages are in FrontEnd/pages/
  return /\/pages\//i.test(location.pathname) ? "../../" : "";
}

/* ── Half-star rating renderer ──
   Accepts numeric rating (e.g. 4.5) and renders ★ ½ ☆ SVG icons */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const starFull = `<svg class="star-icon full"  viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const starHalf = `<svg class="star-icon half"  viewBox="0 0 24 24"><defs><clipPath id="hc"><rect x="0" y="0" width="12" height="24"/></clipPath></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="1.5"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" clip-path="url(#hc)"/></svg>`;
  const starEmpty = `<svg class="star-icon empty" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  return (
    starFull.repeat(full) + (half ? starHalf : "") + starEmpty.repeat(empty)
  );
}

/* ── Scroll-reveal IntersectionObserver ──
   Watches all .sr-hidden elements and adds .sr-visible when they enter the viewport */
(function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sr-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".sr-hidden").forEach((el) => observer.observe(el));

  // Re-observe any dynamically added sr-hidden elements after products render
  const grid = document.getElementById("products-grid");
  if (grid) {
    const gridObserver = new MutationObserver((mutations) => {
      const hasAdded = mutations.some((m) => m.addedNodes.length > 0);
      if (!hasAdded) return;
      grid
        .querySelectorAll(".sr-hidden:not(.sr-visible)")
        .forEach((el) => observer.observe(el));
    });
    gridObserver.observe(grid, { childList: true, subtree: false });
  }
})();

/* ── Mobile accordion for Stationery sub-links ── */
function toggleMobAccordion(btn) {
  const item = btn.closest(".mob-accordion-item");
  const body = item.querySelector(".mob-accordion-body");
  const isOpen = item.classList.contains("open");
  /* Close all first */
  document.querySelectorAll(".mob-accordion-item.open").forEach((el) => {
    el.classList.remove("open");
    el.querySelector(".mob-accordion-body").style.maxHeight = "0";
  });
  if (!isOpen) {
    item.classList.add("open");
    body.style.maxHeight = body.scrollHeight + "px";
  }
}
/* ═══════════════════════════════════════════════════════════
   PHASE 1 — CENTRALIZED STATE MANAGEMENT & DATA PERSISTENCE
   ═══════════════════════════════════════════════════════════

   All mutable data lives in one place: `state`.
   The DOM is always derived from state — never the reverse.

   Storage keys:
     ra-cart      → cart array
     ra-wishlist  → wishlist array
     ra-user      → authenticated user object | null
     ra-recent    → recently viewed product IDs
     ra-lang      → UI language code
═══════════════════════════════════════════════════════════ */

/* ── 1a. StorageManager — thin wrapper around localStorage ── */
const StorageManager = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch { }
  },
};

/* ── 1b. Central state object — single source of truth ── */
const state = {
  cart: StorageManager.get("ra-cart", []),
  wishlist: StorageManager.get("ra-wishlist", []),
  user: StorageManager.get("ra-user", null),
  recentlyViewed: StorageManager.get("ra-recent", []),
  activePromo: StorageManager.get("ra-active-promo", null),
  giftCardBalance: StorageManager.get("ra-gift-balance", 0),
  isLoggedIn: !!StorageManager.get("ra-user", null),
  discount: StorageManager.get("ra-discount", 0), // Phase 1: unified cart discount
};

function syncCartToFirestore(cart) {
  if (auth.currentUser) {
    db.collection("users").doc(auth.currentUser.uid).set({ cart: cart }, { merge: true })
      .catch(err => console.error("Error syncing cart:", err));
  }
}

function syncWishlistToFirestore(wishlist) {
  if (auth.currentUser) {
    db.collection("users").doc(auth.currentUser.uid).set({ wishlist: wishlist }, { merge: true })
      .catch(err => console.error("Error syncing wishlist:", err));
  }
}

/* ── 1c. setState — immutably merge changes, then persist ── */
function setState(patch) {
  Object.assign(state, patch);

  // Persist each key that was updated
  if ("cart" in patch) {
    if (state.user) syncCartToFirestore(state.cart);
    else StorageManager.set("ra-cart", state.cart);
  }
  if ("wishlist" in patch) {
    if (state.user) syncWishlistToFirestore(state.wishlist);
    else StorageManager.set("ra-wishlist", state.wishlist);
  }
  if ("user" in patch) StorageManager.set("ra-user", state.user);
  if ("recentlyViewed" in patch) StorageManager.set("ra-recent", state.recentlyViewed);
  if ("activePromo" in patch) StorageManager.set("ra-active-promo", state.activePromo);
  if ("giftCardBalance" in patch) StorageManager.set("ra-gift-balance", state.giftCardBalance);
  if ("discount" in patch) StorageManager.set("ra-discount", state.discount);
  if ("isLoggedIn" in patch) StorageManager.set("ra-loggedin", state.isLoggedIn);
  if ("theme" in patch) StorageManager.set("ra-theme", state.theme);
}

/* ── 1d. Expose legacy aliases so existing call-sites keep working ──
   Any code that reads/writes `cart` or `wishlist` directly will
   now touch state. The save*() helpers become no-ops (persistence
   is handled by setState) but are kept for backwards compatibility. */
Object.defineProperty(window, "cart", {
  get() {
    return state.cart;
  },
  set(v) {
    setState({ cart: v });
  },
  configurable: true,
});
Object.defineProperty(window, "wishlist", {
  get() {
    return state.wishlist;
  },
  set(v) {
    setState({ wishlist: v });
  },
  configurable: true,
});
Object.defineProperty(window, "mockUser", {
  get() {
    return state.user;
  },
  set(v) {
    setState({ user: v });
  },
  configurable: true,
});
Object.defineProperty(window, "recentlyViewed", {
  get() {
    return state.recentlyViewed;
  },
  set(v) {
    setState({ recentlyViewed: v });
  },
  configurable: true,
});

/* ── 1e. Legacy save helpers — now delegate to setState ── */
function saveCart() {
  setState({ cart: state.cart });
}
function saveWishlist() {
  setState({ wishlist: state.wishlist });
}

/* ── 1f. Firebase Auth State Listener ── */
auth.onAuthStateChanged(async (user) => {
  const authBtns = document.getElementById("auth-btns");
  const userBtnWrap = document.getElementById("user-btn-wrap");
  const avatarBtn = document.getElementById("user-avatar-btn");
  const udName = document.getElementById("ud-name");
  const udEmail = document.getElementById("ud-email");

  if (user) {
    // User is logged in
    const name = user.displayName || "User";
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    // Fetch data from Firestore
    try {
      const [doc, profileDoc, prefsDoc] = await Promise.all([
        db.collection("users").doc(user.uid).get(),
        db.collection("users").doc(user.uid).collection("profile").doc("main").get(),
        db.collection("users").doc(user.uid).collection("preferences").doc("main").get()
      ]);

      // Apply preferences if available
      if (prefsDoc.exists) {
        const prefs = prefsDoc.data();
        if (prefs.theme) {
          localStorage.setItem("ra-theme", prefs.theme);
          document.documentElement.setAttribute("data-theme", prefs.theme);
        }
        if (prefs.accent) {
          localStorage.setItem("ra-accent", prefs.accent);
          // Assuming accent variables are applied by the theme change, or we just set it
        }
        if (prefs.fontsize) localStorage.setItem("ra-fontsize", prefs.fontsize);
        if (prefs.lang) {
          localStorage.setItem("readora_lang", prefs.lang);
          localStorage.setItem("ra-lang", prefs.lang);
        }
      }

      // Handle profile
      if (profileDoc.exists) {
        const profile = profileDoc.data();
        const pName = document.getElementById("profile-name");
        const pPhone = document.getElementById("profile-phone");
        if (pName && profile.displayName) pName.value = profile.displayName;
        if (pPhone && profile.phone) pPhone.value = profile.phone;
      } else {
        // Create initial profile
        await db.collection("users").doc(user.uid).collection("profile").doc("main").set({
          displayName: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || "",
          phone: user.phoneNumber || ""
        });
      }

      let firestoreCart = [];
      let firestoreWishlist = [];

      if (doc.exists) {
        const data = doc.data();
        if (data.cart) firestoreCart = data.cart;
        if (data.wishlist) firestoreWishlist = data.wishlist;
      }

      // Merge local cart/wishlist with Firestore data ONLY if they exist
      const localCart = StorageManager.get("ra-cart", []);
      const localWishlist = StorageManager.get("ra-wishlist", []);

      let mergedCart = [...firestoreCart];
      let mergedWishlist = [...firestoreWishlist];
      let didMerge = false;

      if (localCart.length > 0) {
        localCart.forEach(localItem => {
          const existing = mergedCart.find(i => i.id === localItem.id);
          if (existing) {
            existing.qty += localItem.qty;
          } else {
            mergedCart.push(localItem);
          }
        });
        StorageManager.remove("ra-cart");
        didMerge = true;
      }

      if (localWishlist.length > 0) {
        const seen = new Set(firestoreWishlist.map(i => i.id));
        localWishlist.forEach(i => {
          if (!seen.has(i.id)) {
            mergedWishlist.push(i);
            seen.add(i.id);
          }
        });
        StorageManager.remove("ra-wishlist");
        didMerge = true;
      }

      // Update auth state
      setState({
        user: { name, email: user.email, initials, uid: user.uid },
        isLoggedIn: true
      });

      // Update cart/wishlist state (syncing to Firestore only if we merged guest data)
      if (didMerge) {
        setState({
          cart: mergedCart,
          wishlist: mergedWishlist
        });
      } else {
        setState({ cart: mergedCart, wishlist: mergedWishlist });
      }

      // Update UI
      if (authBtns) authBtns.style.display = "none";
      if (userBtnWrap) userBtnWrap.style.display = "block";
      const navSettingsBtn = document.getElementById("nav-settings-btn");
      if (navSettingsBtn) navSettingsBtn.style.display = "none";
      if (udName) udName.textContent = name;
      if (udEmail) udEmail.textContent = user.email;

      // Reset the sub message colour
      const sub = document.getElementById("modal-sub");
      if (sub) {
        sub.textContent = "Sign in to access your library and orders.";
        sub.style.color = "";
      }

      const dicebearUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=c0392b`;
      const avatarHTML = `<img src="${dicebearUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;" onerror="this.style.display='none'; this.parentNode.innerHTML='${initials}'">`;

      if (avatarBtn) avatarBtn.innerHTML = avatarHTML;
      const udAvatar = document.getElementById("ud-avatar");
      if (udAvatar) udAvatar.innerHTML = avatarHTML;

      // Show mobile logged-in drawer view
      const mobLoggedOutView = document.getElementById("mob-logged-out-view");
      const mobLoggedInView = document.getElementById("mob-logged-in-view");
      if (mobLoggedOutView) mobLoggedOutView.style.display = "none";
      if (mobLoggedInView) {
        mobLoggedInView.style.display = "flex";
        const mobUserAvatar = document.getElementById("mob-user-avatar");
        const mobUserName = document.getElementById("mob-user-name");
        const mobUserEmail = document.getElementById("mob-user-email");
        if (mobUserAvatar) mobUserAvatar.innerHTML = avatarHTML;
        if (mobUserName) mobUserName.textContent = name;
        if (mobUserEmail) mobUserEmail.textContent = user.email;
      }



      // Update UI carts/wishlist counts
      if (typeof updateCartCount === 'function') updateCartCount();
      if (typeof renderWishlist === 'function') renderWishlist();
      if (typeof renderCart === 'function') renderCart();

      // Prefill review form name & avatar (moved from duplicate auth listener)
      const wrName = document.getElementById("wr-name");
      if (wrName) wrName.value = name;
      const qvWrName = document.getElementById("qv-wr-name");
      if (qvWrName) qvWrName.value = name;
      const qvWrAvatar = document.getElementById("qv-wr-avatar");
      if (qvWrAvatar) qvWrAvatar.innerHTML = avatarHTML;

      // Re-render product card heart icons based on loaded wishlist
      document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const idStr = btn.id.replace('w', '');
        if (!idStr) return;
        const id = parseInt(idStr);
        if (isNaN(id)) return;
        const isWished = state.wishlist.some(w => w.id === id);
        if (isWished) {
          btn.classList.add('wished');
          btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
        } else {
          btn.classList.remove('wished');
          btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
        }
      });

    } catch (err) {
      console.error("Error fetching user data from Firestore:", err);
    }
  } else {
    // User is logged out
    setState({
      user: null,
      isLoggedIn: false
    });

    if (authBtns) authBtns.style.display = "flex";
    if (userBtnWrap) userBtnWrap.style.display = "none";

    // Show gear icon when logged out
    const navSettingsBtn = document.getElementById("nav-settings-btn");
    if (navSettingsBtn) navSettingsBtn.style.display = "block"; // or flex depending on its original style, but default is usually ok

    // Show mobile logged-out drawer view
    const mobLoggedOutView = document.getElementById("mob-logged-out-view");
    const mobLoggedInView = document.getElementById("mob-logged-in-view");
    if (mobLoggedOutView) mobLoggedOutView.style.display = "block";
    if (mobLoggedInView) mobLoggedInView.style.display = "none";

    // NOTE: We don't automatically clear the cart/wishlist here on load, 
    // it was cleared during the actual mockLogout/signOut call.
  }
});

/* ═══════════════════════════════════
           PRODUCTS DATA — Emoji covers
        ═══════════════════════════════════ */

let products = [
  // Fiction & Literature
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    price: 620,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Midnight_Library.jpg",
    stars: 4.5,
    reviews: 3100,
    tag: "new",
  },
  {
    id: 2,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 480,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/The_Alchemist.jpg",
    stars: 4.7,
    reviews: 4500,
    tag: "bestseller",
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 500,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/To_Kill_A_Mockingbird.jpg",
    stars: 4.8,
    reviews: 2200,
    tag: "",
  },
  {
    id: 4,
    title: "1984",
    author: "George Orwell",
    price: 450,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/1984.jpg",
    stars: 4.9,
    reviews: 3400,
    tag: "bestseller",
  },
  {
    id: 5,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    price: 420,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/The-Great-Gatsby.jpg",
    stars: 4.6,
    reviews: 1800,
    tag: "",
  },
  {
    id: 6,
    title: "The Book Thief",
    author: "Markus Zusak",
    price: 550,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/The-Book-Thief.jpg",
    stars: 4.8,
    reviews: 2900,
    tag: "",
  },
  {
    id: 7,
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    price: 650,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Where-The-Crawdads-Sing.jpg",
    stars: 4.7,
    reviews: 4100,
    tag: "bestseller",
  },
  {
    id: 8,
    title: "Normal People",
    author: "Sally Rooney",
    price: 580,
    cat: "Fiction",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Normal-People.jpg",
    stars: 4.4,
    reviews: 1500,
    tag: "",
  },

  // Romance
  {
    id: 9,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: 380,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Pride-Prejudice.jpg",
    stars: 4.9,
    reviews: 5200,
    tag: "",
  },
  {
    id: 10,
    title: "It Ends with Us",
    author: "Colleen Hoover",
    price: 680,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/It-Ends-With-Us.jpg",
    stars: 4.6,
    reviews: 8900,
    tag: "bestseller",
  },
  {
    id: 11,
    title: "The Notebook",
    author: "Nicholas Sparks",
    price: 450,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/The-Notebook.jpg",
    stars: 4.5,
    reviews: 3200,
    tag: "",
  },
  {
    id: 12,
    title: "Beach Read",
    author: "Emily Henry",
    price: 650,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Beach-Read.jpg",
    stars: 4.3,
    reviews: 1100,
    tag: "new",
  },
  {
    id: 13,
    title: "People We Meet on Vacation",
    author: "Emily Henry",
    price: 650,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/People-We-Meet-On-Vacation.jpg",
    stars: 4.4,
    reviews: 1400,
    tag: "",
  },
  {
    id: 14,
    title: "Beautiful Disaster",
    author: "Jamie McGuire",
    price: 520,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Beautiful_Disaster.jpg",
    stars: 4.2,
    reviews: 2100,
    tag: "",
  },

  // Sci-Fi & Fantasy
  {
    id: 15,
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: 799,
    cat: "Sci-Fi",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Project-Hail-Mary.jpg",
    stars: 4.7,
    reviews: 890,
    tag: "new",
  },
  {
    id: 16,
    title: "The Hitchhiker's Guide",
    author: "Douglas Adams",
    price: 450,
    cat: "Sci-Fi",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Hitchhiker-Guide.jpg",
    stars: 4.8,
    reviews: 4300,
    tag: "",
  },
  {
    id: 17,
    title: "Ender's Game",
    author: "Orson Scott Card",
    price: 550,
    cat: "Sci-Fi",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Enders-Game.jpg",
    stars: 4.7,
    reviews: 3800,
    tag: "",
  },
  {
    id: 18,
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    price: 750,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Name-of-the-wind.jpg",
    stars: 4.7,
    reviews: 1500,
    tag: "bestseller",
  },
  {
    id: 19,
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    price: 899,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/fourth-wing.jpg",
    stars: 4.8,
    reviews: 3200,
    tag: "bestseller",
  },
  {
    id: 20,
    title: "Dune",
    author: "Frank Herbert",
    price: 650,
    cat: "Sci-Fi",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Dune.jpg",
    stars: 4.8,
    reviews: 5600,
    tag: "",
  },
  {
    id: 21,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    price: 550,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Hobbit.jpg",
    stars: 4.9,
    reviews: 8100,
    tag: "",
  },

  // Mystery & Thriller
  {
    id: 22,
    title: "Gone Girl",
    author: "Gillian Flynn",
    price: 580,
    cat: "Thriller",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Gone-Girl.jpg",
    stars: 4.4,
    reviews: 6200,
    tag: "",
  },
  {
    id: 23,
    title: "And Then There Were None",
    author: "Agatha Christie",
    price: 420,
    cat: "Mystery",
    coverImage: pathToStore() + "FrontEnd/BooksImage/And-then-there-were-none.jpg",
    stars: 4.8,
    reviews: 4100,
    tag: "",
  },

  // Self-Help & Business
  {
    id: 24,
    title: "Atomic Habits",
    author: "James Clear",
    price: 850,
    cat: "Self-Help",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Atomic-Habits.jpg",
    stars: 4.9,
    reviews: 12400,
    tag: "bestseller",
  },
  {
    id: 25,
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    price: 450,
    cat: "Self-Help",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Think-Grow-Rich.jpg",
    stars: 4.6,
    reviews: 3200,
    tag: "",
  },
  {
    id: 26,
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    price: 550,
    cat: "Self-Help",
    coverImage: pathToStore() + "FrontEnd/BooksImage/rihc-dad-poor-dad.jpg",
    stars: 4.7,
    reviews: 4500,
    tag: "",
  },
  {
    id: 27,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    price: 680,
    cat: "Self-Help",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Money-Psychology.jpg",
    stars: 4.8,
    reviews: 2800,
    tag: "new",
  },

  // Filipino / Local
  {
    id: 28,
    title: "Noli Me Tangere",
    author: "Jose Rizal",
    price: 350,
    cat: "Local",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Noli-me-tangere.jpg",
    stars: 4.9,
    reviews: 1500,
    tag: "",
  },
  {
    id: 29,
    title: "El Filibusterismo",
    author: "Jose Rizal",
    price: 350,
    cat: "Local",
    coverImage: pathToStore() + "FrontEnd/BooksImage/El-Filibusterismo.jpg",
    stars: 4.8,
    reviews: 1200,
    tag: "",
  },
  {
    id: 30,
    title: "Smaller and Smaller Circles",
    author: "F.H. Batacan",
    price: 450,
    cat: "Thriller",
    coverImage: pathToStore() + "FrontEnd/BooksImage/smaller-and-smaller-circles.jpg",
    stars: 4.5,
    reviews: 850,
    tag: "",
  },

  // History & Biography
  {
    id: 31,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    price: 899,
    cat: "History",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Sapiens.jpg",
    stars: 4.6,
    reviews: 5800,
    tag: "sale",
    old: 1000,
  },
  {
    id: 32,
    title: "Educated",
    author: "Tara Westover",
    price: 750,
    cat: "Biography",
    coverImage: pathToStore() + "FrontEnd/BooksImage/educated.jpg",
    stars: 4.7,
    reviews: 3400,
    tag: "",
  },

  // Manga
  {
    id: 33,
    title: "Jujutsu Kaisen Vol. 1",
    author: "Gege Akutami",
    price: 550,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Jujutsu-Kaisen.jpg",
    stars: 4.9,
    reviews: 2100,
    tag: "bestseller",
  },
  {
    id: 34,
    title: "Demon Slayer Vol. 1",
    author: "Koyoharu Gotouge",
    price: 550,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Demon-Slayer.jpg",
    stars: 4.8,
    reviews: 1800,
    tag: "",
  },
  {
    id: 35,
    title: "One Piece Vol. 1",
    author: "Eiichiro Oda",
    price: 550,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/One-Piece-Vol1.jpg",
    stars: 4.9,
    reviews: 3500,
    tag: "",
  },
  {
    id: 36,
    title: "Attack on Titan Vol. 1",
    author: "Hajime Isayama",
    price: 550,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Attack-On-Titan.jpg",
    stars: 4.8,
    reviews: 2400,
    tag: "",
  },
  {
    id: 37,
    title: "My Hero Academia Vol. 1",
    author: "Kōhei Horikoshi",
    price: 550,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/My-Hero-Academia.jpg",
    stars: 4.7,
    reviews: 1900,
    tag: "",
  },
  {
    id: 38,
    title: "Solo Leveling Vol. 1",
    author: "Chugong & DUBU",
    price: 850,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Solo-Leveling.jpg",
    stars: 4.9,
    reviews: 4200,
    tag: "bestseller",
  },
  {
    id: 39,
    title: "Tower of God Vol. 1",
    author: "SIU",
    price: 750,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Tower-Of-God.jpg",
    stars: 4.8,
    reviews: 1500,
    tag: "",
  },
  {
    id: 40,
    title: "True Beauty Vol. 1",
    author: "Yaongyi",
    price: 750,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/True-Beauty.jpg",
    stars: 4.6,
    reviews: 1200,
    tag: "",
  },
  {
    id: 41,
    title: "Lookism Vol. 1",
    author: "Park Tae-jun",
    price: 750,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Lookism.jpg",
    stars: 4.7,
    reviews: 900,
    tag: "",
  },
  {
    id: 62,
    title: "Omniscient Reader's Viewpoint Vol. 1",
    author: "Sing N Song & Sleepy-C",
    price: 750,
    cat: "Manga",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Omniscient-Reader.jpg",
    stars: 4.9,
    reviews: 3100,
    tag: "new",
  },

  // Wattpad Books
  {
    id: 42,
    title: "After",
    author: "Anna Todd",
    price: 650,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/After.jpg",
    stars: 4.1,
    reviews: 5600,
    tag: "",
  },
  {
    id: 43,
    title: "The Kissing Quotient",
    author: "Helen Hoang",
    price: 680,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Kiss-Quotient.jpg",
    stars: 4.3,
    reviews: 2100,
    tag: "",
  },
  {
    id: 44,
    title: "Royals",
    author: "Rachel Hawkins",
    price: 550,
    cat: "Romance",
    coverImage: pathToStore() + "FrontEnd/BooksImage/royals.jpg",
    stars: 4.0,
    reviews: 850,
    tag: "",
  },

  // A Court of Thorns and Roses Series
  {
    id: 45,
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    price: 750,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/thorns-and-roses.jpg",
    stars: 4.6,
    reviews: 8900,
    tag: "bestseller",
  },
  {
    id: 46,
    title: "A Court of Mist and Fury",
    author: "Sarah J. Maas",
    price: 790,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/mist-and-fury.jpg",
    stars: 4.9,
    reviews: 9500,
    tag: "",
  },
  {
    id: 47,
    title: "A Court of Wings and Ruin",
    author: "Sarah J. Maas",
    price: 790,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/wings-and-ruin.jpg",
    stars: 4.7,
    reviews: 7800,
    tag: "",
  },
  {
    id: 48,
    title: "A Court of Frost and Starlight",
    author: "Sarah J. Maas",
    price: 650,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/frost-and-starlight.jpg",
    stars: 4.2,
    reviews: 4500,
    tag: "",
  },
  {
    id: 49,
    title: "A Court of Silver Flames",
    author: "Sarah J. Maas",
    price: 850,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/silver-flames.jpg",
    stars: 4.6,
    reviews: 6200,
    tag: "",
  },

  // A Song of Ice and Fire Series
  {
    id: 50,
    title: "A Game of Thrones",
    author: "George R.R. Martin",
    price: 650,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/Game-of-thrones.jpg",
    stars: 4.8,
    reviews: 12500,
    tag: "",
  },
  {
    id: 51,
    title: "A Clash of Kings",
    author: "George R.R. Martin",
    price: 650,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/clash-of-kings.jpg",
    stars: 4.7,
    reviews: 9200,
    tag: "",
  },
  {
    id: 52,
    title: "A Storm of Swords",
    author: "George R.R. Martin",
    price: 750,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/storm-of-swords.jpg",
    stars: 4.9,
    reviews: 11000,
    tag: "",
  },
  {
    id: 53,
    title: "A Feast for Crows",
    author: "George R.R. Martin",
    price: 650,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/feast-for-crows.jpg",
    stars: 4.4,
    reviews: 8100,
    tag: "",
  },
  {
    id: 54,
    title: "A Dance with Dragons",
    author: "George R.R. Martin",
    price: 750,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/dance-with-dragons.jpg",
    stars: 4.5,
    reviews: 8500,
    tag: "",
  },

  // Harry Potter Series
  {
    id: 55,
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    price: 650,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/harry-potter-philosopher-stone.jpg",
    stars: 4.9,
    reviews: 25000,
    tag: "bestseller",
  },
  {
    id: 56,
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    price: 650,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/chamber-of-secrets.jpg",
    stars: 4.8,
    reviews: 18000,
    tag: "",
  },
  {
    id: 57,
    title: "Harry Potter and the Prisoner of Azkaban",
    author: "J.K. Rowling",
    price: 650,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/prisoner-of-azkaban.jpg",
    stars: 4.9,
    reviews: 21000,
    tag: "",
  },
  {
    id: 58,
    title: "Harry Potter and the Goblet of Fire",
    author: "J.K. Rowling",
    price: 750,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/goblet-of-fire.jpg",
    stars: 4.8,
    reviews: 19000,
    tag: "",
  },
  {
    id: 59,
    title: "Harry Potter and the Order of the Phoenix",
    author: "J.K. Rowling",
    price: 790,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/order-of-the-phoenix.jpg",
    stars: 4.7,
    reviews: 17500,
    tag: "",
  },
  {
    id: 60,
    title: "Harry Potter and the Half-Blood Prince",
    author: "J.K. Rowling",
    price: 750,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/half-blood-prince.jpg",
    stars: 4.8,
    reviews: 18500,
    tag: "",
  },
  {
    id: 61,
    title: "Harry Potter and the Deathly Hallows",
    author: "J.K. Rowling",
    price: 790,
    cat: "Fantasy",
    coverImage: pathToStore() + "FrontEnd/BooksImage/deathly-hallows.jpg",
    stars: 4.9,
    reviews: 22000,
    tag: "",
  },
];

document.addEventListener("DOMContentLoaded", () => {

  /* Deep-links from refund / subpages (auth, FAQ, privacy, tracking, etc.) */
  const qs = new URLSearchParams(location.search);
  const stripQuery = () => {
    history.replaceState({}, "", location.pathname);
  };
  const openAuth = qs.get("openAuth");
  if (
    (openAuth === "login" || openAuth === "signup") &&
    document.getElementById("modal-overlay")
  ) {
    openModal(openAuth === "login" ? "login" : "signup");
    stripQuery();
  }
  const deepSearch = qs.get("search");
  if (
    deepSearch &&
    typeof runFullSearch === "function" &&
    document.getElementById("products")
  ) {
    stripQuery();
    setTimeout(() => runFullSearch(deepSearch), 120);
  }
  const supportPg = qs.get("support");
  if (
    supportPg &&
    typeof openSupport === "function" &&
    document.getElementById("support-overlay")
  ) {
    openSupport(supportPg);
    stripQuery();
  }
  if (qs.get("openTeam") === "1" && document.getElementById("team-drawer")) {
    stripQuery();
    setTimeout(() => toggleTeamDrawer(), 280);
  }

  // Force reveal hero animations immediately so they don't wait for scroll
  setTimeout(() => {
    document
      .querySelectorAll(".hero .sr-hidden")
      .forEach((el) => el.classList.add("sr-visible"));
  }, 50);
});

/* ═══ BOOK COVER IMAGES — consistent elegant placeholder ═══ */
const BOOK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&q=80";
const coverImages = {
  // Legacy mapping for Stationery items (they are not in the products array)
  100: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&q=80",
  101: "https://images.unsplash.com/photo-1616628188859-7a11abb6fcc9?w=300&q=80",
  102: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&q=80",
  103: "https://images.unsplash.com/photo-1524578271613-d7f9c7640f07?w=300&q=80",
  104: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=300&q=80",
};

// Dynamically map all product images so search, quick-view, and cart never break!
products.forEach((p) => {
  if (p.coverImage) coverImages[p.id] = p.coverImage;
});

/* ═══ RENDER PRODUCTS ═══ */
const HEART_EMPTY = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
/* ═══ SHARE BOOK ═══ */
function shareBook(id, title, e) {
  e.stopPropagation();
  const url = `${location.origin}${location.pathname}?book=${id}`;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      showToast("🔗 Link copied! Share with a friend.");
    })
    .catch(() => {
      showToast("🔗 readora.ph/book/" + id + " — copied!");
    });
}

/* ── Pagination state ── */
let _paginatedList = [];
let _pageIndex = 0;
const PAGE_SIZE = 12;

function renderProductList(list) {
  _paginatedList = list;
  _pageIndex = 0;
  _renderPage(true);
}

function _renderPage(reset) {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  const start = _pageIndex * PAGE_SIZE;
  const slice = _paginatedList.slice(start, start + PAGE_SIZE);

  /* Remove existing Load More button if any */
  const existingBtn = document.getElementById("load-more-btn");
  if (existingBtn) existingBtn.remove();

  if (!_paginatedList.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3.5rem 1rem;color:var(--text-muted)"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto .85rem;display:block;opacity:.4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg><p style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin-bottom:.35rem">No books found</p><p style="font-size:.88rem;margin-bottom:1.2rem">Try adjusting your filters.</p><button class="checkout-btn" style="width:auto;padding:0 1.5rem;display:inline-block" onclick="runFullSearch('');setFilter(document.querySelector('.filter-tab'),'all')">Clear All Filters</button></div>`;
    return;
  }

  if (reset) {
    const skeletonsHTML = Array(8).fill(`
      <div class="skeleton-card fade-in">
        <div class="skeleton-cover"></div>
        <div class="skeleton-info">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium" style="margin-bottom:8px"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line button"></div>
        </div>
      </div>
    `).join("");
    grid.innerHTML = skeletonsHTML;
  }

  const html = slice
    .map((p, i) => {
      const img = p.coverImage || coverImages[p.id] || BOOK_PLACEHOLDER;
      const isWished = wishlist.some((w) => w.id === p.id);
      const heartIcon = isWished
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : HEART_EMPTY;
      const srDelay = (i % 8) * 70;
      return `
    <div class="product-card sr-hidden sr-scale" role="listitem" style="transition-delay:${srDelay}ms">
      ${p.tag ? `<div class="product-badge ${p.tag}">${p.tag === "new" ? "New" : p.tag === "bestseller" ? "Bestseller" : "Sale"}</div>` : p.id % 5 === 0 ? `<div class="product-badge" style="background:#eab308;color:#422006">Only ${Math.max(1, p.id % 4)} left!</div>` : ""}
      <button class="wishlist-btn${isWished ? " wished" : ""}" id="w${p.id}" onclick="toggleWish(this)" aria-label="${isWished ? "Remove from" : "Add to"} wishlist">${heartIcon}</button>
      <div class="book-3d-wrap" onclick="openQV(${p.id})" style="cursor:pointer">
        <div class="product-cover loading">
          <img src="${img}" alt="Cover of ${p.title}" loading="lazy" onload="this.parentElement.classList.remove('loading')" onerror="this.parentElement.classList.remove('loading');this.src='${BOOK_PLACEHOLDER}'" />
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.cat}</div>
        <div class="product-title" onclick="openQV(${p.id})" style="cursor:pointer">${p.title}</div>
        <div class="product-author">${p.author}</div>
        <div class="product-stars" aria-label="Rated ${p.stars} out of 5">${renderStars(p.stars)}<span>(${p.reviews.toLocaleString()})</span></div>
        <div class="product-footer">
          <div class="price-stack">${p.old ? `<span class="product-price-old">₱${p.old.toLocaleString()}</span>` : ""}<span class="product-price">₱${p.price.toLocaleString()}</span></div>
          <div style="display:flex;align-items:center;gap:.4rem">
            <button class="share-btn" onclick="shareBook(${p.id},'${p.title.replace(/'/g, "\\'")}',event)" aria-label="Share ${p.title}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
            <button class="add-cart-btn" onclick="addToCart(${p.id})" aria-label="Add ${p.title} to cart"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join("");

  const injectRealHTML = () => {
    if (reset) {
      grid.innerHTML = html;
    } else {
      grid.innerHTML += html;
    }

    grid.querySelectorAll(".product-card:not(.has-3d-listener)").forEach((card) => {
      card.classList.add("has-3d-listener");
      const wrap = card.querySelector(".book-3d-wrap");
      if (!wrap) return;
      card.addEventListener("mouseenter", () => {
        wrap.style.transform =
          "perspective(600px) rotateY(-12deg) rotateX(3deg) scale(1.04)";
        wrap.style.transition = "transform .35s ease";
      });
      card.addEventListener("mouseleave", () => {
        wrap.style.transform =
          "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
      });
      card.addEventListener("mousemove", (ev) => {
        const r = wrap.getBoundingClientRect();
        const x = ((ev.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((ev.clientY - r.top) / r.height - 0.5) * 2;
        wrap.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 6}deg) scale(1.04)`;
        wrap.style.transition = "transform .08s ease";
      });
    });

    /* Re-observe new cards for ScrollReveal */
    setTimeout(() => {
      document.querySelectorAll(".sr-hidden").forEach((el) => {
        el.classList.add("sr-visible");
      });
    }, 50);

    /* Load More button */
    const loaded = (_pageIndex + 1) * PAGE_SIZE;
    if (loaded < _paginatedList.length) {
      const remaining = _paginatedList.length - loaded;
      const btn = document.createElement("div");
      btn.id = "load-more-btn";
      btn.style.cssText =
        "grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:.55rem;padding:1.5rem 0 .5rem";
      btn.innerHTML = `
              <button class="load-more-btn" onclick="loadMoreProducts()">
                  Load More
                  <span class="lm-count">${remaining} more book${remaining !== 1 ? "s" : ""}</span>
              </button>
              <div class="lm-progress">
                  <div class="lm-fill" style="width:${Math.round((loaded / _paginatedList.length) * 100)}%"></div>
              </div>
              <p class="lm-label">Showing ${loaded} of ${_paginatedList.length} books</p>`;
      grid.appendChild(btn);
    }
  };

  if (reset) {
    // Show skeletons for 600ms
    setTimeout(injectRealHTML, 600);
  } else {
    injectRealHTML();
  }
}

function loadMoreProducts() {
  _pageIndex++;
  const start = _pageIndex * PAGE_SIZE;
  const slice = _paginatedList.slice(start, start + PAGE_SIZE);
  const grid = document.getElementById("products-grid");

  /* Remove old Load More btn */
  const old = document.getElementById("load-more-btn");
  if (old) old.remove();

  /* Append new cards */
  const html = slice
    .map((p, i) => {
      const img = p.coverImage || coverImages[p.id] || BOOK_PLACEHOLDER;
      const isWished = wishlist.some((w) => w.id === p.id);
      const heartIcon = isWished
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : HEART_EMPTY;
      const srDelay = (i % 8) * 70;
      return `
    <div class="product-card sr-hidden sr-scale" role="listitem" style="transition-delay:${srDelay}ms">
      ${p.tag ? `<div class="product-badge ${p.tag}">${p.tag === "new" ? "New" : p.tag === "bestseller" ? "Bestseller" : "Sale"}</div>` : ""}
      <button class="wishlist-btn${isWished ? " wished" : ""}" id="w${p.id}" onclick="toggleWish(this)" aria-label="${isWished ? "Remove from" : "Add to"} wishlist">${heartIcon}</button>
      <div class="book-3d-wrap" onclick="openQV(${p.id})" style="cursor:pointer">
        <div class="product-cover loading">
          <img src="${img}" alt="Cover of ${p.title}" loading="lazy" onload="this.parentElement.classList.remove('loading')" onerror="this.parentElement.classList.remove('loading');this.src='${BOOK_PLACEHOLDER}'" />
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.cat}</div>
        <div class="product-title" onclick="openQV(${p.id})" style="cursor:pointer">${p.title}</div>
        <div class="product-author">${p.author}</div>
        <div class="product-stars" aria-label="Rated ${p.stars} out of 5">${renderStars(p.stars)}<span>(${p.reviews.toLocaleString()})</span></div>
        <div class="product-footer">
          <div class="price-stack">${p.old ? `<span class="product-price-old">₱${p.old.toLocaleString()}</span>` : ""}<span class="product-price">₱${p.price.toLocaleString()}</span></div>
          <div style="display:flex;align-items:center;gap:.4rem">
            <button class="share-btn" onclick="shareBook(${p.id},'${p.title.replace(/'/g, "\'")}',event)" aria-label="Share ${p.title}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></button>
            <button class="add-cart-btn" onclick="addToCart(${p.id})" aria-label="Add ${p.title} to cart"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join("");

  const temp = document.createElement("div");
  temp.innerHTML = html;
  const newCards = [...temp.children];
  newCards.forEach((c) => grid.appendChild(c));

  /* Re-attach 3D hover to new cards */
  newCards.forEach((card) => {
    const wrap = card.querySelector(".book-3d-wrap");
    if (!wrap) return;
    card.addEventListener("mouseenter", () => {
      wrap.style.transform =
        "perspective(600px) rotateY(-12deg) rotateX(3deg) scale(1.04)";
      wrap.style.transition = "transform .35s ease";
    });
    card.addEventListener("mouseleave", () => {
      wrap.style.transform =
        "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
    });
    card.addEventListener("mousemove", (ev) => {
      const r = wrap.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      wrap.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 6}deg) scale(1.04)`;
      wrap.style.transition = "transform .08s ease";
    });
  });

  /* Recheck if more remain */
  const loaded = (_pageIndex + 1) * PAGE_SIZE;
  if (loaded < _paginatedList.length) {
    const remaining = _paginatedList.length - loaded;
    const btn = document.createElement("div");
    btn.id = "load-more-btn";
    btn.style.cssText =
      "grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:.55rem;padding:1.5rem 0 .5rem";
    btn.innerHTML = `
            <button class="load-more-btn" onclick="loadMoreProducts()">
                Load More
                <span class="lm-count">${remaining} more book${remaining !== 1 ? "s" : ""}</span>
            </button>
            <div class="lm-progress">
                <div class="lm-fill" style="width:${Math.round((loaded / _paginatedList.length) * 100)}%"></div>
            </div>
            <p class="lm-label">Showing ${loaded} of ${_paginatedList.length} books</p>`;
    grid.appendChild(btn);
  }
}
function renderProducts(filter) {
  const list =
    filter === "all" ? products : products.filter((p) => p.tag === filter);
  // Apply current sort order
  const sorted = [...list];
  if (_currentSort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (_currentSort === "price-desc")
    sorted.sort((a, b) => b.price - a.price);
  else if (_currentSort === "rating") sorted.sort((a, b) => b.stars - a.stars);
  else if (_currentSort === "reviews")
    sorted.sort((a, b) => b.reviews - a.reviews);
  else if (_currentSort === "title")
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  renderProductList(sorted);
}
function setFilter(btn, filter) {
  document.querySelectorAll(".filter-tab").forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
  document.querySelectorAll(".afp-genre").forEach((c) => (c.checked = false));
  renderProducts(filter);
}
function setFilterCat(btn, cat) {
  document.querySelectorAll(".filter-tab").forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
  renderProductList(products.filter((p) => p.cat === cat));
}

function filterStationery(cat) {
  // Update active state on filter cards
  document.querySelectorAll(".stat-grid .stat-card").forEach((card) => {
    if (card.dataset.category === cat) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });

  // Show/hide products based on category
  document
    .querySelectorAll(".stat-featured-grid .stat-product-card")
    .forEach((product) => {
      if (cat === "all" || product.dataset.category === cat) {
        product.style.display = "flex";
      } else {
        product.style.display = "none";
      }
    });
}
// cart & saveCart → managed by centralized state (see STATE MANAGER block above)

/* ── Phase 1: Login gate helper ── */
let _pendingCartId = null;
function showLoginGate(pendingId) {
  _pendingCartId = pendingId || null;
  const sub = document.getElementById("modal-sub");
  if (sub) {
    sub.textContent = "🛒 Sign in to start shopping!";
    sub.style.color = "var(--accent)";
  }
  openModal("login");
}

function continueAsGuest() {
  localStorage.setItem("ra-user-mode", "guest");
  closeModal();

  if (_pendingCartId !== null) {
    setTimeout(() => {
      addToCart(_pendingCartId);
      _pendingCartId = null;
    }, 300);
  }
}

function addToCart(id, fromWishlist) {
  // Phase 1: Gate behind login, unless user explicitly chose guest mode
  if (!state.isLoggedIn && localStorage.getItem("ra-user-mode") !== "guest") {
    showLoginGate(id);
    return;
  }
  const p = products.find((x) => x.id === id);
  if (p && p.stock !== undefined && p.stock <= 0) {
    showToast("Sorry, this item is out of stock!");
    return;
  }
  const ex = cart.find((c) => c.id === id);
  ex ? ex.qty++ : cart.push({ ...p, qty: 1 });

  if (p && p.stock !== undefined) {
    p.stock--;
    p.lowStock = p.stock <= 5;
    db.collection("books").doc(id.toString()).update({
      stock: firebase.firestore.FieldValue.increment(-1),
      lowStock: p.lowStock
    }).catch(() => { });
  }

  saveCart();
  renderCart();
  if (fromWishlist) {
    wishlist = wishlist.filter((x) => x.id !== id);
    saveWishlist();
    const btn = document.getElementById("w" + id);
    if (btn) {
      btn.classList.remove("wished");
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    }
    renderWishlist();
    showToast(`"${p.title}" moved to cart`);
  } else {
    showToast(`"${p.title}" added to cart`);
    showRecommended(id);
  }

  // Confetti micro-burst
  if (typeof confetti === "function") {
    const cartIcon = document.querySelector(".cart-btn");
    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect();
      confetti({
        particleCount: 15,
        spread: 45,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        zIndex: 9999,
        colors: ["#C0392B", "#f4a261", "#ffffff", "#b5830a", "#e55b4d"],
      });
    }
  }
}
function removeFromCart(id) {
  const item = cart.find(c => c.id === id);
  if (item) {
    const p = products.find(x => x.id === id);
    if (p && p.stock !== undefined) {
      p.stock += item.qty;
      p.lowStock = p.stock <= 5;
      db.collection("books").doc(id.toString()).update({
        stock: firebase.firestore.FieldValue.increment(item.qty),
        lowStock: p.lowStock
      }).catch(() => { });
    }
  }
  cart = cart.filter((c) => c.id !== id);
  saveCart();
  renderCart();
}
function changeQty(id, d) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;

  const p = products.find(x => x.id === id);
  if (d > 0 && p && p.stock !== undefined && p.stock <= 0) {
    showToast("Sorry, no more stock available!");
    return;
  }

  item.qty += d;

  if (p && p.stock !== undefined) {
    p.stock -= d;
    p.lowStock = p.stock <= 5;
    db.collection("books").doc(id.toString()).update({
      stock: firebase.firestore.FieldValue.increment(-d),
      lowStock: p.lowStock
    }).catch(() => { });
  }

  if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
  saveCart();
  renderCart();
}
function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}
/* ─ Phase 2: Bulk clear with confirmation — now uses custom modal ─ */
function clearCartConfirm() {
  if (!cart.length) return;
  openClearModal('cart');
}
function clearWishlistConfirm() {
  if (!wishlist.length) return;
  openClearModal('wishlist');
}

function addAllWishlistToCart() {
  if (!wishlist.length) {
    showToast("Your wishlist is empty");
    return;
  }

  if (!state.isLoggedIn && localStorage.getItem("ra-user-mode") !== "guest") {
    showLoginGate(wishlist[0].id);
    return;
  }

  let addedCount = 0;

  // Clone wishlist because we will modify it
  const itemsToAdd = [...wishlist];

  itemsToAdd.forEach((w) => {
    const p = products.find(x => x.id === w.id) || w;
    if (p.stock !== undefined && p.stock <= 0) return; // Skip out of stock

    const ex = cart.find((c) => c.id === p.id);
    ex ? ex.qty++ : cart.push({ ...p, qty: 1 });

    if (p.stock !== undefined) {
      p.stock--;
      p.lowStock = p.stock <= 5;
      if (typeof db !== "undefined" && db.collection) {
        db.collection("books").doc(p.id.toString()).update({
          stock: firebase.firestore.FieldValue.increment(-1),
          lowStock: p.lowStock
        }).catch(() => { });
      }
    }

    addedCount++;
  });

  if (addedCount > 0) {
    saveCart();
    renderCart();

    wishlist = [];
    saveWishlist();

    // Un-highlight wishlist buttons
    document.querySelectorAll(".wish-btn.wished").forEach(btn => {
      btn.classList.remove("wished");
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    });

    renderWishlist();
    showToast(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to cart`);

    // Switch to cart drawer
    const wDrawer = document.getElementById("wishlist-drawer");
    const wOverlay = document.getElementById("wishlist-overlay");
    if (wDrawer && wDrawer.classList.contains("open")) {
      wDrawer.classList.remove("open");
      if (wOverlay) wOverlay.style.display = "none";
      document.body.style.overflow = "";
    }
    setTimeout(() => {
      toggleCart();
    }, 100);
  } else {
    showToast("All items in your wishlist are out of stock");
  }
}

/* ── Clear Modal helpers ── */
function openClearModal(type) {
  const isCart = type === 'cart';
  const items = isCart ? cart : wishlist;
  const count = isCart
    ? items.reduce((n, i) => n + (i.qty || 1), 0)
    : items.length;
  const noun = isCart ? 'item' : 'title';

  const titleEl = document.getElementById('clear-modal-title');
  const msgEl = document.getElementById('clear-modal-msg');
  const confirmBtn = document.getElementById('clear-modal-confirm-btn');
  if (!titleEl || !msgEl || !confirmBtn) return;

  titleEl.textContent = isCart ? 'Clear your cart?' : 'Clear your wishlist?';
  msgEl.innerHTML = `All <strong>${count} ${noun}${count !== 1 ? 's' : ''}</strong> will be removed. This can\'t be undone.`;

  // Wire confirm button for this specific type
  confirmBtn.onclick = () => confirmClearModal(type);

  const overlay = document.getElementById('clear-modal-overlay');
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeClearModal() {
  const overlay = document.getElementById('clear-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function confirmClearModal(type) {
  if (type === 'cart') {
    setState({ cart: [], activePromo: null, discount: 0 });
    const promoEl = document.getElementById('cart-promo-applied');
    if (promoEl) { promoEl.dataset.discount = '0'; promoEl.textContent = ''; }
    const msgEl = document.getElementById('promo-msg');
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'promo-msg'; }
    renderCart();
    showToast('🗑️ Cart cleared.');
  } else {
    setState({ wishlist: [] });
    renderWishlist();
    document.querySelectorAll('.wishlist-btn.wished').forEach((btn) => {
      btn.classList.remove('wished');
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    });
    showToast('🗑️ Wishlist cleared.');
  }
  closeClearModal();
}

// Backdrop click & Escape key close
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('clear-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeClearModal(); });
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeClearModal(); });
function renderCart() {
  const countBadge = document.getElementById("cart-count");
  if (!countBadge) return;

  const count = cart.reduce((s, c) => s + c.qty, 0);
  countBadge.textContent = count;

  const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
  // Phase 1 Fix: read discount from state, not a hidden DOM element
  const discount = state.discount || 0;
  const discounted = Math.max(0, sub - discount);
  const shipping = sub === 0 ? 0 : discounted >= 800 ? 0 : 80;
  const total = discounted + shipping;

  document.getElementById("cart-sub").textContent = `₱${sub.toLocaleString()}`;
  document.getElementById("cart-ship").textContent =
    sub === 0 ? "—" : shipping === 0 ? "FREE" : `₱${shipping}`;
  document.getElementById("cart-total").textContent =
    sub === 0 ? "₱0" : `₱${total.toLocaleString()}`;

  // Sync hidden DOM element for any legacy code still reading it
  const promoEl = document.getElementById("cart-promo-applied");
  if (promoEl) promoEl.dataset.discount = discount;

  /* Free shipping progress bar */
  const shipBarWrap = document.getElementById("cart-ship-progress");
  if (shipBarWrap) {
    if (sub > 0 && shipping > 0) {
      const pct = Math.min(100, Math.round((discounted / 800) * 100));
      const remaining = 800 - discounted;
      shipBarWrap.style.display = "block";
      shipBarWrap.querySelector(".csp-fill").style.width = pct + "%";
      shipBarWrap.querySelector(".csp-label").textContent =
        `₱${remaining.toLocaleString()} away from FREE shipping`;
    } else if (sub >= 800) {
      shipBarWrap.style.display = "block";
      shipBarWrap.querySelector(".csp-fill").style.width = "100%";
      shipBarWrap.querySelector(".csp-label").textContent =
        "🎉 You have FREE shipping!";
    } else {
      shipBarWrap.style.display = "none";
    }
  }

  /* Discount row visibility */
  const discRow = document.getElementById("cart-discount-row");
  if (discRow) discRow.style.display = discount > 0 ? "flex" : "none";
  const discEl = document.getElementById("cart-discount-amt");
  if (discEl)
    discEl.textContent = discount > 0 ? `-₱${discount.toLocaleString()}` : "";

  const cont = document.getElementById("cart-items");
  if (!cont) return;
  if (!cart.length) {
    cont.innerHTML = `<div class="cart-empty"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg><p>Your cart is empty</p><button class="browse-btn" onclick="toggleCart();document.getElementById('products')?.scrollIntoView({behavior:'smooth'})">Start Browsing</button></div>`;
    return;
  }
  cont.innerHTML = cart
    .map(
      (c) => `
    <div class="cart-item" id="ci-${c.id}">
      <div class="ci-img" style="width:44px;height:60px;flex-shrink:0;border-radius:6px;overflow:hidden;background:${c.color || "var(--bg-secondary)"}22;">
        <img src="${coverImages[c.id] || BOOK_PLACEHOLDER}" alt="${escapeHtml(c.title)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.src='${BOOK_PLACEHOLDER}'" loading="lazy" />
      </div>
      <div class="ci-info">
        <div class="ci-title">${escapeHtml(c.title)}</div>
        <div class="ci-author">${escapeHtml(c.author)}</div>
        <div class="ci-unit-price">₱${(c.price || 0).toLocaleString()} each</div>
        <div class="ci-qty">
          <button class="qty-btn" onclick="changeQtyAnimated(${c.id},-1)" aria-label="Decrease quantity of ${c.title}">−</button>
          <span class="qty-val" id="qval-${c.id}">${c.qty}</span>
          <button class="qty-btn" onclick="changeQtyAnimated(${c.id},1)" aria-label="Increase quantity of ${c.title}">+</button>
        </div>
      </div>
      <div class="ci-right">
        <span class="ci-price" id="cprice-${c.id}">₱${(c.price * c.qty).toLocaleString()}</span>
        <button class="ci-rm" onclick="removeFromCartAnimated(${c.id})" aria-label="Remove ${c.title}">✕</button>
      </div>
    </div>
  `,
    )
    .join("");
}

/* Phase 1: updateCartUI = canonical alias matching AGENTS.md spec */
const updateCartUI = renderCart;

/* Animated quantity change — updates DOM inline before full re-render */
function changeQtyAnimated(id, d) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  if (item.qty + d <= 0) {
    removeFromCartAnimated(id);
    return;
  }
  item.qty += d;
  saveCart();
  /* Optimistic DOM update for snappiness */
  const qEl = document.getElementById("qval-" + id);
  const pEl = document.getElementById("cprice-" + id);
  if (qEl) {
    qEl.textContent = item.qty;
    qEl.classList.add("qty-bump");
    setTimeout(() => qEl.classList.remove("qty-bump"), 240);
  }
  if (pEl) pEl.textContent = "₱" + (item.price * item.qty).toLocaleString();
  /* Update totals bar */
  const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = state.discount || 0;
  const discounted = Math.max(0, sub - discount);
  const shipping = discounted >= 800 ? 0 : 80;
  document.getElementById("cart-sub").textContent = `₱${sub.toLocaleString()}`;
  document.getElementById("cart-ship").textContent =
    shipping === 0 ? "FREE" : `₱${shipping}`;
  document.getElementById("cart-total").textContent =
    `₱${(discounted + shipping).toLocaleString()}`;
  document.getElementById("cart-count").textContent = cart.reduce(
    (s, c) => s + c.qty,
    0,
  );
  const shipBarWrap = document.getElementById("cart-ship-progress");
  if (shipBarWrap) {
    if (shipping > 0) {
      const pct = Math.min(100, Math.round((discounted / 800) * 100));
      shipBarWrap.style.display = "block";
      shipBarWrap.querySelector(".csp-fill").style.width = pct + "%";
      shipBarWrap.querySelector(".csp-label").textContent =
        `₱${(800 - discounted).toLocaleString()} away from FREE shipping`;
    } else {
      shipBarWrap.style.display = "block";
      shipBarWrap.querySelector(".csp-fill").style.width = "100%";
      shipBarWrap.querySelector(".csp-label").textContent =
        "🎉 You have FREE shipping!";
    }
  }
}

/* Slide-out animation before removing */
function removeFromCartAnimated(id) {
  const el = document.getElementById("ci-" + id);
  if (el) {
    el.classList.add("ci-removing");
    setTimeout(() => {
      cart = cart.filter((c) => c.id !== id);
      saveCart();
      renderCart();
    }, 280);
  } else {
    removeFromCart(id);
  }
}
function toggleCart() {
  document.getElementById("cart-overlay").classList.toggle("open");
  document.getElementById("cart-drawer").classList.toggle("open");
}

/* ═══ CHECKOUT ═══ */
let curStep = 1;
function openCheckout() {
  if (!cart.length) {
    showToast("Your cart is empty!");
    return;
  }
  const modal = document.getElementById("modal-overlay");
  if (!modal) {
    window.location.href = pathToStore() + "index.html";
    return;
  }
  toggleCart();
  document.getElementById("auth-panel").style.display = "none";
  document.getElementById("checkout-panel").style.display = "block";
  modal.classList.add("open");
  goStep(1);
}
function goStep(n) {
  [1, 2, 3, 4, 5].forEach((i) => {
    const p = document.getElementById("cp" + i);
    const s = document.getElementById("cst" + i);
    if (p) p.classList.toggle("active", i === n);
    if (s) {
      s.classList.toggle("active", i === n);
      s.classList.toggle("done", i < n);
    }
  });
  curStep = n;
  if (n === 4) buildReview();
}
function selectPay(el, method) {
  document
    .querySelectorAll(".pay-opt")
    .forEach((e) => e.classList.remove("selected"));
  el.classList.add("selected");
  const msgs = {
    gcash: "You will be redirected to the GCash app to complete payment.",
    maya: "You will be redirected to Maya to complete payment.",
    cod: "Pay cash upon delivery. No online payment needed.",
    bank: "Bank details will be sent to your email after placing your order.",
    711: "A reference code will be emailed. Pay at any 7-Eleven counter.",
  };
  const cf = document.getElementById("card-fields"),
    opm = document.getElementById("opm");
  if (method === "card") {
    cf.classList.add("show");
    opm.style.display = "none";
  } else {
    cf.classList.remove("show");
    opm.style.display = "block";
    opm.textContent = msgs[method] || "";
  }
}
function buildReview() {
  const cont = document.getElementById("review-items");
  const sub = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discount = state.discount || 0;
  const giftBalance = state.giftCardBalance || 0;

  // Math.max so we don't go below 0
  const discounted = Math.max(0, sub - discount - giftBalance);
  const shipping = discounted >= 800 ? 0 : 80;
  const total = discounted + shipping;

  cont.innerHTML =
    cart
      .map(
        (c) => `
        <div class="order-line">
            <span>${c.title} <span style="color:var(--text-muted);font-weight:400">×${c.qty}</span></span>
            <span>₱${(c.price * c.qty).toLocaleString()}</span>
        </div>`,
      )
      .join("") +
    (discount > 0
      ? `<div class="order-line" style="color:var(--accent)"><span>Promo discount</span><span>-₱${discount.toLocaleString()}</span></div>`
      : "") +
    (giftBalance > 0
      ? `<div class="order-line" style="color:var(--accent)"><span>Gift Card Applied</span><span>-₱${giftBalance.toLocaleString()}</span></div>`
      : "") +
    `<div class="order-line"><span>Shipping</span><span>${shipping === 0 ? "FREE" : "₱" + shipping}</span></div>`;

  document.getElementById("review-total").textContent =
    `₱${total.toLocaleString()}`;
}

/* ═══ MOCK GIFT CARDS (Phase 8) ═══ */
const MOCK_GIFT_CARDS = {
  READ_GIFT_500: 500,
  READ_GIFT_1000: 1000,
  READGIFT: 100,
};

async function applyGiftCard() {
  const input = document.getElementById("checkout-gift-input");
  const btn = document.getElementById("checkout-gift-btn");
  const code = (input?.value || "").trim().toUpperCase();
  const msgEl = document.getElementById("checkout-gift-msg");

  if (!code) {
    if (msgEl) {
      msgEl.textContent = "Please enter a gift card code.";
      msgEl.className = "promo-msg error";
    } else {
      showToast("Please enter a gift card code");
    }
    return;
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = "Checking...";
  btn.style.opacity = "0.7";
  btn.disabled = true;

  if (msgEl) {
    msgEl.textContent = "Checking code...";
    msgEl.className = "promo-msg";
  }

  try {
    const doc = await db.collection("promoCodes").doc(code).get();
    if (!doc.exists) {
      if (msgEl) {
        msgEl.textContent = `"${code}" is not a valid gift card.`;
        msgEl.className = "promo-msg error";
      }
      showToast("Invalid gift card code");
    } else {
      const promo = doc.data();
      if (!promo.active) {
        if (msgEl) {
          msgEl.textContent = `"${code}" is no longer active.`;
          msgEl.className = "promo-msg error";
        }
      } else if (promo.expiry && new Date() > new Date(promo.expiry)) {
        if (msgEl) {
          msgEl.textContent = `"${code}" has expired.`;
          msgEl.className = "promo-msg error";
        }
      } else {
        // Assume gift cards are fixed discount types
        const val = promo.discount;
        setState({ giftCardBalance: val });

        if (msgEl) {
          msgEl.textContent = `✓ "${code}" — ₱${val} Gift Card Applied!`;
          msgEl.className = "promo-msg success";
        }
        showToast(`🎉 ₱${val} Gift Card Applied!`);
        buildReview();
        if (input) input.value = "";
      }
    }
  } catch (e) {
    console.error("Error checking gift card:", e);
    if (msgEl) {
      msgEl.textContent = "Error checking code. Please try again.";
      msgEl.className = "promo-msg error";
    }
    showToast("Error checking gift card");
  } finally {
    btn.innerHTML = originalText;
    btn.style.opacity = "1";
    btn.disabled = false;
  }
}

/* ═══ PROMO CODE ═══ */

async function applyPromo() {
  const input = document.getElementById("promo-input");
  const code = (input?.value || "").trim().toUpperCase();
  const msgEl = document.getElementById("promo-msg");
  if (!code) {
    if (msgEl) {
      msgEl.textContent = "Please enter a promo or gift card code.";
      msgEl.className = "promo-msg error";
    }
    return;
  }

  // Set loading state
  if (msgEl) {
    msgEl.textContent = "Checking code...";
    msgEl.className = "promo-msg";
  }

  try {
    const doc = await db.collection("promoCodes").doc(code).get();
    if (!doc.exists) {
      if (msgEl) {
        msgEl.textContent = `"${code}" is not a valid code.`;
        msgEl.className = "promo-msg error";
      }
      setState({ discount: 0, activePromo: null });
      updateCartUI();
      return;
    }

    const promo = doc.data();
    if (!promo.active) {
      if (msgEl) {
        msgEl.textContent = `"${code}" is no longer active.`;
        msgEl.className = "promo-msg error";
      }
      return;
    }

    if (promo.expiry && new Date() > new Date(promo.expiry)) {
      if (msgEl) {
        msgEl.textContent = `"${code}" has expired.`;
        msgEl.className = "promo-msg error";
      }
      return;
    }

    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    let discountAmt = 0;
    if (promo.type === "percent") {
      discountAmt = Math.round((subtotal * promo.discount) / 100);
    } else {
      discountAmt = promo.discount;
    }

    setState({ discount: discountAmt, activePromo: code });
    updateCartUI();

    const label = promo.type === "percent"
      ? `✓ "${code}" — ${promo.discount}% off!`
      : `✓ "${code}" — Code Applied: -₱${discountAmt}!`;
    if (msgEl) {
      msgEl.textContent = label;
      msgEl.className = "promo-msg success";
    }
    if (input) input.value = "";
    showToast(`🎉 Code "${code}" applied — -₱${discountAmt} off!`);

  } catch (e) {
    console.error("Error checking promo code:", e);
    if (msgEl) {
      msgEl.textContent = "Error checking code. Please try again.";
      msgEl.className = "promo-msg error";
    }
  }
}
function removePromo() {
  const msgEl = document.getElementById("promo-msg");
  const input = document.getElementById("promo-input");
  if (msgEl) {
    msgEl.textContent = "";
    msgEl.className = "promo-msg";
  }
  if (input) input.value = "";
  setState({ discount: 0, activePromo: null });
  updateCartUI();
  showToast("Code removed.");
}

function fireConfetti() {
  const colors = ["#C0392B", "#f4a261", "#ffffff", "#b5830a", "#2d6a4f"];
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
  setTimeout(
    () =>
      confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 }, colors }),
    300,
  );
}
function validateCheckoutRequired() {
  const v = (id) => (document.getElementById(id)?.value || "").trim();
  const email = v("checkout-email");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const checks = [
    { ok: !!v("checkout-fname"), label: "first name", step: 1 },
    { ok: !!v("checkout-lname"), label: "last name", step: 1 },
    { ok: emailOk, label: "email address", step: 1 },
    {
      ok: /^\d{7,15}$/.test(v("checkout-phone")),
      label: "phone number (digits only, 7–15 digits)",
      step: 1,
    },
    { ok: !!v("checkout-street"), label: "street address", step: 2 },
    { ok: !!v("checkout-city"), label: "city", step: 2 },
    { ok: !!v("checkout-zip"), label: "ZIP code", step: 2 },
    { ok: !!v("checkout-province"), label: "province or region", step: 2 },
  ];
  const fail = checks.find((c) => !c.ok);
  if (!fail) return true;
  showToast(`Please complete your checkout: enter your ${fail.label}.`);
  goStep(fail.step);
  return false;
}

function placeOrder() {
  if (!validateCheckoutRequired()) return;

  // Show processing state (Step 4 → loading → Step 5)
  const placeBtn = document.querySelector(
    '#cp4 .checkout-btn, #cp4 button[onclick*="placeOrder"]',
  );
  if (placeBtn) {
    placeBtn.textContent = "Processing payment...";
    placeBtn.classList.add("loading");
    placeBtn.disabled = true;
  }

  // Simulate payment processing delay (2 seconds)
  setTimeout(async () => {
    if (placeBtn) {
      placeBtn.textContent = "Place Order";
      placeBtn.classList.remove("loading");
      placeBtn.disabled = false;
    }

    const orderId =
      "#NR-" +
      new Date().getFullYear() +
      "-" +
      Math.floor(1000 + Math.random() * 9000);
    const orderDate = new Date().toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const orderTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

    /* Save order history to localStorage */
    const orders = StorageManager.get("ra-orders", []);
    orders.unshift({
      id: orderId,
      date: orderDate,
      total: orderTotal,
      items: cart.map((c) => ({ title: c.title, qty: c.qty, price: c.price })),
    });
    StorageManager.set("ra-orders", orders);

    /* Save order to Firestore if logged in */
    if (state.isLoggedIn && state.user?.uid) {
      const v = (id) => (document.getElementById(id)?.value || "").trim();
      const shippingAddress = `${v("checkout-street")}, ${v("checkout-city")}, ${v("checkout-province")} ${v("checkout-zip")}`;
      const promoUsed = document.getElementById("cart-promo-applied")?.textContent?.replace('Applied: ', '') || "";
      const orderData = {
        orderId,
        date: new Date().toISOString(),
        displayDate: orderDate,
        total: orderTotal,
        promoUsed,
        shippingAddress,
        status: "Processing",
        items: cart.map((c) => ({ id: c.id, title: c.title, qty: c.qty, price: c.price }))
      };
      try {
        await db.collection("users").doc(state.user.uid).collection("orders").doc(orderId).set(orderData);
      } catch (err) {
        console.error("Error saving order to Firestore:", err);
      }
    }

    /* Update Stock in Firestore and Locally */
    try {
      for (const c of cart) {
        const p = products.find(x => x.id === c.id);
        if (p && p.stock !== undefined) {
          p.stock = Math.max(0, p.stock - c.qty);
          p.lowStock = p.stock <= 5;
          await db.collection("books").doc(c.id.toString()).update({
            stock: firebase.firestore.FieldValue.increment(-c.qty),
            lowStock: p.lowStock
          });
        }
      }
      if (document.getElementById("products-grid")) renderProducts("all");
    } catch (e) {
      console.error("Error decrementing stock:", e);
    }

    /* Clear promo code if any */
    const promoEl = document.getElementById("cart-promo-applied");
    if (promoEl) {
      promoEl.dataset.discount = "0";
      promoEl.textContent = "";
    }

    document.getElementById("order-id").textContent = orderId;
    document.getElementById("order-date").textContent = orderDate;
    document.getElementById("order-total-confirm").textContent =
      `₱${orderTotal.toLocaleString()}`;

    /* Populate order items in confirmation screen */
    const confItems = document.getElementById("confirm-items");
    if (confItems) {
      confItems.innerHTML = cart
        .map(
          (c) => `
                <div class="confirm-line">
                    <span>${c.title} <span class="confirm-qty">×${c.qty}</span></span>
                    <span>₱${(c.price * c.qty).toLocaleString()}</span>
                </div>`,
        )
        .join("");
    }

    clearCart();
    goStep(5);
    setTimeout(fireConfetti, 200);
  }, 2000);
}

/* ═══ MODAL ═══ */
let _modalTrigger = null; // A11Y-05: remember what triggered the modal
function openModal(tab) {
  const modal = document.getElementById("modal-overlay");
  if (!modal) {
    window.location.href =
      pathToStore() +
      "index.html?openAuth=" +
      encodeURIComponent(tab === "signup" ? "signup" : "login");
    return;
  }
  _modalTrigger = document.activeElement; // save focus origin
  document.getElementById("auth-panel").style.display = "block";
  document.getElementById("checkout-panel").style.display = "none";
  modal.classList.add("open");
  switchTab(tab);
}
function closeModal() {
  document.getElementById("modal-overlay")?.classList.remove("open");
  // A11Y-05: restore focus to the element that opened the modal
  if (_modalTrigger && typeof _modalTrigger.focus === "function") {
    requestAnimationFrame(() => {
      _modalTrigger.focus();
      _modalTrigger = null;
    });
  }
}
function closeModalOutside(e) {
  if (e.target === document.getElementById("modal-overlay")) {
    // Prevent closing during checkout — user must complete or use close button
    const checkoutPanel = document.getElementById("checkout-panel");
    if (checkoutPanel && checkoutPanel.style.display === "block") return;
    closeModal();
  }
}
function switchTab(tab) {
  const isL = tab === "login";
  document.getElementById("tab-l").classList.toggle("active", isL);
  document.getElementById("tab-s").classList.toggle("active", !isL);
  document.getElementById("login-form").style.display = isL ? "block" : "none";
  document.getElementById("signup-form").style.display = isL ? "none" : "block";
  document.getElementById("modal-h-auth").textContent = isL
    ? "Welcome back"
    : "Create account";
  document.getElementById("modal-sub").textContent = isL
    ? "Sign in to access your library and orders."
    : "Join 50,000+ readers on Readora.";
}

/* ═══════════════════════════════════════
   PHASE 4 — ADVANCED SEARCH
   ─ Text highlight in results
   ─ Category suggestion chips
   ─ Rich "no results" state with suggestions
═══════════════════════════════════════ */
const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=80&q=75";

/* Wrap matched substrings in a <mark> tag */
function highlightMatch(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="search-hl">$1</mark>',
  );
}

/* Deterministic shuffle — stable for the same seed (used by search + quick view). */
function seededPick(arr, seed, count) {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/* Unique categories that match the query */
function matchingCategories(query) {
  const q = query.toLowerCase();
  const cats = [
    ...new Set(
      products
        .filter(
          (p) =>
            p.cat.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q),
        )
        .map((p) => p.cat),
    ),
  ].slice(0, 4);
  return cats;
}

function buildDropdown(q, ddId) {
  const query = q.trim();
  const dd = document.getElementById(ddId);
  if (!dd) return;
  if (!query) {
    dd.classList.remove("open");
    return;
  }

  const ql = query.toLowerCase();
  const hits = products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(ql) ||
        p.author.toLowerCase().includes(ql) ||
        p.cat.toLowerCase().includes(ql),
    )
    .slice(0, 6);

  const cats = matchingCategories(ql);

  if (!hits.length) {
    /* ── Rich "no results" state ── */
    const pool = products.filter(
      (p) => p.cat !== "Stationery" && coverImages[p.id],
    );
    const qh = [...query].reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0);
    const suggestions = seededPick(pool, Math.abs(qh) + 1, 3);
    dd.innerHTML = `
            <div class="sd-no-results">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    <path d="M11 8v3M11 14h.01" stroke-width="2"/>
                </svg>
                <p>No results for <strong>"${escapeHtml(query)}"</strong></p>
                <p class="sd-no-sub">Try a different spelling, or explore these:</p>
            </div>
            <div class="sd-header">You might like</div>
            ${suggestions
        .map((p) => {
          const imgSrc = (coverImages[p.id] || FALLBACK_COVER).replace(
            "w=300",
            "w=80",
          );
          return `<div class="sd-item" tabindex="0" role="option"
                    onclick="openQV(${p.id})"
                    onkeydown="if(event.key==='Enter')this.click()">
                    <img class="sd-img" src="${imgSrc}" alt="${p.title}" loading="lazy" onerror="this.src='${FALLBACK_COVER}'" />
                    <div class="sd-info"><div class="sd-title">${p.title}</div><div class="sd-author">${p.author}</div></div>
                    <span class="sd-price">₱${p.price.toLocaleString()}</span>
                </div>`;
        })
        .join("")}`;
    dd.classList.add("open");
    return;
  }

  /* ── Category chips ── */
  const catChips = cats.length
    ? `<div class="sd-cat-chips">${cats
      .map(
        (c) =>
          `<button class="sd-cat-chip" onclick="catClick('cat','${c}');document.getElementById('${ddId}').classList.remove('open')">${c}</button>`,
      )
      .join("")}</div>`
    : "";

  /* ── Matched results with highlighted text ── */
  dd.innerHTML =
    catChips +
    `<div class="sd-header">${hits.length} result${hits.length !== 1 ? "s" : ""} for "${escapeHtml(query)}"</div>` +
    hits
      .map((p) => {
        const imgSrc = (coverImages[p.id] || FALLBACK_COVER).replace(
          "w=300",
          "w=80",
        );
        const hlTitle = highlightMatch(p.title, query);
        const hlAuthor = highlightMatch(p.author, query);
        return `<div class="sd-item" tabindex="0" role="option"
                onclick="openQV(${p.id})"
                onkeydown="if(event.key==='Enter')this.click()">
                <img class="sd-img" src="${imgSrc}" alt="${p.title}" loading="lazy" onerror="this.src='${FALLBACK_COVER}'" />
                <div class="sd-info">
                    <div class="sd-title">${hlTitle}</div>
                    <div class="sd-author">${hlAuthor} <span class="sd-cat-tag">${p.cat}</span></div>
                </div>
                <span class="sd-price">₱${p.price.toLocaleString()}</span>
            </div>`;
      })
      .join("") +
    `<div class="sd-footer"><button class="sd-see-all" onclick="runFullSearch('${escapeHtml(query)}')">See all results for "${escapeHtml(query)}" →</button></div>`;

  dd.classList.add("open");
}

/* Run full-grid search from dropdown "see all" */
function runFullSearch(q, opts) {
  saveRecentSearch(q);
  opts = opts || {};
  document.getElementById("dsd")?.classList.remove("open");
  document.getElementById("msd")?.classList.remove("open");
  if (!document.getElementById("products")) {
    window.location.href =
      pathToStore() +
      "index.html?search=" +
      encodeURIComponent(String(q || "").trim());
    return;
  }

  const dsi = document.getElementById("dsi");
  if (dsi) dsi.value = q;

  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  const ql = q.toLowerCase().trim();
  setTimeout(() => {
    let results = products.filter((p) => {
      // Text match: title, author, or category
      const textMatch =
        !ql ||
        p.title.toLowerCase().includes(ql) ||
        p.author.toLowerCase().includes(ql) ||
        p.cat.toLowerCase().includes(ql);
      // Category filter (optional)
      const catMatch = !opts.category || p.cat === opts.category;
      // Max price filter (optional)
      const priceMatch = !opts.maxPrice || p.price <= opts.maxPrice;
      // Tag filter (optional: 'sale', 'new', 'bestseller')
      const tagMatch = !opts.tag || p.tag === opts.tag;
      return textMatch && catMatch && priceMatch && tagMatch;
    });
    // Clear active filter tabs so grid isn't double-filtered
    document.querySelectorAll(".filter-tab").forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    renderProductList(results.length ? results : products);
    showToast(
      results.length
        ? `${results.length} result${results.length > 1 ? "s" : ""} for "${q}"`
        : "No results found — showing all books",
    );
  }, 400);
}

const TRENDING_SEARCHES = [
  "Harry Potter",
  "Atomic Habits",
  "Fourth Wing",
  "Demon Slayer",
  "The Hobbit",
  "The Alchemist",
  "Solo Leveling",
  "Pride and Prejudice",
];

/* ── Recent Searches — persisted in localStorage, max 5 ── */
const MAX_RECENTS = 5;

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem("ra-recent-searches") || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(term) {
  if (!term || term.length < 2) return;
  let recents = getRecentSearches().filter(
    (r) => r.toLowerCase() !== term.toLowerCase(),
  );
  recents.unshift(term);
  recents = recents.slice(0, MAX_RECENTS);
  try {
    localStorage.setItem("ra-recent-searches", JSON.stringify(recents));
  } catch { }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem("ra-recent-searches");
  } catch { }
  buildTrendingDropdown("dsd");
  buildTrendingDropdown("msd");
}

function buildTrendingDropdown(ddId) {
  const dd = document.getElementById(ddId);
  if (!dd) return;

  const recents = getRecentSearches();
  let recentHtml = "";

  if (recents.length) {
    const recentItems = recents
      .map((term) => {
        const match = products.find((p) =>
          p.title.toLowerCase().includes(term.toLowerCase()),
        );
        const imgSrc = match ? coverImages[match.id] || FALLBACK_COVER : null;
        return `<div class="sd-item sd-recent-item" tabindex="0" role="option"
                onclick="runFullSearch('${escapeHtml(term)}')"
                onkeydown="if(event.key==='Enter')this.click()">
                ${imgSrc
            ? `<img class="sd-img" src="${imgSrc}" alt="" loading="lazy" onerror="this.src='${FALLBACK_COVER}'" />`
            : `<span class="sd-trend-icon">🕐</span>`
          }
                <div class="sd-info">
                    <div class="sd-title">${escapeHtml(term)}</div>
                    ${match ? `<div class="sd-meta">${escapeHtml(match.author)} · ${escapeHtml(match.cat)}</div>` : ""}
                </div>
                <span class="sd-price">${match ? "₱" + match.price.toLocaleString() : ""}</span>
            </div>`;
      })
      .join("");
    recentHtml = `
            <div class="sd-header sd-header-split">
                <span>🕐 Recent</span>
                <button class="sd-clear-btn" onclick="event.stopPropagation();clearRecentSearches()">Clear</button>
            </div>
            ${recentItems}`;
  }

  const trendItems = TRENDING_SEARCHES.map((term) => {
    const match = products.find(
      (p) =>
        p.title.toLowerCase().includes(term.toLowerCase()) ||
        p.author.toLowerCase().includes(term.toLowerCase()),
    );
    const imgSrc = match ? coverImages[match.id] || FALLBACK_COVER : null;
    return `<div class="sd-item" tabindex="0" role="option"
            onclick="runFullSearch('${escapeHtml(term)}')"
            onkeydown="if(event.key==='Enter')this.click()">
            ${imgSrc
        ? `<img class="sd-img" src="${imgSrc}" alt="" loading="lazy" onerror="this.src='${FALLBACK_COVER}'" />`
        : `<span class="sd-trend-icon">🔥</span>`
      }
            <div class="sd-info">
                <div class="sd-title">${escapeHtml(term)}</div>
                ${match ? `<div class="sd-meta">${escapeHtml(match.author)} · ${escapeHtml(match.cat)} · ₱${match.price.toLocaleString()}</div>` : ""}
            </div>
        </div>`;
  }).join("");

  dd.innerHTML = `
        ${recentHtml}
        <div class="sd-header">🔥 Trending Searches</div>
        ${trendItems}`;
  dd.classList.add("open");
}

// Updated event listeners for search inputs
let _searchDebounceTimer = null;

function handleSearchInput(e, ddId, spinnerSel) {
  const q = e.target.value;
  const spinner = e.target.parentElement.querySelector(spinnerSel);

  if (spinner) spinner.style.display = "block";

  clearTimeout(_searchDebounceTimer);
  _searchDebounceTimer = setTimeout(() => {
    if (spinner) spinner.style.display = "none";
    if (typeof buildDropdown === "function") {
      buildDropdown(q, ddId);
    }
  }, 200);
}

const _dsiEl = document.getElementById("dsi");
if (_dsiEl) {
  _dsiEl.addEventListener("input", (e) => handleSearchInput(e, "dsd", ".dsi-spinner"));
  _dsiEl.addEventListener("focus", () => {
    const dd = document.getElementById("dsd");
    if (dd && !dd.classList.contains("open")) {
      buildTrendingDropdown("dsd");
    }
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest("#dsw"))
    document.getElementById("dsd")?.classList.remove("open");
  const msd = document.getElementById("msd");
  if (msd && !e.target.closest(".mob-search-wrap"))
    msd.classList.remove("open");
});
if (_dsiEl)
  _dsiEl.addEventListener("keydown", (e) => {
    const dd = document.getElementById("dsd");
    if (!dd) return;
    if (e.key === "Escape") {
      dd.classList.remove("open");
      return;
    }
    if (!dd.classList.contains("open")) return;

    const items = Array.from(dd.querySelectorAll(".sd-item"));
    if (!items.length) return;

    const focused = dd.querySelector(".sd-item:focus");
    const idx = focused ? items.indexOf(focused) : -1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] || items[0];
      next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] || items[items.length - 1];
      prev.focus();
    }
  });
const _msiEl = document.getElementById("mob-nav-search");
if (_msiEl) {
  _msiEl.addEventListener("keydown", (e) => {
    const dd = document.getElementById("mob-nav-dd");
    if (!dd) return;
    if (e.key === "Escape") {
      dd.classList.remove("open");
      return;
    }
    if (!dd.classList.contains("open")) return;

    const items = Array.from(dd.querySelectorAll(".sd-item"));
    if (!items.length) return;

    const focused = dd.querySelector(".sd-item:focus");
    const idx = focused ? items.indexOf(focused) : -1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[idx + 1] || items[0];
      next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[idx - 1] || items[items.length - 1];
      prev.focus();
    }
  });
}

/* ═══ MOBILE MENU ═══ */
function toggleMenu() {
  const m = document.getElementById("mob-menu"),
    b = document.getElementById("hbg");
  if (!m || !b) return;
  const open = m.classList.toggle("open");
  b.classList.toggle("open", open);
  b.setAttribute("aria-expanded", open);
  if (open) {
    // Use nav offsetHeight (stable, not affected by scroll position)
    const nav = document.querySelector("nav");
    const promo = document.getElementById("promo-banner");
    const promoH =
      promo && promo.offsetParent !== null ? promo.offsetHeight : 0;
    const navH = nav ? nav.offsetHeight : 64;
    m.style.top = promoH + navH + "px";
    m.style.maxHeight = "calc(100dvh - " + (promoH + navH) + "px)";
    document.body.classList.add("mob-menu-open");
  } else {
    m.style.top = "";
    m.style.maxHeight = "";
    document.body.classList.remove("mob-menu-open");
  }
}
function closeMenu() {
  document.getElementById("mob-menu")?.classList.remove("open");
  document.getElementById("hbg")?.classList.remove("open");
  document.getElementById("hbg")?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("mob-menu-open");
}

/* Expandable navbar search (mobile) — global for inline onclick handlers */
function toggleMobileSearch() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  nav.classList.toggle("search-expanded");
  const input = document.getElementById("mob-nav-search");
  if (nav.classList.contains("search-expanded") && input) {
    setTimeout(() => input.focus(), 300);
  }
}
window.toggleMobileSearch = toggleMobileSearch;

document.addEventListener("DOMContentLoaded", () => {
  const mobInput = document.getElementById("mob-nav-search");
  if (!mobInput) return;
  mobInput.addEventListener("input", (e) => handleSearchInput(e, "mob-nav-dd", ".msi-spinner"));
  mobInput.addEventListener("blur", () => {
    setTimeout(() => {
      const dd = document.getElementById("mob-nav-dd");
      if (dd) dd.classList.remove("open");
    }, 200);
  });
});

/* ═══ THEME ═══ */
function applyTheme(dark, persist) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  // sync settings toggle
  const dt = document.getElementById("dark-toggle");
  if (dt) dt.classList.toggle("on", dark);
  if (persist) localStorage.setItem("ra-theme", dark ? "dark" : "light");
}
(() => {
  const s = localStorage.getItem("ra-theme");
  if (s === "dark") applyTheme(true, true);
})();

/* ═══ SETTINGS ═══ */
const ACCENTS = {
  crimson: {
    light: "#C0392B",
    hover: "#A93226",
    dark: "#E55B4D",
    dhover: "#F06A5C",
  },
  ocean: {
    light: "#0077B6",
    hover: "#005F92",
    dark: "#4CC9F0",
    dhover: "#72D4F5",
  },
  forest: {
    light: "#2D6A4F",
    hover: "#1B4332",
    dark: "#52B788",
    dhover: "#74C69D",
  },
  gold: {
    light: "#B08004",
    hover: "#8A6300",
    dark: "#F4A261",
    dhover: "#F6B17A",
  },
  purple: {
    light: "#6C2DC7",
    hover: "#521FAF",
    dark: "#9D4EDD",
    dhover: "#B575F4",
  },
};
function applyAccent(key, persist) {
  const a = ACCENTS[key];
  if (!a) return;
  const r = document.documentElement.style;
  r.setProperty("--accent", a.light);
  r.setProperty("--accent-hover", a.hover);
  if (persist) localStorage.setItem("ra-accent", key);
}
function applyFontSize(sz, persist) {
  const map = { small: "14px", medium: "16px", large: "18px" };
  document.documentElement.style.fontSize = map[sz] || "16px";
  if (persist) localStorage.setItem("ra-fontsize", sz);
}
(() => {
  const accent = localStorage.getItem("ra-accent");
  if (accent) applyAccent(accent, true);
  const fs = localStorage.getItem("ra-fontsize");
  if (fs) {
    applyFontSize(fs, true);
    const el = document.getElementById("font-size-pref");
    if (el) el.value = fs;
  }
  const acc2 = document.getElementById("accent-pref");
  if (acc2 && accent) acc2.value = accent;
})();
function settingsToggleTheme(btn) {
  btn.classList.toggle("on");
  applyTheme(btn.classList.contains("on"));
}

/* ── Settings draft/revert system ──
   Changes are previewed immediately but NOT persisted until
   "Save Preferences" is clicked. Outside-click and × both discard. */
let _settingsSnapshot = null;

function _captureSettingsSnapshot() {
  return {
    theme: localStorage.getItem("ra-theme") || "light",
    accent: localStorage.getItem("ra-accent") || "crimson",
    fontSize: localStorage.getItem("ra-fontsize") || "medium",
    lang: localStorage.getItem("ra-lang") || "en",
  };
}

function _revertSettingsToSnapshot() {
  if (!_settingsSnapshot) return;
  const s = _settingsSnapshot;
  applyTheme(s.theme === "dark", true);
  applyAccent(s.accent, true);
  applyFontSize(s.fontSize, true);
  applyTranslations(s.lang, true, true); // silent=true, persist=true (restoring saved values)
  // Sync UI selects back to saved values
  const fsel = document.getElementById("font-size-pref");
  if (fsel) fsel.value = s.fontSize;
  const asel = document.getElementById("accent-pref");
  if (asel) asel.value = s.accent;
  const lsel = document.getElementById("lang-select");
  if (lsel) lsel.value = s.lang;
  _settingsSnapshot = null;
}

let _settingsTrigger = null; // A11Y-05: focus restore
/* ── Order History Modal ── */
async function openOrderHistory() {
  if (!state.isLoggedIn || !state.user?.uid) {
    showToast("Please sign in to view your order history.");
    return;
  }
  const overlay = document.getElementById("order-history-overlay");
  if (!overlay) return;
  overlay.classList.add("open");
  await renderOrderHistory();
}
function closeOrderHistory() {
  const overlay = document.getElementById("order-history-overlay");
  if (overlay) overlay.classList.remove("open");
}
async function renderOrderHistory() {
  const content = document.getElementById("order-history-content");
  if (!content) return;
  content.innerHTML = `<div style="padding:3rem 0;display:flex;justify-content:center"><div class="rd-spinner"></div></div>`;
  try {
    const snap = await db.collection("users").doc(state.user.uid).collection("orders").orderBy("date", "desc").get();
    if (snap.empty) {
      content.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted)" class="fade-in">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto .85rem;display:block;opacity:.4">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin-bottom:.35rem">No orders yet</p>
          <p style="font-size:.88rem;margin-bottom:1.2rem">Start shopping to fill this up!</p>
          <button class="checkout-btn" style="width:auto;padding:0 1.5rem;display:inline-block" onclick="closeOrderHistory(); document.getElementById('products')?.scrollIntoView({behavior:'smooth'})">Browse Books</button>
        </div>`;
      return;
    }
    let html = "";
    snap.forEach(doc => {
      const o = doc.data();
      const itemsHtml = o.items.map(i => `<div style="font-size:0.85rem;color:var(--text-muted)">${i.qty}x ${i.title} (₱${i.price})</div>`).join('');
      html += `
        <div style="border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:1rem;background:var(--bg-secondary);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <strong style="font-family:'Playfair Display',serif;">${o.orderId}</strong>
            <span style="font-size:0.8rem;background:var(--accent-light);color:var(--accent);padding:0.2rem 0.5rem;border-radius:4px;font-weight:600;">${o.status}</span>
          </div>
          <div style="font-size:0.85rem;margin-bottom:0.5rem;"><strong>Date:</strong> ${o.displayDate || new Date(o.date).toLocaleDateString()}</div>
          <div style="margin-bottom:0.5rem;">${itemsHtml}</div>
          <div style="font-size:0.9rem;font-weight:700;margin-top:0.5rem;">Total: ₱${o.total.toLocaleString()} ${o.promoUsed ? `<span style="font-size:0.75rem;color:var(--text-muted);font-weight:normal;">(Promo: ${o.promoUsed})</span>` : ''}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem;">Shipped to: ${o.shippingAddress}</div>
        </div>
      `;
    });
    content.innerHTML = `<div class="fade-in">${html}</div>`;
  } catch (e) {
    console.error("Error loading orders:", e);
    content.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted)" class="fade-in">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" style="margin:0 auto .85rem;display:block;opacity:.8">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin-bottom:.35rem">Couldn't load orders.</p>
        <p style="font-size:.88rem;margin-bottom:1.2rem">Please try again later.</p>
        <button class="checkout-btn" style="width:auto;padding:0 1.5rem;display:inline-block" onclick="renderOrderHistory()">Retry</button>
      </div>`;
  }
}

function openSettings() {
  const overlay = document.getElementById("settings-overlay");
  if (!overlay) {
    window.location.href = pathToStore() + "index.html";
    return;
  }
  _settingsTrigger = document.activeElement; // save focus origin
  _settingsSnapshot = _captureSettingsSnapshot();
  // sync dark toggle state to current (saved) theme
  const dt = document.getElementById("dark-toggle");
  if (dt)
    dt.classList.toggle(
      "on",
      document.documentElement.getAttribute("data-theme") === "dark",
    );
  overlay.classList.add("open");
}

function closeSettings() {
  document.getElementById("settings-overlay")?.classList.remove("open");
  // A11Y-05: restore focus
  if (_settingsTrigger && typeof _settingsTrigger.focus === "function") {
    requestAnimationFrame(() => {
      _settingsTrigger.focus();
      _settingsTrigger = null;
    });
  }
}

function discardSettings() {
  _revertSettingsToSnapshot();
  closeSettings();
}

function closeSettingsOutside(e) {
  if (e.target === document.getElementById("settings-overlay"))
    discardSettings();
}

function saveSettings() {
  // Persist the currently-previewed values to localStorage
  const theme = document.documentElement.getAttribute("data-theme") || "light";
  localStorage.setItem("ra-theme", theme);
  const asel = document.getElementById("accent-pref");
  const accent = asel ? asel.value : "";
  if (asel) localStorage.setItem("ra-accent", accent);
  const fsel = document.getElementById("font-size-pref");
  const fontsize = fsel ? fsel.value : "";
  if (fsel) localStorage.setItem("ra-fontsize", fontsize);
  const lsel = document.getElementById("lang-select");
  const lang = lsel ? lsel.value : "";
  if (lsel) {
    localStorage.setItem("ra-lang", lang);
    _currentLang = lang;
  }

  const profileName = document.getElementById("profile-name")?.value || "";
  const profilePhone = document.getElementById("profile-phone")?.value || "";

  if (state.isLoggedIn && state.user?.uid) {
    try {
      db.collection("users").doc(state.user.uid).collection("preferences").doc("main").set({
        theme, accent, fontsize, lang
      }, { merge: true });
      db.collection("users").doc(state.user.uid).collection("profile").doc("main").set({
        displayName: profileName,
        phone: profilePhone
      }, { merge: true });
    } catch (e) {
      console.error("Error saving settings to Firestore", e);
    }
  }

  _settingsSnapshot = null;
  closeSettings();
  showToast("✓ Preferences saved!");
}

/* ═══ NEWSLETTER ═══ */
function subscribe() {
  const input = document.getElementById("nl-email");
  const v = (input.value || "").trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!v || !regex.test(v)) {
    showToast("Please enter a valid email address!");
    input.focus();
    return;
  }

  // Swap button to success state
  const btn = input.closest(".nl-form")?.querySelector("button");
  if (btn) {
    btn.textContent = "✓ Subscribed!";
    btn.style.background = "#15803d";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = "Subscribe";
      btn.style.background = "";
      btn.disabled = false;
    }, 4000);
  }
  input.value = "";

  showToast("🎉 You're in! Welcome to Readora.");

  // Confetti burst
  if (typeof confetti === "function") {
    const colors = ["#C0392B", "#f4a261", "#ffffff", "#1a1a1a", "#e55b4d"];
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.55 }, colors });
    setTimeout(
      () =>
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.5, x: 0.35 },
          colors,
        }),
      180,
    );
    setTimeout(
      () =>
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.5, x: 0.65 },
          colors,
        }),
      320,
    );
  }
}

/* ═══ TOAST ═══ */
let ttimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  if (!t || !msgEl) return;
  msgEl.textContent = msg;
  t.classList.add("show");
  clearTimeout(ttimer);
  ttimer = setTimeout(() => t.classList.remove("show"), 4000);
}

/* ═══ SCROLL TOP ═══ */
window.addEventListener(
  "scroll",
  () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    document
      .getElementById("stb")
      ?.classList.toggle("visible", window.scrollY > 600);
  },
  { passive: true },
);

/* ═══ ESC KEY ═══ */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeSupport();
    const cd = document.getElementById("cart-drawer");
    if (cd?.classList.contains("open")) toggleCart();
    const wd = document.getElementById("wishlist-drawer");
    if (wd?.classList.contains("open")) {
      document.getElementById("wishlist-overlay")?.classList.remove("open");
      wd.classList.remove("open");
    }
    document.getElementById("dsd")?.classList.remove("open");
    document.getElementById("msd")?.classList.remove("open");
    // Close filter bottom sheet on mobile
    const panel = document.getElementById("adv-filter-panel");
    if (panel && panel.classList.contains("open")) toggleAdvFilter();
  }
});

/* ═══ TESTIMONIAL CAROUSEL ═══ */
(function () {
  const carousel = document.getElementById("testi-carousel");
  const dotsContainer = document.getElementById("testi-dots");
  const prevBtn = document.getElementById("testi-prev");
  const nextBtn = document.getElementById("testi-next");
  if (!carousel) return;

  const cards = carousel.querySelectorAll(".testi-card");
  let currentIndex = 0;

  /* Build dots */
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "testi-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Review ${i + 1}`);
    dot.addEventListener("click", () => scrollToCard(i));
    dotsContainer.appendChild(dot);
  });

  function updateDots(index) {
    dotsContainer.querySelectorAll(".testi-dot").forEach((d, i) => {
      d.classList.toggle("active", i === index);
    });
  }

  function scrollToCard(index) {
    const card = cards[index];
    if (!card) return;
    carousel.scrollTo({
      left: card.offsetLeft - carousel.offsetLeft,
      behavior: "smooth",
    });
    currentIndex = index;
    updateDots(index);
  }

  prevBtn.addEventListener("click", () => {
    scrollToCard(Math.max(0, currentIndex - 1));
  });

  nextBtn.addEventListener("click", () => {
    scrollToCard(Math.min(cards.length - 1, currentIndex + 1));
  });

  /* Sync dots on manual scroll */
  let scrollTimer;
  carousel.addEventListener(
    "scroll",
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        let closest = 0,
          minDist = Infinity;
        cards.forEach((card, i) => {
          const dist = Math.abs(
            card.offsetLeft - carousel.offsetLeft - carousel.scrollLeft,
          );
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        });
        currentIndex = closest;
        updateDots(closest);
      }, 80);
    },
    { passive: true },
  );

  /* Auto-advance every 5s */
  let autoTimer = setInterval(() => {
    const next = (currentIndex + 1) % cards.length;
    scrollToCard(next);
  }, 5000);

  /* Pause on interaction */
  carousel.addEventListener("pointerdown", () => clearInterval(autoTimer));
  prevBtn.addEventListener("click", () => {
    clearInterval(autoTimer);
  });
  nextBtn.addEventListener("click", () => {
    clearInterval(autoTimer);
  });

  /* Pause on hover so users can read */
  carousel.addEventListener("mouseenter", () => clearInterval(autoTimer));
  carousel.addEventListener("mouseleave", () => {
    autoTimer = setInterval(() => {
      const next = (currentIndex + 1) % cards.length;
      scrollToCard(next);
    }, 5000);
  });
})();

/* ═══ WISHLIST ═══ */
// wishlist & saveWishlist → managed by centralized state (see STATE MANAGER block above)
function toggleWishlistItem(id) {
  const p = products.find((x) => x.id === id);
  const idx = wishlist.findIndex((x) => x.id === id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push({ ...p });
  }
  saveWishlist();
  renderWishlist();
}
function renderWishlist() {
  const badge = document.getElementById("wish-count");
  if (!badge) return;

  const count = wishlist.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
  const cont = document.getElementById("wishlist-items");
  if (!cont) return;
  if (!wishlist.length) {
    cont.innerHTML = `<div class="wishlist-empty"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>Your wishlist is empty</p><button class="browse-btn" onclick="toggleWishlist();document.getElementById('products')?.scrollIntoView({behavior:'smooth'})">Start Browsing</button></div>`;
    return;
  }
  cont.innerHTML = wishlist
    .map(
      (p) => `
              <div class="wishlist-item">
                <div class="ci-img" style="width:44px;height:60px;flex-shrink:0;border-radius:6px;overflow:hidden;background:${p.color || "var(--bg-secondary)"}22;">
                  <img src="${coverImages[p.id] || BOOK_PLACEHOLDER}" alt="${escapeHtml(p.title)}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.src='${BOOK_PLACEHOLDER}'" loading="lazy" />
                </div>
                <div class="wi-info">
                  <div class="wi-title">${escapeHtml(p.title)}</div>
                  <div class="wi-author">${escapeHtml(p.author)}</div>
                  <div class="wi-price">₱${p.price.toLocaleString()}</div>
                </div>
                <button class="wi-add" onclick="addToCart(${p.id}, true)">Move to Cart</button>
                <button class="wi-rm" onclick="removeFromWishlist(${p.id})" aria-label="Remove">✕</button>
              </div>`,
    )
    .join("");
}
function removeFromWishlist(id) {
  wishlist = wishlist.filter((x) => x.id !== id);
  saveWishlist();
  const btn = document.getElementById("w" + id);
  if (btn) {
    btn.classList.remove("wished");
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  }
  renderWishlist();
}
function toggleWishlist() {
  document.getElementById("wishlist-overlay").classList.toggle("open");
  document.getElementById("wishlist-drawer").classList.toggle("open");
}

/* ═══ TEAM DRAWER (Phase 2) ═══ */
function toggleTeamDrawer() {
  const overlay = document.getElementById("team-overlay");
  const drawer = document.getElementById("team-drawer");
  if (!overlay || !drawer) return;
  const isOpen = drawer.classList.toggle("open");
  overlay.classList.toggle("open", isOpen);
  document.body.classList.toggle("no-scroll", isOpen);
}
/* Attach swipe-to-close to team drawer on load */
document.addEventListener("DOMContentLoaded", () => {
  const td = document.getElementById("team-drawer");
  if (td && typeof _attachSwipeToClose === "function")
    _attachSwipeToClose(td, toggleTeamDrawer);
});

/* ═══ ADVANCED FILTERS ═══ */
let _currentSort = "default"; // 'default' | 'price-asc' | 'price-desc' | 'rating' | 'reviews' | 'title'
let advRatingMin = 0;
function toggleAdvFilter() {
  const panel = document.getElementById("adv-filter-panel");
  const btn = document.getElementById("adv-filter-toggle");
  const backdrop = document.getElementById("adv-filter-backdrop");
  const closeBtn = document.getElementById("adv-filter-close");
  const isOpen = panel.classList.toggle("open");
  btn.classList.toggle("active", isOpen);
  if (backdrop) backdrop.classList.toggle("open", isOpen);
  if (closeBtn) closeBtn.style.display = isOpen ? "inline-block" : "none";
  document.body.classList.toggle("no-scroll", isOpen);
}
/* Phase 3: Auto-close filter drawer on mobile when a category/checkbox is picked */
function _closeFilterOnMobile() {
  if (
    window.innerWidth <= 768 &&
    document.getElementById("adv-filter-panel")?.classList.contains("open")
  ) {
    toggleAdvFilter();
  }
}
function setRatingFilter(el, val) {
  // Remove active only from rating buttons (not sort buttons)
  document
    .querySelectorAll('.afp-btn:not([id^="sort-btn-"])')
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  advRatingMin = val;
  applyAdvFilters();
}
function setSortOrder(el, order) {
  _currentSort = order;
  // Update active state on sort buttons only
  document
    .querySelectorAll('[id^="sort-btn-"]')
    .forEach((b) => b.classList.remove("active"));
  if (el) el.classList.add("active");
  // Re-apply all filters with new sort
  applyAdvFilters();
}
function applyAdvFilters(closePanelOnMobile) {
  const genres = [...document.querySelectorAll(".afp-genre:checked")].map(
    (c) => c.value,
  );
  const maxPrice = parseInt(document.getElementById("price-range").value);
  const avail =
    document.querySelector('input[name="avail"]:checked')?.value || "all";
  let list = products.filter((p) => {
    if (genres.length && !genres.includes(p.cat)) return false;
    if (p.price > maxPrice) return false;
    if (advRatingMin && p.stars < advRatingMin) return false;
    if (avail === "sale" && p.tag !== "sale") return false;
    if (avail === "new" && p.tag !== "new") return false;
    return true;
  });
  // clear active filter tabs
  document.querySelectorAll(".filter-tab").forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  // Apply sort order
  const sorted = [...list];
  if (_currentSort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (_currentSort === "price-desc")
    sorted.sort((a, b) => b.price - a.price);
  else if (_currentSort === "rating") sorted.sort((a, b) => b.stars - a.stars);
  else if (_currentSort === "reviews")
    sorted.sort((a, b) => b.reviews - a.reviews);
  else if (_currentSort === "title")
    sorted.sort((a, b) => a.title.localeCompare(b.title));
  renderProductList(sorted);
  if (closePanelOnMobile) _closeFilterOnMobile();
  // Update active filter count badge
  const activeCount =
    genres.length +
    (maxPrice < 1000 ? 1 : 0) +
    (advRatingMin > 0 ? 1 : 0) +
    (avail !== "all" ? 1 : 0);
  const badge = document.getElementById("adv-filter-badge");
  if (badge) {
    if (activeCount > 0) {
      badge.textContent = activeCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }
  const toggleBtn = document.getElementById("adv-filter-toggle");
  if (toggleBtn)
    toggleBtn.classList.toggle(
      "active",
      activeCount > 0 ||
      document.getElementById("adv-filter-panel")?.classList.contains("open"),
    );
}
function resetAdvFilters() {
  document.querySelectorAll(".afp-genre").forEach((c) => (c.checked = false));
  document.getElementById("price-range").value = 1000;
  document.getElementById("price-val").textContent = "Up to ₱1000";
  advRatingMin = 0;
  document
    .querySelectorAll('.afp-btn:not([id^="sort-btn-"])')
    .forEach((b, i) => b.classList.toggle("active", i === 0));
  _currentSort = "default";
  document
    .querySelectorAll('[id^="sort-btn-"]')
    .forEach((b, i) => b.classList.toggle("active", i === 0));
  document.querySelector('input[name="avail"][value="all"]').checked = true;
  document.querySelectorAll(".filter-tab").forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  const firstTab = document.querySelector(".filter-tab");
  if (firstTab) {
    firstTab.classList.add("active");
    firstTab.setAttribute("aria-selected", "true");
  }
  // Reset type buttons too
  document
    .querySelectorAll(".afp-type-btn")
    .forEach((b, i) => b.classList.toggle("active", i === 0));
  const badge = document.getElementById("adv-filter-badge");
  if (badge) badge.style.display = "none";
  renderProducts("all");
}

/* ═══ TYPE FILTER (drawer Type section) ═══ */
function setTypeFilter(el, val) {
  // Mark active
  document
    .querySelectorAll(".afp-type-btn")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");

  if (val.startsWith("cat:")) {
    // Category filter — use setFilterCat equivalent
    const cat = val.replace("cat:", "");
    // Sync desktop tabs if visible
    document.querySelectorAll(".filter-tab").forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    renderProductList(products.filter((p) => p.cat === cat));
    showToast("Showing: " + cat);
  } else {
    // Tag filter (all/bestseller/new/sale)
    // Sync desktop tabs
    document.querySelectorAll(".desktop-filter-tab").forEach((t) => {
      const matches =
        (val === "all" && t.textContent.trim() === "All Books") ||
        (val === "bestseller" && t.textContent.trim() === "Bestsellers") ||
        (val === "new" && t.textContent.trim() === "New Arrivals") ||
        (val === "sale" && t.textContent.trim() === "On Sale");
      t.classList.toggle("active", matches);
      t.setAttribute("aria-selected", matches ? "true" : "false");
    });
    renderProducts(val);
  }

  // Auto-close drawer on mobile after picking
  if (window.innerWidth <= 768) {
    setTimeout(() => {
      const panel = document.getElementById("adv-filter-panel");
      if (panel && panel.classList.contains("open")) toggleAdvFilter();
    }, 200);
  }
}

/* ═══ CATEGORY CARD CLICK → AUTO-FILTER ═══ */
function catClick(type, val) {
  // scroll to products section smoothly
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    if (type === "all") {
      // find the bestseller tab and click it
      const tabs = document.querySelectorAll(".filter-tab");
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      const bestsellTab = [...tabs].find(
        (t) => t.textContent.trim() === "Bestsellers",
      );
      if (bestsellTab) {
        bestsellTab.classList.add("active");
        bestsellTab.setAttribute("aria-selected", "true");
      }
      renderProducts("bestseller");
    } else {
      // use advanced filter with the chosen genre pre-checked
      // do not open the panel, just update state
      document.querySelectorAll(".afp-genre").forEach((c) => {
        c.checked = c.value === val;
      });
      applyAdvFilters(false);
      showToast(`Showing: ${val}`);
    }
  }, 400);
}

/* ═══ LANGUAGE SETTINGS ═══ */
const LANG = {
  en: {
    heroTitle: "Find Your Next\nFavourite\nStory.",
    heroCta: "Browse Books",
    heroSub: "Explore Categories",
    navHome: "Home",
    navCats: "Categories",
    navProds: "Products",
    navAbout: "About Us",
    searchPlaceholder: "Search books, authors, genres…",
    subscribe: "Subscribe",
    newsletterBtn: "Subscribe",
    // New keys
    btnGiftCard: "Get Gift Card",
    btnLogin: "Sign In",
    btnSignup: "Sign Up",
    btnClose: "Close",
    btnApply: "Apply",
    sectionOurCollection: "Our Collection",
    sectionFeaturedBooks: "Featured Books",
    sectionBrowseCategories: "Browse Categories",
    sectionRecommended: "Recommended Reads",
    sectionStayInLoop: "Stay in the Loop",
    btnSubscribe: "Subscribe",
    btnReadMore: "Read More",
    toastCodeActive: "Code READGIFT active! Use it in the cart.",
    toastLanguageUpdated: "Language updated!",
  },
  fil: {
    heroTitle: "Hanapin ang Iyong\nSusunod na\nKwento.",
    heroCta: "Mag-browse ng Libro",
    heroSub: "I-explore ang Kategorya",
    navHome: "Tahanan",
    navCats: "Kategorya",
    navProds: "Mga Libro",
    navAbout: "Tungkol sa Amin",
    searchPlaceholder: "Maghanap ng libro, may-akda…",
    subscribe: "Mag-subscribe",
    newsletterBtn: "Mag-subscribe",
    btnGiftCard: "Kumuha ng Gift Card",
    btnLogin: "Mag-sign In",
    btnSignup: "Mag-sign Up",
    btnClose: "Isara",
    btnApply: "Ilapat",
    sectionOurCollection: "Ating Koleksyon",
    sectionFeaturedBooks: "Mga Tampok na Aklat",
    sectionBrowseCategories: "I-browse ang Kategorya",
    sectionRecommended: "Inirerekomendang Basahin",
    sectionStayInLoop: "Manatiling Updated",
    btnSubscribe: "Mag-subscribe",
    btnReadMore: "Basahin Pa",
    toastCodeActive: "Code READGIFT active! Gamitin ito sa cart.",
    toastLanguageUpdated: "Na-update ang wika!",
  },
  es: {
    heroTitle: "Encuentra Tu\nSiguiente\nHistoria.",
    heroCta: "Ver Libros",
    heroSub: "Explorar Categorías",
    navHome: "Inicio",
    navCats: "Categorías",
    navProds: "Productos",
    navAbout: "Acerca de",
    searchPlaceholder: "Buscar libros, autores, géneros…",
    subscribe: "Suscribirse",
    newsletterBtn: "Suscribirse",
    btnGiftCard: "Obtener Tarjeta de Regalo",
    btnLogin: "Iniciar Sesión",
    btnSignup: "Registrarse",
    btnClose: "Cerrar",
    btnApply: "Aplicar",
    sectionOurCollection: "Nuestra Colección",
    sectionFeaturedBooks: "Libros Destacados",
    sectionBrowseCategories: "Explorar Categorías",
    sectionRecommended: "Lecturas Recomendadas",
    sectionStayInLoop: "Mantente al Tanto",
    btnSubscribe: "Suscribirse",
    btnReadMore: "Leer Más",
    toastCodeActive: "Código READGIFT activo! Úsalo en el carrito.",
    toastLanguageUpdated: "¡Idioma actualizado!",
  },
};
/* Selector-map: maps CSS selectors to translation keys.
   Entries with text:true update textContent (preserving child SVGs via text-node targeting).
   Entries with placeholder:true update the placeholder attribute. */
const I18N_SELECTOR_MAP = [
  // ── Desktop nav links ──
  { sel: 'nav .nav-links a[href="#home"]', key: "navHome", text: true },
  { sel: 'nav .nav-links a[href="#categories"]', key: "navCats", text: true },
  { sel: 'nav .nav-links a[href="#products"]', key: "navProds", text: true },
  { sel: 'nav .nav-links a[href="#about"]', key: "navAbout", text: true },
  // ── Mobile nav links ──
  { sel: '.mob-nav-link[href="#home"]', key: "navHome", text: true },
  { sel: '.mob-nav-link[href="#categories"]', key: "navCats", text: true },
  { sel: '.mob-nav-link[href="#products"]', key: "navProds", text: true },
  { sel: '.mob-nav-link[href="#about"]', key: "navAbout", text: true },
  // ── Auth buttons (have SVG icons — update last text node only) ──
  { sel: "#nav-signin-btn", key: "btnLogin", textNode: true },
  { sel: ".nav-auth-btns .btn-signup", key: "btnSignup", text: true },
  { sel: ".mob-btns .btn-login", key: "btnLogin", text: true },
  { sel: ".mob-btns .btn-signup", key: "btnSignup", text: true },
  // ── Search inputs ──
  { sel: "#dsi", key: "searchPlaceholder", placeholder: true },
  { sel: "#msi", key: "searchPlaceholder", placeholder: true },
  // ── Hero CTA buttons ──
  { sel: ".hero a.btn-primary .hero-cta-text", key: "heroCta", text: true },
  { sel: ".hero a.btn-outline", key: "heroSub", textNode: true },
  // ── Section labels & titles ──
  { sel: "#prod-h", key: "sectionFeaturedBooks", text: true },
  { sel: "#cat-h", key: "sectionBrowseCategories", text: true },
  // ── Newsletter section ──
  { sel: ".newsletter h2", key: "sectionStayInLoop", text: true },
];

/* Update only the last text node of an element, leaving SVG/icon children intact */
function _setTextNode(el, text) {
  for (let i = el.childNodes.length - 1; i >= 0; i--) {
    const n = el.childNodes[i];
    if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
      n.textContent = " " + text;
      return;
    }
  }
  // Fallback: no existing text node found, append one
  el.appendChild(document.createTextNode(" " + text));
}

/* Track the currently active language for t() helper (preview-safe) */
let _currentLang = localStorage.getItem("ra-lang") || "en";

function t(key) {
  const dict = LANG[_currentLang] || LANG.en;
  return dict[key] || key;
}

function applyTranslations(lang, silent = false, persist = false) {
  _currentLang = lang;
  if (persist) {
    localStorage.setItem("ra-lang", lang);
  }
  const dict = LANG[lang] || LANG.en;

  // 1. data-i18n attribute elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!dict[key]) return;
    if (
      el.tagName.toLowerCase() === "input" &&
      el.hasAttribute("placeholder")
    ) {
      el.setAttribute("placeholder", dict[key]);
    } else {
      el.textContent = dict[key];
    }
  });

  // 2. data-i18n-placeholder elements
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });

  // 3. Hero title (special multi-line + <em> structure)
  const h1 = document.querySelector(".hero h1");
  if (h1 && dict.heroTitle) {
    const parts = dict.heroTitle.split("\n");
    h1.innerHTML = `${parts[0]}<br><em>${parts[1]}</em><br>${parts[2]}`;
  }

  // 4. Selector-map translations
  I18N_SELECTOR_MAP.forEach(({ sel, key, text, textNode, placeholder }) => {
    if (!dict[key]) return;
    document.querySelectorAll(sel).forEach((el) => {
      if (placeholder) {
        el.setAttribute("placeholder", dict[key]);
      } else if (textNode) {
        _setTextNode(el, dict[key]);
      } else if (text) {
        el.textContent = dict[key];
      }
    });
  });

  if (!silent) showToast(dict.toastLanguageUpdated || "Language updated!");

  // Re-render currently open modals/drawers to apply dynamic translations
  if (document.getElementById("order-history-overlay")?.classList.contains("open")) {
    if (typeof renderOrderHistory === "function") renderOrderHistory();
  }
  if (document.getElementById("qv-spinner-wrap")?.style.display === "flex") {
    // Quickview is open, re-render reviews
    if (typeof renderQvUserReviews === "function" && _qvCurrentProductId) renderQvUserReviews(_qvCurrentProductId);
  }
}

/* On page load, restore saved language (silent — no toast on refresh) */
(() => {
  const saved =
    localStorage.getItem("readora_lang") || localStorage.getItem("ra-lang");
  if (saved && saved !== "en") {
    applyTranslations(saved, true, true);
    const sel = document.getElementById("lang-select");
    if (sel) sel.value = saved;
  }
})();

/* ═══ SUPPORT MODALS ═══ */
const SUPPORT_CONTENT = {
  faq: `
              <h2 id="modal-h-support">Frequently Asked Questions</h2>
              <p class="modal-sub">Find quick answers to the most common questions.</p>
              <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)"><span data-i18n="faq_q1">How long does delivery take?</span> <span>+</span></button><div class="faq-a" data-i18n="faq_a1">Standard delivery takes 3–5 business days within Metro Manila, and 5–8 business days for provincial areas. Express options may be available at checkout.</div></div>
              <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)"><span data-i18n="faq_q2">What payment methods do you accept?</span> <span>+</span></button><div class="faq-a" data-i18n="faq_a2">We accept GCash, Maya, major credit/debit cards (Visa, Mastercard), Cash on Delivery (COD), bank transfers, and 7-Eleven over-the-counter payments.</div></div>
              <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)"><span data-i18n="faq_q3">Can I return a book I already read?</span> <span>+</span></button><div class="faq-a" data-i18n="faq_a3">Returns are accepted within 30 days for items in original, unread condition. Books that show clear signs of reading (cracked spines, highlighted pages) are not eligible. Please contact us to initiate a return.</div></div>
              <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)"><span data-i18n="faq_q4">Are the books brand new?</span> <span>+</span></button><div class="faq-a" data-i18n="faq_a4">Yes — all books sold on Readora are brand new unless explicitly labelled as "Pre-owned" or "Second-hand" in the listing.</div></div>
              <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)"><span data-i18n="faq_q5">Do you offer bulk or school orders?</span> <span>+</span></button><div class="faq-a" data-i18n="faq_a5">Yes! We have a dedicated bulk pricing programme for schools, libraries, and institutions. Contact us via the Contact Us form or email bulkorders@readora.ph for a quote.</div></div>
              <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)"><span data-i18n="faq_q6">How do I use a promo code?</span> <span>+</span></button><div class="faq-a" data-i18n="faq_a6">Add your items to the cart, proceed to checkout, and enter your promo code in Step 4 (Review Order). The discount will be applied automatically before final payment.</div></div>
              <div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)"><span data-i18n="faq_q7">Is my payment information secure?</span> <span>+</span></button><div class="faq-a" data-i18n="faq_a7">Absolutely. We use industry-standard SSL encryption and never store raw card data on our servers. All card transactions are processed through PCI-DSS-compliant payment gateways.</div></div>`,
  contact: `
              <h2 id="modal-h-support">Contact Us</h2>
              <p class="modal-sub">We usually respond within 24 hours on business days.</p>
              <div id="contact-form-wrap">
                <div class="contact-form-grid">
                  <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="cf-fn" placeholder="Juan" /></div>
                  <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="cf-ln" placeholder="dela Cruz" /></div>
                </div>
                <div class="form-group"><label class="form-label">Email Address</label><input class="form-input" id="cf-email" type="email" placeholder="juan@example.com" /></div>
                <div class="form-group"><label class="form-label">Subject</label>
                  <select class="form-input" id="cf-subject">
                    <option value="">Select a topic…</option>
                    <option>Order Issue</option>
                    <option>Returns & Refunds</option>
                    <option>Payment Problem</option>
                    <option>Product Enquiry</option>
                    <option>Bulk Order</option>
                    <option>Other</option>
                  </select>
                </div>
                <div class="form-group"><label class="form-label">Message</label><textarea class="form-input" id="cf-msg" rows="4" style="height:auto;padding:.65rem .88rem;resize:vertical" placeholder="Tell us how we can help…"></textarea></div>
                <button class="modal-btn" onclick="submitContact()">Send Message</button>
                <p style="font-size:.73rem;color:var(--text-muted);margin-top:.55rem;text-align:center;">Or email us directly at <a href="mailto:support@readora.ph" style="color:var(--accent)">support@readora.ph</a></p>
              </div>
              <div class="contact-success" id="contact-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="1.8" style="margin:0 auto .8rem"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                <h3 style="font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:.4rem">Message Sent!</h3>
                <p style="color:var(--text-muted);font-size:.86rem">Thanks for reaching out. Our team will get back to you within 24 hours.</p>
              </div>`,
  privacy: `
              <h2 id="modal-h-support">Privacy Policy</h2>
              <p class="modal-sub">Last updated: January 2025. We take your privacy seriously.</p>
              <div class="privacy-section"><h3>1. Information We Collect</h3><p>We collect information you provide directly — name, email address, shipping address, and payment details during checkout. We also collect usage data such as pages visited, search queries, and browsing behaviour to improve our service.</p></div>
              <div class="privacy-section"><h3>2. How We Use Your Information</h3><p>Your data is used to process orders, personalise your experience, send transactional emails (order confirmation, shipping updates), and — with your consent — marketing communications. We never sell your personal data to third parties.</p></div>
              <div class="privacy-section"><h3>3. Cookies</h3><p>We use essential cookies to keep your cart and preferences (theme, language, font size) intact between sessions. Analytics cookies help us understand how the site is used. You may disable non-essential cookies in your browser settings.</p></div>
              <div class="privacy-section"><h3>4. Data Retention</h3><p>Order records are retained for 5 years for accounting and legal compliance. Account data is kept as long as your account is active. You may request deletion at any time by emailing privacy@readora.ph.</p></div>
              <div class="privacy-section"><h3>5. Third-Party Services</h3><p>We use payment processors (GCash, Maya, Visa/Mastercard gateways) that have their own privacy policies. Shipping partners receive your name and delivery address to fulfil orders. We do not share data beyond what is necessary.</p></div>
              <div class="privacy-section"><h3>6. Your Rights</h3><p>You have the right to access, correct, or delete the personal data we hold about you. To exercise these rights, contact us at privacy@readora.ph. We will respond within 30 days.</p></div>
              <div class="privacy-section"><h3>7. Contact</h3><p>Questions about this policy? Email <a href="mailto:privacy@readora.ph" style="color:var(--accent)">privacy@readora.ph</a> or write to: Readora™, 123 Rizal Avenue, Quezon City, Metro Manila, Philippines.</p></div>`,
  track: `
              <h2 id="modal-h-support">Track Your Order</h2>
              <p class="modal-sub">Enter your order number to see the latest status.</p>
              <div class="form-group" style="display:flex;gap:.6rem">
                <input class="form-input" id="track-input" placeholder="e.g. #RA-284930" style="flex:1" />
                <button class="step-next" style="height:41px;padding:0 1.1rem;border-radius:8px;white-space:nowrap" onclick="trackOrder()">Track</button>
              </div>
              <div id="track-result" style="display:none" class="track-result">
                <div style="display:flex;justify-content:space-between;margin-bottom:.8rem;font-size:.83rem">
                  <span><strong>Order</strong> <span id="tr-id">#RA-284930</span></span>
                  <span style="color:#15803d;font-weight:600">In Transit</span>
                </div>
                <div class="track-step"><div class="track-dot done"></div><div><div style="font-size:.84rem;font-weight:600">Order Placed</div><div style="font-size:.74rem;color:var(--text-muted)">Confirmed &amp; payment received</div></div></div>
                <div class="track-step"><div class="track-dot done"></div><div><div style="font-size:.84rem;font-weight:600">Processed &amp; Packed</div><div style="font-size:.74rem;color:var(--text-muted)">Books carefully packaged at our warehouse</div></div></div>
                <div class="track-step"><div class="track-dot current"></div><div><div style="font-size:.84rem;font-weight:600">In Transit</div><div style="font-size:.74rem;color:var(--text-muted)">With courier — estimated arrival in 1–2 days</div></div></div>
                <div class="track-step"><div class="track-dot"></div><div><div style="font-size:.84rem;font-weight:600">Delivered</div><div style="font-size:.74rem;color:var(--text-muted)">Awaiting delivery to your address</div></div></div>
                <p style="font-size:.73rem;color:var(--text-muted);margin-top:.8rem">This is a sample tracking result for demonstration only.</p>
              </div>`,
  returns: `
              <h2 id="modal-h-support">Returns & Refunds</h2>
              <p class="modal-sub">We want you to love every book. Here's how returns work.</p>
              <div style="background:var(--accent-light);border:1.5px solid var(--border);border-radius:10px;padding:.9rem 1rem;margin-bottom:1.3rem;font-size:.84rem;color:var(--accent);font-weight:600;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:.35rem"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                30-day hassle-free return window on all eligible items.
              </div>
              <div class="returns-timeline">
                <div class="rt-item"><div class="rt-dot"></div><div class="rt-title">Step 1 — Check Eligibility</div><div class="rt-desc">Items must be in original, unread condition with no signs of damage. Highlighted, cracked, or water-damaged books are not eligible.</div></div>
                <div class="rt-item"><div class="rt-dot"></div><div class="rt-title">Step 2 — Request a Return</div><div class="rt-desc">Contact us via the <a href="#" onclick="openSupport('contact');return false;" style="color:var(--accent)">Contact Us form</a> or email returns@readora.ph with your order number and reason.</div></div>
                <div class="rt-item"><div class="rt-dot"></div><div class="rt-title">Step 3 — Ship the Item</div><div class="rt-desc">We'll send you a return authorisation within 2 business days with a prepaid shipping label (for defective/damaged items) or instructions for standard returns.</div></div>
                <div class="rt-item"><div class="rt-dot"></div><div class="rt-title">Step 4 — Refund Processed</div><div class="rt-desc">Once received and inspected, your refund will be issued within 5–7 business days to your original payment method. GCash and Maya refunds may appear sooner.</div></div>
              </div>
              <p style="font-size:.8rem;color:var(--text-muted);margin-top:1rem;">Questions? Email <a href="mailto:returns@readora.ph" style="color:var(--accent)">returns@readora.ph</a></p>`,
};
function openSupport(page) {
  const overlay = document.getElementById("support-overlay");
  const holder = document.getElementById("support-content");
  if (!overlay || !holder) {
    window.location.href =
      pathToStore() + "index.html?support=" + encodeURIComponent(page);
    return;
  }
  holder.innerHTML = SUPPORT_CONTENT[page] || "";
  overlay.classList.add("open");
  if (typeof setLanguage === 'function' && typeof getCurrentLang === 'function') setLanguage(getCurrentLang());
}
function closeSupport() {
  document.getElementById("support-overlay")?.classList.remove("open");
}
function toggleFaq(btn) {
  const ans = btn.nextElementSibling;
  const isOpen = ans.classList.contains("open");
  // close all
  document
    .querySelectorAll(".faq-a")
    .forEach((a) => a.classList.remove("open"));
  document
    .querySelectorAll(".faq-q span")
    .forEach((s) => (s.textContent = "+"));
  if (!isOpen) {
    ans.classList.add("open");
    btn.querySelector("span").textContent = "−";
  }
}
function submitContact() {
  const fn = document.getElementById("cf-fn")?.value;
  const email = document.getElementById("cf-email")?.value;
  const msg = document.getElementById("cf-msg")?.value;
  if (!fn || !email || !email.includes("@") || !msg) {
    showToast("Please fill in all required fields.");
    return;
  }
  document.getElementById("contact-form-wrap").style.display = "none";
  document.getElementById("contact-success").classList.add("show");
}
function trackOrder() {
  const val = document.getElementById("track-input").value.trim();
  if (!val) {
    showToast("Please enter an order number.");
    return;
  }
  document.getElementById("tr-id").textContent = val;
  document.getElementById("track-result").style.display = "block";
}

/* ═══ UPDATE toggleWish to sync with wishlist ═══ */
function toggleWish(btn) {
  // Phase 1: Gate behind login
  if (!state.isLoggedIn && localStorage.getItem("ra-user-mode") !== "guest") {
    showLoginGate(null);
    return;
  }
  const id = parseInt(btn.id.replace("w", ""));
  btn.classList.toggle("wished");
  const isWished = btn.classList.contains("wished");
  btn.innerHTML = isWished
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  btn.setAttribute(
    "aria-label",
    isWished ? "Remove from wishlist" : "Add to wishlist",
  );
  const p = products.find((x) => x.id === id);
  const idx = wishlist.findIndex((x) => x.id === id);
  if (isWished && idx === -1) {
    wishlist.push({ ...p });
  } else if (!isWished && idx > -1) {
    wishlist.splice(idx, 1);
  }
  saveWishlist();
  renderWishlist();
  showToast(isWished ? "♥ Added to wishlist!" : "Removed from wishlist");
}

/* ═══ MEGA MENU (Phase 2: 300ms hover-intent delay) ═══ */
const statNavItem = document.getElementById("stat-nav-item");
const megaMenu = document.getElementById("mega-menu");
let _megaLeaveTimer = null;
if (statNavItem) {
  statNavItem.addEventListener("mouseenter", () => {
    clearTimeout(_megaLeaveTimer);
    megaMenu.classList.add("open");
  });
  statNavItem.addEventListener("mouseleave", () => {
    _megaLeaveTimer = setTimeout(() => megaMenu.classList.remove("open"), 300);
  });
  megaMenu.addEventListener("mouseenter", () => clearTimeout(_megaLeaveTimer));
  megaMenu.addEventListener("mouseleave", () => {
    _megaLeaveTimer = setTimeout(() => megaMenu.classList.remove("open"), 300);
  });
}

/* ═══ STATIONERY PAGE ═══ */
function openStationery() {
  document.getElementById("stationery-page").classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeStationery() {
  document.getElementById("stationery-page").classList.remove("open");
  document.body.style.overflow = "";
}

/* ═══ RECENTLY VIEWED ═══ */
// recentlyViewed → managed by centralized state (see STATE MANAGER block above)
function pushRecentlyViewed(id) {
  const updated = [id, ...state.recentlyViewed.filter((x) => x !== id)].slice(
    0,
    10,
  );
  setState({ recentlyViewed: updated });
  renderRecentlyViewed();
}
function renderRecentlyViewed() {
  const ids = recentlyViewed.filter((id) => products.find((p) => p.id === id));
  const section = document.getElementById("recently-viewed-section");
  const scroll = document.getElementById("recently-viewed-scroll");
  if (!section || !scroll || ids.length < 2) {
    if (section) section.style.display = "none";
    return;
  }
  section.style.display = "block";
  scroll.innerHTML = ids
    .map((id) => {
      const p = products.find((x) => x.id === id);
      const img = coverImages[id] || BOOK_PLACEHOLDER;
      return `
        <div class="rec-card" onclick="openQV(${p.id})" style="cursor:pointer">
          <div class="rec-cover"><img src="${img}" alt="${p.title}" loading="lazy" onerror="this.src='${BOOK_PLACEHOLDER}'" /></div>
          <div class="rec-info">
            <div class="rec-title">${p.title}</div>
            <div class="rec-price">₱${p.price.toLocaleString()}</div>
          </div>
        </div>`;
    })
    .join("");
}

/* ═══ QUICK VIEW MODAL ═══ */
const BOOK_DESCS = {
  default:
    "A beautifully crafted story that pulls you in from the very first page. This title has captivated readers around the world with its vivid characters, rich world-building, and unforgettable prose. A must-have for any reader's collection.",
};
const BOOK_REVIEWS = [
  {
    stars: 5,
    text: "Absolutely gripping — couldn't put it down. Finished the whole thing in one sitting.",
    name: "Maria S.",
  },
  {
    stars: 5,
    text: "One of the best books I've read this year. The characters felt so real and the ending left me speechless.",
    name: "James R.",
  },
  {
    stars: 4,
    text: "Great read overall. The middle slows down a little but the payoff at the end is completely worth it.",
    name: "Aisha C.",
  },
  {
    stars: 3,
    text: "Decent story but not quite what I expected from the synopsis. Some characters felt underdeveloped.",
    name: "Rico D.",
  },
  {
    stars: 5,
    text: "A masterpiece of storytelling. Bought copies for my entire family — everyone needs to read this.",
    name: "Dr. Lea F.",
  },
  {
    stars: 5,
    text: "Changed the way I see the world. I keep coming back to reread certain chapters.",
    name: "Paulo M.",
  },
  {
    stars: 4,
    text: "Beautiful, lyrical writing. Some chapters felt slow but overall worth every peso spent.",
    name: "Sofia T.",
  },
  {
    stars: 5,
    text: "I laughed, cried, and stayed up until 3am. The prose is stunning from start to finish.",
    name: "Trisha B.",
  },
  {
    stars: 4,
    text: "Solid, immersive story. The world-building is incredible and the characters grew on me by the end.",
    name: "Carl N.",
  },
  {
    stars: 5,
    text: "My all-time favourite book. I reread it every year — it gets better every time.",
    name: "Elena G.",
  },
  {
    stars: 3,
    text: "Interesting concept and strong opening chapters, but the pacing drags in the second half.",
    name: "Marco V.",
  },
  {
    stars: 5,
    text: "Every reader needs this on their shelf. The kind of book that genuinely changes your perspective.",
    name: "Dana P.",
  },
  {
    stars: 4,
    text: "The plot twists kept me guessing right up to the last page. Highly recommend for thriller fans.",
    name: "Angelo B.",
  },
  {
    stars: 5,
    text: "Vivid, unforgettable characters. I still think about this book weeks after finishing it.",
    name: "Camille R.",
  },
  {
    stars: 4,
    text: "Beautifully written. The author has a gift for making you feel every emotion the protagonist feels.",
    name: "Nico T.",
  },
];
/* ── Product metadata (pages, year) — separate lookup to avoid touching product objects ── */
const PRODUCT_META = {
  1: { pages: 288, year: 2020 },
  2: { pages: 320, year: 2018 },
  3: { pages: 412, year: 1965 },
  4: { pages: 662, year: 2007 },
  5: { pages: 422, year: 2012 },
  6: { pages: 443, year: 2011 },
  7: { pages: 197, year: 1988 },
  8: { pages: 476, year: 2021 },
  9: { pages: 336, year: 1997 },
  10: { pages: 288, year: 2016 },
  11: { pages: 517, year: 2023 },
  12: { pages: 256, year: 2020 },
  13: { pages: 419, year: 2015 },
  14: { pages: 352, year: 2018 },
  15: { pages: 193, year: 1979 },
  16: { pages: 336, year: 1960 },
  17: { pages: 328, year: 1949 },
  18: { pages: 180, year: 1925 },
  19: { pages: 352, year: 1985 },
  20: { pages: 310, year: 1937 },
  21: { pages: 272, year: 1939 },
  22: { pages: 233, year: 1937 },
  23: { pages: 214, year: 1996 },
  24: { pages: 432, year: 1813 },
  30: { pages: 192, year: 2018 },
  31: { pages: 192, year: 2016 },
  32: { pages: 216, year: 1997 },
  33: { pages: 192, year: 2009 },
  34: { pages: 192, year: 2014 },
  35: { pages: 276, year: 2016 },
  36: { pages: 312, year: 2010 },
  37: { pages: 176, year: 2015 },
  38: { pages: 198, year: 2014 },
  39: { pages: 368, year: 2014 },
  40: { pages: 304, year: 2018 },
  41: { pages: 272, year: 2019 },
  42: { pages: 240, year: 2023 },
  43: { pages: 148, year: 2024 },
  44: { pages: null, year: 2022 },
  45: { pages: 416, year: 2015 },
  46: { pages: 640, year: 2016 },
  47: { pages: 720, year: 2017 },
  48: { pages: 229, year: 2018 },
  49: { pages: 768, year: 2021 },
  50: { pages: 694, year: 1996 },
  51: { pages: 768, year: 1999 },
  52: { pages: 973, year: 2000 },
  53: { pages: 753, year: 2005 },
  54: { pages: 1040, year: 2011 },
  55: { pages: 223, year: 1997 },
  56: { pages: 251, year: 1998 },
  57: { pages: 317, year: 1999 },
  58: { pages: 636, year: 2000 },
  59: { pages: 766, year: 2003 },
  60: { pages: 607, year: 2005 },
  61: { pages: 607, year: 2007 },
  62: { pages: 198, year: 2024 },
  100: { pages: null, year: 2024 },
  101: { pages: null, year: 2023 },
  102: { pages: null, year: 2024 },
  103: { pages: null, year: 2024 },
  104: { pages: null, year: 2024 },
  64: { pages: 412, year: 1965 },
  65: { pages: 310, year: 1937 },
};

function openQV(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  pushRecentlyViewed(id);

  const spinnerWrap = document.getElementById("qv-spinner-wrap");
  if (spinnerWrap) {
    spinnerWrap.style.display = "flex";
    spinnerWrap.style.opacity = "1";
    spinnerWrap.classList.remove("fade-out");
    document.getElementById("qv-cover").style.opacity = "0";
    document.querySelector(".qv-body").style.opacity = "0";
  }
  document.getElementById("qv-img").src = coverImages[id] || BOOK_PLACEHOLDER;
  document.getElementById("qv-img").alt = p.title;
  document.getElementById("qv-cat").textContent = p.cat;
  const catEl = document.getElementById("qv-cat");
  catEl.style.cursor = "pointer";
  catEl.title = `Browse all ${p.cat} books`;
  catEl.onclick = () => {
    closeQV();
    const tabs = document.querySelectorAll(".filter-tab");
    const match = Array.from(tabs).find((t) =>
      t.textContent.trim().toLowerCase().includes(p.cat.toLowerCase()),
    );
    if (match) {
      match.click();
    } else {
      runFullSearch(p.cat);
    }
    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };
  const badgeEl = document.getElementById("qv-badge");
  if (badgeEl) {
    if (p.tag === "bestseller") {
      badgeEl.textContent = "🏆 Bestseller";
      badgeEl.style.display = "inline-block";
    } else if (p.tag === "new") {
      badgeEl.textContent = "✨ New Arrival";
      badgeEl.style.display = "inline-block";
    } else if (p.tag === "sale") {
      badgeEl.textContent = "🏷️ On Sale";
      badgeEl.style.display = "inline-block";
    } else {
      badgeEl.style.display = "none";
    }
  }
  document.getElementById("qv-title").textContent = p.title;
  document.getElementById("qv-author").textContent = "by " + p.author;

  // Render Stock Badge
  let badgeStockEl = document.getElementById("qv-stock-badge");
  if (!badgeStockEl) {
    badgeStockEl = document.createElement("div");
    badgeStockEl.id = "qv-stock-badge";
    badgeStockEl.style.fontSize = "0.75rem";
    badgeStockEl.style.fontWeight = "600";
    badgeStockEl.style.padding = "0.2rem 0.5rem";
    badgeStockEl.style.borderRadius = "4px";
    badgeStockEl.style.marginTop = "0.5rem";
    badgeStockEl.style.marginBottom = "0.5rem";
    badgeStockEl.style.display = "inline-block";
    const titleParent = document.getElementById("qv-title").parentNode;
    titleParent.insertBefore(badgeStockEl, document.getElementById("qv-title").nextSibling);
  }
  if (p.stock !== undefined) {
    if (p.stock <= 0) {
      badgeStockEl.textContent = "Out of Stock";
      badgeStockEl.style.backgroundColor = "var(--bg-secondary)";
      badgeStockEl.style.color = "var(--text-muted)";
    } else if (p.lowStock || p.stock <= 5) {
      badgeStockEl.textContent = `Only ${p.stock} left in stock!`;
      badgeStockEl.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
      badgeStockEl.style.color = "#dc3545";
    } else {
      badgeStockEl.textContent = "In Stock";
      badgeStockEl.style.backgroundColor = "rgba(40, 167, 69, 0.1)";
      badgeStockEl.style.color = "#28a745";
    }
    badgeStockEl.style.display = "inline-block";
  } else {
    badgeStockEl.style.display = "none";
  }

  const stars = renderStars(p.stars);
  document.getElementById("qv-stars").innerHTML =
    `<span class="qv-star-wrap">${stars}</span> <span style="font-size:.78rem;color:var(--text-muted)">${p.reviews.toLocaleString()} reviews</span>`;
  // Phase 2C — under-cover star rating
  const coverRating = document.getElementById("qv-cover-rating");
  if (coverRating) {
    coverRating.innerHTML = `<div class="star-row">${renderStars(p.stars)}</div><span class="rating-number">${p.stars.toFixed(1)}</span><span class="rating-count">${p.reviews.toLocaleString()} ratings</span>`;
  }
  document.getElementById("qv-desc").textContent = p.desc || BOOK_DESCS.default;
  document.getElementById("qv-price").textContent =
    "\u20b1" + p.price.toLocaleString();
  const oldEl = document.getElementById("qv-old");
  const saveEl = document.getElementById("qv-save");
  if (p.old && p.old > p.price) {
    oldEl.textContent = "\u20b1" + p.old.toLocaleString();
    const saved = p.old - p.price;
    const pct = Math.round((saved / p.old) * 100);
    if (saveEl)
      saveEl.textContent = `Save \u20b1${saved.toLocaleString()} (${pct}% off)`;
  } else {
    oldEl.textContent = "";
    if (saveEl) saveEl.textContent = "";
  }
  // reset formats
  document
    .querySelectorAll(".qv-fmt-btn")
    .forEach((b, i) => b.classList.toggle("active", i === 0));

  /* ── Dynamic stock status (seeded by product id for consistency) ── */
  const stockEl = document.getElementById("qv-stock");
  if (stockEl) {
    const stockStates = [
      {
        icon: "\u2713",
        msg: "In Stock \u2014 Usually ships in 2\u20133 days",
        cls: "stock-ok",
      },
      {
        icon: "\u2713",
        msg: "In Stock \u2014 Usually ships in 1\u20132 days",
        cls: "stock-ok",
      },
      {
        icon: "\u2713",
        msg: "In Stock \u2014 Ships same day before 3PM",
        cls: "stock-ok",
      },
      {
        icon: "!",
        msg: "Only 3 left in stock \u2014 order soon",
        cls: "stock-low",
      },
      { icon: "!", msg: "Only 5 left \u2014 popular item", cls: "stock-low" },
      {
        icon: "\u2713",
        msg: "In Stock \u2014 Free shipping on orders \u20b1799+",
        cls: "stock-ok",
      },
    ];
    const state = stockStates[id % stockStates.length];
    stockEl.className = `qv-stock ${state.cls}`;
    stockEl.innerHTML = `<span class="stock-icon">${state.icon}</span> ${state.msg}`;
  }

  /* ── Quantity selector setup ── */
  let _qvQty = 1;
  const qtyVal = document.getElementById("qv-qty-val");
  const qtyMinus = document.getElementById("qv-qty-minus");
  const qtyPlus = document.getElementById("qv-qty-plus");
  function _updateQty(n) {
    _qvQty = Math.max(1, Math.min(99, n));
    qtyVal.textContent = _qvQty;
    qtyMinus.disabled = _qvQty <= 1;
    qtyPlus.disabled = _qvQty >= 99;
  }
  _updateQty(1);
  qtyMinus.onclick = (e) => {
    e.stopPropagation();
    _updateQty(_qvQty - 1);
  };
  qtyPlus.onclick = (e) => {
    e.stopPropagation();
    _updateQty(_qvQty + 1);
  };

  // actions
  const addBtn = document.getElementById("qv-add-btn");
  if (p.stock !== undefined && p.stock <= 0) {
    addBtn.disabled = true;
    addBtn.textContent = "Out of Stock";
    addBtn.onclick = null;
  } else {
    addBtn.disabled = false;
    addBtn.innerHTML = `Add to Cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    addBtn.onclick = () => {
      for (let i = 0; i < _qvQty; i++) addToCart(id);
      const label =
        _qvQty > 1
          ? `${_qvQty}\u00d7 "${p.title}" added`
          : `"${p.title}" added to cart`;
      showToast(label);
      _updateQty(1);
    };
  }
  // Legacy mock reviews removed to prevent null innerHTML error
  // Phase 6: Testimonials scroll row — deterministic per product
  const testiPicks = seededPick(BOOK_REVIEWS, id * 7, 5);
  document.getElementById("qv-testi-scroll").innerHTML = testiPicks
    .map(
      (r) => `
        <div class="qv-testi-card">
            <div class="qv-testi-stars">${renderStars(r.stars)}</div>
            <div class="qv-testi-text">"${r.text}"</div>
            <div class="qv-testi-name">\u2014 ${r.name}</div>
        </div>`,
    )
    .join("");
  const isWished = wishlist.some((w) => w.id === id);
  const wishBtn = document.getElementById("qv-wish-btn");
  wishBtn.onclick = () => {
    toggleWishlistItem(id);
    const now = wishlist.some((w) => w.id === id);
    wishBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="${now ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${now ? "Wishlisted" : "Wishlist"}`;
    showToast(now ? "\u2665 Added to wishlist!" : "Removed from wishlist");
  };
  wishBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="${isWished ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ${isWished ? "Wishlisted" : "Wishlist"}`;

  /* ── Details table (Fix 4D) ── */
  const meta = PRODUCT_META[id] || {};
  const pagesEl = document.getElementById("qv-pages");
  const yearEl = document.getElementById("qv-year");
  const genreEl = document.getElementById("qv-genre");
  if (pagesEl)
    pagesEl.textContent = meta.pages
      ? meta.pages.toLocaleString() + " pp."
      : "\u2014";
  if (yearEl) yearEl.textContent = meta.year ? meta.year : "\u2014";
  if (genreEl) genreEl.textContent = p.cat || "\u2014";

  /* ── Share button ── */
  const shareBtn = document.getElementById("qv-share-btn");
  if (shareBtn) {
    shareBtn.onclick = (e) => {
      e.stopPropagation();
      const url = `${location.origin}${location.pathname}?book=${id}`;
      navigator.clipboard
        .writeText(url)
        .then(() => showToast("Link copied! Share with a friend."))
        .catch(() => showToast("readora.ph/book/" + id + " \u2014 copied!"));
    };
  }

  /* ── You Might Also Like ── */
  const alsoRow = document.getElementById("qv-also-row");
  if (alsoRow) {
    const related = products
      .filter((x) => x.id !== id && x.cat === p.cat && coverImages[x.id])
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 4);
    if (related.length >= 2) {
      alsoRow.innerHTML = related
        .map(
          (x) => `
                <div class="qv-also-card" onclick="openQV(${x.id})" role="button"
                     tabindex="0" aria-label="View ${escapeHtml(x.title)}"
                     onkeydown="if(event.key==='Enter'||event.key===' ')openQV(${x.id})">
                    <img class="qv-also-img" src="${coverImages[x.id]}" alt="${escapeHtml(x.title)}" loading="lazy" onerror="this.src='${BOOK_PLACEHOLDER}'" />
                    <div class="qv-also-info">
                        <div class="qv-also-name">${escapeHtml(x.title)}</div>
                        <div class="qv-also-price">\u20b1${x.price.toLocaleString()}</div>
                    </div>
                </div>`,
        )
        .join("");
      document.getElementById("qv-also-like").style.display = "block";
    } else {
      document.getElementById("qv-also-like").style.display = "none";
    }
  }

  document.getElementById("qv-overlay").classList.add("open");
  document.body.style.overflow = "hidden";

  if (spinnerWrap) {
    setTimeout(() => {
      spinnerWrap.classList.add("fade-out");
      const cover = document.getElementById("qv-cover");
      const body = document.querySelector(".qv-body");
      if (cover) { cover.style.opacity = ""; cover.classList.add("fade-in"); }
      if (body) { body.style.opacity = ""; body.classList.add("fade-in"); }

      setTimeout(() => {
        spinnerWrap.style.display = "none";
        if (cover) cover.classList.remove("fade-in");
        if (body) body.classList.remove("fade-in");
      }, 300);
    }, 350);
  }

  /* Phase 3: Show sticky buy bar on mobile */
  if (window.innerWidth <= 768) {
    const bar = document.getElementById("sticky-buy-bar");
    if (bar) {
      document.getElementById("sticky-buy-price-val").textContent =
        "\u20b1" + p.price.toLocaleString();
      const stickyBuyBtn = document.getElementById("sticky-buy-cart-btn");
      if (p.stock !== undefined && p.stock <= 0) {
        stickyBuyBtn.disabled = true;
        stickyBuyBtn.textContent = "Out of Stock";
        stickyBuyBtn.onclick = null;
      } else {
        stickyBuyBtn.disabled = false;
        stickyBuyBtn.textContent = "Add to Cart";
        stickyBuyBtn.onclick = () => {
          addToCart(id);
          showToast(`"${p.title}" added to cart`);
        };
      }
      document.getElementById("sticky-buy-wish-btn").onclick = () => {
        toggleWishlistItem(id);
        showToast("\u2665 Wishlist updated!");
      };
      bar.classList.add("visible");
    }
  }
  // ── TABS ──────────────────────────────────────────────────────────────
  const tabsSection = document.getElementById("qv-tabs-section");
  if (tabsSection) {
    // Overview tab — Goodreads-style rich layout
    const seriesLabel = getSeriesLabel(p);
    const genreTags = getGenreTags(p);
    const bookDetails = getBookDetails(p);
    const detSeed = id * 1103515245 + 12345;
    const readingCount = Math.floor(
      p.reviews * 0.6 + (Math.abs(detSeed) % 501),
    ).toLocaleString();
    const wantToRead = Math.floor(
      p.reviews * 2.1 + (Math.abs(detSeed * 7) % 1001),
    ).toLocaleString();
    document.getElementById("qv-tab-overview").innerHTML = `
            ${seriesLabel ? `<p class="qv-ov-series">${seriesLabel}</p>` : ""}
            <div class="qv-ov-desc">
                <p>${p.desc || "No description available."}</p>
            </div>
            <div class="qv-ov-genres">
                <span class="qv-ov-genres-label">Genres</span>
                ${genreTags.map((g) => `<span class="qv-ov-tag">${g}</span>`).join("")}
            </div>
            <div class="qv-ov-pub">
                <p>${bookDetails.pages} pages, Paperback</p>
                <p>First published ${bookDetails.pubDate}</p>
            </div>
            <div class="qv-ov-stats">
                <div class="qv-ov-stat">
                    <span class="qv-ov-stat-icon">🔥</span>
                    <span><strong>${readingCount}</strong> currently reading</span>
                </div>
                <div class="qv-ov-stat">
                    <span class="qv-ov-stat-icon">📚</span>
                    <span><strong>${wantToRead}</strong> want to read</span>
                </div>
            </div>
        `;
    // Specifications tab
    const specs = buildSpecsHTML(p);
    document.getElementById("qv-tab-specs").innerHTML = specs;
    // Reviews tab — reuse existing BOOK_REVIEWS pool
    const shuffled = seededPick(BOOK_REVIEWS, id * 31, 3);
    document.getElementById("qv-tab-reviews").innerHTML = shuffled
      .map(
        (r) => `
            <div class="qv-review-item">
                <div class="qv-review-stars">${"\u2605".repeat(r.stars)}${"\u2606".repeat(5 - r.stars)}</div>
                <p class="qv-review-text">"${r.text}"</p>
                <p class="qv-review-name">\u2014 ${r.name}</p>
            </div>`,
      )
      .join("");
    // Reset tab state: activate first tab
    document.querySelectorAll(".qv-tab-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === 0);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    });
    document.querySelectorAll(".qv-tab-panel").forEach((panel, i) => {
      i === 0
        ? panel.removeAttribute("hidden")
        : panel.setAttribute("hidden", "");
    });
  }
}

/** Unwrapped quick-view implementation (before window.openQV gains a11y + review hooks). */
const _openQVCore = openQV;

function closeQV() {
  document.getElementById("qv-overlay").classList.remove("open");
  document.body.style.overflow = "";
  /* Phase 3: Hide sticky buy bar */
  document.getElementById("sticky-buy-bar")?.classList.remove("visible");
}

/* ═══ PHASE 4C: BESTSELLER HERO GALLERY ═══ */
function renderBestsellerHero() {
  const grid = document.getElementById("bh-grid");
  if (!grid) return;
  const premiumBooks = products.filter((p) => p.isBestseller === true);
  grid.innerHTML = premiumBooks
    .map((p) => {
      const imgSrc = coverImages[p.id] || BOOK_PLACEHOLDER;
      const priceDisplay = p.discountPrice
        ? `<span class="bh-currency">$</span><span class="bh-price">${p.discountPrice.toFixed(2)}</span>`
        : `<span class="bh-price">₱${p.price}</span>`;
      return `
            <article class="bh-card" onclick="openQV(${p.id})" role="button" tabindex="0"
                     aria-label="View details for ${p.title.replace(/"/g, "&quot;")}">
                <div class="bh-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Best Seller
                </div>
                <img class="bh-cover" src="${imgSrc}" alt="${p.title}" loading="lazy"
                     onerror="this.src=BOOK_PLACEHOLDER">
                <div class="bh-info">
                    <p class="bh-title">${p.title}</p>
                    <p class="bh-author">${p.author}</p>
                    <div class="bh-price-module">${priceDisplay}</div>
                </div>
            </article>`;
    })
    .join("");
}

/* ═══ PHASE 4: OVERVIEW TAB HELPERS ═══ */
function getSeriesLabel(p) {
  if (p.id >= 45 && p.id <= 49)
    return `A Court of Thorns and Roses #${p.id - 44}`;
  if (p.id >= 50 && p.id <= 54) return `A Song of Ice and Fire #${p.id - 49}`;
  if (p.id >= 55 && p.id <= 61) return `Harry Potter #${p.id - 54}`;
  if (p.id === 64) return "Dune Chronicles #1";
  return null;
}

function getGenreTags(p) {
  const base = [p.cat];
  if (p.id >= 45 && p.id <= 49)
    return ["Fantasy", "Romance", "Romantasy", "Fae", "Adult"];
  if (p.id >= 50 && p.id <= 54)
    return ["Fantasy", "Epic Fantasy", "Political", "Dark Fantasy", "Adult"];
  if (p.id >= 55 && p.id <= 61)
    return ["Fantasy", "Young Adult", "Magic", "Adventure", "Coming of Age"];
  if (p.id === 64)
    return [
      "Science Fiction",
      "Dystopia",
      "Politics",
      "Classics",
      "Space Opera",
    ];
  if (p.id === 65)
    return ["Fantasy", "Adventure", "Classics", "Children's", "Quest"];
  const tagMap = {
    Fiction: ["Fiction", "Literary Fiction", "Classics"],
    "Sci-Fi": ["Science Fiction", "Dystopia", "Speculative"],
    Fantasy: ["Fantasy", "Adventure", "Epic"],
    Mystery: ["Mystery", "Thriller", "Suspense"],
    "Self-Help": ["Self-Help", "Personal Growth", "Motivation"],
    Business: ["Business", "Finance", "Non-Fiction"],
    History: ["History", "Non-Fiction", "Science"],
    Romance: ["Romance", "Contemporary", "Love Story"],
    Manga: ["Manga", "Comics", "Japanese"],
    Manhwa: ["Manhwa", "Comics", "Korean"],
    Wattpad: ["Wattpad", "Romance", "Filipino"],
  };
  return tagMap[p.cat] || base;
}

function getBookDetails(p) {
  const pageMap = {
    45: { pages: 416, pubDate: "March 5, 2015" },
    46: { pages: 640, pubDate: "May 3, 2016" },
    47: { pages: 720, pubDate: "May 2, 2017" },
    48: { pages: 229, pubDate: "May 1, 2018" },
    49: { pages: 768, pubDate: "February 16, 2021" },
    50: { pages: 694, pubDate: "August 1, 1996" },
    51: { pages: 768, pubDate: "February 2, 1999" },
    52: { pages: 973, pubDate: "November 8, 2000" },
    53: { pages: 753, pubDate: "November 8, 2005" },
    54: { pages: 1040, pubDate: "July 12, 2011" },
    55: { pages: 223, pubDate: "June 26, 1997" },
    56: { pages: 251, pubDate: "July 2, 1998" },
    57: { pages: 317, pubDate: "July 8, 1999" },
    58: { pages: 636, pubDate: "July 8, 2000" },
    59: { pages: 766, pubDate: "June 21, 2003" },
    60: { pages: 607, pubDate: "July 16, 2005" },
    61: { pages: 607, pubDate: "July 21, 2007" },
    62: { pages: 198, pubDate: "2024" },
    64: { pages: 688, pubDate: "August 1, 1965" },
    65: { pages: 310, pubDate: "September 21, 1937" },
  };
  if (pageMap[p.id]) return pageMap[p.id];
  const genericPages = 250 + Math.floor(p.title.length * 8 + p.reviews * 0.01);
  return {
    pages: Math.min(genericPages, 650),
    pubDate: p.tag === "new" ? "2023" : "2020",
  };
}

/* ═══ PHASE 4E: SERIES-SPECIFIC SPECIFICATIONS ═══ */
function buildSpecsHTML(p) {
  const isACOTAR = p.id >= 45 && p.id <= 49;
  const isASOIAF = p.id >= 50 && p.id <= 54;
  const isHP = p.id >= 55 && p.id <= 61;
  const isDune = p.id === 64;
  const isHobbit = p.id === 65;
  let rows = [];
  rows.push(["Author", p.author]);
  rows.push(["Category", p.cat]);
  rows.push(["Format", "Paperback / Hardcover / E-Book"]);
  rows.push(["Language", "English"]);
  if (isACOTAR) {
    rows.push(["Genre", "Romantasy"]);
    rows.push(["Publisher", "Bloomsbury Publishing"]);
    rows.push(["Series", "A Court of Thorns and Roses"]);
    rows.push(["Book #", (p.id - 44).toString()]);
    rows.push(["Content Advisory", "Mature themes — recommended for 18+"]);
  }
  if (isASOIAF) {
    rows.push(["Genre", "Epic Fantasy"]);
    rows.push(["Publisher", "Bantam Books"]);
    rows.push(["Series", "A Song of Ice and Fire"]);
    rows.push(["Book #", (p.id - 49).toString()]);
    rows.push(["Maps Included", "Yes"]);
    rows.push(["Content Advisory", "Mature themes — recommended for 17+"]);
  }
  if (isHP) {
    const hpNum = p.id - 54;
    rows.push(["Genre", "Young Adult Fantasy"]);
    rows.push(["Publisher", "Bloomsbury (UK) / Scholastic (US)"]);
    rows.push(["Series", "Harry Potter"]);
    rows.push(["Book #", hpNum.toString()]);
  }
  if (isDune) {
    rows.push(["Genre", "Science Fiction"]);
    rows.push(["Publisher", "Chilton Books / Ace Books"]);
    rows.push(["Series", "Dune Chronicles — Book 1"]);
    rows.push(["Awards", "Hugo Award, Nebula Award"]);
  }
  if (isHobbit) {
    rows.push(["Genre", "High Fantasy / Children's"]);
    rows.push(["Publisher", "George Allen & Unwin"]);
    rows.push(["Universe", "Middle-earth"]);
    rows.push(["Note", "Prequel to The Lord of the Rings"]);
  }
  if (!isACOTAR && !isASOIAF && !isHP && !isDune && !isHobbit) {
    rows.push(["Genre", p.cat]);
    if (p.tag === "bestseller")
      rows.push(["Recognition", "International Bestseller"]);
    if (p.old) rows.push(["Original Price", `₱${p.old}`]);
  }
  const tableRows = rows
    .map(([key, val]) => `<tr><th>${key}</th><td>${val}</td></tr>`)
    .join("");
  return `<table class="qv-spec-table" aria-label="Book specifications"><tbody>${tableRows}</tbody></table>`;
}

/* ═══ PHASE 4D: TAB CLICK DELEGATION ═══ */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".qv-tab-btn");
  if (!btn) return;
  if (!document.getElementById("qv-overlay")?.classList.contains("open"))
    return;
  const targetTab = btn.dataset.tab;
  document.querySelectorAll(".qv-tab-btn").forEach((b) => {
    b.classList.toggle("active", b === btn);
    b.setAttribute("aria-selected", b === btn ? "true" : "false");
  });
  document.querySelectorAll(".qv-tab-panel").forEach((panel) => {
    panel.id === `qv-tab-${targetTab}`
      ? panel.removeAttribute("hidden")
      : panel.setAttribute("hidden", "");
  });
});

/* ═══════════════════════════════════════
   PHASE 5 — ACCESSIBILITY (a11y)

   ① Escape key closes any open modal/drawer/overlay
   ② Focus trapping inside modals
   ③ Product-grid keyboard navigation (Tab + Enter/Space)
   ④ ARIA live regions for dynamic cart/filter updates
   ⑤ Skip-to-content already in HTML — wired here
═══════════════════════════════════════ */

/* 5A: Global Escape-key handler */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  /* QV modal */
  if (document.getElementById("qv-overlay")?.classList.contains("open")) {
    closeQV();
    return;
  }
  /* Cart drawer */
  if (document.getElementById("cart-drawer")?.classList.contains("open")) {
    toggleCart();
    return;
  }
  /* Wishlist drawer */
  if (document.getElementById("wishlist-drawer")?.classList.contains("open")) {
    toggleWishlist();
    return;
  }
  /* Auth / checkout modal */
  if (document.getElementById("modal-overlay")?.classList.contains("open")) {
    closeModal();
    return;
  }
  /* Settings modal */
  if (document.getElementById("settings-overlay")?.classList.contains("open")) {
    closeSettings();
    return;
  }
  /* Support modal */
  if (document.getElementById("support-overlay")?.classList.contains("open")) {
    closeSupport();
    return;
  }
  /* Stationery page */
  if (document.getElementById("stationery-page")?.classList.contains("open")) {
    closeStationery();
    return;
  }
  /* Mobile menu */
  if (document.getElementById("mob-menu")?.classList.contains("open")) {
    closeMenu();
    return;
  }
  /* Search dropdowns */
  document.getElementById("dsd")?.classList.remove("open");
  document.getElementById("msd")?.classList.remove("open");
  /* Adv filters panel on mobile */
  if (document.getElementById("adv-filter-panel")?.classList.contains("open")) {
    toggleAdvFilter();
  }
});

/* 5B: Focus trap — keep keyboard focus inside an open modal */
function trapFocus(modalEl) {
  const focusable = modalEl.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  modalEl._trapHandler = (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  modalEl.addEventListener("keydown", modalEl._trapHandler);
  /* Auto-focus first focusable */
  requestAnimationFrame(() => first.focus());
}
function releaseFocus(modalEl) {
  if (modalEl._trapHandler) {
    modalEl.removeEventListener("keydown", modalEl._trapHandler);
    delete modalEl._trapHandler;
  }
}

/* Focus trapping: quick-view uses merged window.openQV below (see wireOpenQVWithReviews). */
const _origCloseQV = closeQV;
window.closeQV = function () {
  releaseFocus(document.getElementById("qv-modal"));
  _origCloseQV();
};

/* Wire focus trapping onto cart drawer */
const _origToggleCart = toggleCart;
window.toggleCart = function () {
  _origToggleCart();
  const drawer = document.getElementById("cart-drawer");
  if (drawer.classList.contains("open")) trapFocus(drawer);
  else releaseFocus(drawer);
};

/* Wire focus trapping onto auth/checkout modal */
const _origOpenModal = openModal;
window.openModal = function (tab) {
  _origOpenModal(tab);
  trapFocus(document.getElementById("modal"));
};
const _origCloseModal = closeModal;
window.closeModal = function () {
  releaseFocus(document.getElementById("modal"));
  _origCloseModal();
};

/* 5C: Product-grid keyboard navigation
   Tab moves between cards; Enter/Space triggers quick-view */
(function setupProductGridKeys() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.addEventListener("keydown", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const idMatch = card
        .querySelector('[onclick*="openQV"]')
        ?.getAttribute("onclick")
        ?.match(/openQV\((\d+)\)/);
      if (idMatch) openQV(parseInt(idMatch[1]));
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = card.nextElementSibling;
      if (next && next.classList.contains("product-card")) next.focus();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = card.previousElementSibling;
      if (prev && prev.classList.contains("product-card")) prev.focus();
    }
  });
})();

/* 5D: Make product cards focusable and add visible focus ring */
(function makeCardsFocusable() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  const observer = new MutationObserver(() => {
    grid.querySelectorAll(".product-card:not([tabindex])").forEach((card) => {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
    });
  });
  observer.observe(grid, { childList: true, subtree: false });
  /* Also run immediately for first render */
  grid.querySelectorAll(".product-card:not([tabindex])").forEach((card) => {
    card.setAttribute("tabindex", "0");
  });
})();

/* 5E: Announce cart changes to screen readers via live region */
(function setupA11yLiveRegion() {
  const liveEl = document.createElement("div");
  liveEl.id = "a11y-live";
  liveEl.setAttribute("aria-live", "polite");
  liveEl.setAttribute("aria-atomic", "true");
  liveEl.className = "sr-only";
  document.body.appendChild(liveEl);
})();

function announceA11y(msg) {
  const el = document.getElementById("a11y-live");
  if (!el) return;
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = msg;
  });
}

/* Patch addToCart to announce */
const _origAddToCart = addToCart;
window.addToCart = function (id, fromWishlist) {
  _origAddToCart(id, fromWishlist);
  const p = products.find((x) => x.id === id);
  if (p)
    announceA11y(
      `${p.title} added to cart. Cart now has ${cart.reduce((s, c) => s + c.qty, 0)} items.`,
    );
};

/* ═══ SEARCH ENTER KEY → delegate to runFullSearch ═══ */
document.getElementById("dsi").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const q = e.target.value.trim();
    if (!q) return;
    runFullSearch(q);
  }
});

/* ═══ MOCK USER LOGIN ═══ */
// mockUser → managed by centralized state (see STATE MANAGER block above)
function mockLogin(name, email) {
  const user = {
    name,
    email,
    initials: name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
  };
  setState({ user, isLoggedIn: true });
  document.getElementById("auth-btns").style.display = "none";
  document.getElementById("user-btn-wrap").style.display = "block";
  document.getElementById("user-avatar-btn").textContent = user.initials;
  document.getElementById("ud-name").textContent = user.name;
  document.getElementById("ud-email").textContent = user.email;
  // Reset the sub message colour
  const sub = document.getElementById("modal-sub");
  if (sub) {
    sub.textContent = "Sign in to access your library and orders.";
    sub.style.color = "";
  }
}
window.mockLogout = async function mockLogout() {
  try {
    await auth.signOut();
    localStorage.removeItem("ra-user-mode");
    setState({
      user: null,
      isLoggedIn: false,
      giftCardBalance: 0,
      discount: 0,
      activePromo: null,
      cart: [],
      wishlist: []
    });
    document.getElementById("auth-btns").style.display = "flex";
    document.getElementById("user-btn-wrap").style.display = "none";
    document.getElementById("user-dropdown").classList.remove("open");
    showToast("Logged out. See you again!");
  } catch (error) {
    showToast("Error logging out: " + error.message);
  }
};
function toggleUserDD() {
  document.getElementById("user-dropdown")?.classList.toggle("open");
}
window.doLogin = async function doLogin() {
  if (!checkLoginRateLimit()) return;
  const emailEl = document.getElementById("le");
  const passEl = document.getElementById("lp");
  const btn = document.getElementById("login-btn");
  const errEl = document.getElementById("login-error");
  const email = emailEl.value.trim();
  const pass = passEl.value;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Clear previous errors
  emailEl.classList.remove("input-error");
  passEl.classList.remove("input-error");
  if (errEl) {
    errEl.textContent = "";
    errEl.classList.remove("visible");
  }

  // Validate
  let hasError = false;
  if (!email || !regex.test(email)) {
    emailEl.classList.add("input-error");
    hasError = true;
  }
  if (!pass || pass.length < 6) {
    passEl.classList.add("input-error");
    hasError = true;
  }
  if (hasError) {
    if (errEl) {
      errEl.textContent = "Invalid email or password";
      errEl.classList.add("visible");
    }
    recordFailedLogin();
    return;
  }

  // Loading state
  const origText = btn.textContent;
  btn.textContent = "Signing in...";
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    // Remember Me — save email to localStorage
    const rememberMe = document.getElementById("remember-me");
    if (rememberMe && rememberMe.checked) {
      localStorage.setItem("ra-remember-email", email);
    } else {
      localStorage.removeItem("ra-remember-email");
    }
    // NEW-06: Reset rate-limit counter on successful login
    _loginAttempts.count = 0;
    _loginAttempts.lockedUntil = 0;
    closeModal();
    showToast("Welcome back! 👋");
    if (_pendingCartId !== null) {
      setTimeout(() => {
        addToCart(_pendingCartId);
        _pendingCartId = null;
      }, 300);
    }
  } catch (error) {
    if (errEl) {
      errEl.textContent = "Invalid email or password";
      errEl.classList.add("visible");
    }
    recordFailedLogin();
  } finally {
    btn.textContent = origText;
    btn.classList.remove("loading");
    btn.disabled = false;
  }
};

/* Clear login error states when user types */
function clearLoginErrors() {
  document.getElementById("le")?.classList.remove("input-error");
  document.getElementById("lp")?.classList.remove("input-error");
  const errEl = document.getElementById("login-error");
  if (errEl) {
    errEl.textContent = "";
    errEl.classList.remove("visible");
  }
}

/* Forgot Password handler */
function showForgotPassword() {
  const emailEl = document.getElementById("le");
  const email = emailEl?.value.trim() || "";
  const container = document.getElementById("login-error");
  if (container) {
    const emailHint = email ? ` to <strong>${escapeHtml(email)}</strong>` : "";
    container.innerHTML = `<div class="forgot-pw-msg">📧 A password reset link has been sent${emailHint}. Please check your inbox (this is a demo — no email is actually sent).</div>`;
    container.classList.add("visible");
    container.style.color = "var(--text-primary)";
  }
}

/* Restore remembered email on page load */
(function restoreRememberedEmail() {
  const saved = localStorage.getItem("ra-remember-email");
  if (saved) {
    const el = document.getElementById("le");
    if (el) el.value = saved;
    const cb = document.getElementById("remember-me");
    if (cb) cb.checked = true;
  }
})();
window.doSignup = async function doSignup() {
  const nameEl = document.getElementById("sn");
  const emailEl = document.getElementById("se");
  const passEl = document.getElementById("sp");
  const btn = document.getElementById("signup-btn");
  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const pass = passEl.value;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Clear previous error highlights
  nameEl.classList.remove("input-error");
  emailEl.classList.remove("input-error");
  passEl.classList.remove("input-error");

  // Validate with red borders
  let hasError = false;
  if (!name) {
    nameEl.classList.add("input-error");
    hasError = true;
  }
  if (!email || !regex.test(email)) {
    emailEl.classList.add("input-error");
    hasError = true;
  }
  if (!pass || pass.length < 6) {
    passEl.classList.add("input-error");
    hasError = true;
  }
  if (hasError) {
    showToast("Please fill in all required fields correctly.");
    return;
  }

  // Loading state
  const origText = btn.textContent;
  btn.textContent = "Creating account...";
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      pass,
    );
    const user = userCredential.user;

    // Save user to Firestore (merge: true prevents overwriting existing data if sync fired first)
    await db.collection("users").doc(user.uid).set({
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
    }, { merge: true });

    closeModal();
    showToast(`Account created! Welcome, ${name.split(" ")[0]}! 🎉`);
    if (_pendingCartId !== null) {
      setTimeout(() => {
        addToCart(_pendingCartId);
        _pendingCartId = null;
      }, 300);
    }
  } catch (error) {
    showToast(error.message);
  } finally {
    btn.textContent = origText;
    btn.classList.remove("loading");
    btn.disabled = false;
  }
};

// Google Sign-in Handler
window.doGoogleLogin = async function doGoogleLogin() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const isNewUser = result.additionalUserInfo?.isNewUser;

    // Save basic info to Firestore (merge: true prevents overwriting existing data)
    await db
      .collection("users")
      .doc(user.uid)
      .set(
        {
          name: user.displayName || "Google User",
          email: user.email,
          createdAt: user.metadata?.creationTime || new Date().toISOString(),
        },
        { merge: true },
      );

    closeModal();
    if (isNewUser) {
      const firstName = (user.displayName || "Google User").split(" ")[0];
      showToast(`Account created! Welcome, ${firstName}! 🎉`);
    } else {
      showToast("Welcome back! 👋");
    }

    if (_pendingCartId !== null) {
      setTimeout(() => {
        addToCart(_pendingCartId);
        _pendingCartId = null;
      }, 300);
    }
  } catch (error) {
    showToast("Google Sign-In Error: " + error.message);
  }
};

// Attach event listener for Google sign-in buttons dynamically
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".google-signin-btn").forEach((btn) => {
    btn.removeAttribute("onclick");
    btn.addEventListener("click", window.doGoogleLogin);
  });
});

// NOTE: Duplicate auth.onAuthStateChanged listener removed.
// All auth UI + review-form prefill is handled by the primary listener above.
document.addEventListener("click", (e) => {
  if (!e.target.closest("#user-btn-wrap")) {
    document.getElementById("user-dropdown")?.classList.remove("open");
  }
});

/* ═══ RECOMMENDED SECTION ═══ */
function renderRecommended(basedOnId) {
  const scroll = document.getElementById("rec-scroll");
  if (!scroll) return;

  // Pick source: if we have a book to base on, use same-cat + high-stars;
  // otherwise fall back to top-rated books across all categories.
  let pool;
  if (basedOnId) {
    const base = products.find((x) => x.id === basedOnId);
    pool = base
      ? products.filter(
        (p) => p.id !== basedOnId && (p.cat === base.cat || p.stars >= 4),
      )
      : products.filter((p) => p.stars >= 4);
  } else {
    // Default: mix of bestsellers + high-rated, shuffled slightly for variety
    pool = products
      .filter(
        (p) =>
          p.cat !== "Stationery" && (p.tag === "bestseller" || p.stars >= 4),
      )
      .sort(
        (a, b) => b.stars * 1000 + b.reviews - (a.stars * 1000 + a.reviews),
      );
  }

  const rec = pool.slice(0, 12);
  scroll.innerHTML = rec
    .map(
      (p) => `
        <div class="rec-card" onclick="openQV(${p.id})" role="button" tabindex="0"
             aria-label="View ${p.title}">
            <div class="rec-cover">
                <img src="${coverImages[p.id] || BOOK_PLACEHOLDER}" alt="${p.title}"
                     loading="lazy" onerror="this.src='${BOOK_PLACEHOLDER}'" />
            </div>
            <div class="rec-info">
                <div class="rec-title">${escapeHtml(p.title)}</div>
                <div class="rec-author" style="font-size:.7rem;color:var(--text-muted);margin-bottom:.2rem">${escapeHtml(p.author)}</div>
                <div class="rec-price">&#8369;${p.price.toLocaleString()}</div>
            </div>
        </div>`,
    )
    .join("");
}

// Legacy alias kept so any existing openQV call to showRecommended still works
function showRecommended(basedOnId) {
  renderRecommended(basedOnId);
}

/* ═══ INIT ═══ */
async function initApp() {
  if (document.getElementById("products-grid")) renderProducts("all");

  // Fetch live stock from Firestore
  try {
    const snap = await db.collection("books").get();
    snap.forEach(doc => {
      const data = doc.data();
      const p = products.find(x => x.id.toString() === doc.id);
      if (p) {
        p.stock = data.stock;
        p.lowStock = data.lowStock;
      }
    });
  } catch (e) {
    console.error("Error fetching live stock:", e);
  }

  renderCart();
  renderWishlist();
  renderRecentlyViewed();
  renderRecommended();
  fetchSiteReviews();
}

initApp();

/* ═══ DEEP-LINK: ?book=ID ═══
   Opens the Quick-View for the given book ID from a shared URL.
   Runs after initApp() so the products grid and UI are ready. */
(function handleBookDeepLink() {
  const qs = new URLSearchParams(location.search);
  const bookId = qs.get("book");
  if (!bookId) return;
  const id = parseInt(bookId, 10);
  if (isNaN(id)) return;
  history.replaceState({}, "", location.pathname);
  /* Guard: products array must be populated before calling openQV */
  if (products && products.length > 0) {
    setTimeout(() => openQV(id), 150); // slight delay so DOM is fully painted
  }
})();

/* ═══════════════════════════════════════
   WRITE-A-REVIEW FORM
═══════════════════════════════════════ */
var selectedRating = 0; // global so setReviewRating, submitReview, and hover all share it
var _wrStarLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent!"];

(function () {
  // Char counter
  const textarea = document.getElementById("wr-comment");
  const charEl = document.getElementById("wr-char");
  if (textarea && charEl) {
    textarea.addEventListener("input", () => {
      charEl.textContent = textarea.value.length + " / 400";
    });
  }

  // Star hover effects — reads/writes the global selectedRating
  const starsWrap = document.getElementById("wr-stars");
  if (starsWrap) {
    const starBtns = starsWrap.querySelectorAll(".wr-star");
    starBtns.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        const v = +btn.dataset.val;
        starBtns.forEach((s) => s.classList.toggle("lit", +s.dataset.val <= v));
        const lbl = document.getElementById("wr-star-label");
        if (lbl) lbl.textContent = _wrStarLabels[v];
      });
      btn.addEventListener("mouseleave", () => {
        starBtns.forEach((s) =>
          s.classList.toggle("lit", +s.dataset.val <= selectedRating),
        );
        const lbl = document.getElementById("wr-star-label");
        if (lbl)
          lbl.textContent =
            selectedRating > 0 ? _wrStarLabels[selectedRating] : "Tap to rate";
      });
    });
  }
})();

function setReviewRating(val) {
  selectedRating = val;
  const starsWrap = document.getElementById("wr-stars");
  if (!starsWrap) return;
  starsWrap.querySelectorAll(".wr-star").forEach((s) => {
    s.classList.toggle("lit", +s.dataset.val <= val);
  });
  const lbl = document.getElementById("wr-star-label");
  if (lbl) lbl.textContent = _wrStarLabels[val] || "";
}

async function submitReview() {
  const name = (document.getElementById("wr-name").value || "").trim();
  const comment = (document.getElementById("wr-comment").value || "").trim();

  if (!name) {
    showToast("Please enter your name.");
    return;
  }
  if (selectedRating === 0) {
    showToast("Please select a star rating.");
    return;
  }
  if (comment.length < 10) {
    showToast("Please write at least 10 characters.");
    return;
  }

  const btn = document.querySelector(".wr-submit");
  if (btn) btn.disabled = true;

  try {
    const docRef = await db.collection("siteReviews").add({
      name: name,
      rating: selectedRating,
      comment: comment,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Reset
    document.getElementById("wr-comment").value = "";
    document.getElementById("wr-char").textContent = "0 / 400";
    selectedRating = 0;
    document
      .getElementById("wr-stars")
      .querySelectorAll(".wr-star")
      .forEach((s) => s.classList.remove("lit"));
    const lbl = document.getElementById("wr-star-label");
    if (lbl) lbl.textContent = "Tap to rate";

    showToast("Review posted — thank you! ✓");
    fetchSiteReviews();
  } catch (error) {
    showToast("Error posting review: " + error.message);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function fetchSiteReviews() {
  const container = document.getElementById("wr-submitted");
  if (!container) return;

  try {
    const snap = await db.collection("siteReviews")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    let html = "";
    snap.forEach(doc => {
      const data = doc.data();
      const stars = renderStars(data.rating || 5);
      const dateStr = data.createdAt
        ? new Date(data.createdAt.toDate()).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
        : "Just now";

      const dicebearUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=c0392b`;

      html += `
        <div class="wr-review-item" style="display:flex; gap:1rem; align-items:flex-start;">
            <img src="${dicebearUrl}" alt="${escapeHtml(data.name)}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; flex-shrink:0;">
            <div style="flex:1;">
                <div class="wr-item-top">
                    <span class="wr-item-name">${escapeHtml(data.name)}</span>
                    <span class="wr-item-stars" style="color:#c0830a">${stars}</span>
                </div>
                <div class="wr-item-text">"${escapeHtml(data.comment)}"</div>
                <div class="wr-item-date">${dateStr}</div>
            </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (error) {
    console.error("Error fetching site reviews:", error);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ═══ CAROUSEL: resume auto-scroll after touch ends ═══ */
(function () {
  const carousel = document.getElementById("testi-carousel");
  if (!carousel) return;
  let autoTimer;
  let currentIndex = 0;

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      const cards = carousel.querySelectorAll(".testi-card");
      const next = (currentIndex + 1) % cards.length;
      const card = cards[next];
      if (card) {
        carousel.scrollTo({
          left: card.offsetLeft - carousel.offsetLeft,
          behavior: "smooth",
        });
        currentIndex = next;
      }
    }, 6000);
  }

  carousel.addEventListener(
    "touchend",
    () => {
      setTimeout(restartAuto, 1200); // restart auto-play 1.2s after touch lifts
    },
    { passive: true },
  );
})();

/* ═══════════════════════════════════════
   MOBILE MENU: re-position on resize/scroll
   (keeps menu below nav even after promo
   banner is dismissed)
═══════════════════════════════════════ */
window.addEventListener(
  "resize",
  () => {
    const m = document.getElementById("mob-menu");
    if (m && m.classList.contains("open")) {
      const nav = document.querySelector("nav");
      if (nav) {
        const navBottom = nav.getBoundingClientRect().bottom;
        m.style.top = navBottom + "px";
        m.style.maxHeight = "calc(100dvh - " + navBottom + "px)";
      }
    }
  },
  { passive: true },
);

/* ═══════════════════════════════════════
   READING PROGRESS BAR
   — thin accent-coloured bar at the very
   top that fills as the user scrolls
═══════════════════════════════════════ */
(function () {
  const bar = document.createElement("div");
  bar.id = "read-progress";
  bar.style.cssText = [
    "position:fixed",
    "top:0",
    "left:0",
    "height:3px",
    "background:var(--accent)",
    "width:0%",
    "z-index:9999",
    "transition:width .1s linear",
    "pointer-events:none",
    "border-radius:0 2px 2px 0",
  ].join(";");
  document.body.prepend(bar);

  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + "%";
    },
    { passive: true },
  );
})();

/* ═══════════════════════════════════════
   RECENTLY SEARCHED CHIPS
   — stores last 5 searches in localStorage
   and shows them as quick-tap chips under
   the mobile search bar
═══════════════════════════════════════ */
(function () {
  const MOB_INPUT = document.getElementById("msi");
  if (!MOB_INPUT) return;

  const STORAGE_KEY = "ra-recent-searches";
  let recents = [];
  try {
    recents = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    recents = [];
  }

  function saveSearch(term) {
    if (!term || term.length < 2) return;
    recents = [
      term,
      ...recents.filter((r) => r.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 5);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
    } catch (e) { }
    renderChips();
  }

  function renderChips() {
    let wrap = document.getElementById("mob-recent-chips");
    if (!recents.length) {
      if (wrap) wrap.remove();
      return;
    }
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "mob-recent-chips";
      wrap.style.cssText =
        "display:flex;flex-wrap:wrap;gap:.4rem;padding:.4rem 0 .1rem;";
      MOB_INPUT.closest(".mob-search-wrap")?.after(wrap);
    }
    wrap.innerHTML =
      '<span style="font-size:.68rem;color:var(--text-muted);width:100%;letter-spacing:.5px;text-transform:uppercase;font-weight:700;">Recent</span>' +
      recents
        .map(
          (r) =>
            `<button onclick="document.getElementById('msi').value='${escapeHtml(r)}';document.getElementById('msi').dispatchEvent(new Event('input'))" style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:100px;padding:.22rem .72rem;font-size:.75rem;color:var(--text-muted);cursor:pointer;font-family:'DM Sans',sans-serif;">${escapeHtml(r)}</button>`,
        )
        .join("");
  }

  MOB_INPUT.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveSearch(MOB_INPUT.value.trim());
  });

  renderChips();
})();

/* ═══════════════════════════════════════
   HERO CTA SCROLL INDICATOR
   — small animated chevron that appears
   at the bottom of the hero section and
   disappears once user scrolls past it
═══════════════════════════════════════ */
(function () {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const chevron = document.createElement("button");
  chevron.id = "hero-scroll-cue";
  chevron.setAttribute("aria-label", "Scroll down");
  chevron.onclick = () => {
    document
      .getElementById("categories")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  chevron.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  chevron.style.cssText = [
    "position:absolute",
    "bottom:1.6rem",
    "left:50%",
    "transform:translateX(-50%)",
    "background:rgba(255,255,255,.12)",
    "border:1px solid rgba(255,255,255,.25)",
    "border-radius:50%",
    "width:40px",
    "height:40px",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "cursor:pointer",
    "z-index:2",
    "animation:bobDown 1.6s ease-in-out infinite",
    "transition:opacity .3s",
    "backdrop-filter:blur(6px)",
  ].join(";");

  // Inject keyframe
  if (!document.getElementById("hero-cue-kf")) {
    const s = document.createElement("style");
    s.id = "hero-cue-kf";
    s.textContent =
      "@keyframes bobDown{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(5px)}}";
    document.head.appendChild(s);
  }

  // Make hero position:relative if needed
  if (getComputedStyle(hero).position === "static")
    hero.style.position = "relative";
  hero.appendChild(chevron);

  // Hide once user scrolls past hero
  const obs = new IntersectionObserver(
    ([e]) => {
      chevron.style.opacity = e.isIntersecting ? "1" : "0";
      chevron.style.pointerEvents = e.isIntersecting ? "" : "none";
    },
    { threshold: 0.3 },
  );
  obs.observe(hero);
})();

/* ═══════════════════════════════════════
   NEWSLETTER: press Enter to subscribe
═══════════════════════════════════════ */
document.getElementById("nl-email")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") subscribe();
});

/* ═══════════════════════════════════════
   LIVE VISITOR COUNT (simulated, no backend)
   — shows a subtle "X people browsing now"
   badge in the hero that updates every ~12s
═══════════════════════════════════════ */
(function () {
  const heroStats = document.querySelector(".hero-stats");
  if (!heroStats) return;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  let count = rand(18, 47);

  const stat = document.createElement("div");
  stat.className = "stat";
  stat.innerHTML = `<span class="stat-num" id="live-count">${count}</span><span class="stat-label stat-label-pillcaps" style="display:flex;align-items:center;gap:.3rem"><span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse-green 1.8s ease-in-out infinite"></span>online</span>`;
  heroStats.appendChild(stat);

  if (!document.getElementById("pulse-kf")) {
    const s = document.createElement("style");
    s.id = "pulse-kf";
    s.textContent =
      "@keyframes pulse-green{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.75)}}";
    document.head.appendChild(s);
  }

  setInterval(() => {
    count += rand(-3, 5);
    count = Math.max(8, Math.min(count, 99));
    const el = document.getElementById("live-count");
    if (el) el.textContent = count;
  }, 12000);
})();

/* ═══════════════════════════════════════════════════
   PHASE 4 — SWIPE-TO-CLOSE  (Cart & Wishlist drawers)

   Rules:
   • Only fires on a LEFT → RIGHT swipe of > 100 px
   • Horizontal delta must be ≥ 1.5× vertical delta so
     normal vertical scrolling never triggers the close
   • Works on real touch devices AND Chrome DevTools
     "Toggle Device Toolbar" simulation
═══════════════════════════════════════════════════ */
function _attachSwipeToClose(drawerEl, closeFn) {
  let startX = 0;
  let startY = 0;

  drawerEl.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true },
  );

  drawerEl.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX; // positive = rightward
      const dy = Math.abs(e.changedTouches[0].clientY - startY);

      // Must be a rightward swipe > 100px AND more horizontal than vertical
      if (dx > 100 && dx > dy * 1.5) {
        closeFn();
      }
    },
    { passive: true },
  );
}

// Wire up once the DOM is ready (drawers already exist in HTML)
_attachSwipeToClose(document.getElementById("cart-drawer"), () => {
  if (document.getElementById("cart-drawer").classList.contains("open"))
    toggleCart();
});
_attachSwipeToClose(document.getElementById("wishlist-drawer"), () => {
  if (document.getElementById("wishlist-drawer").classList.contains("open"))
    toggleWishlist();
});

/* ═══════════════════════════════════════════════════
   PHASE 4 — SWIPE DOWN TO CLOSE (Filter Drawer Bottom Sheet)
═══════════════════════════════════════════════════ */
function _attachSwipeDownToClose(drawerEl, closeFn) {
  if (!drawerEl) return;
  let startY = 0;
  let startX = 0;
  let isDragging = false;

  drawerEl.addEventListener(
    "touchstart",
    (e) => {
      // Only register swipe if we are at the top of the scroll container
      if (drawerEl.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isDragging = true;
        drawerEl.style.transition = "none"; // Remove transition for smooth tracking
        drawerEl.style.animation = "none"; // Disable CSS animation override
      } else {
        isDragging = false;
      }
    },
    { passive: true },
  );

  drawerEl.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const dy = e.touches[0].clientY - startY;
      const dx = Math.abs(e.touches[0].clientX - startX);

      // If swiping horizontally or scrolling up, ignore
      if (dx > dy * 1.5 || dy < 0) return;

      // Translate the drawer down visually
      drawerEl.style.transform = `translateY(${dy}px)`;
    },
    { passive: true },
  );

  drawerEl.addEventListener(
    "touchend",
    (e) => {
      if (!isDragging) return;
      isDragging = false;
      const dy = e.changedTouches[0].clientY - startY; // positive = downward
      const dx = Math.abs(e.changedTouches[0].clientX - startX);

      drawerEl.style.transition =
        "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"; // Restore transition

      // Must be a downward swipe > 80px AND more vertical than horizontal
      if (dy > 80 && dy > dx * 1.5) {
        drawerEl.style.transform = ""; // Clear inline style
        closeFn();
      } else {
        drawerEl.style.transform = "translateY(0)"; // Snap back up
        setTimeout(() => {
          drawerEl.style.transform = "";
          drawerEl.style.animation = "";
        }, 300);
      }
    },
    { passive: true },
  );
}

// Wire up filter panel
_attachSwipeDownToClose(document.getElementById("adv-filter-panel"), () => {
  if (document.getElementById("adv-filter-panel").classList.contains("open"))
    toggleAdvFilter();
});

/* ════════════════════════════════════════════
   PHASE 3 — HOVER QUICK VIEW (HQV) ENGINE
   Desktop-only tooltip on product card hover
════════════════════════════════════════════ */
(function initHQV() {
  const panel = document.getElementById("hqv-panel");
  if (!panel) return; // guard
  const isTouchDevice = () =>
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  let hqvTimer = null;
  let currentId = null;

  function showHQV(card, productId) {
    if (isTouchDevice() || window.innerWidth <= 768) return;
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    currentId = productId;

    const img = coverImages[p.id] || BOOK_PLACEHOLDER;
    document.getElementById("hqv-img").src = img;
    document.getElementById("hqv-img").alt = p.title;
    document.getElementById("hqv-cat").textContent = p.cat;
    document.getElementById("hqv-title").textContent = p.title;
    document.getElementById("hqv-author").textContent = "by " + p.author;
    document.getElementById("hqv-stars").innerHTML =
      renderStars(p.stars) + ` <span>${p.stars.toFixed(1)}</span>`;
    document.getElementById("hqv-desc").textContent =
      (p.desc || "").slice(0, 120) + (p.desc && p.desc.length > 120 ? "…" : "");
    document.getElementById("hqv-price").textContent =
      "₱" + p.price.toLocaleString();
    document.getElementById("hqv-cart-btn").onclick = (e) => {
      e.stopPropagation();
      addToCart(productId);
      showToast(`"${p.title}" added to cart`);
    };

    // Position
    const rect = card.getBoundingClientRect();
    let top = rect.top + window.scrollY - 10;
    let left = rect.right + 12;
    // If overflows right, show on left
    if (left + 290 > window.innerWidth) {
      left = rect.left - 290 - 12;
    }
    // If overflows top, push down
    if (top < window.scrollY + 10) top = window.scrollY + 10;

    panel.style.top = top + "px";
    panel.style.left = left + "px";
    panel.classList.add("visible");
    panel.setAttribute("aria-hidden", "false");
  }

  function hideHQV() {
    currentId = null;
    panel.classList.remove("visible");
    panel.setAttribute("aria-hidden", "true");
  }

  // Event delegation on the product grid
  document.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const wrap = card.querySelector(".book-3d-wrap");
    if (!wrap) return;
    const onclick = wrap.getAttribute("onclick") || "";
    const idMatch = onclick.match(/openQV\((\d+)\)/);
    if (!idMatch) return;
    const pid = parseInt(idMatch[1], 10);
    if (pid === currentId) return; // already showing
    clearTimeout(hqvTimer);
    hqvTimer = setTimeout(() => showHQV(card, pid), 350);
  });

  document.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".product-card");
    if (!card && !e.target.closest(".hqv-panel")) {
      clearTimeout(hqvTimer);
      hqvTimer = setTimeout(hideHQV, 200);
    }
  });

  // Keep panel visible when hovering the panel itself
  panel.addEventListener("mouseenter", () => clearTimeout(hqvTimer));
  panel.addEventListener("mouseleave", () => {
    hqvTimer = setTimeout(hideHQV, 200);
  });
})();

/* ════════════════════════════════════════════════════════════
   OVERHAUL PT2 — ANIMATION ENGINES
════════════════════════════════════════════════════════════ */

/* Anim-1 — Mobile product-card reveal (desktop uses top-of-file initScrollReveal) */
(function initMobileProductCardReveal() {
  /* Mobile gets a simpler, faster version of scroll reveal */
  if (window.innerWidth < 769) {
    const mobileObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            mobileObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );

    document.querySelectorAll(".product-card").forEach((card) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(12px)";
      card.style.transition = "opacity .3s ease, transform .3s ease";
      mobileObs.observe(card);
    });

    // Also observe newly loaded cards
    const grid = document.getElementById("products-grid");
    if (grid) {
      new MutationObserver(() => {
        grid.querySelectorAll(".product-card").forEach((card) => {
          if (!card.dataset.mobObserved) {
            card.style.opacity = "0";
            card.style.transform = "translateY(12px)";
            card.style.transition = "opacity .3s ease, transform .3s ease";
            mobileObs.observe(card);
            card.dataset.mobObserved = "1";
          }
        });
      }).observe(grid, { childList: true });
    }
    return; // skip the desktop observer below
  }
})();
// duplicate observer removed for performance

/* Anim-2 — Hero elements above the fold: reveal immediately */
document.addEventListener("DOMContentLoaded", () => {
  if (window.innerWidth < 769) return;
  setTimeout(() => {
    document.querySelectorAll("#home .sr-hidden").forEach((el) => {
      el.classList.add("sr-visible");
    });
  }, 80);
});

/* Anim-5 — Navbar scroll shadow */
(function initNavScroll() {
  const nav = document.querySelector("nav");
  if (!nav || window.innerWidth < 769) return;
  const toggle = () =>
    nav.classList.toggle("nav-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
})();

/* Anim-7 — Filter fade wrapper (desktop only) */
function setFilterWithFade(el, filter) {
  if (window.innerWidth < 769) {
    setFilter(el, filter);
    return;
  }
  const grid = document.getElementById("products-grid");
  if (!grid) return;
  grid.style.transition = "opacity .15s ease";
  grid.style.opacity = "0";
  setTimeout(() => {
    setFilter(el, filter);
    grid.style.opacity = "1";
  }, 150);
}

/* Anim-8 — Button Ripple Engine */
(function initRipple() {
  if (window.innerWidth < 769) return;
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(
      ".add-cart-btn, .checkout-btn, .btn-primary, .load-more-btn, .filter-tab",
    );
    if (!btn) return;
    const wave = document.createElement("span");
    wave.className = "ripple-wave";
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    Object.assign(wave.style, {
      width: size + "px",
      height: size + "px",
      left: e.clientX - r.left - size / 2 + "px",
      top: e.clientY - r.top - size / 2 + "px",
      position: "absolute",
      borderRadius: "50%",
      background: "rgba(255,255,255,.30)",
      transform: "scale(0)",
      pointerEvents: "none",
    });
    btn.style.position = "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(wave);
    wave.animate(
      [
        { transform: "scale(0)", opacity: 1 },
        { transform: "scale(3.5)", opacity: 0 },
      ],
      { duration: 500, easing: "cubic-bezier(0.22,1,0.36,1)" },
    ).onfinish = () => wave.remove();
  });
})();

/* ════════════════════════════════════════════════════════════
       SECURITY ENGINES
    ════════════════════════════════════════════════════════════ */

/* Sec-2 — Password Strength Indicator */
(function initPasswordStrength() {
  const pwdInput = document.getElementById("sp");
  if (!pwdInput) return;
  const wrap = document.getElementById("pwd-strength-wrap");
  const fill = document.getElementById("pwd-strength-fill");
  const label = document.getElementById("pwd-strength-label");

  const levels = [
    { max: 3, label: "Too short", color: "#e74c3c", width: "15%" },
    { max: 5, label: "Weak", color: "#e67e22", width: "35%" },
    { max: 7, label: "Fair", color: "#f1c40f", width: "60%" },
    { max: 11, label: "Good", color: "#2ecc71", width: "80%" },
    { max: 99, label: "Strong 💪", color: "#27ae60", width: "100%" },
  ];

  pwdInput.addEventListener("input", () => {
    const len = pwdInput.value.length;
    if (!len) {
      wrap.style.display = "none";
      return;
    }
    wrap.style.display = "block";
    const lvl = levels.find((l) => len <= l.max);
    fill.style.width = lvl.width;
    fill.style.background = lvl.color;
    label.textContent = lvl.label;
  });
})();

/* Sec-3 — Login Rate-Limit Simulation */
const _loginAttempts = { count: 0, lockedUntil: 0 };

function checkLoginRateLimit() {
  const now = Date.now();
  if (_loginAttempts.lockedUntil > now) {
    const secs = Math.ceil((_loginAttempts.lockedUntil - now) / 1000);
    showToast(`⛔ Too many attempts. Try again in ${secs}s.`);
    return false;
  }
  return true;
}

function recordFailedLogin() {
  _loginAttempts.count++;
  if (_loginAttempts.count < 5) return;
  _loginAttempts.lockedUntil = Date.now() + 30000;
  _loginAttempts.count = 0;
  const btn = document.getElementById("login-btn");
  if (!btn) return;
  btn.disabled = true;
  let secs = 30;
  btn.textContent = `Locked (${secs}s)`;
  const interval = setInterval(() => {
    secs--;
    if (secs <= 0) {
      clearInterval(interval);
      btn.disabled = false;
      btn.textContent = "Login to Account";
    } else {
      btn.textContent = `Locked (${secs}s)`;
    }
  }, 1000);
}

/* ═══════════════════════════════════════
       i18n — Language selector wiring (legacy translations.js)
    ═══════════════════════════════════════ */
// Restore saved language on page load
(function restoreLanguage() {
  const saved = localStorage.getItem("ra-lang") || "en";
  const sel = document.getElementById("lang-select");
  if (sel) sel.value = saved;
  if (saved && saved !== "en" && typeof setLanguage === "function") {
    setLanguage(saved);
  }
})();

/* ═══════════════════════════════════════
       QV (QUICKVIEW) — WRITE REVIEW FORM
    ═══════════════════════════════════════ */
let _qvCurrentRating = 0;
let _qvCurrentProductId = null;

async function renderQvUserReviews(productId) {
  const list = document.getElementById("qv-user-reviews");
  const breakdownWrap = document.getElementById("qv-rating-breakdown");
  if (!list) return;
  list.innerHTML = "<p style='font-size:0.8rem;color:var(--text-muted)'>Loading reviews...</p>";

  const stored = localStorage.getItem(`ra-book-reviews-${productId}`);
  let localReviews = [];
  try {
    if (stored) localReviews = JSON.parse(stored);
  } catch (e) { }

  let firestoreReviews = [];
  try {
    const snap = await db.collection("books").doc(productId.toString()).collection("reviews").get();
    snap.forEach(doc => firestoreReviews.push(doc.data()));
  } catch (e) {
    console.error("Error loading reviews from Firestore:", e);
  }

  const allReviews = [...firestoreReviews, ...localReviews].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (allReviews.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.9rem;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📝</div>
        No reviews yet. Be the first to review this book!
    </div>`;
    if (breakdownWrap) breakdownWrap.innerHTML = "";
    return;
  }

  // Calculate Breakdown
  const total = allReviews.length;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allReviews.forEach(r => counts[r.rating || 5]++);

  if (breakdownWrap) {
    let breakdownHtml = "";
    for (let i = 5; i >= 1; i--) {
      const pct = Math.round((counts[i] / total) * 100) || 0;
      breakdownHtml += `
            <div class="qv-rating-bar-row">
                <div style="width: 20px;">${i}★</div>
                <div class="qv-rating-bar-bg">
                    <div class="qv-rating-bar-fill" style="width: ${pct}%"></div>
                </div>
                <div style="width: 35px; text-align: right;">${pct}%</div>
            </div>`;
    }
    breakdownWrap.innerHTML = breakdownHtml;
  }

  // Determine Verified Buyers & Render Cards
  const renderPromises = allReviews.map(async (r) => {
    let isVerified = false;
    if (r.uid) {
      try {
        const ordersSnap = await db.collection("orders").where("uid", "==", r.uid).get();
        ordersSnap.forEach(doc => {
          const data = doc.data();
          if (data.items && data.items.some(i => String(i.id) === String(productId))) {
            isVerified = true;
          }
        });
      } catch (e) { console.error(e); }
    } else {
      // Fallback to legacy saved verified flag if no uid exists
      isVerified = !!r.verified;
    }

    const dateStr = r.date ? new Date(r.date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "Just now";
    const dicebearUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(r.name || 'Anonymous')}&backgroundColor=c0392b`;

    return `
      <div class="qv-user-review-item">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <img src="${dicebearUrl}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
              <div>
                  <div style="font-weight:700;font-size:.85rem; display:flex; align-items:center; gap:6px;">
                      ${escapeHtml(r.name || 'Anonymous')}
                      ${isVerified ? '<span style="font-size:0.65rem; background:rgba(39, 174, 96, 0.15); color:#27ae60; padding:2px 6px; border-radius:10px;">✓ Verified Buyer</span>' : ""}
                  </div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${dateStr}</div>
              </div>
          </div>
          <div class="qv-review-stars" style="margin-bottom:6px;">
              <span style="color:var(--star-orange);font-size:.85rem">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
          </div>
          <div style="font-size:.85rem;color:var(--text-primary);line-height:1.4">${escapeHtml(r.text)}</div>
      </div>
    `;
  });

  const resolvedHtmls = await Promise.all(renderPromises);
  list.innerHTML = resolvedHtmls.join("");
}

function setQvReviewRating(rating) {
  _qvCurrentRating = rating;
  document.querySelectorAll(".qv-wr-star").forEach((btn) => {
    const val = parseInt(btn.dataset.val);
    if (val <= rating) {
      btn.classList.add("active");
      btn.style.color = "var(--star-orange)";
    } else {
      btn.classList.remove("active");
      btn.style.color = "var(--border)";
    }
  });
  resetQvReviewRating(); // Update the label text to reflect the set rating
}

const QV_STAR_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Amazing"
};

function hoverQvReviewRating(rating) {
  const labelEl = document.getElementById("qv-wr-star-label");
  if (labelEl) labelEl.textContent = `${rating}★ ${QV_STAR_LABELS[rating]}`;
  document.querySelectorAll(".qv-wr-star").forEach((btn) => {
    const val = parseInt(btn.dataset.val);
    if (val <= rating) {
      btn.style.color = "var(--star-orange)";
    } else {
      btn.style.color = "var(--border)";
    }
  });
}

function resetQvReviewRating() {
  const labelEl = document.getElementById("qv-wr-star-label");
  if (labelEl) {
    labelEl.textContent = _qvCurrentRating ? `${_qvCurrentRating}★ ${QV_STAR_LABELS[_qvCurrentRating]}` : "";
  }
  document.querySelectorAll(".qv-wr-star").forEach((btn) => {
    const val = parseInt(btn.dataset.val);
    if (val <= _qvCurrentRating) {
      btn.style.color = "var(--star-orange)";
    } else {
      btn.style.color = "var(--border)";
    }
  });
}

// Character counter setup
document.addEventListener("input", (e) => {
  if (e.target && e.target.id === "qv-wr-text") {
    const charEl = document.getElementById("qv-wr-char");
    if (charEl) {
      const currentLen = e.target.value.length;
      charEl.textContent = `${currentLen} / 300`;
      if (300 - currentLen < 50) {
        charEl.style.color = "#C0392B";
      } else {
        charEl.style.color = "var(--text-muted)";
      }
    }
  }
});

async function submitQvReview() {
  if (!_qvCurrentProductId) return;
  if (_qvCurrentRating === 0) {
    showToast("Please select a rating");
    return;
  }
  const nameInput = document.getElementById("qv-wr-name");
  const textInput = document.getElementById("qv-wr-text");
  if (!nameInput || !textInput) return;

  const name = nameInput.value.trim() || "Anonymous";
  const text = textInput.value.trim();

  if (!text) {
    showToast("Please write a review");
    return;
  }

  const btn = document.getElementById("qv-wr-submit");
  if (btn) btn.disabled = true;

  const reviewData = {
    name: name,
    text: text,
    rating: _qvCurrentRating,
    verified: typeof state !== "undefined" && state.isLoggedIn,
    date: new Date().toISOString(),
  };

  if (state && state.isLoggedIn && state.user?.uid) {
    reviewData.uid = state.user.uid;
    try {
      await db.collection("books").doc(_qvCurrentProductId.toString()).collection("reviews").add(reviewData);
    } catch (e) {
      console.error("Error saving review:", e);
      showToast("Error saving review");
      if (btn) btn.disabled = false;
      return;
    }
  } else {
    const key = `ra-book-reviews-${_qvCurrentProductId}`;
    const stored = localStorage.getItem(key);
    let reviews = [];
    try {
      if (stored) reviews = JSON.parse(stored);
    } catch (e) { }
    reviews.push(reviewData);
    localStorage.setItem(key, JSON.stringify(reviews));
  }

  // Reset form
  textInput.value = "";
  setQvReviewRating(0);
  const charEl = document.getElementById("qv-wr-char");
  if (charEl) charEl.textContent = "0 / 300";
  if (btn) btn.disabled = false;

  showToast("Review submitted! Thank you.");

  // Re-render
  renderQvUserReviews(_qvCurrentProductId);
}

// Single wrapper: core QV + focus trap + per-book review form
let _qvTrigger = null; // A11Y-05: remember what triggered QV
window.openQV = function (id) {
  _qvTrigger = document.activeElement; // save focus origin
  _qvCurrentProductId = id;
  _qvCurrentRating = 0;
  _openQVCore(id);
  trapFocus(document.getElementById("qv-modal"));
  setTimeout(() => {
    setQvReviewRating(0);
    const nameInput = document.getElementById("qv-wr-name");
    if (
      nameInput &&
      typeof state !== "undefined" &&
      state.isLoggedIn &&
      state.user &&
      state.user.displayName
    ) {
      nameInput.value = state.user.displayName;
    }
    renderQvUserReviews(id);
  }, 50);
};

/* Extend closeQV to also restore focus — A11Y-05 */
const _baseCloseQV = window.closeQV;
window.closeQV = function () {
  _baseCloseQV();
  if (_qvTrigger && typeof _qvTrigger.focus === "function") {
    requestAnimationFrame(() => {
      _qvTrigger.focus();
      _qvTrigger = null;
    });
  }
};