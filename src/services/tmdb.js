const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const apiFetch = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, API_OPTIONS);
  if (!response.ok) {
    throw new Error(`Failed to fetch from endpoint: ${endpoint}`);
  }
  return response.json();
};

export const getMovies = async (query = '') => {
  const endpoint = query
    ? `/search/movie?query=${encodeURIComponent(query)}`
    : '/discover/movie?sort_by=popularity.desc';
  const data = await apiFetch(endpoint);
  return data.results || [];
};

export const getGenres = async () => {
  const data = await apiFetch('/genre/movie/list');
  return data.genres || [];
};

export const getMovieDetails = async (movieId) => {
  const [detailsData, creditsData, releaseDatesData] = await Promise.all([
    apiFetch(`/movie/${movieId}`),
    apiFetch(`/movie/${movieId}/credits`),
    apiFetch(`/movie/${movieId}/release_dates`)
  ]);

  const director = creditsData.crew.find(person => person.job === 'Director');

  let certification = 'N/A';
  const usRelease = releaseDatesData.results.find(r => r.iso_3166_1 === 'US');
  if (usRelease) {
    const ratedRelease = usRelease.release_dates.find(rd => rd.certification);
    if (ratedRelease) {
      certification = ratedRelease.certification;
    }
  }

  return {
    ...detailsData,
    director: director ? director.name : 'N/A',
    certification: certification,
  };
};