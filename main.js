const BASE_URL = "http://localhost:7000/api/matches";
// const BASE_URL = "https://reedstreamsbackend1.onrender.com/api/matches";

const allowedSports = ["football", "baseball", "amfootball"];

const sportIcons = {
  football: "fas fa-futbol",
  baseball: "fas fa-baseball-ball",
  amfootball: "fas fa-football-ball",
};

const sportDisplayNames = {
  football: "Football",
  baseball: "Baseball",
  amfootball: "American Football",
};

function capitalizeSportName(sport) {
  if (!sport || typeof sport !== "string") return "Unknown Sport";
  return (
    sportDisplayNames[sport] || sport.charAt(0).toUpperCase() + sport.slice(1)
  );
}

async function loadSports() {
  const container = document.querySelector("#sports-container");
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`${BASE_URL}/streams`);
    const response = await res.json();

    const data = Array.isArray(response.data?.streams)
      ? response.data.streams
      : [];
    container.innerHTML = "";

    const grouped = {};
    data.forEach((match) => {
      const sport = match?.sport_name?.toLowerCase();
      if (sport && allowedSports.includes(sport)) {
        grouped[sport] = grouped[sport] || [];
        if (match.match_status?.toUpperCase() === "LIVE") {
          grouped[sport].push(match);
        }
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
        <h3 class="category-name">${capitalizeSportName(sport)}</h3>
        <div class="category-matches">${liveMatchCount} Live Matches</div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `live-matches.html?sport=${sport}`;
      });

      container.appendChild(card);
    });

    if (!container.hasChildNodes()) {
      container.innerHTML = "<p>No live matches available right now.</p>";
    }
  } catch (err) {
    console.error("Error loading sports:", err);
    container.innerHTML = "Failed to load sports.";
  }
}

loadSports();
