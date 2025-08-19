// const BASE_URL = "http://localhost:7000/api/matches";
const BASE_URL = "https://reedstreamsbackend1.onrender.com/api/matches";
const allowedSports = ["football", "baseball"];

const sportIcons = {
  football: "fas fa-futbol",
  baseball: "fas fa-baseball-ball",
};

let currentLoadedMatches = [];

function capitalize(text) {
  if (!text) return "";
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function loadSports() {
  const container = document.querySelector("#sports-container");
  container.innerHTML = "Loading...";
  try {
    const res = await fetch(`${BASE_URL}/streams`);
    const response = await res.json();
    const data = Array.isArray(response.data?.streams) ? response.data.streams : [];
    currentLoadedMatches = data;
    container.innerHTML = "";
    const grouped = {};
    data.forEach((match) => {
      const sport = match.sport_name?.toLowerCase();
      if (allowedSports.includes(sport)) {
        grouped[sport] = grouped[sport] || [];
        if (match.match_status === "LIVE") grouped[sport].push(match);
      }
      
    });
    allowedSports.forEach((sport) => {
      const matches = grouped[sport] || [];
      const liveMatchCount = matches.length;
      const iconClass = sportIcons[sport] || "fas fa-trophy";
      const card = document.createElement("div");
      card.className = "category-card";
      card.innerHTML = `
        <div class="category-icon"><i class="${iconClass}"></i></div>
        <h3 class="category-name">${capitalize(sport)}</h3>
        <div class="category-matches">${liveMatchCount} Live Matches</div>
      `;
      card.addEventListener("click", () => showMatches(sport, matches));
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading sports:", err);
    container.innerHTML = "Failed to load sports.";
  }
}

function showMatches(sport, matches) {
  const matchContainer = document.querySelector("#match-list");
  matchContainer.innerHTML = `<h2>${capitalize(sport)} - Live Matches</h2>`;
  
  if (matches.length === 0) {
    matchContainer.innerHTML += `<p class="no-matches-message">No live matches currently for ${capitalize(sport)}.</p>`;
    return;
  }

  const matchesGrid = document.createElement("div");
  matchesGrid.className = "matches-grid";
  matchContainer.appendChild(matchesGrid);

  
  const formatTimeDisplay = (time) => {
    if (!time) return "N/A";
    
    
    if (typeof time === "string" && time !== "N/A" && !/^\d+$/.test(time)) {
      return time;
    }
    
    
    const timestamp = typeof time === "string" ? parseInt(time) : time;
    if (!isNaN(timestamp)) {
      const date = new Date(timestamp * 1000);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
    }
    
    return "N/A";
  };

  matches.forEach((match) => {
    const statusText = match.match_status || "N/A";
    const statusClass = statusText.toLowerCase();
    const formattedTime = formatTimeDisplay(match.match_time || match.start_time);
    
    const matchCard = document.createElement("div");
    matchCard.className = "match-card";
    matchCard.innerHTML = `
      <div class="match-header">
        <h4 class="competition-name">${match.competition_name || "N/A"}</h4>
        <span class="live-status ${statusClass}">${statusText}</span>
      </div>
      <p class="team-names">${match.home_name || "Home"} vs ${match.away_name || "Away"}</p>
      <p class="start-time">Start Time: ${formattedTime}</p>
      <button class="watch-link" 
          data-match-id="${match.match_id || ""}"
          data-stream-url="${encodeURIComponent(match.playurl2 || match.playurl1 || "")}"
          data-home-name="${match.home_name || ""}"
          data-away-name="${match.away_name || ""}"
          data-competition-name="${match.competition_name || ""}"
          data-start-time="${match.match_time || ""}"
      >Watch Now</button>
    `;
    matchesGrid.appendChild(matchCard);
  });

  
  matchesGrid.addEventListener("click", (e) => {
    const watchBtn = e.target.closest(".watch-link");
    if (!watchBtn) return;

    const streamUrl = decodeURIComponent(watchBtn.getAttribute("data-stream-url"));
    if (!streamUrl || streamUrl === "null" || streamUrl === "undefined") {
      alert("Stream URL not available.");
      return;
    }

    const params = new URLSearchParams({
      streamUrl: watchBtn.getAttribute("data-stream-url"),
      home_name: watchBtn.getAttribute("data-home-name"),
      away_name: watchBtn.getAttribute("data-away-name"),
      competition_name: watchBtn.getAttribute("data-competition-name"),
      start_time: watchBtn.getAttribute("data-start-time")
    });

    window.location.href = `match.html?${params.toString()}`;
  });
}

loadSports();
