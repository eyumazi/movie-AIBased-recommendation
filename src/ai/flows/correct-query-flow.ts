'use server';
/**
 * @fileOverview An AI agent that corrects spelling in a movie search query.
 *
 * - correctQuery - A function that corrects the spelling of a search query.
 * - CorrectQueryInput - The input type for the correctQuery function.
 * - CorrectQueryOutput - The return type for the correctQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CorrectQueryInputSchema = z.object({
  query: z.string().describe('The user\'s raw search query for a movie.'),
});
export type CorrectQueryInput = z.infer<typeof CorrectQueryInputSchema>;

const CorrectQueryOutputSchema = z.object({
  correctedQuery: z.string().describe('The corrected movie title. If no correction is needed, return the original query.'),
});
export type CorrectQueryOutput = z.infer<typeof CorrectQueryOutputSchema>;

export async function correctQuery(input: CorrectQueryInput): Promise<CorrectQueryOutput> {
  return correctQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'correctQueryPrompt',
  input: { schema: CorrectQueryInputSchema },
  output: { schema: CorrectQueryOutputSchema },
  prompt: `You are a helpful assistant that corrects spelling mistakes in movie search queries.
A user has entered the following search term: "{{query}}"

Please correct any spelling errors in this term to match a real movie title.
- If the query seems correct, return the original query.
- Only return the corrected movie title. Do not add any extra text or explanations.

For example:
- "shawshenk redemtion" -> "The Shawshank Redemption"
- "forist gump" -> "Forrest Gump"
- "inception" -> "Inception"
`,
});

const correctQueryFlow = ai.defineFlow(
  {
    name: 'correctQueryFlow',
    inputSchema: CorrectQueryInputSchema,
    outputSchema: CorrectQueryOutputSchema,
  },
  async (input) => {
    // If the query is very short, it's unlikely to be a typo that needs correction,
    // and the AI might over-correct. We'll skip correction for short queries.
    if (input.query.length < 4) {
      return { correctedQuery: input.query };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
