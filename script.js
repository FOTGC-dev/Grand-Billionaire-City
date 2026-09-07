const SUPABASE_URL =
  "https://blmpsybqewgbvmqjajmc.supabase.co";

const SUPABASE_ANON_KEY =
  "Sb_publishable_3q_HCgN5TEmaSjO6luPbwA_rXE6CLHx";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================
   GENERAL HELPERS
========================= */

function getElement(id) {
  return document.getElementById(id);
}

function showMessage(id, message, type = "") {
  const element = getElement(id);

  if (!element) return;

  element.textContent = message;
  element.className = `form-message ${type}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(price) {
  return `₦${Number(price || 0).toLocaleString("en-NG")}`;
}

function createOrderId() {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `GBC-${Date.now()}-${randomPart}`;
}

async function getCurrentSession() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    return null;
  }

  return data.session;
}


/* =========================
   PUBLIC STORE
========================= */

async function loadStore() {
  const storeGrid = getElement("store-grid");

  if (!storeGrid) return;

  storeGrid.innerHTML = "<p>Loading store items...</p>";

  const { data, error } = await supabaseClient
    .from("store_items")
    .select("*")
    .eq("active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    storeGrid.innerHTML =
      "<p>Unable to load store items.</p>";
    return;
  }

  if (!data || data.length === 0) {
    storeGrid.innerHTML =
      "<p>No store items are available right now.</p>";
    return;
  }

  storeGrid.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("article");

    card.className = "store-card";

    card.innerHTML = `
      <p class="store-tag">
        ${escapeHTML(item.tag || item.category || "GBC")}
      </p>

      <h3>${escapeHTML(item.title)}</h3>

      <p class="store-description">
        ${escapeHTML(item.description || "")}
      </p>

      <strong class="store-price">
        ${formatPrice(item.price)}
      </strong>

      <a
        class="primary-button"
        href="purchase.html?item=${encodeURIComponent(item.id)}"
      >
        Purchase
      </a>
    `;

    storeGrid.appendChild(card);
  });
}


/* =========================
   PLAYER LOGIN
========================= */

async function handleLogin(event) {
  event.preventDefault();

  const loginInput = getElement("login");
  const passwordInput = getElement("password");

  if (!loginInput || !passwordInput) return;

  const login = loginInput.value.trim();
  const password = passwordInput.value;

  if (!login || !password) {
    showMessage(
      "login-message",
      "Enter your login details.",
      "error"
    );
    return;
  }

  showMessage(
    "login-message",
    "Signing in..."
  );

  let email = login;

  if (!login.includes("@")) {
    const { data, error } = await supabaseClient.rpc(
      "get_login_email",
      {
        login_identifier: login
      }
    );

    if (error || !data) {
      showMessage(
        "login-message",
        "Username not found.",
        "error"
      );
      return;
    }

    email = data;
  }

  const { error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    showMessage(
      "login-message",
      error.message,
      "error"
    );
    return;
  }

  window.location.href = "account.html";
}


/* =========================
   PLAYER REGISTRATION
========================= */

async function handleRegister(event) {
  event.preventDefault();

  const usernameInput = getElement("register-username");
  const emailInput = getElement("register-email");
  const passwordInput = getElement("register-password");
  const confirmInput = getElement("register-confirm-password");

  if (
    !usernameInput ||
    !emailInput ||
    !passwordInput ||
    !confirmInput
  ) {
    return;
  }

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (password !== confirmPassword) {
    showMessage(
      "register-message",
      "Passwords do not match.",
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

  showMessage(
    "register-message",
    "Creating account..."
  );

  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

  if (error) {
    showMessage(
      "register-message",
      error.message,
      "error"
    );
    return;
  }

  if (data.session) {
    window.location.href = "account.html";
    return;
  }

  showMessage(
    "register-message",
    "Registration successful. Check your email if confirmation is required.",
    "success"
  );
}


/* =========================
   PLAYER ACCOUNT
========================= */

async function loadAccountPage() {
  const usernameElement = getElement("account-username");
  const profileUsername = getElement("profile-username");
  const profileEmail = getElement("profile-email");

  if (
    !usernameElement &&
    !profileUsername &&
    !profileEmail
  ) {
    return;
  }

  const session = await getCurrentSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const user = session.user;

  const { data: profile, error } =
    await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

  if (error) {
    console.error(error);
  }

  const username =
    profile?.username ||
    user.user_metadata?.username ||
    "Player";

  if (usernameElement) {
    usernameElement.textContent = username;
  }

  if (profileUsername) {
    profileUsername.textContent = username;
  }

  if (profileEmail) {
    profileEmail.textContent = user.email || "";
  }

  await loadPlayerOrders(user.id);
}

async function loadPlayerOrders(userId) {
  const ordersList = getElement("orders-list");

  if (!ordersList) return;

  ordersList.innerHTML = "<p>Loading orders...</p>";

  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    ordersList.innerHTML =
      "<p>Unable to load your orders.</p>";
    return;
  }

  if (!data || data.length === 0) {
    ordersList.innerHTML =
      "<p>You have not made any purchases yet.</p>";
    return;
  }

  ordersList.innerHTML = "";

  data.forEach((order) => {
    const card = document.createElement("article");

    const status = String(
      order.status || "pending"
    ).toLowerCase();

    card.className = "order-card";

    card.innerHTML = `
      <h3>${escapeHTML(order.item_title)}</h3>

      <div class="order-meta">
        <span>Order ID: ${escapeHTML(order.order_id)}</span>
        <span>${formatPrice(order.item_price)}</span>
      </div>

      <p>
        Status:
        <strong class="order-status status-${escapeHTML(status)}">
          ${escapeHTML(status.toUpperCase())}
        </strong>
      </p>
    `;

    ordersList.appendChild(card);
  });
}


/* =========================
   PURCHASE PAGE
========================= */

let purchaseItems = [];

async function loadPurchaseItems() {
  const itemSelect = getElement("purchase-item");

  if (!itemSelect) return;

  const { data, error } = await supabaseClient
    .from("store_items")
    .select("*")
    .eq("active", true)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    showMessage(
      "purchase-message",
      "Unable to load store items.",
      "error"
    );
    return;
  }

  purchaseItems = data || [];

  itemSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select an item...";
  itemSelect.appendChild(defaultOption);

  purchaseItems.forEach((item) => {
    const option = document.createElement("option");

    option.value = item.id;
    option.textContent =
      `${item.title} - ${formatPrice(item.price)}`;

    itemSelect.appendChild(option);
  });

  const params = new URLSearchParams(
    window.location.search
  );

  const selectedItem = params.get("item");

  if (selectedItem) {
    itemSelect.value = selectedItem;
  }

  updateSelectedItem();
}

function updateSelectedItem() {
  const itemSelect = getElement("purchase-item");
  const selectedItemElement = getElement("selected-item");

  if (!itemSelect || !selectedItemElement) return;

  const item = purchaseItems.find(
    (storeItem) =>
      String(storeItem.id) === String(itemSelect.value)
  );

  if (!item) {
    selectedItemElement.innerHTML =
      "<p>Select an item to continue.</p>";
    return;
  }

  selectedItemElement.innerHTML = `
    <h3>${escapeHTML(item.title)}</h3>
    <p>${escapeHTML(item.description || "")}</p>
    <strong>${formatPrice(item.price)}</strong>
  `;
}

async function loadBankDetails() {
  const bankName = getElement("bank-name");
  const bankAccount = getElement("bank-account");
  const bankAccountName = getElement("bank-account-name");

  if (!bankName && !bankAccount && !bankAccountName) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("site_config")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return;
  }

  if (bankName) {
    bankName.textContent = data?.bank_name || "Not available";
  }

  if (bankAccount) {
    bankAccount.textContent =
      data?.account_number || "Not available";
  }

  if (bankAccountName) {
    bankAccountName.textContent =
      data?.account_name || "Not available";
  }
}

async function handlePurchase(event) {
  event.preventDefault();

  const session = await getCurrentSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const itemSelect = getElement("purchase-item");
  const receiptInput = getElement("purchase-receipt");

  if (!itemSelect || !receiptInput) return;

  const item = purchaseItems.find(
    (storeItem) =>
      String(storeItem.id) === String(itemSelect.value)
  );

  if (!item) {
    showMessage(
      "purchase-message",
      "Select an item first.",
      "error"
    );
    return;
  }

  const receiptFile = receiptInput.files[0];

  if (!receiptFile) {
    showMessage(
      "purchase-message",
      "Upload your payment receipt.",
      "error"
    );
    return;
  }

  showMessage(
    "purchase-message",
    "Uploading receipt..."
  );

  const orderId = createOrderId();

  const safeFilename = receiptFile.name
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  const receiptPath =
    `${session.user.id}/${orderId}-${safeFilename}`;

  const { error: uploadError } =
    await supabaseClient.storage
      .from("receipts")
      .upload(receiptPath, receiptFile);

  if (uploadError) {
    console.error(uploadError);

    showMessage(
      "purchase-message",
      uploadError.message,
      "error"
    );
    return;
  }

  showMessage(
    "purchase-message",
    "Submitting order..."
  );

  const { error: orderError } =
    await supabaseClient
      .from("orders")
      .insert({
        order_id: orderId,
        user_id: session.user.id,
        item_title: item.title,
        item_price: item.price,
        receipt_path: receiptPath,
        status: "pending"
      });

  if (orderError) {
    console.error(orderError);

    showMessage(
      "purchase-message",
      orderError.message,
      "error"
    );
    return;
  }

  window.location.href = "account.html";
}


/* =========================
   STAFF LOGIN
========================= */

async function handleStaffLogin(event) {
  event.preventDefault();

  const loginInput = getElement("staff-login");
  const passwordInput = getElement("staff-password");

  if (!loginInput || !passwordInput) return;

  const login = loginInput.value.trim();
  const password = passwordInput.value;

  showMessage(
    "staff-login-message",
    "Checking staff account..."
  );

  let email = login;

  if (!login.includes("@")) {
    const { data, error } =
      await supabaseClient.rpc(
        "get_login_email",
        {
          login_identifier: login
        }
      );

    if (error || !data) {
      showMessage(
        "staff-login-message",
        "Staff account not found.",
        "error"
      );
      return;
    }

    email = data;
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    showMessage(
      "staff-login-message",
      error.message,
      "error"
    );
    return;
  }

  const userId = data.user.id;

  const { data: staff, error: staffError } =
    await supabaseClient
      .from("staff")
      .select("level, role, active")
      .eq("user_id", userId)
      .maybeSingle();

  if (
    staffError ||
    !staff ||
    staff.active !== true
  ) {
    await supabaseClient.auth.signOut();

    showMessage(
      "staff-login-message",
      "You are not authorized as GBC staff.",
      "error"
    );
    return;
  }

  window.location.href = "panel.html";
}


/* =========================
   STAFF PANEL
========================= */

async function loadStaffPanel() {
  const panelName = getElement("staff-panel-name");

  if (!panelName) return;

  const session = await getCurrentSession();

  if (!session) {
    window.location.href = "staff-login.html";
    return;
  }

  const userId = session.user.id;

  const { data: profile } =
    await supabaseClient
      .from("profiles")
      .select("username, email")
      .eq("id", userId)
      .maybeSingle();

  const { data: staff, error } =
    await supabaseClient
      .from("staff")
      .select("level, role, active")
      .eq("user_id", userId)
      .maybeSingle();

  if (
    error ||
    !staff ||
    staff.active !== true
  ) {
    await supabaseClient.auth.signOut();
    window.location.href = "staff-login.html";
    return;
  }

  const level = Number(staff.level || 0);

  panelName.textContent =
    profile?.username ||
    session.user.email ||
    "Staff Member";

  const roleElement = getElement("staff-panel-role");
  const levelElement = getElement("staff-panel-level");

  if (roleElement) {
    roleElement.textContent =
      staff.role || "GBC Staff";
  }

  if (levelElement) {
    levelElement.textContent = level;
  }

  const ordersCard = getElement("orders-panel-card");
  const storeCard = getElement("store-panel-card");
  const bankCard = getElement("bank-panel-card");
  const managementCard = getElement("staff-management-card");

  if (level >= 2 && ordersCard) {
    ordersCard.classList.remove("hidden");
    await loadStaffOrders();
  }

  if (level >= 4 && storeCard) {
    storeCard.classList.remove("hidden");
    await loadStaffStoreItems();
  }

  if (level >= 7 && bankCard) {
    bankCard.classList.remove("hidden");
    await loadStaffBankDetails();
  }

  if (level >= 8 && managementCard) {
    managementCard.classList.remove("hidden");
  }
}


/* =========================
   STAFF ORDERS
========================= */

async function loadStaffOrders() {
  const ordersList = getElement("staff-orders-list");

  if (!ordersList) return;

  ordersList.innerHTML = "<p>Loading orders...</p>";

  const { data, error } =
    await supabaseClient
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

  if (error) {
    console.error(error);
    ordersList.innerHTML =
      "<p>Unable to load orders.</p>";
    return;
  }

  if (!data || data.length === 0) {
    ordersList.innerHTML =
      "<p>No orders found.</p>";
    return;
  }

  ordersList.innerHTML = "";

  data.forEach((order) => {
    const card = document.createElement("article");

    const status = String(
      order.status || "pending"
    ).toLowerCase();

    card.className = "staff-order-card";

    card.innerHTML = `
      <h3>${escapeHTML(order.item_title)}</h3>

      <p>
        Order ID:
        ${escapeHTML(order.order_id)}
      </p>

      <p>
        User ID:
        ${escapeHTML(order.user_id)}
      </p>

      <p>
        Price:
        ${formatPrice(order.item_price)}
      </p>

      <p>
        Status:
        <strong class="status-${escapeHTML(status)}">
          ${escapeHTML(status.toUpperCase())}
        </strong>
      </p>

      <div class="order-actions">
        <button
          class="primary-button"
          data-order-action="approved"
          data-order-id="${escapeHTML(order.id)}"
        >
          Approve
        </button>

        <button
          class="danger-button"
          data-order-action="rejected"
          data-order-id="${escapeHTML(order.id)}"
        >
          Reject
        </button>
      </div>
    `;

    ordersList.appendChild(card);
  });

  document
    .querySelectorAll("[data-order-action]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const orderId = button.dataset.orderId;
        const newStatus = button.dataset.orderAction;

        await updateOrderStatus(orderId, newStatus);
      });
    });
}

async function updateOrderStatus(orderId, status) {
  const { error } =
    await supabaseClient
      .from("orders")
      .update({ status })
      .eq("id", orderId);

  if (error) {
    showMessage(
      "panel-message",
      error.message,
      "error"
    );
    return;
  }

  showMessage(
    "panel-message",
    `Order ${status}.`,
    "success"
  );

  await loadStaffOrders();
}


/* =========================
   STAFF STORE MANAGEMENT
========================= */

async function loadStaffStoreItems() {
  const storeList = getElement("staff-store-list");

  if (!storeList) return;

  const { data, error } =
    await supabaseClient
      .from("store_items")
      .select("*")
      .order("id", { ascending: false });

  if (error) {
    console.error(error);
    storeList.innerHTML =
      "<p>Unable to load store items.</p>";
    return;
  }

  storeList.innerHTML = "";

  if (!data || data.length === 0) {
    storeList.innerHTML =
      "<p>No store items found.</p>";
    return;
  }

  data.forEach((item) => {
    const itemElement = document.createElement("article");

    itemElement.className = "staff-store-item";

    itemElement.innerHTML = `
      <h3>${escapeHTML(item.title)}</h3>

      <p>
        ${escapeHTML(item.category || "")}
      </p>

      <p>
        ${formatPrice(item.price)}
      </p>

      <p>
        Status:
        ${item.active ? "Active" : "Inactive"}
      </p>
    `;

    storeList.appendChild(itemElement);
  });
}

async function handleStoreItemCreation(event) {
  event.preventDefault();

  const category = getElement("store-category")?.value.trim();
  const title = getElement("store-title")?.value.trim();
  const price = Number(getElement("store-price")?.value);
  const tag = getElement("store-tag")?.value.trim();
  const description =
    getElement("store-description")?.value.trim();

  if (!category || !title || !price || !description) {
    showMessage(
      "panel-message",
      "Complete all store item fields.",
      "error"
    );
    return;
  }

  const { error } =
    await supabaseClient
      .from("store_items")
      .insert({
        category,
        title,
        price,
        tag,
        description,
        active: true
      });

  if (error) {
    showMessage(
      "panel-message",
      error.message,
      "error"
    );
    return;
  }

  event.target.reset();

  showMessage(
    "panel-message",
    "Store item added successfully.",
    "success"
  );

  await loadStaffStoreItems();
}


/* =========================
   STAFF BANK DETAILS
========================= */

async function loadStaffBankDetails() {
  const { data, error } =
    await supabaseClient
      .from("site_config")
      .select("*")
      .limit(1)
      .maybeSingle();

  if (error || !data) return;

  const bankName = getElement("bank-config-name");
  const accountNumber = getElement("bank-config-number");
  const accountName = getElement("bank-config-owner");

  if (bankName) {
    bankName.value = data.bank_name || "";
  }

  if (accountNumber) {
    accountNumber.value = data.account_number || "";
  }

  if (accountName) {
    accountName.value = data.account_name || "";
  }
}

async function handleBankDetailsSave(event) {
  event.preventDefault();

  const bankName =
    getElement("bank-config-name")?.value.trim();

  const accountNumber =
    getElement("bank-config-number")?.value.trim();

  const accountName =
    getElement("bank-config-owner")?.value.trim();

  if (!bankName || !accountNumber || !accountName) {
    showMessage(
      "panel-message",
      "Complete all bank details.",
      "error"
    );
    return;
  }

  const { data: existingConfig } =
    await supabaseClient
      .from("site_config")
      .select("id")
      .limit(1)
      .maybeSingle();

  let result;

  if (existingConfig?.id) {
    result = await supabaseClient
      .from("site_config")
      .update({
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName
      })
      .eq("id", existingConfig.id);
  } else {
    result = await supabaseClient
      .from("site_config")
      .insert({
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName
      });
  }

  if (result.error) {
    showMessage(
      "panel-message",
      result.error.message,
      "error"
    );
    return;
  }

  showMessage(
    "panel-message",
    "Bank details saved.",
    "success"
  );
}


/* =========================
   LOGOUT
========================= */

async function logoutPlayer() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

async function logoutStaff() {
  await supabaseClient.auth.signOut();
  window.location.href = "staff-login.html";
}


/* =========================
   PAGE INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadStore();
  loadAccountPage();
  loadPurchaseItems();
  loadBankDetails();
  loadStaffPanel();

  const loginForm = getElement("login-form");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }

  const registerForm = getElement("register-form");

  if (registerForm) {
    registerForm.addEventListener(
      "submit",
      handleRegister
    );
  }

  const staffLoginForm =
    getElement("staff-login-form");

  if (staffLoginForm) {
    staffLoginForm.addEventListener(
      "submit",
      handleStaffLogin
    );
  }

  const purchaseForm =
    getElement("purchase-form");

  if (purchaseForm) {
    purchaseForm.addEventListener(
      "submit",
      handlePurchase
    );
  }

  const purchaseItem =
    getElement("purchase-item");

  if (purchaseItem) {
    purchaseItem.addEventListener(
      "change",
      updateSelectedItem
    );
  }

  const storeItemForm =
    getElement("store-item-form");

  if (storeItemForm) {
    storeItemForm.addEventListener(
      "submit",
      handleStoreItemCreation
    );
  }

  const bankDetailsForm =
    getElement("bank-details-form");

  if (bankDetailsForm) {
    bankDetailsForm.addEventListener(
      "submit",
      handleBankDetailsSave
    );
  }

  const logoutLink =
    getElement("logout-link");

  if (logoutLink) {
    logoutLink.addEventListener(
      "click",
      logoutPlayer
    );
  }

  const staffLogoutButton =
    getElement("staff-logout-button");

  if (staffLogoutButton) {
    staffLogoutButton.addEventListener(
      "click",
      logoutStaff
    );
  }

  const refreshOrders =
    getElement("refresh-orders");

  if (refreshOrders) {
    refreshOrders.addEventListener(
      "click",
      async () => {
        const session = await getCurrentSession();

        if (session) {
          await loadPlayerOrders(session.user.id);
        }
      }
    );
  }

  const refreshStaffOrders =
    getElement("refresh-orders-panel");

  if (refreshStaffOrders) {
    refreshStaffOrders.addEventListener(
      "click",
      loadStaffOrders
    );
  }
});
