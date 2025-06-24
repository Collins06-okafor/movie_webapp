// components/MovieList.js
import React from 'react';

const MovieList = ({ movies, onMovieClick, onToggleFavorite, favorites, favouriteComponent: FavouriteComponent }) => {
  return (
    <>
      {movies.map((movie) => {
        const isFavorite = favorites?.some((fav) => fav.imdbID === movie.imdbID);

        return (
          <div key={movie.imdbID} className="col-sm-6 col-md-4 col-lg-3 mb-4">
            <div 
              className="movie-card p-2 position-relative" 
              onClick={() => onMovieClick(movie)}
              style={{ cursor: 'pointer' }}
            >
              <img src={movie.Poster} alt={movie.Title} className="img-fluid rounded" />
              <h5 className="mt-2">{movie.Title}</h5>
              <p>{movie.Year}</p>

              {/* Favorite Toggle Button */}
              {onToggleFavorite && (
                <button
                  className="favorite-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening details when clicking heart
                    onToggleFavorite(movie);
                  }}
                >
                  {isFavorite ? '💖' : '🤍'}
                </button>
              )}

              {/* Optional Component for AddFavourites */}
              {FavouriteComponent && (
                <div onClick={(e) => e.stopPropagation()}>
                  <FavouriteComponent />
                </div>
              )}

              <div className="movie-card-overlay">
                <span>Click for details</span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default MovieList;
