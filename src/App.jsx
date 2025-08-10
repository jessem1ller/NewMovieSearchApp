import { useEffect, useState } from 'react';
import Search from '@/components/Search.jsx';
import Spinner from '@/components/Spinner.jsx';
import MovieCard from '@/components/MovieCard.jsx';
import Modal from '@/components/Modal.jsx';
import MovieDetail from '@/components/MovieDetail.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from '@/appwrite.js';
import { getMovies, getGenres, getMovieDetails } from '@/services/tmdb.js';

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const movies = await getMovies(query);
      setMovieList(movies);
      if (query && movies.length > 0) {
        await updateSearchCount(query, movies[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  const loadGenres = async () => {
    try {
      const genreData = await getGenres();
      setGenres(genreData);
    } catch (error) {
      console.error(`Error fetching genres: ${error}`);
    }
  };

  const handleMovieClick = async (movie) => {
    setIsModalOpen(true);
    setSelectedMovie(movie);
    setIsModalLoading(true);
    setMovieDetails(null);
    try {
      const details = await getMovieDetails(movie.id);
      setMovieDetails(details);
    } catch (error) {
      console.error(`Error fetching detailed movie data: ${error}`);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
    setMovieDetails(null);
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
    loadGenres();
  }, []);

  return (
    <>
      <main>
        <div className="pattern" />
        <div className="wrapper">
          <header>
            <img src="./hero.png" alt="Hero Banner" />
            <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>
          {trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="all-movies">
            <h2>All Movies</h2>
            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} onCardClick={handleMovieClick} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <MovieDetail
          movie={selectedMovie}
          details={movieDetails}
          isLoading={isModalLoading}
          genres={genres}
        />
      </Modal>
    </>
  );
};

export default App;