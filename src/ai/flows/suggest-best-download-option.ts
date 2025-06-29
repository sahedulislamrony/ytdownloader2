// src/ai/flows/suggest-best-download-option.ts
'use server';

/**
 * @fileOverview A tool that uses GenAI to suggest the best download option based on the provided video formats.
 *
 * - suggestBestDownloadOption - A function that suggests the best download option.
 * - SuggestBestDownloadOptionInput - The input type for the suggestBestDownloadOption function.
 * - SuggestBestDownloadOptionOutput - The return type for the suggestBestDownloadOption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBestDownloadOptionInputSchema = z.object({
  formats: z.string().describe('A list of available download formats from yt-dlp.'),
  videoTitle: z.string().describe('The title of the video being downloaded.'),
});
export type SuggestBestDownloadOptionInput = z.infer<typeof SuggestBestDownloadOptionInputSchema>;

const SuggestBestDownloadOptionOutputSchema = z.object({
  suggestedFormat: z.string().describe('The suggested download format based on resolution, codec, and file size.'),
  reason: z.string().describe('The reasoning behind the suggested format selection.'),
});
export type SuggestBestDownloadOptionOutput = z.infer<typeof SuggestBestDownloadOptionOutputSchema>;

export async function suggestBestDownloadOption(input: SuggestBestDownloadOptionInput): Promise<SuggestBestDownloadOptionOutput> {
  return suggestBestDownloadOptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBestDownloadOptionPrompt',
  input: {schema: SuggestBestDownloadOptionInputSchema},
  output: {schema: SuggestBestDownloadOptionOutputSchema},
  prompt: `You are an expert in video encoding and download optimization.
Given the following video title: {{{videoTitle}}} and a list of available download formats:
{{{formats}}}

Analyze the formats and suggest the single best format for downloading, considering resolution, codec compatibility, and file size.
Explain your reasoning for choosing this format.

Output in JSON format:
{
  "suggestedFormat": "The best format",
  "reason": "Explanation of why this format is the best choice"
}
`,
});

const suggestBestDownloadOptionFlow = ai.defineFlow(
  {
    name: 'suggestBestDownloadOptionFlow',
    inputSchema: SuggestBestDownloadOptionInputSchema,
    outputSchema: SuggestBestDownloadOptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
