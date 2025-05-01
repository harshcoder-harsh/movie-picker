import React, { useState, useEffect } from 'react';
import MovieList from './components/MovieList.jsx';
import RandomPickerButton from './components/RandomPickerButton.jsx';
import PaginationControls from './components/PaginationControls.jsx';
import './App.css';

const API_KEY = 'fa7caa74';
const API_URL_BASE = `http://www.omdbapi.com/?apikey=${API_KEY}`;
const SEARCH_TERM = 'movie';

const MOVIES_PER_PAGE = 10; // OMDb returns 10 per page, so align pagination display

function App() {
  const [currentMovies, setCurrentMovies] = useState([]); // Movies for the *current* page
  const [pickedMovie, setPickedMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for page fetches
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Keep search term, but API doesn't support filtering *and* pagination well
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Function to fetch a specific page of movies
  const fetchMoviePage = async (page, searchTermToUse = SEARCH_TERM) => {
    setIsLoading(true);
    setError(null);
    setCurrentMovies([]); // Clear current movies while loading new page
    try {
      // Note: OMDb API doesn't reliably support searching AND specific page numbers beyond page 100
      // For simplicity, we'll use the default search term for pagination
      const response = await fetch(`${API_URL_BASE}&s=${SEARCH_TERM}&page=${page}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status} on page ${page}`);
      const data = await response.json();

      if (data.Response === "True") {
        setTotalResults(parseInt(data.totalResults, 10));
        const moviesWithId = data.Search.map(movie => ({ ...movie, id: movie.imdbID }));
        setCurrentMovies(moviesWithId);
      } else {
        // Handle cases like "Movie not found." or reaching page limit
        setTotalResults(0);
        setCurrentMovies([]);
        // Don't throw an error for "Movie not found", just show no results
        if (data.Error !== "Movie not found.") {
           setError(data.Error || `Failed to fetch page ${page}`);
        }
      }
    } catch (err) {
      setError(err.message);
      setTotalResults(0);
      setCurrentMovies([]);
      console.error(`Fetching page ${page} failed:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect for initial movie list fetch (page 1)
  useEffect(() => {
    fetchMoviePage(1);
  }, []); // Runs once on mount

  // Effect to fetch details when selectedMovie changes
  useEffect(() => {
    if (!selectedMovie) {
      setSelectedMovieDetails(null);
      setDetailsError(null);
      return;
    }
    const fetchDetails = async () => {
      setIsDetailsLoading(true);
      setDetailsError(null);
      setSelectedMovieDetails(null);
      try {
        const response = await fetch(`${API_URL_BASE}&i=${selectedMovie.imdbID}&plot=full`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.Response === "True") {
          setSelectedMovieDetails(data);
        } else {
          throw new Error(data.Error || 'Failed to fetch movie details');
        }
      } catch (err) {
        setDetailsError(err.message);
        console.error("Fetching details failed:", err);
      } finally {
        setIsDetailsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedMovie]);

  // --- Pagination Logic ---
  // Calculate total pages based on API's totalResults
  const totalPages = Math.ceil(totalResults / MOVIES_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setSelectedMovie(null); // Close details section
      fetchMoviePage(pageNumber); // Fetch the new page
    }
  };
  // --- End Pagination Logic ---

  // --- Filtering Logic (Client-side on current page only - Limitation) ---
  // NOTE: Real filtering across all 6000+ movies would require API support or a backend
  const displayedMovies = currentMovies.filter(movie =>
    movie.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- End Filtering Logic ---

  const handleMovieSelect = (imdbID) => {
    const movie = currentMovies.find(m => m.imdbID === imdbID); // Find in current page movies
    setSelectedMovie(movie || null);
  };

  const handlePickRandom = () => {
    // Pick from the *currently displayed* filtered movies on the page
    if (displayedMovies.length > 0) {
      const randomIndex = Math.floor(Math.random() * displayedMovies.length);
      const randomMovie = displayedMovies[randomIndex];
      setPickedMovie(randomMovie);
      setSelectedMovie(randomMovie); // Show details of the picked movie
    } else {
      console.warn("Cannot pick a movie: No movies available on current page/filter.");
      setPickedMovie(null);
    }
  };

  return (
    <div className="App">
      <h1>Movie Picker</h1>
      <RandomPickerButton
        onPick={handlePickRandom}
        disabled={isLoading || displayedMovies.length === 0}
      />

      {/* Show picked movie (simple display) */}
      {pickedMovie && !selectedMovie && (
         <div className="picked-movie-section">
            {/* ... simple picked movie display ... */}
            <h2>Your Picked Movie:</h2>
            <p>{pickedMovie.Title} ({pickedMovie.Year})</p>
           <img src={pickedMovie.Poster !== 'N/A' ? pickedMovie.Poster : 'https://via.placeholder.com/100x150?text=No+Poster'} alt="Picked Poster" style={{maxWidth: '100px'}}/>
         </div>
      )}

      {/* Search Bar - Note: only filters current page */}
      <div className="search-container">
         <input
          type="text"
          placeholder="Search current page by title..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Display Selected Movie Details */}
      {selectedMovie && (
        <div id="movie-details" className="movie-details-section">
           {/* ... existing details display logic ... */}
           <button onClick={() => setSelectedMovie(null)} className="close-details-button" aria-label="Close details">&times;</button>
           {isDetailsLoading && <div className="details-loading">Loading details...</div>}
           {detailsError && <p className="error-message">Error loading details: {detailsError}</p>}
           {selectedMovieDetails && !isDetailsLoading && (
             <>
               <img src={selectedMovieDetails.Poster === 'N/A' ? 'https://via.placeholder.com/300x450?text=No+Poster' : selectedMovieDetails.Poster} alt={`${selectedMovieDetails.Title} Poster`} className="details-poster" />
               <div className="details-info">
                 <h2>{selectedMovieDetails.Title}</h2>
                 <div className="details-meta">
                   <span>{selectedMovieDetails.Rated}</span>
                   <span>{selectedMovieDetails.Runtime}</span>
                   <span>{selectedMovieDetails.Genre}</span>
                   <span>{selectedMovieDetails.Year}</span>
                 </div>
                 <p className="details-plot">{selectedMovieDetails.Plot}</p>
                 <div className="details-crew">
                   <p><strong>Director:</strong> {selectedMovieDetails.Director}</p>
                   <p><strong>Writer:</strong> {selectedMovieDetails.Writer}</p>
                   <p><strong>Actors:</strong> {selectedMovieDetails.Actors}</p>
                 </div>
               </div>
             </>
           )}
           {!selectedMovieDetails && !isDetailsLoading && !detailsError && (
             <p>Loading details for {selectedMovie.Title}...</p>
           )}
        </div>
      )}

      {/* Movie List Section */}
      <div className="movie-list-section">
        <h2 className="movie-row-title">
           Available Movies {totalResults > 0 ? `(Page ${currentPage} of ${totalPages})` : ''}
        </h2>
        {isLoading && <p className="loading-message">Loading page...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && currentMovies.length === 0 && (
          <p className="no-movies-message">No movies found for this page.</p>
        )}
        {!isLoading && !error && currentMovies.length > 0 && displayedMovies.length === 0 && (
           <p className="no-movies-message">No movies match your search on this page.</p>
        )}

        {!isLoading && !error && displayedMovies.length > 0 && (
          <>
            <MovieList
              movies={displayedMovies} // Pass filtered movies for the current page
              onMovieSelect={handleMovieSelect}
              selectedMovieId={selectedMovie ? selectedMovie.imdbID : null}
            />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages} // Use totalPages calculated from totalResults
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
