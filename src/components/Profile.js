import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';

const Profile = ({ user, favorites, watchlist, onClose }) => {
  const [stats, setStats] = useState({
    totalMoviesRated: 0,
    favoriteGenres: [],
    watchTime: 0
  });

  const getInitials = (email) => {
    const name = email.split('@')[0].replace(/[^a-zA-Z ]/g, '').trim();
    const parts = name.split(/[._\s]+/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  };

  const joinDate = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : 'Unknown';

  useEffect(() => {
    // Calculate user stats
    const genres = favorites.reduce((acc, movie) => {
      if (movie.Genre) {
        const movieGenres = movie.Genre.split(', ');
        movieGenres.forEach(genre => {
          acc[genre] = (acc[genre] || 0) + 1;
        });
      }
      return acc;
    }, {});

    const topGenres = Object.entries(genres)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    setStats({
      totalMoviesRated: favorites.length,
      favoriteGenres: topGenres,
      watchTime: favorites.length * 120 // estimate 2 hours per movie
    });
  }, [favorites]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="profile-header">
          <div className="avatar-circle">
            {getInitials(user.email)}
          </div>
          <h2>{user.email}</h2>
          <p className="join-date">Member since {joinDate}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>{favorites.length}</h3>
            <p>Favorite Movies</p>
          </div>
          <div className="stat-card">
            <h3>{watchlist.length}</h3>
            <p>Watchlist Items</p>
          </div>
          <div className="stat-card">
            <h3>{Math.round(stats.watchTime / 60)}</h3>
            <p>Hours of Content</p>
          </div>
        </div>

        {stats.favoriteGenres.length > 0 && (
          <div className="favorite-genres">
            <h3>Top Genres</h3>
            <div className="genre-tags">
              {stats.favoriteGenres.map((genre, index) => (
                <span key={index} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="recent-activity">
          <h3>Recent Favorites</h3>
          <div className="recent-movies">
            {favorites.slice(0, 4).map((movie, index) => (
              <div key={index} className="recent-movie">
                <img src={movie.Poster} alt={movie.Title} />
                <p>{movie.Title}</p>
              </div>
            ))}
          </div>
          {favorites.length === 0 && (
            <p className="no-activity">No favorite movies yet. Start exploring!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;