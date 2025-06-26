import React, { useState, useEffect } from 'react';
import { addToWatchlist, getWatchlist, removeFromWatchlist } from '../services/firestore';
import AddToWatchlist from './AddToWatchlist';

const MovieDetails = ({ movie, onClose, user, switchForm }) => {

  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [watchlist, setWatchlist] = useState([]);
  const [showDetails, setShowDetails] = useState(false); // for toggling plot & rating
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');





  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=9733aa05&plot=full`);
        const data = await res.json();
        setMovieDetails(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setLoading(false);
      }
    };

    fetchMovieDetails();

    if (user) {
      const saved = localStorage.getItem(`rating_${user.uid}_${movie.imdbID}`);
      if (saved) {
        const { rating, review } = JSON.parse(saved);
        setUserRating(rating);
        setUserReview(review);
      }

      getWatchlist().then(setWatchlist);
    }
  }, [movie.imdbID, user]);

  const handleRatingSubmit = () => {
  if (!user) {
    setRatingMessage('Please log in to rate movies.');
    return;
  }

  if (userRating === 0) {
    setRatingMessage('Please select a star rating before submitting.');
    return;
  }

  const reviewData = {
    rating: userRating,
    review: userReview,
  };

  localStorage.setItem(`rating_${user.uid}_${movie.imdbID}`, JSON.stringify(reviewData));

  setHasRated(true);
  setRatingMessage(`Thanks for rating "${movie.Title}" ${userRating} star${userRating > 1 ? 's' : ''}!`);
};


  const renderStars = (rating, interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 10; i++) {
      if (interactive) {
        stars.push(
          <span
            key={i}
            className={`star ${i <= (hoveredStar || userRating) ? 'filled' : ''}`}
            onClick={() => setUserRating(i)}
            onMouseEnter={() => setHoveredStar(i)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            ★
          </span>
        );
      } else {
        const isFilled = i <= fullStars || (i === fullStars + 1 && hasHalfStar);
        stars.push(<span key={i} className={`star ${isFilled ? 'filled' : ''}`}>★</span>);
      }
    }
    return stars;
  };

  const isInWatchlist = watchlist.some((item) => item.imdbID === movie.imdbID);
  const docId = watchlist.find((item) => item.imdbID === movie.imdbID)?.id;

  const toggleWatchlist = async () => {
    if (!user) return alert('Log in first');
    if (isInWatchlist) {
      await removeFromWatchlist(docId);
    } else {
      await addToWatchlist(movie);
    }
    const updated = await getWatchlist();
    setWatchlist(updated);
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="movie-details-modal">
          <div className="loading">Loading movie details...</div>
        </div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="modal-overlay">
        <div className="movie-details-modal">
          <div className="error">Failed to load movie details</div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  {showLoginPrompt && (
  <div className="login-modal-overlay" onClick={() => setShowLoginPrompt(false)}>
    <div className="login-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Please Log In</h2>
      <p>To view more details and interact, you need to log in.</p>
      <button className="login-confirm-btn" onClick={() => {
        setShowLoginPrompt(false);
        switchForm('login'); // now switch form from parent App
      }}>
        Go to Login
      </button>
      <button className="close-btn" onClick={() => setShowLoginPrompt(false)}>Cancel</button>
    </div>
  </div>
)}


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="movie-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="movie-details-content">
          <div className="movie-poster-section">
            <img src={movieDetails.Poster} alt={movieDetails.Title} className="movie-poster-large" />
          </div>

          <div className="movie-info-section">
            <h2>{movieDetails.Title} ({movieDetails.Year})</h2>

            <div className="movie-meta">
              <p><strong>Genre:</strong> {movieDetails.Genre}</p>
              <p><strong>Runtime:</strong> {movieDetails.Runtime}</p>
              <p><strong>Director:</strong> {movieDetails.Director}</p>
              <p><strong>Cast:</strong> {movieDetails.Actors}</p>
            </div>


            {/* Toggle Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="toggle-details-btn"
            >
              {showDetails ? 'Hide Details' : '...more'}
            </button>

            {/* Conditionally show Plot & Ratings */}
            {showDetails && (
              <>
                {!user ? (
                  <div className="login-prompt">
                    <p><strong>Login to get more details on this movie.</strong></p>
                    <button
                      className="login-btn"
                      onClick={() => switchForm('login')}
                    >
                      Login
                    </button>
                  </div>
                ) : (

                  <>
                    <div className="plot-section">
                      <h3>Plot</h3>
                      <p>{movieDetails.Plot?.split('. ')[0]}.</p>
                    </div>

                    <div className="ratings-section">
                      <h3>Ratings</h3>
                      {movieDetails.Ratings?.map((rating, index) => (
                        <div key={index} className="rating-item">
                          <strong>{rating.Source}:</strong> {rating.Value}
                        </div>
                      ))}
                      {movieDetails.imdbRating && (
                        <div className="rating-item">
                          <strong>IMDB Rating:</strong> {movieDetails.imdbRating}/10
                          <div className="stars-display">{renderStars(movieDetails.imdbRating)}</div>
                        </div>
                      )}
                    </div>
                    {user && userRating > 0 && (
                      <div className="rating-item user-rating-display">
                        <strong>Your Rating:</strong> {userRating}/10
                        <div className="stars-display">{renderStars(userRating)}</div>
                        {userReview && <p className="user-review">"{userReview}"</p>}
                      </div>
                    )}

                  </>
                )}
              </>
            )}

            {user && !hasRated && (
              <div className="user-rating-section">
                <h3>Rate This Movie</h3>
                <div className="user-rating-stars">{renderStars(userRating, true)}</div>
                <p>Your Rating: {userRating}/10</p>

                <textarea
                  placeholder="Write a review (optional)"
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  className="review-textarea"
                />

                <button onClick={handleRatingSubmit} className="submit-rating-btn">
                  Submit Rating
                </button>

                {ratingMessage && <p className="rating-feedback">{ratingMessage}</p>}
              </div>
            )}

            {user && hasRated && (
              <div className="rating-feedback success-message">
                <p>{ratingMessage}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
