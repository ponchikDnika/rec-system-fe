import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { fetchRandomMovies, fetchMoviesByTag, fetchSimilarMovies, fetchMovieDetails } from '../services/api';

export default function MovieRecommendations() {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState(null);

    // Initial load: fetch random movies
    useEffect(() => {
        fetchRandomMovies()
            .then((res) => {
                setMovies(res.data.data);
                setSelectedMovie(null);
                setInfoMessage(null);
            })
            .catch(() => setError('Failed to fetch movies.'));
    }, []);

    const handleTagClick = (tag) => {
        fetchMoviesByTag(tag)
            .then((res) => {
                setMovies(res.data.data);
                setSelectedMovie(null);
                setInfoMessage(null);
            })
            .catch(() => setError(`Failed to fetch movies with tag: ${tag}`));
    };

    const handleMovieClick = (movieId) => {
        Promise.all([
            fetchMovieDetails(movieId),
            fetchSimilarMovies(movieId)
        ])
            .then(([detailsRes, similarRes]) => {
                setSelectedMovie(detailsRes.data);
                if (similarRes.data.data.length > 0) {
                    setMovies(similarRes.data.data);
                    setInfoMessage(null);
                } else {
                    setInfoMessage("No similar movies found. Maybe you'll like these:");
                    return fetchRandomMovies().then((fallbackRes) => setMovies(fallbackRes.data));
                }
            })
            .catch(() => {
                setError("Failed to load movie or recommendations.");
            });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-6">Movie Recommendations</h1>
            {error && <p className="text-red-500 text-center">{error}</p>}
            {infoMessage && <p className="text-yellow-600 text-center">{infoMessage}</p>}

            {selectedMovie && (
                <div className="mb-6 p-4 border rounded shadow bg-white">
                    <h2 className="text-xl font-semibold mb-2">{selectedMovie.title}</h2>
                    <p><strong>Genres:</strong> {selectedMovie.genres.join(', ')}</p>
                    <p>
                        <strong>Links:</strong>
                        {selectedMovie.imdbId && (
                            <a
                                href={`https://www.imdb.com/title/${selectedMovie.imdbId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline ml-2"
                            >IMDB</a>
                        )}
                        {selectedMovie.tmdbId && (
                            <a
                                href={`https://www.themoviedb.org/movie/${selectedMovie.tmdbId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline ml-2"
                            >TMDB</a>
                        )}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {movies.map((movie) => (
                    <Card key={movie.movieId} className="rounded-xl shadow-md">
                        <CardHeader>
                            <CardTitle>
                                <button
                                    onClick={() => handleMovieClick(movie.movieId)}
                                    className="text-blue-500 underline cursor-pointer"
                                >
                                    {movie.title}
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p><strong>Genres:</strong> {movie.genres.join(', ')}</p>
                            <p>
                                <strong>Links:</strong>
                                <ul>
                                {movie.imdbId && (
                                    <li>
                                    <a
                                        href={`https://www.imdb.com/title/${movie.imdbId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline ml-2"
                                    >IMDB</a>
                                    </li>
                                )}
                    
                                
                                {movie.tmdbId && (
                                    <li>
                                        <a
                                        href={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline ml-2"
                                    >TMDB</a>
                                    </li>
                                    
                                )}
                                </ul>
                            </p>
                            <p>
                                <strong>Tags:</strong>{' '}
                                {movie.tags && movie.tags.length > 0 ? (
                                    movie.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            onClick={() => handleTagClick(tag)}
                                            className="text-green-600 underline cursor-pointer ml-1"
                                        >
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500 ml-1">No tags</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
