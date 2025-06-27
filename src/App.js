import React, { useState, useEffect, useRef } from 'react';
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






//import backgroundImage from '../images/background.png';

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
  const [userMenuOpen, setUserMenuOpen] = useState(false); // 👈 for avatar dropdown
  const [showProfile, setShowProfile] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);


  // Create ref for the dropdown container
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const openForm = (formType) => {
    setActiveForm((prevForm) => (prevForm === formType ? null : formType));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInitials = (email) => {
    const name = email.split('@')[0].replace(/[^a-zA-Z ]/g, '').trim();
    const parts = name.split(/[._\s]+/); // handles john.doe or john doe
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  };

  const handleMovieClick = (movie) => setSelectedMovie(movie);
  const handleCloseMovieDetails = () => setSelectedMovie(null);
  const hasSearchResults = movies && movies.length > 0;
  const defaultKeywords = ['batman', 'spider', 'star', 'love', 'war', 'future', 'dream', 'ghost', 'alien', 'dragon'];

  const fetchRandomMovies = async () => {
    const randomKeyword = defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
    const url = `http://www.omdbapi.com/?s=${randomKeyword}&apikey=9733aa05`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.Search) {
      setMovies(data.Search);
    }
  };

  useEffect(() => {
    if (selectedTab === 'movies' && !searchValue) {
      fetchRandomMovies();
    }

    if (selectedTab === 'movies') {
      setTimeout(() => {
        const el = document.getElementById('movie-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [selectedTab]);

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
        
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        }
      } else {
        // Clear data when user logs out
        setFavorites([]);
        setWatchlist([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedTab === 'movies') {
      setTimeout(() => {
        const input = document.querySelector('.search-center-input, .search-box input');
        if (input) input.focus(); // ✅ Auto-focuses input field

        const el = document.getElementById('movie-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [selectedTab]);

  // Fixed: Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdown container
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // Only add event listener if menu is open
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]); // Depend on menuOpen state

  useEffect(() => {
    const fetchMovies = async () => {
      const url = `http://www.omdbapi.com/?s=${searchValue}&apikey=9733aa05`;
      const response = await fetch(url);
      const responseJson = await response.json();
      if (responseJson.Search) {
        setMovies(responseJson.Search);
      }
    };

    if (searchValue) {
      fetchMovies();
    }
  }, [searchValue]);

  const getMovieRequest = async () => {
    const url = `http://www.omdbapi.com/?s=${searchValue}&apikey=9733aa05`;
    const response = await fetch(url);
    const responseJson = await response.json();
    if (responseJson.Search) {
      setMovies(responseJson.Search);
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

  //Age verification
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
    setSelectedMovie(null);      // ✅ close movie details modal
    setActiveForm('login');      // ✅ open login form modal
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

      {/* Auth Buttons */}
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

      {/* Modals */}
      {/* Login Modal */}
      {activeForm === 'login' && (
        <div className="modal-overlay">
          <LoginForm
            switchForm={openForm}
            onLoginSuccess={handleLoginSuccess} // ✅ Must be passed in
          />
        </div>
      )}

      {/* Signup Modal */}
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
          onClose={() => setShowAccountSettings(false)}
          showToast={showToast}
        />
      )}

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={handleCloseMovieDetails}
          user={user}
          switchForm={openLoginForm} // ✅ fixed
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
                  setSelectedTab('movies');
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
          {!hasSearchResults ? (
            <div className="movie-search-center">
              <input
                type="text"
                className="search-center-input"
                placeholder="Search for movies..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    getMovieRequest(); // or setSelectedTab('movies');
                  }
                }}
              />
            </div>
          ) : (
            <div className="row justify-content-center align-items-center my-4 px-3">
              <div className="row justify-content-between align-items-center mb-3 px-3">
                <div className="text-center">
                  <SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
                </div>
              </div>
              <div className="row">
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
            </div>
          )}
        </>
      )}

      {/* Favorites Page */}
      {selectedTab === 'favorites' && (
        <div className="container-fluid movie-app">
          <div className="row">
            <MovieListHeading heading="" />
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watchlist Page */}
      {selectedTab === 'watchlist' && (
        <div className="container-fluid movie-app">
          <div className="row">
            <MovieListHeading heading="" />
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;