import React from 'react';
import MovieCard from './MovieCard.jsx';

const MovieList = ({ movies, onMovieSelect, selectedMovieId }) => {
  return (
    <div className="movie-list">
      {movies.map(movie => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onMovieSelect={onMovieSelect}
          isSelected={selectedMovieId === movie.imdbID}
        />
      ))}
    </div>
  );
};

export default MovieList; 