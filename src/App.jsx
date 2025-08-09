import { useEffect, useState } from 'react'
import Search from './components/search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import Modal from './components/Modal.jsx'
import MovieDetail from './components/MovieDetail.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  // --- State variables are unchanged ---
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

  // --- fetchGenres, fetchMovies, and loadTrendingMovies are unchanged ---
  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error(`Error fetching genres: ${error}`);
    }
  };

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
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


  // --- Updated Modal Handlers ---
  const handleMovieClick = async (movie) => {
    setIsModalOpen(true);
    setSelectedMovie(movie);
    setIsModalLoading(true);
    setMovieDetails(null);

    try {
      // Fetch details, credits, and release dates simultaneously
      const [detailsRes, creditsRes, releaseDatesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/movie/${movie.id}`, API_OPTIONS),
        fetch(`${API_BASE_URL}/movie/${movie.id}/credits`, API_OPTIONS),
        fetch(`${API_BASE_URL}/movie/${movie.id}/release_dates`, API_OPTIONS)
      ]);

      if (!detailsRes.ok || !creditsRes.ok || !releaseDatesRes.ok) {
        throw new Error('Failed to fetch all movie data.');
      }

      const detailsData = await detailsRes.json();
      const creditsData = await creditsRes.json();
      const releaseDatesData = await releaseDatesRes.json();

      // Find the director
      const director = creditsData.crew.find(person => person.job === 'Director');

      // Find the US content rating
      let certification = 'N/A';
      const usRelease = releaseDatesData.results.find(r => r.iso_3166_1 === 'US');
      if (usRelease) {
        // Find the first release date entry that has a certification
        const ratedRelease = usRelease.release_dates.find(rd => rd.certification);
        if (ratedRelease) {
          certification = ratedRelease.certification;
        }
      }

      // Combine all data and set state
      setMovieDetails({
        ...detailsData,
        director: director ? director.name : 'N/A',
        certification: certification,
      });
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
    fetchGenres();
  }, []);

  return (
    <>
      <main>
        {/* ... (Your existing main layout is unchanged) ... */}
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
}

export default App;

// import { useEffect, useState } from 'react'
// // Corrected the import paths to be relative to App.jsx inside the src directory.
// import Search from './components/search.jsx'
// import Spinner from './components/Spinner.jsx'
// import MovieCard from './components/MovieCard.jsx'
// import Modal from './components/Modal.jsx'
// import MovieDetail from './components/MovieDetail.jsx'
// import { useDebounce } from 'react-use'
// import { getTrendingMovies, updateSearchCount } from './appwrite.js'

// const API_BASE_URL = 'https://api.themoviedb.org/3';

// // Vite handles environment variables through import.meta.env
// const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// const API_OPTIONS = {
//   method: 'GET',
//   headers: {
//     accept: 'application/json',
//     Authorization: `Bearer ${API_KEY}`
//   }
// };

// const App = () => {
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');

//   const [movieList, setMovieList] = useState([]);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const [trendingMovies, setTrendingMovies] = useState([]);
//   const [genres, setGenres] = useState([]); // State for genres

//   // State for modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedMovie, setSelectedMovie] = useState(null);

//   useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

//   // Function to fetch the list of all movie genres
//   const fetchGenres = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/genre/movie/list`, API_OPTIONS);
//       if (!response.ok) throw new Error('Failed to fetch genres');
//       const data = await response.json();
//       setGenres(data.genres || []);
//     } catch (error) {
//       console.error(`Error fetching genres: ${error}`);
//     }
//   };

//   const fetchMovies = async (query = '') => {
//     setIsLoading(true);
//     setErrorMessage('');
//     try {
//       const endpoint = query
//         ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
//         : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
//       const response = await fetch(endpoint, API_OPTIONS);
//       if (!response.ok) throw new Error('Failed to fetch movies');
//       const data = await response.json();
//       if (data.Response === 'False') {
//         setErrorMessage(data.Error || 'Failed to fetch movies');
//         setMovieList([]);
//         return;
//       }
//       setMovieList(data.results || []);
//       if (query && data.results.length > 0) {
//         await updateSearchCount(query, data.results[0]);
//       }
//     } catch (error) {
//       console.error(`Error fetching movies: ${error}`);
//       setErrorMessage('Error fetching movies. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadTrendingMovies = async () => {
//     try {
//       const movies = await getTrendingMovies();
//       setTrendingMovies(movies);
//     } catch (error) {
//       console.error(`Error fetching trending movies: ${error}`);
//     }
//   };

//   // Handlers for the modal
//   const handleMovieClick = (movie) => {
//     setSelectedMovie(movie);
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     // Delay clearing movie to allow for closing animation if you add one
//     setTimeout(() => setSelectedMovie(null), 300);
//   };

//   useEffect(() => {
//     fetchMovies(debouncedSearchTerm);
//   }, [debouncedSearchTerm]);

//   useEffect(() => {
//     loadTrendingMovies();
//     fetchGenres(); // Fetch genres on initial load
//   }, []);

//   return (
//     // Use a Fragment <> to wrap main and Modal
//     <>
//       <main>
//         <div className="pattern" />
//         <div className="wrapper">
//           <header>
//             <img src="./hero.png" alt="Hero Banner" />
//             <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
//             <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//           </header>

//           {trendingMovies.length > 0 && (
//             <section className="trending">
//               <h2>Trending Movies</h2>
//               <ul>
//                 {trendingMovies.map((movie, index) => (
//                   <li key={movie.$id}>
//                     <p>{index + 1}</p>
//                     <img src={movie.poster_url} alt={movie.title} />
//                   </li>
//                 ))}
//               </ul>
//             </section>
//           )}

//           <section className="all-movies">
//             <h2>All Movies</h2>
//             {isLoading ? (
//               <Spinner />
//             ) : errorMessage ? (
//               <p className="text-red-500">{errorMessage}</p>
//             ) : (
//               <ul>
//                 {movieList.map((movie) => (
//                   // Pass the handleMovieClick function to each card
//                   <MovieCard key={movie.id} movie={movie} onCardClick={handleMovieClick} />
//                 ))}
//               </ul>
//             )}
//           </section>
//         </div>
//       </main>

//       {/* Render the Modal and its content outside of main */}
//       <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
//         <MovieDetail movie={selectedMovie} genres={genres} />
//       </Modal>
//     </>
//   );
// }

// export default App;