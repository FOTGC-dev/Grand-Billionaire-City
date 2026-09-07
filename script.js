// GBC Supabase connection
const SUPABASE_URL = "https://blmpsybqewgbvmqjajmc.supabase.co";

const SUPABASE_KEY =
  "Sb_publishable_3q_HCgN5TEmaSjO6luPbwA_rXE6CLHx";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Safely create text elements.
// Do not insert database/user content using innerHTML.
function createText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text ?? "";
  if (className) element.className = className;
  return element;
}

// Store icons are decorative and do not come from user input.
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
      createText("div", "Store is temporarily unavailable.", "loading")
    );
    return;
  }

  grid.replaceChildren();

  if (!data || data.length === 0) {
    grid.appendChild(
      createText("div", "No items available yet.", "loading")
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

    card.append(icon, tag, title, description, priceRow);
    grid.appendChild(card);
  });
}

// Initialize only the page features that exist.
document.addEventListener("DOMContentLoaded", () => {
  loadStore();
});
