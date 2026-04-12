// to access DOM elements
const loading = document.getElementById("loading");
const moviesDiv = document.getElementById("movies");
const detailsDiv = document.getElementById("details");
const themeBtn = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");

// Hide loading initially
loading.style.display = "none";

// LOAD GENRES
async function loadGenres() {
  try {
    const res = await fetch(`${BASE}/genre/movie/list?api_key=${API_KEY}`);
    const data = await res.json();

    const select = document.getElementById("genre");

    data.genres.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error loading genres:", err);
  }
}

// FETCH & DISPLAY MOVIES
async function getMovies(url) {
  loading.style.display = "block";
  moviesDiv.innerHTML = "";

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    console.error("Error fetching movies:", err);
    moviesDiv.innerHTML = `<p style="color:#f87171;">Failed to load movies. Check your connection.</p>`;
  }

  loading.style.display = "none";
}

// DISPLAY MOVIES
function displayMovies(movies) {
  moviesDiv.innerHTML = "";

  if (!movies || movies.length === 0) {
    moviesDiv.innerHTML = `<p style="color:#aaa;">No movies found.</p>`;
    return;
  }

  movies.forEach(movie => {
    if (!movie.poster_path) return;

    const div = document.createElement("div");
    div.classList.add("movie");

    div.innerHTML = `
      <img src="${IMG + movie.poster_path}" alt="${movie.title}">
      <div class="info">
        <span>${movie.title}</span>
        <span>⭐ ${movie.vote_average.toFixed(1)}</span>
      </div>
    `;

    div.onclick = () => showDetails(movie.id);

    moviesDiv.appendChild(div);
  });
}

// SHOW MOVIE DETAILS
async function showDetails(id) {
  detailsDiv.innerHTML = `<p>Loading details...</p>`;
  detailsDiv.style.display = "flex";

  try {
    const res = await fetch(`${BASE}/movie/${id}?api_key=${API_KEY}`);
    const movie = await res.json();

    // Also fetch watch providers
    const provRes = await fetch(`${BASE}/movie/${id}/watch/providers?api_key=${API_KEY}`);
    const provData = await provRes.json();
    const providers = provData.results?.IN?.flatrate || provData.results?.US?.flatrate || [];

    const providerHTML = providers.length > 0
      ? providers.map(p => `<span>${p.provider_name}</span>`).join("")
      : "<span>Not available for streaming</span>";

    detailsDiv.innerHTML = `
      <img src="${IMG + movie.poster_path}" alt="${movie.title}">
      <div>
        <h2>${movie.title} (${movie.release_date ? movie.release_date.slice(0, 4) : "N/A"})</h2>
        <p style="margin: 8px 0;">⭐ ${movie.vote_average.toFixed(1)} &nbsp;|&nbsp; ${movie.runtime} min</p>
        <p style="margin: 8px 0; line-height: 1.5;">${movie.overview}</p>
        <p style="margin: 8px 0;"><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(", ")}</p>
        <div class="watch" style="margin-top: 12px;">
          <strong>Stream on:</strong><br>
          ${providerHTML}
        </div>
        <button onclick="closeDetails()" style="margin-top: 16px;">✕ Close</button>
      </div>
    `;
  } catch (err) {
    console.error("Error loading details:", err);
    detailsDiv.innerHTML = `<p style="color:#f87171;">Failed to load details.</p>`;
  }
}

// CLOSE DETAILS
function closeDetails() {
  detailsDiv.innerHTML = "";
  detailsDiv.style.display = "none";
}

// SEARCH (with debounce)
let searchTimer;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();

  searchTimer = setTimeout(() => {
    if (q === "") {
      getMovies(`${BASE}/discover/movie?api_key=${API_KEY}`);
      return;
    }
    getMovies(`${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`);
  }, 400);
});

// COMBINED GENRE + SORT FETCH
function fetchWithFilters() {
  const genre = document.getElementById("genre").value;
  const sort = document.getElementById("sort").value;

  let url = `${BASE}/discover/movie?api_key=${API_KEY}&sort_by=${sort}`;

  if (genre !== "") {
    url += `&with_genres=${genre}`;
  }

  getMovies(url);
}

// GENRE FILTER
document.getElementById("genre").addEventListener("change", fetchWithFilters);

// SORT
document.getElementById("sort").addEventListener("change", fetchWithFilters);

// DARK / LIGHT MODE TOGGLE
themeBtn.onclick = () => {
  document.body.classList.toggle("light");

  if (document.body.classList.contains("light")) {
    themeBtn.textContent = "Dark Mode";
  } else {
    themeBtn.textContent = "Light Mode";
  }
};

// INIT
loadGenres();
getMovies(`${BASE}/discover/movie?api_key=${API_KEY}`);
