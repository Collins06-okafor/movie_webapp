import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import './App.css';
import MovieListHeading from './components/MovieListHeading';
import SearchBox from './components/SearchBox';
import AddFavourite from './components/AddFavourites';
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

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const openForm = (formType) => setActiveForm(formType);
  const handleMovieClick = (movie) => setSelectedMovie(movie);
  const handleCloseMovieDetails = () => setSelectedMovie(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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

  const getMovieRequest = async () => {
    const url = `http://www.omdbapi.com/?s=${searchValue}&apikey=9733aa05`;
    const response = await fetch(url);
    const responseJson = await response.json();
    if (responseJson.Search) {
      setMovies(responseJson.Search);
    }
  };

  useEffect(() => {
    if (searchValue) {
      getMovieRequest();
    }
  }, [searchValue]);

  const toggleFavorite = (movie) => {
    if (!user) return alert("Login to manage favorites");
    setFavorites((prev) =>
      prev.find((m) => m.imdbID === movie.imdbID)
        ? prev.filter((m) => m.imdbID !== movie.imdbID)
        : [...prev, movie]
    );
  };

  const toggleWatchlist = (movie) => {
    if (!user) return alert("Login to manage watchlist");
    setWatchlist((prev) =>
      prev.find((m) => m.imdbID === movie.imdbID)
        ? prev.filter((m) => m.imdbID !== movie.imdbID)
        : [...prev, movie]
    );
  };

  const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null); // Clear user state
  } catch (error) {
    console.error("Logout failed:", error);
  }
};


  return (
    <div>
      {/* Auth Buttons */}
      {!user ? (
        <div className="auth-buttons">
          <button className="top-right-button" onClick={() => openForm('login')}>Login</button>
          <button className="top-right-button signup-btn" onClick={() => openForm('signup')}>Sign Up</button>
        </div>
      ) : (
        <div className="top-user-info">
          <p>Welcome, {user.email}</p>
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
          <LoginForm switchForm={setActiveForm} />
        </div>
      )}
      {activeForm === 'signup' && (
        <div className="modal-overlay">
          <SignupForm switchForm={setActiveForm} />
        </div>
      )}
      {selectedMovie && (
        <MovieDetails movie={selectedMovie} onClose={handleCloseMovieDetails} user={user} />
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

      {/* Movies Tab */}
      {selectedTab === 'movies' && (
        <div className='container-fluid movie-app'>
          <div className='row d-flex align-items-center mt-4 mb-4'>
            <MovieListHeading heading='Movies' />
            <SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
          </div>
          <div className='row' id="movie-results">
            <MovieList
              movies={movies}
              onMovieClick={handleMovieClick}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
              favouriteComponent={AddFavourite}
            />
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {selectedTab === 'favorites' && (
        <div className='container-fluid movie-app'>
          <div className='row d-flex align-items-center mt-4 mb-4'>
            <MovieListHeading heading='Your Favorites' />
          </div>
          <div className='row'>
            {favorites.length > 0 ? (
              <MovieList
                movies={favorites}
                onMovieClick={handleMovieClick}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
                favouriteComponent={AddFavourite}
              />
            ) : (
              <p className="text-center w-100">No favorites yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Watchlist Tab */}
      {selectedTab === 'watchlist' && (
        <div className="watchlist-section">
          <h2>Watchlist</h2>
          <p>No movies in your watchlist.</p>
        </div>
      )}
    </div>
  );
};

export default App;
