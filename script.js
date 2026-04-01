const loading = document.getElementById("loading");
const moviesDiv = document.getElementById("movies");
const detailsDiv = document.getElementById("details");
const themeBtn = document.getElementById("themeToggle");

// LOAD GENRES
async function loadGenres() {
  const res = await fetch(`${BASE}/genre/movie/list?api_key=${API_KEY}`);
  const data = await res.json();

  const select = document.getElementById("genre");

  data.genres.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = g.name;
    select.appendChild(opt);
  });
}

// LOAD MOVIES
async function getMovies(url) {
  const res = await fetch(url);
  const data = await res.json();
  displayMovies(data.results);
}

// DISPLAY MOVIES
function displayMovies(movies) {
  moviesDiv.innerHTML = "";

  movies.forEach(movie => {
    if (!movie.poster_path) return;

    const div = document.createElement("div");
    div.classList.add("movie");

    div.innerHTML = `
      <img src="${IMG + movie.poster_path}">
      <div class="info">
        <span>${movie.title}</span>
        <span>⭐ ${movie.vote_average}</span>
      </div>
    `;

    div.onclick = () => showDetails(movie.id);

    moviesDiv.appendChild(div);
  });
}

// SEARCH
// document.getElementById("searchInput").addEventListener("input", (e) => {
//   const q = e.target.value;

//   if (q === "") {
//     getMovies(`${BASE}/discover/movie?api_key=${API_KEY}`);
//     return;
//   }

//   getMovies(`${BASE}/search/movie?api_key=${API_KEY}&query=${q}`);
// });
async function getMovies(url) {
  loading.style.display = "block";

  try {
    const res = await fetch(url);
    const data = await res.json();
    displayMovies(data.results);
  } catch (err) {
    console.log("Error fetching movies");
  }

  loading.style.display = "none";
}

// GENRE FILTER
document.getElementById("genre").addEventListener("change", (e) => {
  const id = e.target.value;
  getMovies(`${BASE}/discover/movie?api_key=${API_KEY}&with_genres=${id}`);
});

// SORT
document.getElementById("sort").addEventListener("change", (e) => {
  const sort = e.target.value;
  getMovies(`${BASE}/discover/movie?api_key=${API_KEY}&sort_by=${sort}`);
});

// // FAVORITES
// function addFav(movie) {
//   let fav = JSON.parse(localStorage.getItem("fav")) || [];
//   fav.push(movie);
//   localStorage.setItem("fav", JSON.stringify(fav));
//   alert("Added to favorites");
// }

// DARK MODE + TEXT CHANGE
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeBtn.textContent = "Light Mode";
  } else {
    themeBtn.textContent = "Dark Mode";
  }
};

// INIT
loadGenres();
getMovies(`${BASE}/discover/movie?api_key=${API_KEY}`);