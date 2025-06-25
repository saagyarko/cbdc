// src/app/actions.ts
'use server';
import { analyzeTransactionPatterns as analyzeTransactionPatternsFlow, type AnalyzeTransactionPatternsInput, type AnalyzeTransactionPatternsOutput } from '@/ai/flows/analyze-transaction-patterns';
import { z } from 'zod';

// Define schema for analyzeTransaction input for validation within the action
const AnalyzeTransactionActionInputSchema = z.object({
  transactionData: z.string().min(10, "Transaction data must be at least 10 characters long."),
});

export type AnalyzeTransactionActionResult = 
  | (AnalyzeTransactionPatternsOutput & { error?: undefined })
  | { error: string; isFraudulent?: undefined; fraudExplanation?: undefined; riskScore?: undefined };

export async function analyzeTransaction(input: { transactionData: string }): Promise<AnalyzeTransactionActionResult> {
  const validatedInput = AnalyzeTransactionActionInputSchema.safeParse(input);

  if (!validatedInput.success) {
    return { error: validatedInput.error.errors.map(e => e.message).join(', ') };
  }
  
  try {
    // The AI flow expects AnalyzeTransactionPatternsInput, which matches validatedInput.data
    const result = await analyzeTransactionPatternsFlow(validatedInput.data);
    return result;
  } catch (error) {
    console.error("Full error in AI transaction analysis:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    let detailedErrorMessage = "An unexpected error occurred during transaction analysis.";
    if (error instanceof Error) {
      detailedErrorMessage = error.message; // Default to standard error message
      // Check for Genkit/Google specific error properties
      const anyError = error as any;
      if (typeof anyError.statusText === 'string' && anyError.statusText) {
        detailedErrorMessage = `AI Service Error: ${anyError.statusText}. Message: ${error.message}`;
      } else if (Array.isArray(anyError.errorDetails) && anyError.errorDetails.length > 0) {
        const firstDetail = anyError.errorDetails[0];
        if (firstDetail && typeof firstDetail.message === 'string') {
            detailedErrorMessage = `AI Service Error: ${firstDetail.message}`;
        }
      } else if (anyError.message) { // Fallback to error.message if specific fields not found
        detailedErrorMessage = anyError.message;
      }
    }
    
    return { error: detailedErrorMessage + " Please try again later or contact support if the issue persists." };
  }
}

// Placeholder for generating compliance report
export async function generateComplianceReport(filters: { period: string; type: string }): Promise<{ reportUrl?: string; error?: string }> {
  console.log("Generating compliance report with filters:", filters);
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success or failure
  if (Math.random() > 0.1) { // 90% success rate
    return { reportUrl: `/reports/compliance_report_${filters.type}_${filters.period}_${Date.now()}.pdf` }; // Mock URL
  } else {
    return { error: "Failed to generate compliance report. Please try again." };
  }
}
