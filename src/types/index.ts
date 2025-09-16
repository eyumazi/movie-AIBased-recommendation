export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
  imdbRating?: string;
}

export interface MovieDetails extends Movie {
  Plot: string;
  Actors: string;
  Director: string;
  Genre: string;
  Rated: string;
  Runtime: string;
  imdbRating: string;
}
