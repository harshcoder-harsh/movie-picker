import React from 'react';

const MovieCard = ({ movie, onMovieSelect, isSelected }) => {
  // Use OMDb properties: Title, Year, Poster
  // Provide a default poster if the API doesn't return one
  const poster = movie.Poster === 'N/A' ? 'https://via.placeholder.com/300x450?text=No+Poster' : movie.Poster;

  // Add a CSS class if the card is selected
  const cardClassName = `movie-card ${isSelected ? 'selected' : ''}`;

  return (
    <div
      className={cardClassName} // Use dynamic class name
      onClick={() => onMovieSelect(movie.imdbID)} // Call handler on click
      style={{ cursor: 'pointer' }} // Add pointer cursor
    >
      <img src={poster} alt={`${movie.Title} Poster`} className="movie-poster" />
      <div className="movie-info">
        <h3>{movie.Title}</h3>
        <p>Year: {movie.Year}</p>
        {/* OMDb search doesn't usually return genre, so we remove it */}
        {/* <p>Genre: {movie.genre}</p> */}
      </div>
    </div>
  );
};

export default MovieCard; 