const translations = {
  en: {
    announcement:"Thoughtful finds for a more beautiful everyday.",
    navDiscover:"Discover", navAbout:"Our story",
    eyebrow:"THE AURA & GRACE EDIT",
    headline:"Little details.<br><em>Lovely living.</em>",
    intro:"A considered collection of home and style finds chosen to inspire your everyday.",
    explore:"Explore the selection", curated:"CURATED FOR YOU",
    featured:"Featured finds", sectionNote:"A few pieces worth discovering.",
    aboutEyebrow:"A NOTE FROM AURA & GRACE",
    aboutTitle:"Inspired choices for<br><em>everyday moments.</em>",
    aboutCopy:"We share finds that catch our eye across home and personal style. Explore at your own pace and choose what feels right for you.",
    stayConnected:"STAY CONNECTED", follow:"Follow along",
    socialCopy:"More inspiration, ideas and featured finds on our social channels.",
    affiliate:"Some links on this page are affiliate links. If you make a purchase through them, we may earn a commission at no additional cost to you.",
    rights:"All rights reserved.", view:"VIEW AT TEMU", price:"Reference price"
  },
  es: {
    announcement:"Hallazgos especiales para disfrutar más de cada día.",
    navDiscover:"Descubrir", navAbout:"Nuestra esencia",
    eyebrow:"LA SELECCIÓN AURA & GRACE",
    headline:"Pequeños detalles.<br><em>Una vida bonita.</em>",
    intro:"Una selección cuidada de artículos para el hogar y el estilo, pensada para inspirar tu día a día.",
    explore:"Explorar la selección", curated:"SELECCIONADOS PARA TI",
    featured:"Nuestros destacados", sectionNote:"Algunos hallazgos que vale la pena descubrir.",
    aboutEyebrow:"UNA NOTA DE AURA & GRACE",
    aboutTitle:"Ideas que inspiran<br><em>momentos cotidianos.</em>",
    aboutCopy:"Compartimos productos que llaman nuestra atención para el hogar y el estilo personal. Explora con calma y elige lo que vaya contigo.",
    stayConnected:"SIGAMOS EN CONTACTO", follow:"Acompáñanos",
    socialCopy:"Más inspiración, ideas y productos destacados en nuestras redes sociales.",
    affiliate:"Algunos enlaces de esta página son enlaces de afiliado. Si realizas una compra a través de ellos, podemos recibir una comisión sin costo adicional para ti.",
    rights:"Todos los derechos reservados.", view:"VER EN TEMU", price:"Precio de referencia"
  }
};
let language = localStorage.getItem("ag-language") || "en";
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
function renderProducts() {
  const root = document.getElementById("productList");
  const items = catalog.filter(p => p.active).sort((a,b) => a.order - b.order);
  if (!items.length) {
    root.innerHTML = '<p class="empty">The collection is being refreshed. Please check back soon.</p>';
    return;
  }
  root.innerHTML = items.map((p, index) => {
    const name = p.name[language] || p.name.en;
    const description = p.description[language] || p.description.en;
    const note = p.priceNote[language] || p.priceNote.en;
    const safeUrl = /^https:\/\//i.test(p.affiliateUrl) ? p.affiliateUrl : "#";
    return `<article class="product-card">
      <a class="product-image" href="${safeUrl}" target="_blank" rel="sponsored nofollow noopener" aria-label="${name}">
        <img src="${p.image}" alt="${name}" loading="${index === 0 ? "eager" : "lazy"}" onerror="this.closest('.product-image').classList.add('image-missing');this.remove()">
        <span class="image-fallback">A&G</span>
      </a>
      <div class="product-info">
        <p class="product-index">${String(p.order).padStart(2,"0")} <span>·</span> ${p.category}</p>
        <h3>${name}</h3>
        <p class="product-description">${description}</p>
        <p class="product-price"><span>${translations[language].price}</span> <strong>${p.price}</strong></p>
        <p class="price-note">${note}</p>
        <a class="buy-link" href="${safeUrl}" target="_blank" rel="sponsored nofollow noopener">${translations[language].view}<span aria-hidden="true">↗</span></a>
      </div>
    </article>`;
  }).join("");
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
    catalog = await response.json();
    renderProducts();
  } catch (error) {
    document.getElementById("productList").innerHTML = '<p class="empty">The collection could not be loaded. Please try again later.</p>';
  }
  applyLanguage();
}
init();