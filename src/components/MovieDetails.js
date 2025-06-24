import React, { useState, useEffect } from 'react';

const MovieDetails = ({ movie, onClose, user }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  // Fetch detailed movie information
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=9733aa05&plot=full`);
        const data = await response.json();
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
  }
}, [movie.imdbID, user]);

  const handleRatingSubmit = () => {
    if (!user) {
      alert('Please log in to rate movies');
      return;
    }
    
    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    const reviewData = {
    rating: userRating,
    review: userReview
  };

  localStorage.setItem(`rating_${user.uid}_${movie.imdbID}`, JSON.stringify(reviewData));

  alert(`Thanks for rating "${movie.Title}" ${userRating} stars!${userReview ? ' Your review: ' + userReview : ''}`);


    // Here you would typically save to a database
    // For now, we'll just show an alert
    alert(`Thanks for rating "${movie.Title}" ${userRating} stars!${userReview ? ' Your review: ' + userReview : ''}`);
    
    // Reset form
    setUserRating(0);
    setUserReview('');
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
        stars.push(
          <span key={i} className={`star ${isFilled ? 'filled' : ''}`}>
            ★
          </span>
        );
      }
    }
    return stars;
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

            <div className="ratings-section">
              <h3>Ratings</h3>
              {movieDetails.Ratings && movieDetails.Ratings.map((rating, index) => (
                <div key={index} className="rating-item">
                  <strong>{rating.Source}:</strong> {rating.Value}
                </div>
              ))}
              {movieDetails.imdbRating && (
                <div className="rating-item">
                  <strong>IMDB Rating:</strong> {movieDetails.imdbRating}/10
                  <div className="stars-display">
                    {renderStars(movieDetails.imdbRating)}
                  </div>
                </div>
              )}
            </div>

            <div className="plot-section">
              <h3>Plot</h3>
              <p>{movieDetails.Plot}</p>
            </div>

            {user && (
              <div className="user-rating-section">
                <h3>Rate This Movie</h3>
                <div className="user-rating-stars">
                  {renderStars(userRating, true)}
                </div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;