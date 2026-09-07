const SUPABASE_URL =
  "https://blmpsybqewgbvmqjajmc.supabase.co";

const SUPABASE_ANON_KEY =
  "Sb_publishable_3q_HCgN5TEmaSjO6luPbwA_rXE6CLHx";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================
   HELPERS
========================= */

function getElement(id) {
  return document.getElementById(id);
}

function showMessage(id, message, type = "") {
  const element = getElement(id);

  if (!element) {
    console.error("Missing message element:", id);
    return;
  }

  element.textContent = message;
  element.className = "form-message " + type;
}


/* =========================
   REGISTER
========================= */

async function handleRegister(event) {
  event.preventDefault();

  const username = getElement("register-username").value.trim();
  const email = getElement("register-email").value.trim();
  const password = getElement("register-password").value;
  const confirmPassword =
    getElement("register-confirm-password").value;

  if (!username || !email || !password || !confirmPassword) {
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

  const { data, error } =
    await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username
        }
      }
    });

  if (error) {
    console.error("Supabase registration error:", error);

    showMessage(
      "register-message",
      error.message,
      "error"
    );

    return;
  }

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


/* =========================
   LOGIN
========================= */

async function handleLogin(event) {
  event.preventDefault();

  const login = getElement("login").value.trim();
  const password = getElement("password").value;

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

  if (!login.includes("@")) {
    const { data, error } =
      await supabaseClient.rpc(
        "get_login_email",
        {
          login_identifier: login
        }
      );

    if (error || !data) {
      console.error("Username lookup error:", error);

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
      email: email,
      password: password
    });

  if (error) {
    console.error("Login error:", error);

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


/* =========================
   LOGOUT
========================= */

async function logoutPlayer(event) {
  if (event) {
    event.preventDefault();
  }

  await supabaseClient.auth.signOut();

  window.location.href = "login.html";
}


/* =========================
   START SCRIPT
========================= */

console.log("GBC script loaded.");

const registerForm = getElement("register-form");

if (registerForm) {
  console.log("Register form found.");

  registerForm.addEventListener(
    "submit",
    handleRegister
  );
}

const loginForm = getElement("login-form");

if (loginForm) {
  console.log("Login form found.");

  loginForm.addEventListener(
    "submit",
    handleLogin
  );
}

const logoutLink = getElement("logout-link");

if (logoutLink) {
  logoutLink.addEventListener(
    "click",
    logoutPlayer
  );
}
