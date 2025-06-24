import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MovieList from './components/MovieList';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import './App.css';
import MovieListHeading from './components/MovieListHeading';
import SearchBox from './components/SearchBox';
import { auth } from './firebase/config'; // Fixed: Added ./ to make it relative
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App = () => {
  const [activeForm, setActiveForm] = useState(null); // 'login' | 'signup' | null
  const [user, setUser] = useState(null);

  const toggleForm = (formType) => {
  setActiveForm((prevForm) => (prevForm === formType ? null : formType));
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    alert('Logged out');
  };

  const [movies, setMovies] = useState([
    {
      Title: "Batman Begins",
      Year: "2005",
      imdbID: "tt0372784",
      Type: "movie",
      Poster: "https://m.media-amazon.com/images/M/MV5BODIyMDdhNTgtNDlmOC00MjUxLWE2NDItODA5MTdkNzY3ZTdhXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
      Title: "The Batman",
      Year: "2022",
      imdbID: "tt1877830",
      Type: "movie",
      Poster: "https://m.media-amazon.com/images/M/MV5BMmU5NGJlMzAtMGNmOC00YjJjLTgyMzUtNjAyYmE4Njg5YWMyXkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
      Title: "Batman v Superman: Dawn of Justice",
      Year: "2016",
      imdbID: "tt2975590",
      Type: "movie",
      Poster: "https://m.media-amazon.com/images/M/MV5BZTJkYjdmYjYtOGMyNC00ZGU1LThkY2ItYTc1OTVlMmE2YWY1XkEyXkFqcGc@._V1_SX300.jpg"
    },
    {
      Title: "Batman",
      Year: "1989",
      imdbID: "tt0096895",
      Type: "movie",
      Poster: "https://m.media-amazon.com/images/M/MV5BYzZmZWViM2EtNzhlMi00NzBlLWE0MWEtZDFjMjk3YjIyNTBhXkEyXkFqcGc@._V1_SX300.jpg"
    }
  ]);
  const [searchValue, setSearchValue] = useState ('');

  const getMovieRequest = async () => {
  const url = `http://www.omdbapi.com/?s=${searchValue}&apikey=9733aa05`; // ✅ backticks!

  const response = await fetch(url);
  const responseJson = await response.json();

  if (responseJson.Search) {
    setMovies(responseJson.Search);
  }
};

  useEffect(() => {
    getMovieRequest(searchValue);
  }, [searchValue]);

  return (
    <div>
      {/* Top buttons */}
      {!user && (
        <>
          <button className="top-right-button" onClick={() => toggleForm('login')}>
            {activeForm === 'login' ? 'Close Login' : 'Login'}
          </button>
          <button className="top-right-button signup-btn" onClick={() => toggleForm('signup')}>
            {activeForm === 'signup' ? 'Close Signup' : 'Sign Up'}
          </button>
        </>
      )}

      {user && (
        <div className="top-user-info">
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Modals */}
      {activeForm === 'login' && (
        <div className="modal-overlay">
          <LoginForm switchForm={toggleForm} />
        </div>
      )}
      {activeForm === 'signup' && (
        <div className="modal-overlay">
          <SignupForm switchForm={toggleForm} />
        </div>
      )}

      {/* Movie list */}
      <div className='container-fluid movie-app'>
        <div className='row d-flex align-items-center mt-4 mb-4'>
          <MovieListHeading heading='Movies' />
          <SearchBox searchValue={searchValue} setSearchValue={setSearchValue}/>
          </div>
        <div className='row'>
          <MovieList movies={movies} />
        </div>
      </div>
    </div>
  );
};

export default App;