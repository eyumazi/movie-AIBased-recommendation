
'use server';
/**
 * @fileOverview An AI agent that suggests movies based on a user's mood.
 *
 * - suggestMoviesByMood - A function that handles the mood-based recommendation process.
 * - SuggestMoviesByMoodInput - The input type for the suggestMoviesByMood function.
 * - SuggestMoviesByMoodOutput - The return type for the suggestMoviesByMood function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestMoviesByMoodInputSchema = z.object({
  vibe: z.string().describe("The user's general feeling (e.g., happy, adventurous, thoughtful)."),
  story: z.string().describe("The kind of story the user wants (e.g., a fun escape, a mind-bending plot, an emotional journey)."),
  avoid: z.string().optional().describe("Anything the user wants to avoid (e.g., too scary, too sad)."),
});
export type SuggestMoviesByMoodInput = z.infer<typeof SuggestMoviesByMoodInputSchema>;

const RecommendedMovieSchema = z.object({
    title: z.string().describe('The title of the recommended movie.'),
    year: z.string().describe('The release year of the recommended movie.'),
    imdbID: z.string().describe('The IMDb ID of the recommended movie.'),
    reason: z.string().describe('A short, compelling reason why this movie fits the user\'s mood.'),
});

const SuggestMoviesByMoodOutputSchema = z.object({
  recommendations: z.array(RecommendedMovieSchema),
});
export type SuggestMoviesByMoodOutput = z.infer<typeof SuggestMoviesByMoodOutputSchema>;

export async function suggestMoviesByMood(input: SuggestMoviesByMoodInput): Promise<SuggestMoviesByMoodOutput> {
  return suggestMoviesByMoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMoviesByMoodPrompt',
  input: { schema: SuggestMoviesByMoodInputSchema },
  output: { schema: SuggestMoviesByMoodOutputSchema },
  prompt: `You are a movie sommelier, an expert at pairing films with feelings. A user has answered a few questions to describe their mood. Your task is to recommend 5 perfect movies that match their vibe.

Here's what the user is looking for:
-   **Current Vibe:** {{vibe}}
-   **Desired Story:** {{story}}
{{#if avoid}}
-   **Want to Avoid:** {{avoid}}
{{/if}}

Synthesize these answers to understand the user's core desire.

For each of the 5 recommendations, you must provide:
1.  The exact movie title.
2.  The release year.
3.  The movie's IMDb ID.
4.  A concise, one-sentence explanation of why this movie is a perfect match for the user's current mood and preferences.

Choose a diverse set of films, but keep them all relevant to the user's request. Do not suggest movies that are extremely obscure or hard to find.`,
});

const suggestMoviesByMoodFlow = ai.defineFlow(
  {
    name: 'suggestMoviesByMoodFlow',
    inputSchema: SuggestMoviesByMoodInputSchema,
    outputSchema: SuggestMoviesByMoodOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
