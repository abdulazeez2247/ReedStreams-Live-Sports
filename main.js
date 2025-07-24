const BASE_URL = 'http://localhost:7000/api/matches';
const allowedSports = ['football', 'basketball', 'baseball', 'table-tennis', 'volleyball'];

const sportIcons = {
  football: 'fas fa-futbol',
  basketball: 'fas fa-basketball-ball',
  baseball: 'fas fa-baseball-ball',
  volleyball: 'fas fa-volleyball-ball',
  'table-tennis': 'fas fa-table-tennis',
};

let currentLoadedMatches = [];

function capitalize(text) {
  return text
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function loadSports() {
  const container = document.querySelector('#sports-container');
  container.innerHTML = 'Loading...';

  try {
    const res = await fetch(`${BASE_URL}/streams`);
    const response = await res.json();
    const data = Array.isArray(response.data?.streams) ? response.data.streams : [];
    currentLoadedMatches = data;

    container.innerHTML = '';

    const grouped = {};
    data.forEach((match) => {
      const sport = match.sport_name?.toLowerCase();
      if (allowedSports.includes(sport) && match.stream_source && match.status?.type === 'inprogress') {
        grouped[sport] = grouped[sport] || [];
        grouped[sport].push(match);
      }
    });

    allowedSports.forEach((sport) => {
      const matches = grouped[sport] || [];
      const liveMatchCount = matches.length;
      const iconClass = sportIcons[sport] || 'fas fa-trophy';

      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `
        <div class="category-icon"><i class="${iconClass}"></i></div>
        <h3 class="category-name">${capitalize(sport)}</h3>
        <div class="category-matches">${liveMatchCount} Live Matches</div>
      `;
      card.addEventListener('click', () => showMatches(sport, matches));
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = 'Failed to load sports.';
  }
}

function showMatches(sport, matches) {
  const matchContainer = document.querySelector('#match-list');
  matchContainer.innerHTML = `<h2>${capitalize(sport)} - Live Matches</h2>`;

  if (matches.length === 0) {
    matchContainer.innerHTML += `<p class="no-matches-message">No live matches currently for ${capitalize(sport)}.</p>`;
    return;
  }

  // Reset HLS player
  if (window.hlsInstance) {
    window.hlsInstance.destroy();
    window.hlsInstance = null;
  }

  // Create or reuse video player container
  let videoPlayerContainer = document.querySelector('#video-player-container');
  if (!videoPlayerContainer) {
    videoPlayerContainer = document.createElement('div');
    videoPlayerContainer.id = 'video-player-container';
    videoPlayerContainer.className = 'video-player-section';
    matchContainer.prepend(videoPlayerContainer);
  } else {
    videoPlayerContainer.innerHTML = '';
  }

  const matchesGrid = document.createElement('div');
  matchesGrid.className = 'matches-grid';
  matchContainer.appendChild(matchesGrid);

  matches.forEach((match) => {
    const matchCard = document.createElement('div');
    matchCard.className = 'match-card';

    const displayTime = match.start_time
      ? new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';

    const goalScorersHtml = Array.isArray(match.goal_scorers) && match.goal_scorers.length > 0
      ? `<div class="goal-scorers">
           <p><strong>Goal Scorers:</strong></p>
           <ul class="goal-scorers-list">
             ${match.goal_scorers.map(s => `<li>${s.player_name} (${s.time}') - ${s.score_after}</li>`).join('')}
           </ul>
         </div>`
      : '';

    const watchButtonHtml = match.stream_source && match.status?.type === 'inprogress'
    ? `<a href="watchmatch.html?stream=${encodeURIComponent(match.stream_source)}&home=${encodeURIComponent(match.home_team_name)}&away=${encodeURIComponent(match.away_team_name)}" class="watch-button">Watch</a>`
    : '';


    matchCard.innerHTML = `
      <div class="match-header">
        <h4 class="competition-name">${match.competition_name || 'Live Match'}</h4>
        <span class="match-status">${match.status?.description || 'Live'}</span>
      </div>
      <p class="team-names"><strong>${match.home_team_name || 'N/A'}</strong> 
        <span class="vs-separator">vs</span> 
        <strong>${match.away_team_name || 'N/A'}</strong></p>
      <p class="score">Score: ${match.home_score_current ?? '0'} - ${match.away_score_current ?? '0'}</p>
      <p class="start-time">Start Time: ${displayTime}</p>
      ${goalScorersHtml}
      ${watchButtonHtml}
    `;

    matchesGrid.appendChild(matchCard);
  });

  // Attach event listener to each watch button
  matchesGrid.querySelectorAll('.watch-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const streamSource = event.target.dataset.streamSource;
      const gmid = event.target.dataset.matchId;
      playStream(streamSource, gmid);
    });
  });
}

function playStream(streamSource, gmid) {
  const videoPlayerContainer = document.querySelector('#video-player-container');
  videoPlayerContainer.innerHTML = '';

  const videoElement = document.createElement('video');
  videoElement.controls = true;
  videoElement.autoplay = true;
  videoElement.className = 'video-player';
  videoPlayerContainer.appendChild(videoElement);

  const currentMatch = currentLoadedMatches.find(m => m.gmid === gmid);
  if (currentMatch) {
    const title = document.createElement('h3');
    title.className = 'playing-match-title';
    title.textContent = `Now Playing: ${currentMatch.home_team_name || 'N/A'} vs ${currentMatch.away_team_name || 'N/A'}`;
    videoPlayerContainer.prepend(title);
  }

  const proxiedUrl = `${BASE_URL}/proxy-stream?url=${encodeURIComponent(streamSource)}`;

  if (Hls.isSupported()) {
    if (window.hlsInstance) {
      window.hlsInstance.destroy();
    }

    const hls = new Hls();
    window.hlsInstance = hls;

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError();
            break;
          default:
            videoElement.src = '';
            videoPlayerContainer.innerHTML += '<p class="error-message">Error playing stream. Please try another match or check your connection.</p>';
            hls.destroy();
            window.hlsInstance = null;
        }
      }
    });

    hls.loadSource(proxiedUrl);
    hls.attachMedia(videoElement);
    hls.on(Hls.Events.MANIFEST_PARSED, () => videoElement.play());
  } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
    videoElement.src = proxiedUrl;
    videoElement.addEventListener('loadedmetadata', () => videoElement.play());
  } else {
    videoPlayerContainer.innerHTML += '<p class="error-message">Your browser does not support HLS playback.</p>';
  }
}

// Start loading
loadSports();
