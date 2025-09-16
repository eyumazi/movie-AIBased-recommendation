'use server';
/**
 * @fileOverview An AI agent that provides a "vibe check" for a movie.
 *
 * - getVibeCheck - A function that handles the vibe check process.
 * - VibeCheckInput - The input type for the getVibeCheck function.
 * - VibeCheckOutput - The return type for the getVibeCheck function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VibeCheckInputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  year: z.string().describe('The release year of the movie.'),
});
export type VibeCheckInput = z.infer<typeof VibeCheckInputSchema>;

const VibeCheckOutputSchema = z.object({
  vibe: z.string().describe("The AI-generated 'vibe check' for the movie."),
});
export type VibeCheckOutput = z.infer<typeof VibeCheckOutputSchema>;

export async function getVibeCheck(input: VibeCheckInput): Promise<VibeCheckOutput> {
  return vibeCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'vibeCheckPrompt',
  input: { schema: VibeCheckInputSchema },
  output: { schema: VibeCheckOutputSchema },
  prompt: `You are a witty and insightful film critic. A user wants to know the "vibe" of a movie.

Movie Title: {{title}} ({{year}})

Analyze the movie and provide a short, creative summary (2-3 sentences) that captures its overall mood and feeling.
Answer questions like:
- What kind of mood should I be in for this movie?
- Is this a 'popcorn flick' or something that will make me think?
- What's the general atmosphere? (e.g., dark, funny, intense, uplifting)

Your response should be engaging and give the user a unique perspective beyond a simple plot summary. Frame your response as the 'vibe'.`,
});

const vibeCheckFlow = ai.defineFlow(
  {
    name: 'vibeCheckFlow',
    inputSchema: VibeCheckInputSchema,
    outputSchema: VibeCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
