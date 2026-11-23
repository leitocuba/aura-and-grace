const translations = {
  en: {
    announcement: "Thoughtful finds for a more beautiful everyday.",
    navDiscover: "Discover", navAbout: "Our story",
    eyebrow: "THE AURA & GRACE EDIT",
    headline: "Little details.<br><em>Lovely living.</em>",
    intro: "A considered collection of home and style finds chosen to inspire your everyday.",
    explore: "Explore the selection", curated: "CURATED FOR YOU",
    featured: "Featured finds", sectionNote: "A few pieces worth discovering.",
    aboutEyebrow: "A NOTE FROM AURA & GRACE",
    aboutTitle: "Inspired choices for<br><em>everyday moments.</em>",
    aboutCopy: "We share finds that catch our eye across home and personal style. Explore at your own pace and choose what feels right for you.",
    stayConnected: "STAY CONNECTED", follow: "Follow along",
    socialCopy: "More inspiration, ideas and featured finds on our social channels.",
    affiliate: "Some links on this page are affiliate links. If you make a purchase through them, we may earn a commission at no additional cost to you.",
    rights: "All rights reserved.",
    view: "VIEW PRODUCT", 
    price: "Reference price",
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
    aboutEyebrow: "UNA NOTA DE AURA & GRACE",
    aboutTitle: "Ideas que inspiran<br><em>momentos cotidianos.</em>",
    aboutCopy: "Compartimos productos que llaman nuestra atención para el hogar y el estilo personal. Explora con calma y elige lo que vaya contigo.",
    stayConnected: "SIGAMOS EN CONTACTO", follow: "Acompáñanos",
    socialCopy: "Más inspiración, ideas y productos destacados en nuestras redes sociales.",
    affiliate: "Algunos enlaces de esta página son enlaces de afiliado. Si realizas una compra a través de ellos, podemos recibir una comisión sin costo adicional para ti.",
    rights: "Todos los derechos reservados.",
    view: "VER PRODUCTO", 
    price: "Precio de referencia",
    emptyCatalog: "La colección se está actualizando. Por favor, vuelve pronto.",
    errorCatalog: "No se pudo cargar la colección. Por favor, inténtalo más tarde."
  }
};

let language = localStorage.getItem("ag-language") || "es"; // Corregido: Por defecto en Español
let catalog = [];

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[language][key]) el.innerHTML = translations[language][key];
  });
  document.getElementById("languageToggle").textContent = language === "en" ? "ES" : "EN";
  renderProducts();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[char]);
}

function renderProducts() {
  const root = document.getElementById("productList");
  const items = catalog.filter(p => p.active).sort((a,b) => a.order - b.order);
  
  if (!items.length) {
    root.innerHTML = `<p class="empty">${translations[language].emptyCatalog}</p>`;
    return;
  }

  root.innerHTML = items.map((p, index) => {
    const name = escapeHtml(p.name?.[language] || p.name?.en || "");
    const description = escapeHtml(p.description?.[language] || p.description?.en || "");
    const note = escapeHtml(p.priceNote?.[language] || p.priceNote?.en || "");
    const category = escapeHtml(p.category || "");
    const price = escapeHtml(p.price || "");
    const id = escapeHtml(p.id || "");
    const order = Number.isFinite(Number(p.order)) ? String(p.order).padStart(2,"0") : "";
    const safeUrl = typeof p.affiliateUrl === "string" && /^https:\/\//i.test(p.affiliateUrl) ? escapeHtml(p.affiliateUrl) : "";
    
    // Corregido: Regex de imagen mejorado para permitir espacios y paréntesis sin romper la seguridad
    const safeImage = typeof p.image === "string" && /^(?:\/)?assets\/[A-Za-z0-9_ ./()-]+$/.test(p.image) ? escapeHtml(p.image) : "";
    
    const imageMarkup = safeImage
      ? `<img src="${safeImage}" alt="${name}" loading="${index === 0 ? "eager" : "lazy"}">`
      : "";
    const actionMarkup = safeUrl
      ? `<a class="buy-link" href="${safeUrl}" target="_blank" rel="sponsored nofollow noopener">${translations[language].view}<span aria-hidden="true">↗</span></a>`
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
        <p class="product-price"><span>${translations[language].price}</span> <strong>${price}</strong></p>
        <p class="price-note">${note}</p>
        ${actionMarkup}
      </div>
    </article>`;
  }).join("");

  root.querySelectorAll(".product-image img").forEach(img => {
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

  try {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Catalog could not be loaded");
    const data = await response.json();
    catalog = Array.isArray(data) ? data : (data.products || []);
    renderProducts();
  } catch (error) {
    document.getElementById("productList").innerHTML = `<p class="empty">${translations[language].errorCatalog}</p>`;
  }
  
  applyLanguage();
}

init();
