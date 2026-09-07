const SUPABASE_URL =
  "https://blmpsybqewgbvmqjajmc.supabase.co";

const SUPABASE_ANON_KEY =
  "Sb_publishable_3q_HCgN5TEmaSjO6luPbwA_rXE6CLHx";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================================================
   HELPERS
========================================================= */

function getElement(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function showMessage(id, message, type = "") {
  const element = getElement(id);

  if (!element) {
    console.error("Missing message element:", id);
    return;
  }

  element.textContent = message;

  const classes = ["form-message", "show"];

  if (type) {
    classes.push(type);
  }

  element.className = classes.join(" ");
}


function clearMessage(id) {
  const element = getElement(id);

  if (!element) {
    return;
  }

  element.textContent = "";
  element.className = "form-message";
}


function formatPrice(price) {
  if (price === null || price === undefined || price === "") {
    return "Price unavailable";
  }

  const numericPrice = Number(
    String(price).replace(/[^0-9.-]/g, "")
  );

  if (Number.isFinite(numericPrice)) {
    return "₦" + numericPrice.toLocaleString("en-NG");
  }

  return escapeHTML(price);
}


function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase();
}


function getStatusClass(status) {
  const normalized = normalizeStatus(status);

  if (
    normalized === "pending" ||
    normalized === "approved" ||
    normalized === "rejected" ||
    normalized === "cancelled"
  ) {
    return "status-" + normalized;
  }

  return "";
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return escapeHTML(dateValue);
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}


async function getCurrentUser() {
  const {
    data,
    error
  } = await supabaseClient.auth.getUser();

  if (error) {
    console.error("Unable to get current user:", error);
    return null;
  }

  return data.user || null;
}


/* =========================================================
   REGISTER
========================================================= */

async function handleRegister(event) {
  event.preventDefault();

  const usernameElement =
    getElement("register-username");

  const emailElement =
    getElement("register-email");

  const passwordElement =
    getElement("register-password");

  const confirmElement =
    getElement("register-confirm-password");

  if (
    !usernameElement ||
    !emailElement ||
    !passwordElement ||
    !confirmElement
  ) {
    console.error("Registration form elements are missing.");
    return;
  }

  const username =
    usernameElement.value.trim();

  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;

  const confirmPassword =
    confirmElement.value;

  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    showMessage(
      "register-message",
      "Please complete every field.",
      "error"
    );
    return;
  }

  if (password.length < 6) {
    showMessage(
      "register-message",
      "Password must be at least 6 characters.",
      "error"
    );
    return;
  }

  if (password !== confirmPassword) {
    showMessage(
      "register-message",
      "Passwords do not match.",
      "error"
    );
    return;
  }

  showMessage(
    "register-message",
    "Creating your account..."
  );

  const {
    data,
    error
  } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: username
      }
    }
  });

  if (error) {
    console.error(
      "Supabase registration error:",
      error
    );

    showMessage(
      "register-message",
      error.message,
      "error"
    );

    return;
  }

  /*
     IMPORTANT:
     The existing registration architecture stores
     username in Supabase Auth metadata.

     We are NOT blindly inserting into profiles here
     because the actual INSERT policy / trigger has
     not yet been verified.
  */

  if (data.session) {
    showMessage(
      "register-message",
      "Account created successfully. Opening your account...",
      "success"
    );

    setTimeout(function () {
      window.location.href = "account.html";
    }, 700);

    return;
  }

  showMessage(
    "register-message",
    "Account created. Check your email to confirm your account.",
    "success"
  );
}


/* =========================================================
   LOGIN
========================================================= */

async function handleLogin(event) {
  event.preventDefault();

  const loginElement =
    getElement("login");

  const passwordElement =
    getElement("password");

  if (!loginElement || !passwordElement) {
    console.error("Login form elements are missing.");
    return;
  }

  const login =
    loginElement.value.trim();

  const password =
    passwordElement.value;

  if (!login || !password) {
    showMessage(
      "login-message",
      "Please enter your login details.",
      "error"
    );
    return;
  }

  showMessage(
    "login-message",
    "Logging in..."
  );

  let email = login;

  /*
     Email login
  */

  if (!login.includes("@")) {

    /*
       Username login depends on the existing
       get_login_email RPC.

       Its existence/signature has not been independently
       verified yet, so errors are handled safely.
    */

    const {
      data,
      error
    } = await supabaseClient.rpc(
      "get_login_email",
      {
        login_identifier: login
      }
    );

    if (error) {
      console.error(
        "Username lookup error:",
        error
      );

      showMessage(
        "login-message",
        "Username login is currently unavailable. Please try your email address.",
        "error"
      );

      return;
    }

    if (!data) {
      showMessage(
        "login-message",
        "Username not found.",
        "error"
      );

      return;
    }

    email = data;
  }

  const {
    error
  } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error(
      "Login error:",
      error
    );

    showMessage(
      "login-message",
      error.message,
      "error"
    );

    return;
  }

  showMessage(
    "login-message",
    "Login successful. Opening your account...",
    "success"
  );

  setTimeout(function () {
    window.location.href = "account.html";
  }, 700);
}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutPlayer(event) {
  if (event) {
    event.preventDefault();
  }

  try {
    await supabaseClient.auth.signOut();
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );
  }

  window.location.href = "login.html";
}


/* =========================================================
   AUTH GUARDS
========================================================= */

async function protectPage() {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return null;
  }

  return user;
}


/* =========================================================
   ACCOUNT
========================================================= */

async function loadAccountPage() {
  const accountUsername =
    getElement("account-username");

  const profileUsername =
    getElement("profile-username");

  const profileEmail =
    getElement("profile-email");

  /*
     If none of the account elements exist,
     this is not the account page.
  */

  if (
    !accountUsername &&
    !profileUsername &&
    !profileEmail &&
    !getElement("orders-list")
  ) {
    return;
  }

  const user = await protectPage();

  if (!user) {
    return;
  }

  if (profileEmail) {
    profileEmail.textContent =
      user.email || "";
  }

  /*
     First try profiles.
  */

  let profile = null;

  const {
    data: profileData,
    error: profileError
  } = await supabaseClient
    .from("profiles")
    .select("id, username, email, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Profile loading error:",
      profileError
    );
  } else {
    profile = profileData;
  }

  /*
     Player data may contain additional information
     such as display_name, level and gc_balance.
  */

  let player = null;

  const {
    data: playerData,
    error: playerError
  } = await supabaseClient
    .from("players")
    .select(
      "id, username, email, display_name, level, gc_balance, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (playerError) {
    console.error(
      "Player loading error:",
      playerError
    );
  } else {
    player = playerData;
  }

  const username =
    (profile && profile.username) ||
    (player && player.username) ||
    (user.user_metadata &&
      user.user_metadata.username) ||
    "Player";

  if (accountUsername) {
    accountUsername.textContent =
      username;
  }

  if (profileUsername) {
    profileUsername.textContent =
      username;
  }

  if (profileEmail) {
    profileEmail.textContent =
      (profile && profile.email) ||
      (player && player.email) ||
      user.email ||
      "";
  }

  await loadOrders(user.id);
}


/* =========================================================
   ORDERS
========================================================= */

async function loadOrders(userId) {
  const ordersList =
    getElement("orders-list");

  if (!ordersList) {
    return;
  }

  ordersList.innerHTML =
    '<div class="loading">Loading orders...</div>';

  const {
    data,
    error
  } = await supabaseClient
    .from("orders")
    .select(
      "id, order_id, user_id, item_title, item_price, receipt_path, status, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(
      "Order loading error:",
      error
    );

    ordersList.innerHTML =
      '<div class="form-message show error">Unable to load your orders.</div>';

    return;
  }

  if (!data || data.length === 0) {
    ordersList.innerHTML =
      '<div class="loading">You have no orders yet.</div>';

    return;
  }

  ordersList.innerHTML =
    data.map(renderOrder).join("");
}


function renderOrder(order) {
  const status =
    normalizeStatus(order.status);

  const statusClass =
    getStatusClass(order.status);

  const statusText =
    status
      ? status.charAt(0).toUpperCase() +
        status.slice(1)
      : "Unknown";

  return `
    <article class="order-card">
      <div class="order-top">
        <div>
          <h3>${escapeHTML(
            order.item_title || "GBC Purchase"
          )}</h3>

          <div class="order-meta">
            <span>
              Order:
              ${escapeHTML(
                order.order_id || order.id || ""
              )}
            </span>

            <span>
              ${formatDate(order.created_at)}
            </span>
          </div>
        </div>

        <div class="order-status ${statusClass}">
          ${escapeHTML(statusText)}
        </div>
      </div>

      <div class="order-meta">
        <span>
          Amount:
          ${formatPrice(order.item_price)}
        </span>
      </div>
    </article>
  `;
}


async function refreshOrders() {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await loadOrders(user.id);
}


/* =========================================================
   STORE
========================================================= */

async function loadStore() {
  const storeGrid =
    getElement("store-grid");

  if (!storeGrid) {
    return;
  }

  storeGrid.innerHTML =
    '<div class="loading">Loading store...</div>';

  const {
    data,
    error
  } = await supabaseClient
    .from("store_items")
    .select(
      "id, category, title, price, tag, description, active, created_at"
    )
    .eq("active", true)
    .order("created_at", {
      ascending: true
    });

  if (error) {
    console.error(
      "Store loading error:",
      error
    );

    storeGrid.innerHTML =
      '<div class="form-message show error">Unable to load the store right now.</div>';

    return;
  }

  if (!data || data.length === 0) {
    storeGrid.innerHTML =
      '<div class="loading">No store items are currently available.</div>';

    return;
  }

  storeGrid.innerHTML =
    data.map(renderStoreItem).join("");

  attachStoreButtons();
}


function renderStoreItem(item) {
  return `
    <article class="store-card">

      <div class="store-card-content">

        ${
          item.tag
            ? `<span class="eyebrow">${escapeHTML(
                item.tag
              )}</span>`
            : ""
        }

        <h3>
          ${escapeHTML(
            item.title || "GBC Item"
          )}
        </h3>

        ${
          item.category
            ? `<div class="store-category">
                ${escapeHTML(item.category)}
              </div>`
            : ""
        }

        ${
          item.description
            ? `<p>
                ${escapeHTML(item.description)}
              </p>`
            : ""
        }

        <strong class="store-price">
          ${formatPrice(item.price)}
        </strong>

        <button
          type="button"
          class="btn btn-primary store-buy-button"
          data-item-id="${escapeHTML(item.id)}"
        >
          Purchase
        </button>

      </div>

    </article>
  `;
}


function attachStoreButtons() {
  const buttons =
    document.querySelectorAll(
      ".store-buy-button"
    );

  buttons.forEach(function (button) {
    button.addEventListener(
      "click",
      async function () {

        const user =
          await getCurrentUser();

        if (!user) {
          window.location.href =
            "login.html";
          return;
        }

        const itemId =
          button.dataset.itemId;

        if (!itemId) {
          return;
        }

        window.location.href =
          "purchase.html?item=" +
          encodeURIComponent(itemId);
      }
    );
  });
}


/* =========================================================
   PURCHASE PAGE
========================================================= */

async function loadPurchasePage() {
  const purchaseForm =
    getElement("purchase-form");

  if (!purchaseForm) {
    return;
  }

  const user =
    await protectPage();

  if (!user) {
    return;
  }

  await loadPurchaseItems();
  await loadBankDetails();

  const params =
    new URLSearchParams(
      window.location.search
    );

  const requestedItem =
    params.get("item");

  if (requestedItem) {
    const select =
      getElement("purchase-item");

    if (select) {
      select.value =
        requestedItem;

      updateSelectedItem();
    }
  }
}


async function loadPurchaseItems() {
  const select =
    getElement("purchase-item");

  if (!select) {
    return;
  }

  select.innerHTML =
    '<option value="">Loading items...</option>';

  const {
    data,
    error
  } = await supabaseClient
    .from("store_items")
    .select(
      "id, category, title, price, tag, description, active"
    )
    .eq("active", true)
    .order("created_at", {
      ascending: true
    });

  if (error) {
    console.error(
      "Purchase item loading error:",
      error
    );

    select.innerHTML =
      '<option value="">Unable to load items</option>';

    showMessage(
      "purchase-message",
      "Unable to load store items.",
      "error"
    );

    return;
  }

  if (!data || data.length === 0) {
    select.innerHTML =
      '<option value="">No items available</option>';

    return;
  }

  select.innerHTML =
    '<option value="">Select an item</option>' +
    data.map(function (item) {
      return `
        <option
          value="${escapeHTML(item.id)}"
          data-title="${escapeHTML(item.title || "")}"
          data-price="${escapeHTML(item.price || "")}"
          data-description="${escapeHTML(
            item.description || ""
          )}"
        >
          ${escapeHTML(
            item.title || "GBC Item"
          )} — ${formatPrice(item.price)}
        </option>
      `;
    }).join("");

  select.addEventListener(
    "change",
    updateSelectedItem
  );
}


function updateSelectedItem() {
  const select =
    getElement("purchase-item");

  const selectedItem =
    getElement("selected-item");

  if (!select || !selectedItem) {
    return;
  }

  const option =
    select.options[select.selectedIndex];

  if (
    !option ||
    !option.value
  ) {
    selectedItem.innerHTML =
      "Select an item to view its details.";
    return;
  }

  const title =
    option.dataset.title || "";

  const price =
    option.dataset.price || "";

  const description =
    option.dataset.description || "";

  selectedItem.innerHTML = `
    <strong>
      ${escapeHTML(title)}
    </strong>

    <div>
      ${formatPrice(price)}
    </div>

    ${
      description
        ? `<p>${escapeHTML(description)}</p>`
        : ""
    }
  `;
}


async function loadBankDetails() {
  const bankName =
    getElement("bank-name");

  const bankAccount =
    getElement("bank-account");

  const bankAccountName =
    getElement("bank-account-name");

  if (
    !bankName &&
    !bankAccount &&
    !bankAccountName
  ) {
    return;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("bank_accounts")
    .select(
      "id, bank_name, account_number, account_name, active"
    )
    .eq("active", true)
    .order("created_at", {
      ascending: true
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Bank details loading error:",
      error
    );

    if (bankName) {
      bankName.textContent =
        "Unable to load";
    }

    if (bankAccount) {
      bankAccount.textContent =
        "Unable to load";
    }

    if (bankAccountName) {
      bankAccountName.textContent =
        "Unable to load";
    }

    return;
  }

  if (!data) {
    if (bankName) {
      bankName.textContent =
        "No active bank account";
    }

    if (bankAccount) {
      bankAccount.textContent =
        "Unavailable";
    }

    if (bankAccountName) {
      bankAccountName.textContent =
        "Unavailable";
    }

    return;
  }

  if (bankName) {
    bankName.textContent =
      data.bank_name || "";
  }

  if (bankAccount) {
    bankAccount.textContent =
      data.account_number || "";
  }

  if (bankAccountName) {
    bankAccountName.textContent =
      data.account_name || "";
  }
}


/* =========================================================
   CREATE ORDER
========================================================= */

async function handlePurchase(event) {
  event.preventDefault();

  const user =
    await protectPage();

  if (!user) {
    return;
  }

  const itemSelect =
    getElement("purchase-item");

  const receiptInput =
    getElement("purchase-receipt");

  if (!itemSelect) {
    showMessage(
      "purchase-message",
      "The purchase item selector is missing.",
      "error"
    );

    return;
  }

  if (!receiptInput) {
    showMessage(
      "purchase-message",
      "The receipt field is missing.",
      "error"
    );

    return;
  }

  const itemId =
    itemSelect.value;

  const receiptFile =
    receiptInput.files &&
    receiptInput.files[0];

  if (!itemId) {
    showMessage(
      "purchase-message",
      "Please select an item.",
      "error"
    );

    return;
  }

  if (!receiptFile) {
    showMessage(
      "purchase-message",
      "Please upload your payment receipt.",
      "error"
    );

    return;
  }

  /*
     Receipt upload is intentionally NOT attempted here.

     The Storage bucket name and Storage policies have
     not yet been verified.

     Creating an arbitrary bucket/path would violate
     the project requirement not to invent infrastructure.
  */

  showMessage(
    "purchase-message",
    "Receipt upload is not yet connected because the GBC receipt storage configuration still needs to be verified.",
    "error"
  );
}


/* =========================================================
   STAFF LOGIN
========================================================= */

async function handleStaffLogin(event) {
  event.preventDefault();

  const loginElement =
    getElement("staff-login");

  const passwordElement =
    getElement("staff-password");

  if (
    !loginElement ||
    !passwordElement
  ) {
    console.error(
      "Staff login form elements are missing."
    );

    return;
  }

  const login =
    loginElement.value.trim();

  const password =
    passwordElement.value;

  if (!login || !password) {
    showMessage(
      "staff-login-message",
      "Please enter your staff login details.",
      "error"
    );

    return;
  }

  showMessage(
    "staff-login-message",
    "Authenticating..."
  );

  let email = login;

  if (!login.includes("@")) {

    const {
      data,
      error
    } = await supabaseClient.rpc(
      "get_login_email",
      {
        login_identifier: login
      }
    );

    if (error || !data) {
      console.error(
        "Staff username lookup error:",
        error
      );

      showMessage(
        "staff-login-message",
        "Username not found.",
        "error"
      );

      return;
    }

    email = data;
  }

  const {
    error
  } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error(
      "Staff authentication error:",
      error
    );

    showMessage(
      "staff-login-message",
      error.message,
      "error"
    );

    return;
  }

  const user =
    await getCurrentUser();

  if (!user) {
    showMessage(
      "staff-login-message",
      "Authentication failed.",
      "error"
    );

    return;
  }

  /*
     Verify the authenticated user against the existing
     staff table.

     We do NOT grant staff access merely because login
     succeeded.
  */

  const {
    data: staffMember,
    error: staffError
  } = await supabaseClient
    .from("staff")
    .select(
      "id, user_id, level, role, active"
    )
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (staffError) {
    console.error(
      "Staff authorization error:",
      staffError
    );

    showMessage(
      "staff-login-message",
      "Unable to verify staff authorization.",
      "error"
    );

    return;
  }

  if (!staffMember) {
    await supabaseClient.auth.signOut();

    showMessage(
      "staff-login-message",
      "You are not authorized as GBC staff.",
      "error"
    );

    return;
  }

  showMessage(
    "staff-login-message",
    "Staff access verified.",
    "success"
  );

  /*
     The actual staff dashboard filename has not been
     supplied/verified, so we deliberately do NOT invent
     a redirect such as staff-dashboard.html.
  */

  console.log(
    "Authorized GBC staff:",
    staffMember
  );
}


/* =========================================================
   STARTUP
========================================================= */

async function initializeGBC() {
  console.log("GBC script loaded.");

  /*
     REGISTER
  */

  const registerForm =
    getElement("register-form");

  if (registerForm) {
    console.log("Register form found.");

    registerForm.addEventListener(
      "submit",
      handleRegister
    );
  }


  /*
     LOGIN
  */

  const loginForm =
    getElement("login-form");

  if (loginForm) {
    console.log("Login form found.");

    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }


  /*
     STAFF LOGIN
  */

  const staffLoginForm =
    getElement("staff-login-form");

  if (staffLoginForm) {
    console.log(
      "Staff login form found."
    );

    staffLoginForm.addEventListener(
      "submit",
      handleStaffLogin
    );
  }


  /*
     LOGOUT
  */

  const logoutLink =
    getElement("logout-link");

  if (logoutLink) {
    logoutLink.addEventListener(
      "click",
      logoutPlayer
    );
  }


  /*
     ACCOUNT
  */

  if (
    getElement("account-username") ||
    getElement("profile-username") ||
    getElement("profile-email") ||
    getElement("orders-list")
  ) {
    await loadAccountPage();
  }


  /*
     REFRESH ORDERS
  */

  const refreshOrdersButton =
    getElement("refresh-orders");

  if (refreshOrdersButton) {
    refreshOrdersButton.addEventListener(
      "click",
      refreshOrders
    );
  }


  /*
     HOMEPAGE STORE
  */

  if (getElement("store-grid")) {
    await loadStore();
  }


  /*
     PURCHASE
  */

  if (getElement("purchase-form")) {

    await loadPurchasePage();

    const purchaseForm =
      getElement("purchase-form");

    purchaseForm.addEventListener(
      "submit",
      handlePurchase
    );
  }
}


if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeGBC
  );
} else {
  initializeGBC();
}
