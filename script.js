// ============================================================
// GRAND BILLIONAIRE CITY — SHARED FRONTEND SCRIPT
// ============================================================

// ---------- SUPABASE CONNECTION ----------

const SUPABASE_URL =
  "https://blmpsybqewgbvmqjajmc.supabase.co";

const SUPABASE_KEY =
  "Sb_publishable_3q_HCgN5TEmaSjO6luPbwA_rXE6CLHx";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ---------- SAFE DOM HELPERS ----------

// Creates an element without inserting unescaped HTML.
function createText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text ?? "";

  if (className) {
    element.className = className;
  }

  return element;
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

  // Only run on pages that contain the store.
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


// ---------- MESSAGES ----------

function showMessage(element, message, type) {
  if (!element) return;

  element.textContent = message;
  element.className = `form-message show ${type}`;
}


// ---------- PLAYER LOGIN ----------

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
    // Resolve username/email to the actual Auth email.
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

    // Password goes ONLY to Supabase Auth.
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

    // Temporary destination until player account page exists.
    setTimeout(() => {
      window.location.href = "index.html";
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


// ---------- PLAYER REGISTRATION ----------

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
    // Password goes ONLY to Supabase Auth.
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

    // The database trigger should create the profile.
    // No password is inserted into profiles.

    if (data.session) {
      showMessage(
        message,
        "Account created. Redirecting...",
        "success"
      );

      setTimeout(() => {
        window.location.href = "index.html";
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


// ---------- LOGOUT ----------

async function logoutPlayer() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  window.location.href = "index.html";
}


// ---------- SESSION HELPER ----------

// Gets the current Supabase session.
// No custom authentication or localStorage credentials.
async function getCurrentSession() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    return null;
  }

  return data.session;
}


// ---------- PAGE INITIALIZATION ----------

document.addEventListener("DOMContentLoaded", () => {

  // Homepage / store page
  loadStore();

  // Login page
  const loginForm =
    document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }

  // Registration page
  const registerForm =
    document.getElementById("register-form");

  if (registerForm) {
    registerForm.addEventListener(
      "submit",
      handleRegister
    );
  }

});
