const BASE_URL = "http://localhost:7000/api/matches";
// const BASE_URL = "https://reedstreamsbackend1.onrender.com/api/matches";

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function formatMatchTime(match) {
  try {
    if (match.raw_match_time) {
      const date = new Date(match.raw_match_time * 1000);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }
    if (match.start_time) {
      const date = new Date(match.start_time);
      if (!isNaN(date)) {
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
      }
    }
    return "N/A";
  } catch {
    return "N/A";
  }
}

async function loadLiveMatches() {
  const sport = getQueryParam("sport");
  const matchContainer = document.querySelector("#match-list");
  if (!matchContainer) {
    console.error("Missing #match-list element in HTML");
    return;
  }

  matchContainer.innerHTML = "Loading matches...";

  if (!sport) {
    matchContainer.innerHTML = `<p>No sport selected. Please go back and choose a sport.</p>`;
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/streams`);
    const response = await res.json();
    const data = Array.isArray(response.data?.streams) ? response.data.streams : [];

    const matches = data.filter(
      (m) => m.sport_name?.toLowerCase() === sport.toLowerCase() && m.match_status === "LIVE"
    );

    const pageTitle = document.querySelector("#page-title");
    if (pageTitle) {
      pageTitle.textContent = `${sport[0].toUpperCase() + sport.slice(1)} - Live Matches`;
    }

    if (matches.length === 0) {
      matchContainer.innerHTML = `<p>No live matches currently for ${sport}.</p>`;
      return;
    }

    const matchesGrid = document.createElement("div");
    matchesGrid.className = "matches-grid";
    matchContainer.innerHTML = "";
    matchContainer.appendChild(matchesGrid);

    matches.forEach((match) => {
      const startTime = formatMatchTime(match);

      const matchCard = document.createElement("div");
      matchCard.className = "match-card";
      matchCard.innerHTML = `
        <div class="match-header">
          <h4>${match.competition_name || "N/A"}</h4>
          <span class="live-status">${match.match_status}</span>
        </div>
        <p>${match.home_name || "Home"} vs ${match.away_name || "Away"}</p>
        <p class="start-time">Started: ${startTime}</p>
        <button class="watch-link"
          data-stream-url="${encodeURIComponent(match.playurl2 || match.playurl1 || "")}"
          data-home-name="${match.home_name || ""}"
          data-away-name="${match.away_name || ""}"
          data-competition-name="${match.competition_name || ""}"
          data-start-time="${match.raw_match_time || match.start_time || ""}"
        >Watch Now</button>
      `;
      matchesGrid.appendChild(matchCard);
    });

    matchesGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".watch-link");
      if (!btn) return;

      const params = new URLSearchParams({
        streamUrl: btn.getAttribute("data-stream-url"),
        home_name: btn.getAttribute("data-home-name"),
        away_name: btn.getAttribute("data-away-name"),
        competition_name: btn.getAttribute("data-competition-name"),
        start_time: btn.getAttribute("data-start-time")
      });

      window.location.href = `match.html?${params.toString()}`;
    });
  } catch (err) {
    console.error("Error fetching matches:", err);
    matchContainer.innerHTML = "Failed to load matches.";
  }
}

document.addEventListener("DOMContentLoaded", loadLiveMatches);
