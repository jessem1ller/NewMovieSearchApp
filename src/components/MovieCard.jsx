import React from 'react'

const MovieCard = ({ movie, onCardClick }) => {
  if (!movie) {
    return null;
  }

  const { title, vote_average, poster_path, release_date, original_language } = movie;

  const posterUrl = poster_path ? `/img/t/p/w500${poster_path}` : '/no-movie.png';

  return (
    <div
      className="movie-card cursor-pointer hover:scale-105 hover:shadow-light-100/20 transition-transform duration-300"
      onClick={() => onCardClick(movie)}
    >
      <img
        src={posterUrl}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div className="content">
          <div className="rating">
            <img src="Rating.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>

          <span>•</span>
          <p className="lang">{original_language}</p>

          <span>•</span>
          <p className="year">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MovieCard