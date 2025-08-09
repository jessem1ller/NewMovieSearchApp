// src/components/MovieDetail.jsx

const MovieDetail = ({ movie, genres }) => {
  if (!movie) return null;

  // Construct the full URL for the movie poster
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://placehold.co/500x750/0f0d23/cecefb?text=No+Image'; // Fallback placeholder

  // Map genre IDs from the movie object to their names
  const movieGenres = movie.genre_ids.map(id =>
    genres.find(g => g.id === id)?.name
  ).filter(Boolean); // Filter out any undefined genres

  return (
    <div className="flex flex-col md:flex-row gap-8 p-5 md:p-8">
      {/* Left side: Movie Poster */}
      <div className="flex-none w-full md:w-1/3">
        <img
          src={posterUrl}
          alt={`Poster of ${movie.title}`}
          className="rounded-lg w-full h-auto object-cover shadow-lg"
        />
      </div>

      {/* Right side: Movie Details */}
      <div className="flex flex-col gap-4 text-light-100">
        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{movie.title}</h2>

        {/* Genres */}
        {movieGenres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movieGenres.map(genre => (
              <span key={genre} className="bg-light-100/10 text-light-200 text-sm font-medium px-3 py-1 rounded-full">
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Overview */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Overview</h3>
          <p className="text-gray-100 text-base leading-relaxed">{movie.overview || "No overview available."}</p>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-base">
            <div>
                <span className="font-bold text-white">Release Date:</span>
                <p className="text-gray-100">{movie.release_date || 'N/A'}</p>
            </div>
            <div>
                <span className="font-bold text-white">Rating:</span>
                <p className="text-gray-100">{movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : 'N/A'}</p>
            </div>
            <div>
                <span className="font-bold text-white">Language:</span>
                <p className="text-gray-100 uppercase">{movie.original_language || 'N/A'}</p>
            </div>
             <div>
                <span className="font-bold text-white">Popularity:</span>
                <p className="text-gray-100">{movie.popularity ? movie.popularity.toFixed(0) : 'N/A'}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;