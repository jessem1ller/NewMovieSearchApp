import React from 'react';
import Spinner from './Spinner.jsx';

const MovieDetail = ({ movie, details, isLoading, genres }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  const displayData = details || movie;
  if (!displayData) return null;

  const posterUrl = displayData.poster_path
    ? `/img/t/p/w500${displayData.poster_path}`
    : 'https://placehold.co/500x750/0f0d23/cecefb?text=No+Image';

  const movieGenres = (displayData.genres || displayData.genre_ids.map(id => genres.find(g => g.id === id)))
    .map(g => g?.name)
    .filter(Boolean);

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-5 md:p-8">
      <div className="flex-none w-full md:w-1/3">
        <img
          src={posterUrl}
          alt={`Poster of ${displayData.title}`}
          className="rounded-lg w-full h-auto object-cover shadow-lg"
        />
      </div>

      <div className="flex flex-col gap-4 text-light-100">
        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{displayData.title}</h2>

        {movieGenres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movieGenres.map(genre => (
              <span key={genre} className="bg-light-100/10 text-light-200 text-sm font-medium px-3 py-1 rounded-full">
                {genre}
              </span>
            ))}
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold text-white mb-2">Overview</h3>
          <p className="text-gray-100 text-base leading-relaxed">{displayData.overview || "No overview available."}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4 pt-4 text-base border-t border-light-100/10">
            <div>
                <span className="font-bold text-white">User Rating:</span>
                <p className="text-gray-100">{displayData.vote_average ? `${displayData.vote_average.toFixed(1)} / 10` : 'N/A'}</p>
            </div>
            <div>
                <span className="font-bold text-white">MPAA Rating:</span>
                <p className="text-gray-100">{details?.certification || 'N/A'}</p>
            </div>
            <div>
                <span className="font-bold text-white">Runtime:</span>
                <p className="text-gray-100">{formatRuntime(details?.runtime)}</p>
            </div>
            <div>
                <span className="font-bold text-white">Director:</span>
                <p className="text-gray-100">{details?.director || 'N/A'}</p>
            </div>
            <div>
                <span className="font-bold text-white">Release Date:</span>
                <p className="text-gray-100">{displayData.release_date || 'N/A'}</p>
            </div>
            {details?.production_companies?.[0] && (
              <div className="col-span-2 md:col-span-1">
                  <span className="font-bold text-white">Studio:</span>
                  <p className="text-gray-100">{details.production_companies[0].name}</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
