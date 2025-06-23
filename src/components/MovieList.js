import React from 'react';

const MovieList = (props) => {
  return (
    <>
      {props.movies.map((movie, index) => (
        <div key={movie.imdbID} className="movie-item">
          <img src={movie.Poster} alt={movie.Title} />
          <h5>{movie.Title} ({movie.Year})</h5>
        </div>
      ))}
    </>
  );
};

export default MovieList;
