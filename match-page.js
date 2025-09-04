const BASE_URL = "http://localhost:7000/api/matches";
// const BASE_URL = "https://reedstreamsbackend1.onrender.com/api/matches";

function formatMatchTime(timestamp) {
  if (!timestamp) return null;

  try {
    if (/^\d+$/.test(timestamp)) {
      const date = new Date(parseInt(timestamp) * 1000);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const date = new Date(timestamp);
    if (!isNaN(date)) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    return null;
  } catch {
    return null;
  }
}

function renderMatchDetails(matchData) {
  const detailsContainer = document.getElementById("match-details-container");
  const titleElement = document.getElementById("match-title");

  if (!detailsContainer || !titleElement) return;

  titleElement.textContent = `${matchData.home_name || "Home"} vs ${matchData.away_name || "Away"}`;

  const startTimeFormatted = formatMatchTime(matchData.match_time || matchData.start_time);

  let detailsHtml = `
    <div class="match-diary-header">
      <h4>${matchData.competition_name || "N/A"}</h4>
      <span class="match-status ${(matchData.status || "Live").toLowerCase()}">
        ${matchData.status || "Live"}
      </span>
    </div>
    <p class="team-names">
      <strong>${matchData.home_name || "Home"}</strong>
      <span class="vs-separator">vs</span>
      <strong>${matchData.away_name || "Away"}</strong>
    </p>
  `;

  if (startTimeFormatted) {
    detailsHtml += `<p class="start-time">Started: ${startTimeFormatted}</p>`;
  }

  detailsContainer.innerHTML = detailsHtml;
}

function playStream(streamUrl, videoElement) {
  if (!streamUrl || !videoElement) return;

  const encodedUrl = encodeURIComponent(streamUrl);
  const proxiedUrl = `${BASE_URL}/proxy-stream?url=${encodedUrl}`;

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(proxiedUrl);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoElement.play().catch(e => console.error("Playback failed:", e));
    });
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error("HLS Error:", data);
    });
    window.hlsInstance = hls;
  } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
    videoElement.src = proxiedUrl;
    videoElement.addEventListener("loadedmetadata", () => {
      videoElement.play().catch(e => console.error("Playback failed:", e));
    });
  } else {
    videoElement.style.display = "none";
    const errorElement = document.createElement('p');
    errorElement.className = "error-message";
    errorElement.textContent = "Your browser does not support HLS streaming.";
    document.querySelector(".container")?.appendChild(errorElement);
  }
}

function initMatchPage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const streamUrl = decodeURIComponent(urlParams.get("streamUrl") || "");
    const home_name = decodeURIComponent(urlParams.get("home_name") || "");
    const away_name = decodeURIComponent(urlParams.get("away_name") || "");
    const competition_name = decodeURIComponent(urlParams.get("competition_name") || "");
    const match_time = urlParams.get("start_time");

    if (!streamUrl) {
      const errorElement = document.getElementById("match-title") || document.createElement('h1');
      errorElement.textContent = "Error: Stream URL missing";
      if (!errorElement.parentNode) {
        document.body.prepend(errorElement);
      }
      return;
    }

    const matchData = {
      home_name,
      away_name,
      competition_name,
      match_time,
      status: "Live"
    };

    renderMatchDetails(matchData);
    playStream(streamUrl, document.getElementById("video-player"));
  } catch (e) {
    console.error("Initialization error:", e);
  }
}

document.addEventListener("DOMContentLoaded", initMatchPage);
