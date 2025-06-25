// src/ai/flows/analyze-transaction-patterns.ts
'use server';

/**
 * @fileOverview AI-powered transaction pattern analysis for fraud detection.
 *
 * - analyzeTransactionPatterns - Analyzes transaction data to identify potentially fraudulent patterns.
 * - AnalyzeTransactionPatternsInput - The input type for the analyzeTransactionPatterns function.
 * - AnalyzeTransactionPatternsOutput - The return type for the analyzeTransactionPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTransactionPatternsInputSchema = z.object({
  transactionData: z
    .string()
    .describe(
      'A string containing transaction details, including sender, receiver, amount, timestamp, and other relevant metadata.'
    ),
});
export type AnalyzeTransactionPatternsInput = z.infer<
  typeof AnalyzeTransactionPatternsInputSchema
>;

const AnalyzeTransactionPatternsOutputSchema = z.object({
  isFraudulent: z
    .boolean()
    .describe(
      'A boolean indicating whether the transaction pattern is flagged as potentially fraudulent.'
    ),
  fraudExplanation: z
    .string()
    .describe(
      'A detailed explanation of why the transaction pattern is considered potentially fraudulent.'
    ),
  riskScore: z
    .number()
    .describe(
      'A numerical score representing the risk level associated with the transaction pattern.'
    ),
});

export type AnalyzeTransactionPatternsOutput = z.infer<
  typeof AnalyzeTransactionPatternsOutputSchema
>;

export async function analyzeTransactionPatterns(
  input: AnalyzeTransactionPatternsInput
): Promise<AnalyzeTransactionPatternsOutput> {
  return analyzeTransactionPatternsFlow(input);
}

const analyzeTransactionPatternsPrompt = ai.definePrompt({
  name: 'analyzeTransactionPatternsPrompt',
  input: {schema: AnalyzeTransactionPatternsInputSchema},
  output: {schema: AnalyzeTransactionPatternsOutputSchema},
  prompt: `You are an AI-powered fraud detection system for a Central Bank Digital Currency (CBDC) network.

  Analyze the provided transaction data for unusual patterns that may indicate fraudulent activity. Provide a detailed explanation of why the transaction pattern is considered potentially fraudulent and assign a risk score.

  Transaction Data: {{{transactionData}}}

  Ensure your response strictly conforms to the defined output schema.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE', 
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const analyzeTransactionPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeTransactionPatternsFlow',
    inputSchema: AnalyzeTransactionPatternsInputSchema,
    outputSchema: AnalyzeTransactionPatternsOutputSchema,
  },
  async input => {
    const {output} = await analyzeTransactionPatternsPrompt(input);
    return output!;
  }
);
