// ============================================================
// GRAND BILLIONAIRE CITY — SHARED FRONTEND SCRIPT
// ============================================================

const SUPABASE_URL =
  "https://blmpsybqewgbvmqjajmc.supabase.co";

const SUPABASE_KEY =
  "Sb_publishable_3q_HCgN5TEmaSjO6luPbwA_rXE6CLHx";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ---------- SAFE DOM HELPERS ----------

function createText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text ?? "";

  if (className) {
    element.className = className;
  }

  return element;
}

function showMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = `form-message show ${type}`;
}


// ---------- STORE ----------

function getStoreIcon(category) {
  if (category === "coins") return "◈";
  if (category === "vehicles") return "▣";
  if (category === "properties") return "⌂";

  return "◆";
}

async function loadStore() {
  const grid = document.getElementById("store-grid");

  if (!grid) return;

  const { data, error } = await supabaseClient
    .from("store_items")
    .select("id, category, title, price, tag, description")
    .eq("active", true)
    .order("id");

  if (error) {
    console.error("Store loading error:", error);

    grid.replaceChildren(
      createText(
        "div",
        "Store is temporarily unavailable.",
        "loading"
      )
    );

    return;
  }

  grid.replaceChildren();

  if (!data || data.length === 0) {
    grid.appendChild(
      createText(
        "div",
        "No items available yet.",
        "loading"
      )
    );

    return;
  }

  data.forEach(item => {
    const card = document.createElement("article");
    card.className = "store-card";

    const icon = createText(
      "div",
      getStoreIcon(item.category),
      "store-icon"
    );

    const tag = createText(
      "span",
      item.tag || item.category,
      "store-tag"
    );

    const title = createText("h3", item.title);

    const description = createText(
      "p",
      item.description || "Available in the GBC marketplace."
    );

    const price = createText(
      "span",
      `${item.price} GC`,
      "price"
    );

    const button = createText(
      "a",
      "Purchase",
      "btn btn-primary"
    );

    button.href = "login.html";

    const priceRow = document.createElement("div");
    priceRow.className = "store-price";

    priceRow.append(price, button);

    card.append(
      icon,
      tag,
      title,
      description,
      priceRow
    );

    grid.appendChild(card);
  });
}


// ---------- SESSION ----------

async function getCurrentSession() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    return null;
  }

  return data.session;
}


// ---------- LOGIN ----------

async function handleLogin(event) {
  event.preventDefault();

  const identifier = document
    .getElementById("login-identifier")
    .value
    .trim();

  const password = document
    .getElementById("login-password")
    .value;

  const message = document.getElementById("login-message");
  const button = event.target.querySelector("button");

  button.disabled = true;
  button.textContent = "Logging in...";
  message.className = "form-message";

  try {
    const { data: email, error: resolveError } =
      await supabaseClient.rpc(
        "get_login_email",
        {
          login_identifier: identifier
        }
      );

    if (resolveError) {
      throw new Error(
        "Unable to resolve login identifier."
      );
    }

    if (!email) {
      throw new Error(
        "Invalid username or email."
      );
    }

    const { error: loginError } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (loginError) {
      throw new Error(loginError.message);
    }

    showMessage(
      message,
      "Login successful. Redirecting...",
      "success"
    );

    setTimeout(() => {
      window.location.href = "account.html";
    }, 800);

  } catch (error) {
    console.error("Login error:", error);

    showMessage(
      message,
      error.message,
      "error"
    );

  } finally {
    button.disabled = false;
    button.textContent = "Log In";
  }
}


// ---------- REGISTRATION ----------

async function handleRegister(event) {
  event.preventDefault();

  const username = document
    .getElementById("register-username")
    .value
    .trim();

  const email = document
    .getElementById("register-email")
    .value
    .trim();

  const password = document
    .getElementById("register-password")
    .value;

  const message = document.getElementById("register-message");
  const button = event.target.querySelector("button");

  if (username.length < 3) {
    showMessage(
      message,
      "Username must be at least 3 characters.",
      "error"
    );

    return;
  }

  button.disabled = true;
  button.textContent = "Creating account...";
  message.className = "form-message";

  try {
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
      throw new Error(error.message);
    }

    if (data.session) {
      showMessage(
        message,
        "Account created. Redirecting...",
        "success"
      );

      setTimeout(() => {
        window.location.href = "account.html";
      }, 800);

    } else {
      showMessage(
        message,
        "Account created. Check your email to confirm your account.",
        "success"
      );
    }

  } catch (error) {
    console.error("Registration error:", error);

    showMessage(
      message,
      error.message,
      "error"
    );

  } finally {
    button.disabled = false;
    button.textContent = "Create Account";
  }
}


// ---------- ACCOUNT ----------

async function loadAccount() {
  const usernameElement =
    document.getElementById("account-username");

  if (!usernameElement) return;

  const message =
    document.getElementById("account-message");

  const session = await getCurrentSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const user = session.user;

  const { data: profile, error } =
    await supabaseClient
      .from("profiles")
      .select("username, email")
      .eq("id", user.id)
      .single();

  if (error) {
    console.error("Profile loading error:", error);

    showMessage(
      message,
      "Unable to load your profile.",
      "error"
    );

    return;
  }

  usernameElement.textContent =
    profile.username || "Player";

  document.getElementById("profile-username")
    .textContent = profile.username || "Player";

  document.getElementById("profile-email")
    .textContent = profile.email || user.email || "";

  await loadOrders(user.id);
}


// ---------- ORDERS ----------

async function loadOrders(userId) {
  const list = document.getElementById("orders-list");

  if (!list) return;

  const { data, error } =
    await supabaseClient
      .from("orders")
      .select("id, order_id, item_title, item_price, receipt_path, status")
      .eq("user_id", userId)
      .order("id", { ascending: false });

  if (error) {
    console.error("Orders loading error:", error);

    list.replaceChildren(
      createText(
        "div",
        "Unable to load your orders.",
        "loading"
      )
    );

    return;
  }

  list.replaceChildren();

  if (!data || data.length === 0) {
    list.appendChild(
      createText(
        "div",
        "You have no orders yet.",
        "loading"
      )
    );

    return;
  }

  data.forEach(order => {
    const card = document.createElement("div");
    card.className = "order-card";

    const top = document.createElement("div");
    top.className = "order-top";

    const title = createText(
      "h3",
      order.item_title || "GBC Purchase"
    );

    const orderNumber = createText(
      "p",
      `Order ID: ${order.order_id || order.id}`
    );

    const status = createText(
      "span",
      order.status || "pending",
      `order-status status-${order.status || "pending"}`
    );

    const heading = document.createElement("div");
    heading.append(title, orderNumber);

    top.append(heading, status);

    const meta = document.createElement("div");
    meta.className = "order-meta";

    const priceBox = document.createElement("div");
    priceBox.append(
      createText("span", "Price"),
      createText("strong", `${order.item_price} GC`)
    );

    const receiptBox = document.createElement("div");
    receiptBox.append(
      createText("span", "Receipt"),
      createText(
        "strong",
        order.receipt_path ? "Uploaded" : "Not uploaded"
      )
    );

    meta.append(priceBox, receiptBox);

    card.append(top, meta);

    if (!order.receipt_path &&
        order.status === "pending") {

      const form = document.createElement("form");
      form.className = "receipt-form";

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,.pdf";
      input.required = true;

      const button = createText(
        "button",
        "Upload Receipt",
        "btn btn-primary"
      );

      button.type = "submit";

      form.append(input, button);

      form.addEventListener("submit", async event => {
        event.preventDefault();

        await uploadReceipt(
          order,
          input,
          button
        );
      });

      card.appendChild(form);
    }

    list.appendChild(card);
  });
}


// ---------- RECEIPT UPLOAD ----------

async function uploadReceipt(order, input, button) {
  const file = input.files[0];

  if (!file) return;

  const session = await getCurrentSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  button.disabled = true;
  button.textContent = "Uploading...";

  try {
    const safeName = file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );

    const path =
      `${session.user.id}/${order.order_id}-${safeName}`;

    const { error: uploadError } =
      await supabaseClient.storage
        .from("receipts")
        .upload(path, file, {
          upsert: false
        });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { error: updateError } =
      await supabaseClient
        .from("orders")
        .update({
          receipt_path: path
        })
        .eq("id", order.id)
        .eq("user_id", session.user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    alert("Receipt uploaded successfully.");

    await loadOrders(session.user.id);

  } catch (error) {
    console.error("Receipt upload error:", error);
    alert(error.message);

  } finally {
    button.disabled = false;
    button.textContent = "Upload Receipt";
  }
}


// ---------- LOGOUT ----------

async function logoutPlayer() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  window.location.href = "index.html";
}


// ---------- INITIALIZATION ----------

document.addEventListener("DOMContentLoaded", () => {

  loadStore();

  const loginForm =
    document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }

  const registerForm =
    document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener(
      "submit",
      handleRegister
    );
  }

  const logoutLink =
    document.getElementById("logout-link");

  if (logoutLink) {
    logoutLink.addEventListener("click", event => {
      event.preventDefault();
      logoutPlayer();
    });
  }

  const refreshButton =
    document.getElementById("refresh-orders");

  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      const session = await getCurrentSession();

      if (session) {
        await loadOrders(session.user.id);
      }
    });
  }

  loadAccount();

});
