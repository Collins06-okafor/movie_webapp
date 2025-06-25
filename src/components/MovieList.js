import React from 'react';

const MovieList = ({
  movies,
  onMovieClick,
  handleFavouritesClick,
  handleWatchlistClick,
  favourites = [],
  favorites = [],
  watchlist = [],
  favouriteComponent: FavouriteComponent,
  watchlistComponent: WatchlistComponent,
}) => {
  return (
    <>
      {movies.map((movie) => {
        const isFavorite = favorites?.some((fav) => fav.imdbID === movie.imdbID);
        const isInWatchlist = watchlist?.some((w) => w.imdbID === movie.imdbID);

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

              {/* Favorite (Heart Icon) */}
              <button
                className="favorite-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavouritesClick(movie);
                }}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                {isFavorite ? '💖' : '🤍'}
              </button>

              {/* Watchlist (Plus/Minus Icon) */}
              <button
                className="watchlist-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWatchlistClick(movie);
                }}
                title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {isInWatchlist ? '➖' : '➕'}
              </button>


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
