const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API 1 - Get all movie names
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name AS movieName
    FROM
      movie;
  `;
  const movies = await db.all(getMoviesQuery);
  response.send(movies);
});

// API 2 - Create a new movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `
    INSERT INTO
      movie (director_id, movie_name, lead_actor)
    VALUES
      (${directorId}, '${movieName}', '${leadActor}');
  `;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 - Get a movie by ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      movie_id AS movieId,
      director_id AS directorId,
      movie_name AS movieName,
      lead_actor AS leadActor
    FROM
      movie
    WHERE
      movie_id = ${movieId};
  `;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

// API 4 - Update a movie by ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
    WHERE
      movie_id = ${movieId};
  `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5 - Delete a movie by ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};
  `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// API 6 - Get all directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      director_id AS directorId,
      director_name AS directorName
    FROM
      director;
  `;
  const directors = await db.all(getDirectorsQuery);
  response.send(directors);
});

// API 7 - Get movies directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `
    SELECT
      movie_name AS movieName
    FROM
      movie
    WHERE
      director_id = ${directorId};
  `;
  const movies = await db.all(getMoviesByDirectorQuery);
  response.send(movies);
});

module.exports = app;
