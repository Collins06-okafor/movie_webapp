import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Toast from './components/Toast';
import Modal from './components/Modal';
import './App.css';
import MovieListHeading from './components/MovieListHeading';
import SearchBox from './components/SearchBox';
import AddFavourite from './components/AddFavourites';
import AddToWatchlist from './components/AddToWatchlist';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import AgeVerification from './components/AgeVerification';
import Profile from './components/Profile';
import AccountSettings from './components/AccountSettings';
import './i18n'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import Footer from './components/Footer';

const App = () => {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const [activeForm, setActiveForm] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [settings, setSettings] = useState({
    preferences: {
      contentRating: 'R',
    },
  });

  // Create ref for the dropdown container
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  
  const openForm = (formType) => {
    setActiveForm((prevForm) => (prevForm === formType ? null : formType));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInitials = (email) => {
    const name = email.split('@')[0].replace(/[^a-zA-Z ]/g, '').trim();
    const parts = name.split(/[._\s]+/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  };

  const handleMovieClick = (movie) => setSelectedMovie(movie);
  const handleCloseMovieDetails = () => setSelectedMovie(null);
  const hasSearchResults = movies && movies.length > 0;
  const defaultKeywords = ['batman', 'spider', 'star', 'love', 'war', 'future', 'dream', 'ghost', 'alien', 'dragon'];

  // Memoized function to prevent unnecessary re-renders
  const fetchMoviesWithRatings = useCallback(async (keyword) => {
    if (!keyword.trim()) return;
    
    setIsLoading(true);
    try {
      const url = `https://www.omdbapi.com/?s=${encodeURIComponent(keyword)}&apikey=9733aa05`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.Search) {
        setMovies([]);
        showToast('No movies found for your search', 'info');
        return;
      }

      // Limit concurrent requests to prevent API rate limiting
      const batchSize = 5;
      const detailedMovies = [];
      
      for (let i = 0; i < data.Search.length; i += batchSize) {
        const batch = data.Search.slice(i, i + batchSize);
        const batchPromises = batch.map(async (movie) => {
          try {
            const res = await fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=9733aa05`);
            return res.json();
          } catch (error) {
            console.error(`Error fetching details for ${movie.Title}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        detailedMovies.push(...batchResults.filter(movie => movie && movie.Response !== 'False'));
      }

      const allowedRatings = ['G', 'PG', 'PG-13', 'R'];
      const ratingLimit = settings?.preferences?.contentRating || 'R';
      const limitIndex = allowedRatings.indexOf(ratingLimit);

      const filtered = detailedMovies.filter(
        (movie) => allowedRatings.indexOf(movie.Rated) <= limitIndex
      );

      setMovies(filtered);
    } catch (error) {
      console.error('Error fetching movies:', error);
      showToast('Error fetching movies. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [settings?.preferences?.contentRating]);

  const fetchRandomMovies = useCallback(async () => {
    const randomKeyword = defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
    await fetchMoviesWithRatings(randomKeyword);
  }, [fetchMoviesWithRatings]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.trim()) {
        fetchMoviesWithRatings(searchTerm);
      }
    }, 500),
    [fetchMoviesWithRatings]
  );

  useEffect(() => {
    if (selectedTab === 'movies') {
      // If there's a search value, search for it, otherwise show random movies
      if (searchValue.trim()) {
        fetchMoviesWithRatings(searchValue);
      } else if (!hasSearchResults) {
        fetchRandomMovies();
      }

      setTimeout(() => {
        const el = document.getElementById('movie-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [selectedTab, fetchMoviesWithRatings, fetchRandomMovies, searchValue]);

  // Toast management
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Modal management
  const showModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Load user's favorites and watchlist from localStorage
        const savedFavorites = localStorage.getItem(`favorites_${user.uid}`);
        const savedWatchlist = localStorage.getItem(`watchlist_${user.uid}`);
        const savedSettings = localStorage.getItem(`settings_${user.uid}`);
        
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        }
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } else {
        // Clear data when user logs out
        setFavorites([]);
        setWatchlist([]);
        setSettings({
          preferences: {
            contentRating: 'R',
          },
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedTab === 'movies') {
      setTimeout(() => {
        const input = document.querySelector('.search-center-input, .search-box input');
        if (input) input.focus();

        const el = document.getElementById('movie-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [selectedTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Handle search input changes with debouncing
  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (selectedTab === 'movies') {
      debouncedSearch(value);
    }
  };

  // Handle search from home page - switch to movies tab and trigger search
  const handleHomeSearch = (searchTerm) => {
    setSearchValue(searchTerm);
    setSelectedTab('movies');
    // The search will be triggered by the useEffect when selectedTab changes
  };

  const getMovieRequest = () => {
    if (searchValue) {
      fetchMoviesWithRatings(searchValue);
    }
  };

  const toggleFavorite = (movie) => {
    if (!user) {
      showModal('Login Required', 'Please log in to manage your favorites.', 'warning');
      return;
    }

    const isCurrentlyFavorite = favorites.find((m) => m.imdbID === movie.imdbID);
    let newFavorites;

    if (isCurrentlyFavorite) {
      newFavorites = favorites.filter((m) => m.imdbID !== movie.imdbID);
      showToast(`"${movie.Title}" removed from favorites`, 'info');
    } else {
      newFavorites = [...favorites, movie];
      showToast(`"${movie.Title}" added to favorites`, 'success');
    }

    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(newFavorites));
  };

  const toggleWatchlist = (movie) => {
    if (!user) {
      showModal('Login Required', 'Please log in to manage your watchlist.', 'warning');
      return;
    }

    const isCurrentlyInWatchlist = watchlist.find((m) => m.imdbID === movie.imdbID);
    let newWatchlist;

    if (isCurrentlyInWatchlist) {
      newWatchlist = watchlist.filter((m) => m.imdbID !== movie.imdbID);
      showToast(`"${movie.Title}" removed from watchlist`, 'info');
    } else {
      newWatchlist = [...watchlist, movie];
      showToast(`"${movie.Title}" added to watchlist`, 'success');
    }

    setWatchlist(newWatchlist);
    localStorage.setItem(`watchlist_${user.uid}`, JSON.stringify(newWatchlist));
  };

  // Age verification
  if (!isAgeVerified) {
    return <AgeVerification onVerify={setIsAgeVerified} />;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error("Logout failed:", error);
      showToast('Logout failed. Please try again.', 'error');
    }
  };

  const handleLoginSuccess = () => {
    showToast('Login successful!', 'success');
    setActiveForm(null);
  };

  const handleSignupSuccess = () => {
    showToast('Signup successful!', 'success');
    setActiveForm('login');
  };

  const handleRatingSubmit = (movieTitle, rating, review) => {
    showModal(
      'Rating Submitted',
      `Thanks for rating "${movieTitle}" ${rating} stars!${review ? '\n\nYour review: ' + review : ''}`,
      'success'
    );
  };

  const openLoginForm = () => {
    setSelectedMovie(null);
    setActiveForm('login');
  };

  return (
    <div>
      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={1500}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        type={modal.type}
      >
        <p style={{ whiteSpace: 'pre-line' }}>{modal.message}</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={closeModal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Navigation Menu */}
      <div className="menu-container">
        <div className="menu-toggle" onClick={toggleMenu}>☰</div>
        <div className={`menu-bar ${menuOpen ? 'open' : ''}`}>
          {/* Menu Links */}
          <button onClick={() => setSelectedTab('home')} className={selectedTab === 'home' ? 'active' : ''}>Home</button>
          <button onClick={() => setSelectedTab('movies')} className={selectedTab === 'movies' ? 'active' : ''}>Movies</button>
          <button onClick={() => setSelectedTab('favorites')} className={selectedTab === 'favorites' ? 'active' : ''}>Favorites</button>
          <button onClick={() => setSelectedTab('watchlist')} className={selectedTab === 'watchlist' ? 'active' : ''}>Watchlist</button>

          {/* Right-aligned avatar and greeting */}
          <div className="menu-right">
            {user ? (
              <div className="user-avatar-dropdown" ref={dropdownRef}>
                <div className="user-avatar" onClick={() => setMenuOpen(prev => !prev)}>
                  {getInitials(user.email)}
                </div>

                {menuOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-email">{user.email}</div>
                  <hr />
                  <button onClick={() => {
                    setMenuOpen(false);
                    setShowProfile(true);
                  }}>
                    👤 Profile
                  </button>
                  <button onClick={() => {
                    setMenuOpen(false);
                    setShowAccountSettings(true);
                  }}>
                    ⚙️ Account Settings
                  </button>
                  <button onClick={() => {
                    setMenuOpen(false);
                    setActiveForm('login');
                  }}>
                    🔁 Switch User
                  </button>
                  <button onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}>
                    🚪 Log Out
                  </button>
                </div>
              )}
              </div>
            ) : (
              <div className="auth-controls">
                <button className="menu-auth-btn" onClick={() => openForm('login')}>Login</button>
                <button className="menu-auth-btn" onClick={() => openForm('signup')}>Sign Up</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Authentication Modals */}
      {activeForm === 'login' && (
        <div className="modal-overlay">
          <LoginForm
            switchForm={openForm}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      )}

      {activeForm === 'signup' && (
        <div className="modal-overlay">
          <SignupForm 
            switchForm={setActiveForm} 
            onSignupSuccess={handleSignupSuccess}
          />
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <Profile
          user={user}
          favorites={favorites}
          watchlist={watchlist}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings
          user={user}
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowAccountSettings(false)}
          showToast={showToast}
        />
      )}

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={handleCloseMovieDetails}
          user={user}
          switchForm={openLoginForm}
        />
      )}

      {/* Home Page */}
      {selectedTab === 'home' && (
        <>
          <div className="home-hero">
            <div className="overlay">
              <h1 className="hero-title">Welcome to C-Box 🎬</h1>
              <input
                type="text"
                className="hero-search"
                placeholder="Search for movies..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleHomeSearch(e.target.value);
                  }
                }}
              />
            </div>
          </div>
          <Footer />
        </>
      )}

      {/* Movies Page */}
      {selectedTab === 'movies' && (
        <>
          {!hasSearchResults && !isLoading ? (
            <div className="movie-search-center">
              <input
                type="text"
                className="search-center-input"
                placeholder="Search for movies..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    getMovieRequest();
                  }
                }}
              />
            </div>
          ) : (
            <div className="row justify-content-center align-items-center my-4 px-3">
              <div className="row justify-content-between align-items-center mb-3 px-3">
                <div className="text-center">
                  <SearchBox 
                    searchValue={searchValue} 
                    setSearchValue={handleSearchChange}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p>Loading movies...</p>
                </div>
              ) : (
                <div className="row" id="movie-results">
                  <MovieList
                    movies={movies}
                    favouriteComponent={AddFavourite}
                    handleFavouritesClick={toggleFavorite}
                    watchlistComponent={AddToWatchlist}
                    handleWatchlistClick={toggleWatchlist}
                    onMovieClick={handleMovieClick}
                    favorites={favorites}
                    watchlist={watchlist}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Favorites Page */}
      {selectedTab === 'favorites' && (
        <div className="container-fluid movie-app">
          <div className="row">
            <MovieListHeading heading="Your Favorites" />
          </div>
          <div className="row">
            {favorites.length > 0 ? (
              <MovieList
                movies={favorites}
                favouriteComponent={AddFavourite}
                handleFavouritesClick={toggleFavorite}
                watchlistComponent={AddToWatchlist}
                handleWatchlistClick={toggleWatchlist}
                onMovieClick={handleMovieClick}
                favorites={favorites}
                watchlist={watchlist}
              />
            ) : (
              <div className="col-12 text-center">
                <h3>No favorites yet</h3>
                <p>Start adding movies to your favorites!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setSelectedTab('movies')}
                >
                  Browse Movies
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watchlist Page */}
      {selectedTab === 'watchlist' && (
        <div className="container-fluid movie-app">
          <div className="row">
            <MovieListHeading heading="Your Watchlist" />
          </div>
          <div className="row">
            {watchlist.length > 0 ? (
              <MovieList
                movies={watchlist}
                favouriteComponent={AddFavourite}
                handleFavouritesClick={toggleFavorite}
                watchlistComponent={AddToWatchlist}
                handleWatchlistClick={toggleWatchlist}
                onMovieClick={handleMovieClick}
                favorites={favorites}
                watchlist={watchlist}
              />
            ) : (
              <div className="col-12 text-center">
                <h3>No movies in watchlist</h3>
                <p>Add movies you want to watch later!</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setSelectedTab('movies')}
                >
                  Browse Movies
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default App;