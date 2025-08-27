// Mobile Menu Toggle
const mobileMenu = document.getElementById("mobileMenu");
const openMenuBtn = document.getElementById("openMenuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const overlay = document.getElementById("overlay");

if (openMenuBtn && mobileMenu && overlay) {
  openMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });
}

if (closeMenuBtn && mobileMenu && overlay) {
  closeMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  });
}

if (overlay && mobileMenu) {
  overlay.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  });
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupTuneInButtons();
  updateClock();
  setInterval(updateClock, 1000);
});

function setupSearch() {
  const searchInputs = document.querySelectorAll(
    ".search-container input, .mobile-search input"
  );
  const categoryCards = document.querySelectorAll(".category-card");
  const channelCards = document.querySelectorAll(".channel-card");

  // Create search results title if container exists
  let resultsTitle = document.getElementById("search-results-title");
  const categoriesEl = document.querySelector(".sports-categories");

  if (!resultsTitle && categoriesEl && categoriesEl.parentNode) {
    resultsTitle = document.createElement("h2");
    resultsTitle.id = "search-results-title";
    resultsTitle.style.display = "none";
    categoriesEl.parentNode.insertBefore(resultsTitle, categoriesEl);
  }

  // Add clear buttons to search inputs
  searchInputs.forEach((input) => {
    const container = input.closest(".search-container, .mobile-search");
    if (!container) return;

    const clearBtn = document.createElement("button");
    clearBtn.innerHTML = '<i class="fas fa-times"></i>';
    clearBtn.className = "clear-search";
    clearBtn.style.display = "none";
    container.appendChild(clearBtn);

    input.addEventListener("input", (e) => {
      clearBtn.style.display = e.target.value ? "block" : "none";
      filterContent(
        e.target.value,
        categoryCards,
        channelCards,
        resultsTitle
      );
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.style.display = "none";
      filterContent("", categoryCards, channelCards, resultsTitle);
      input.focus();
    });
  });
}

function filterContent(query, categoryCards, channelCards, resultsTitle) {
  const normalizedQuery = query.toLowerCase().trim();
  let resultCount = 0;

  // Reset all cards
  categoryCards.forEach((card) => {
    card.style.display = "block";
    const nameEl = card.querySelector(".category-name");
    if (nameEl) nameEl.innerHTML = nameEl.textContent;
  });

  channelCards.forEach((card) => {
    card.style.display = "block";
    const nameEl = card.querySelector(".channel-name");
    if (nameEl) nameEl.innerHTML = nameEl.textContent;
  });

  if (!normalizedQuery.length) {
    if (resultsTitle) resultsTitle.style.display = "none";
    return;
  }

  // Filter and highlight category cards
  categoryCards.forEach((card) => {
    const nameEl = card.querySelector(".category-name");
    if (!nameEl) return;

    const name = nameEl.textContent.toLowerCase();
    if (name.includes(normalizedQuery)) {
      resultCount++;
      highlightText(nameEl, normalizedQuery);
    } else {
      card.style.display = "none";
    }
  });

  // Filter and highlight channel cards
  channelCards.forEach((card) => {
    const nameEl = card.querySelector(".channel-name");
    if (!nameEl) return;

    const name = nameEl.textContent.toLowerCase();
    if (name.includes(normalizedQuery)) {
      resultCount++;
      highlightText(nameEl, normalizedQuery);
    } else {
      card.style.display = "none";
    }
  });

  // Update results title
  if (resultsTitle) {
    resultsTitle.style.display = "block";
    resultsTitle.innerHTML =
      resultCount > 0
        ? `Found ${resultCount} results for "${query}"`
        : `No results found for "${query}"`;
    resultsTitle.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function highlightText(element, searchText) {
  const text = element.textContent;
  const regex = new RegExp(searchText, "gi");
  element.innerHTML = text.replace(
    regex,
    (match) => `<span class="highlight-match">${match}</span>`
  );
}

function setupTuneInButtons() {
  document.querySelectorAll(".btn-tune-in").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.getAttribute("data-url");
      if (url) {
        window.location.href = url;
      } else {
        console.warn("No data-url attribute found for Tune In button:", button);
      }
    });
  });
}

function updateClock() {
  const now = new Date();
  const options = {
    timeZone: "Asia/Karachi",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  const dateTime = now.toLocaleString("en-US", options).replace(",", "");
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    clockElement.textContent = dateTime;
  }
}
