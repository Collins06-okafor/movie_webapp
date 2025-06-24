// components/MovieList.js
import React from 'react';

const MovieList = ({ movies }) => {
  return (
    <>
      {movies.map((movie) => (
        <div key={movie.imdbID} className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="movie-card p-2">
            <img src={movie.Poster} alt={movie.Title} className="img-fluid rounded" />
            <h5 className="mt-2">{movie.Title}</h5>
            <p>{movie.Year}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default MovieList;
