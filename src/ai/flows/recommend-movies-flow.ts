'use server';
/**
 * @fileOverview A movie recommendation AI agent.
 *
 * - recommendMovies - A function that handles the movie recommendation process.
 * - RecommendMoviesInput - The input type for the recommendMovies function.
 * - RecommendMoviesOutput - The return type for the recommendMovies function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Movie } from '@/types';

const MovieSchema = z.object({
  Title: z.string(),
  Year: z.string(),
  imdbID: z.string(),
  Type: z.string(),
  Poster: z.string(),
});

const RecommendMoviesInputSchema = z.object({
  watchlist: z.array(MovieSchema).describe('The list of movies the user has watched and liked.'),
});
export type RecommendMoviesInput = z.infer<typeof RecommendMoviesInputSchema>;

const RecommendedMovieSchema = z.object({
    title: z.string().describe('The title of the recommended movie.'),
    year: z.string().describe('The release year of the recommended movie.'),
    imdbID: z.string().describe('The IMDb ID of the recommended movie.'),
    reason: z.string().describe('A short, compelling reason why the user might like this movie, based on their watchlist.'),
});

const RecommendMoviesOutputSchema = z.object({
  recommendations: z.array(RecommendedMovieSchema),
});
export type RecommendMoviesOutput = z.infer<typeof RecommendMoviesOutputSchema>;

export async function recommendMovies(movies: Movie[]): Promise<RecommendMoviesOutput> {
  return recommendMoviesFlow({ watchlist: movies });
}

const prompt = ai.definePrompt({
  name: 'recommendMoviesPrompt',
  input: { schema: RecommendMoviesInputSchema },
  output: { schema: RecommendMoviesOutputSchema },
  prompt: `You are a sophisticated film critic and recommendation expert with a deep knowledge of world cinema history. Your goal is to provide 5 thoughtful and surprising movie recommendations based on a user's watchlist.

Analyze the user's watchlist below. Look for deeper connections and underlying patterns. Consider shared genres, storytelling themes, actors, directors, and country of origin. For instance, if you see multiple films from a specific director or country, suggest another of their key works. If you detect that the watchlist is predominantly from a specific region (e.g., Indian cinema), you should prioritize recommendations from that same region. Avoid obvious, blockbuster suggestions unless they are a perfect fit.

For each of the 5 recommendations, you must provide:
1.  The exact movie title.
2.  The release year.
3.  The movie's IMDb ID.
4.  A compelling, one-sentence explanation for the recommendation. This reason should be insightful, connecting the recommendation to a specific aspect (e.g., shared genre, director, cast, country, or story elements) of one or more movies on their watchlist.

IMPORTANT: Do not recommend any movies that are already on the user's watchlist.

User's Watchlist:
{{#each watchlist}}
- {{Title}} ({{Year}})
{{/each}}
`,
});

const recommendMoviesFlow = ai.defineFlow(
  {
    name: 'recommendMoviesFlow',
    inputSchema: RecommendMoviesInputSchema,
    outputSchema: RecommendMoviesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
