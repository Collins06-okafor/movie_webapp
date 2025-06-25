import React, { useState, useEffect } from 'react';
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

const App = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const [activeForm, setActiveForm] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const openForm = (formType) => setActiveForm(formType);
  const handleMovieClick = (movie) => setSelectedMovie(movie);
  const handleCloseMovieDetails = () => setSelectedMovie(null);
  

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
        const el = document.getElementById('movie-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [selectedTab]);

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
              duration={toast.duration}
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
      {!user ? (
        <div className="auth-buttons">
          <button className="top-right-button" onClick={() => openForm('login')}>Login</button>
          <button className="top-right-button signup-btn" onClick={() => openForm('signup')}>Sign Up</button>
        </div>
      ) : (
        <div className="top-user-info">
          <p>Welcome, {user.email.split('@')[0]}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Menu Bar */}
      <div className="menu-container">
        <div className="menu-toggle" onClick={toggleMenu}>☰</div>
        <div className={`menu-bar ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => setSelectedTab('home')} className={selectedTab === 'home' ? 'active' : ''}>Home</button>
          <button onClick={() => setSelectedTab('movies')} className={selectedTab === 'movies' ? 'active' : ''}>Movies</button>
          <button onClick={() => setSelectedTab('favorites')} className={selectedTab === 'favorites' ? 'active' : ''}>Favorites</button>
          <button onClick={() => setSelectedTab('watchlist')} className={selectedTab === 'watchlist' ? 'active' : ''}>Watchlist</button>
        </div>
      </div>

      {/* Modals */}
      {activeForm === 'login' && (
        <div className="modal-overlay">
          <LoginForm 
            switchForm={setActiveForm} 
            onLoginSuccess={handleLoginSuccess}
            showToast={showToast}
          />
        </div>
      )}
      {activeForm === 'signup' && (
        <div className="modal-overlay">
          <SignupForm 
            switchForm={setActiveForm} 
            onSignupSuccess={handleSignupSuccess}
            showToast={showToast}
          />
        </div>
      )}
      {selectedMovie && (
        <MovieDetails 
          movie={selectedMovie} 
          onClose={handleCloseMovieDetails} 
          user={user} 
          onRatingSubmit={handleRatingSubmit}
        />
      )}

      {/* Home Page */}
      {selectedTab === 'home' && (
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
      )}

      {/* Movies Page */}
      {selectedTab === 'movies' && (
        <div id="movie-results" className="container-fluid movie-app">
          <div className="row">
            <MovieListHeading heading="Search Results" />
            <SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;