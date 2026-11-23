const translations = {
  en: {
    announcement: "Thoughtful finds for a more beautiful everyday.",
    navDiscover: "Discover", navAbout: "Our story",
    eyebrow: "THE AURA & GRACE EDIT",
    headline: "Little details.<br><em>Lovely living.</em>",
    intro: "A considered collection of home and style finds chosen to inspire your everyday.",
    explore: "Explore the selection", curated: "CURATED FOR YOU",
    featured: "Featured finds", sectionNote: "A few pieces worth discovering.",
    referralText: "New to Temu? Join through our link.", referralButton: "Join Temu",
    aboutEyebrow: "HOW WE CHOOSE",
    aboutTitle: "How we choose",
    aboutCopy: "Aura & Grace is a small curation project. We select home and style pieces that fit a clean, modern look, and we read the product details and customer reviews before featuring them. We don't sell or ship anything ourselves: every purchase is made and fulfilled by Temu.",
    stayConnected: "STAY CONNECTED", follow: "Follow along",
    socialCopy: "More inspiration, ideas and featured finds on our social channels.",
    affiliateIntro: "Some links on this page are affiliate links. If you buy through them, we may earn a commission at no extra cost to you.",
    productAffiliate: "Affiliate link: we may earn a commission.",
    priceChecked: "Price as listed on Temu when checked; it may change.",
    affiliate: "Some links on this page are affiliate links. If you make a purchase through them, we may earn a commission at no additional cost to you.",
    contactLabel: "Contact", privacyLink: "Privacy",
    rights: "All rights reserved.",
    view: "VIEW PRODUCT", price: "Reference price",
    emptyCatalog: "The collection is being refreshed. Please check back soon.",
    errorCatalog: "The collection could not be loaded. Please try again later."
  },
  es: {
    announcement: "Hallazgos especiales para disfrutar más de cada día.",
    navDiscover: "Descubrir", navAbout: "Nuestra esencia",
    eyebrow: "LA SELECCIÓN AURA & GRACE",
    headline: "Pequeños detalles.<br><em>Una vida bonita.</em>",
    intro: "Una selección cuidada de artículos para el hogar y el estilo, pensada para inspirar tu día a día.",
    explore: "Explorar la selección", curated: "SELECCIONADOS PARA TI",
    featured: "Nuestros destacados", sectionNote: "Algunos hallazgos que vale la pena descubrir.",
    referralText: "¿Nuevo en Temu? Únete a través de nuestro enlace.", referralButton: "Unirme a Temu",
    aboutEyebrow: "CÓMO ELEGIMOS",
    aboutTitle: "Cómo elegimos",
    aboutCopy: "Aura & Grace es un pequeño proyecto de curaduría. Seleccionamos piezas de hogar y estilo con una estética limpia y moderna, y revisamos los detalles del producto y las reseñas de clientes antes de recomendarlas. No vendemos ni enviamos nada nosotros: cada compra la realiza y la gestiona Temu.",
    stayConnected: "SIGAMOS EN CONTACTO", follow: "Acompáñanos",
    socialCopy: "Más inspiración, ideas y productos destacados en nuestras redes sociales.",
    affiliateIntro: "Algunos enlaces de esta página son de afiliado. Si compras a través de ellos, podemos ganar una comisión sin costo adicional para ti.",
    productAffiliate: "Enlace de afiliado: podemos ganar una comisión.",
    priceChecked: "Precio según Temu al momento de la revisión; puede cambiar.",
    affiliate: "Algunos enlaces de esta página son enlaces de afiliado. Si realizas una compra a través de ellos, podemos recibir una comisión sin costo adicional para ti.",
    contactLabel: "Contacto", privacyLink: "Privacidad",
    rights: "Todos los derechos reservados.",
    view: "VER PRODUCTO", price: "Precio de referencia",
    emptyCatalog: "La colección se está actualizando. Por favor, vuelve pronto.",
    errorCatalog: "No se pudo cargar la colección. Por favor, inténtalo más tarde."
  }
};

let language = localStorage.getItem("ag-language") || "es";
let catalog = [];
let catalogLoadError = false;

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[language][key]) el.innerHTML = translations[language][key];
  });
  document.getElementById("languageToggle").textContent = language === "en" ? "ES" : "EN";
  renderCatalog();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}

// Función auxiliar para generar el HTML de una tarjeta (evita duplicar código)
function generateCardHtml(p, index) {
  const name = escapeHtml(p.name?.[language] || p.name?.en || "");
  const description = escapeHtml(p.description?.[language] || p.description?.en || "");
  const note = escapeHtml(p.priceNote?.[language] || p.priceNote?.en || "");
  const category = escapeHtml(p.category || "");
  const price = escapeHtml(p.price || "");
  const id = escapeHtml(p.id || "");
  const order = Number.isFinite(Number(p.order)) ? String(p.order).padStart(2,"0") : "";
  const safeUrl = typeof p.affiliateUrl === "string" && /^https:\/\//i.test(p.affiliateUrl) ? escapeHtml(p.affiliateUrl) : "";
  
  const safeImage = typeof p.image === "string" && /^(?:\/)?assets\/[A-Za-z0-9_ ./()-]+$/.test(p.image) ? escapeHtml(p.image) : "";
  
  const imageMarkup = safeImage
    ? `<img src="${safeImage}" alt="${name}" loading="${index === 0 ? "eager" : "lazy"}">`
    : "";
  const actionMarkup = safeUrl
    ? `<a class="buy-link" href="${safeUrl}" target="_blank" rel="sponsored noopener noreferrer">${translations[language].view}<span aria-hidden="true">↗</span></a>`
    : `<span class="buy-link is-disabled" aria-disabled="true">${translations[language].view}</span>`;
    
  return `<article class="product-card" data-product-id="${id}">
    <div class="product-image ${safeImage ? "" : "image-missing"}">
      ${imageMarkup}
      <span class="image-fallback">A&amp;G</span>
    </div>
    <div class="product-info">
      <p class="product-index">${order} <span>·</span> ${category}</p>
      <h3>${name}</h3>
      <p class="product-description">${description}</p>
      ${price ? `<p class="product-price"><span>${translations[language].price}</span> <strong>${price}</strong></p><p class="price-change-note">${translations[language].priceChecked}</p>` : ""}
      <p class="price-note">${note}</p>
      ${actionMarkup}
      ${safeUrl ? `<p class="product-affiliate-note">${translations[language].productAffiliate}</p>` : ""}
    </div>
  </article>`;
}

// Renderiza los productos agrupados por categoría
function renderCatalog() {
  const root = document.getElementById("productList");
  if (!root) return;
  
  if (catalogLoadError) {
    root.innerHTML = `<p class="empty">${translations[language].errorCatalog}</p>`;
    return;
  }
  const items = catalog.filter(p => p.active).sort((a,b) => a.order - b.order);
  
  if (!items.length) {
    root.innerHTML = `<p class="empty">${translations[language].emptyCatalog}</p>`;
    return;
  }

  // Agrupar por categoría
  const grouped = {};
  items.forEach(item => {
    const cat = item.category || "Otros";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  let finalHtml = "";
  for (const [category, products] of Object.entries(grouped)) {
    finalHtml += `<div class="category-group">
      <h2 class="category-title">${category}</h2>
      <div class="category-products">`;
    finalHtml += products.map((p, i) => generateCardHtml(p, i)).join("");
    finalHtml += `</div></div>`;
  }
  
  root.innerHTML = finalHtml;
  attachImageErrorListeners(root);
}

function attachImageErrorListeners(container) {
  container.querySelectorAll(".product-image img").forEach(img => {
    img.addEventListener("error", () => {
      img.closest(".product-image").classList.add("image-missing");
      img.remove();
    }, { once:true });
  });
}

async function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  
  document.getElementById("languageToggle").addEventListener("click", () => {
    language = language === "en" ? "es" : "en";
    localStorage.setItem("ag-language", language);
    applyLanguage();
  });

  // Cargar Productos Físicos
  try {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog could not be loaded");
    const data = await response.json();
    catalog = Array.isArray(data) ? data : (data.products || []);
  } catch (error) {
    catalogLoadError = true;
  }

  applyLanguage(); // Esto llamará a renderCatalog()
}

init();
