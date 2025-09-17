
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting the best time to schedule an event.
 *
 * The flow takes into account resource availability and member information to maximize attendance.
 * - suggestEventTime - A function that takes event details and returns a suggested date/time.
 * - SuggestEventTimeInput - The input type for the suggestEventTime function.
 * - SuggestEventTimeOutput - The return type for the suggestEventTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventTimeInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  expectedDuration: z
    .string()
    .describe('The expected duration of the event (e.g., 1 hour, 2.5 hours).'),
  availableResources: z
    .string()
    .describe(
      'A description of the resources available for the event (e.g., hall size, equipment).'
    ),
  memberInformation: z
    .string()
    .describe(
      'Information about the church members, including demographics and typical attendance patterns.'
    ),
  constraints: z
    .string()
    .optional()
    .describe('Any constraints on the event time (e.g., no Sundays).'),
});
export type SuggestEventTimeInput = z.infer<typeof SuggestEventTimeInputSchema>;

const SuggestEventTimeOutputSchema = z.object({
  suggestedDateTime: z
    .string()
    .describe(
      'The suggested date and time for the event, considering resource availability and member information. Should include timezone.'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested date and time, explaining why it is optimal.'
    ),
});
export type SuggestEventTimeOutput = z.infer<typeof SuggestEventTimeOutputSchema>;

export async function suggestEventTime(
  input: SuggestEventTimeInput
): Promise<SuggestEventTimeOutput> {
  return suggestEventTimeFlow(input);
}

const suggestEventTimePrompt = ai.definePrompt({
  name: 'suggestEventTimePrompt',
  input: {schema: SuggestEventTimeInputSchema},
  output: {schema: SuggestEventTimeOutputSchema},
  prompt: `You are an expert event scheduler for a church.

  Given the following information, suggest the best date and time to schedule the event to maximize attendance.

  Event Name: {{{eventName}}}
  Expected Duration: {{{expectedDuration}}}
  Available Resources: {{{availableResources}}}
  Member Information: {{{memberInformation}}}
  Constraints: {{{constraints}}}

  Consider all factors and provide a suggested date and time, along with a clear explanation of your reasoning.
  The suggested date and time should include timezone.
  `,
});

const suggestEventTimeFlow = ai.defineFlow(
  {
    name: 'suggestEventTimeFlow',
    inputSchema: SuggestEventTimeInputSchema,
    outputSchema: SuggestEventTimeOutputSchema,
  },
  async input => {
    const {output} = await suggestEventTimePrompt(input);
    return output!;
  }
);
