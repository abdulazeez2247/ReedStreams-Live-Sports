const BASE_URL = "http://localhost:7000/api/matches";
const allowedSports = ["football", "baseball"];

const sportIcons = {
  football: "fas fa-futbol",
  baseball: "fas fa-baseball-ball",
};

let currentLoadedMatches = [];

function capitalize(text) {
  return text
    .split("-")
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
        grouped[sport].push(match);
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

  matches.forEach((match) => {
    const statusClass = match.match_status?.toLowerCase() || 'live';
    const statusText = match.match_status?.toUpperCase() || 'LIVE';
    const streamUrl = match.playurl2 || match.playurl1;

    // The change is here: check if the status is "LIVE"
    const watchButtonHtml = (streamUrl && match.match_status === "LIVE") ? 
      `<a href="match.html?matchId=${match.match_id}&sportName=${match.sport_name}&streamUrl=${encodeURIComponent(streamUrl)}" class="watch-link">Watch Now</a>` 
      : "";

    const matchCard = document.createElement("div");
    matchCard.className = "match-card";
    matchCard.innerHTML = `
      <div class="match-header">
        <h4 class="competition-name">${match.competition_name || "Unknown Competition"}</h4>
        <span class="live-status ${statusClass}">${statusText}</span>
      </div>
      <p class="team-names">${match.home_team || "TBD"} vs ${match.away_team || "TBD"}</p>
      <p class="start-time">Start Time: ${new Date(match.match_time * 1000).toLocaleString()}</p>
      ${watchButtonHtml}
    `;
    matchesGrid.appendChild(matchCard);
  });
}


loadSports();
