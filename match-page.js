const BASE_URL = "http://localhost:7000/api/matches";

function formatMatchTime(tspTime) {
  if (!tspTime) return "N/A";
  return new Date(tspTime).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderMatchDetails(matchData) {
  const detailsContainer = document.getElementById("match-details-container");
  const titleElement = document.getElementById("match-title");

  titleElement.textContent = `${matchData.homeTeam || "Home"} vs ${matchData.awayTeam || "Away"}`;

  detailsContainer.innerHTML = `
    <div class="match-diary-header">
      <h4>${matchData.competition || "Live Match"}</h4>
      <span class="match-status">${matchData.status || "Live"}</span>
    </div>
    <p class="team-names">
      <strong>${matchData.homeTeam || "Home"}</strong>
      <span class="vs-separator">vs</span>
      <strong>${matchData.awayTeam || "Away"}</strong>
    </p>
    <p class="start-time">Start Time: ${formatMatchTime(matchData.matchTime)}</p>
  `;
}

function playStream(streamUrl, videoElement) {
  const proxiedUrl = `${BASE_URL}/proxy-stream?url=${streamUrl}`;

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(proxiedUrl);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => videoElement.play());
    window.hlsInstance = hls;
  } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
    videoElement.src = proxiedUrl;
    videoElement.addEventListener("loadedmetadata", () => videoElement.play());
  } else {
    videoElement.style.display = "none";
    document.querySelector(".container").innerHTML +=
      '<p class="error-message">Your browser does not support HLS streaming.</p>';
  }
}

function initMatchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const streamUrl = urlParams.get("streamUrl");

  if (!streamUrl) {
    document.getElementById("match-title").textContent = "Error: Stream URL missing";
    return;
  }

  const matchData = {
    competition: urlParams.get("competition"),
    homeTeam: urlParams.get("homeTeam"),
    awayTeam: urlParams.get("awayTeam"),
    matchTime: urlParams.get("matchTime"),
    status: "Live" // Default status
  };

  renderMatchDetails(matchData);
  playStream(streamUrl, document.getElementById("video-player"));
}

document.addEventListener("DOMContentLoaded", initMatchPage);