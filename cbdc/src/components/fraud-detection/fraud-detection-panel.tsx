// src/components/fraud-detection/fraud-detection-panel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { analyzeTransaction, AnalyzeTransactionActionResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertTriangle, BotMessageSquare, FileScan } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { MOCK_FRAUD_ALERTS } from '@/lib/constants';
import { AlertCircle } from 'lucide-react';

const fraudDetectionSchema = z.object({
  transactionData: z.string().min(50, { message: "Transaction data must be at least 50 characters long to provide sufficient context for analysis." }).max(5000, { message: "Transaction data must not exceed 5000 characters." }),
});

type FraudDetectionFormValues = z.infer<typeof fraudDetectionSchema>;

export function FraudDetectionPanel() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTransactionActionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FraudDetectionFormValues>({
    resolver: zodResolver(fraudDetectionSchema),
    defaultValues: {
      transactionData: '',
    },
  });

  const onSubmit = async (data: FraudDetectionFormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeTransaction(data);
      setAnalysisResult(result);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Analysis Error",
          description: result.error,
        });
      } else if (result.isFraudulent) {
         toast({
          variant: "destructive",
          title: "Fraud Alert!",
          description: `Potential fraud detected. Risk Score: ${result.riskScore}`,
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Transaction appears normal. Risk Score: ${result.riskScore}`,
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: `Failed to submit transaction for analysis: ${errorMessage}`,
      });
      setAnalysisResult({ error: "Failed to submit transaction for analysis." });
    }
    setIsLoading(false);
  };

  // For pre-filling form if an alertId is in query params (demonstration)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const alertId = queryParams.get('alertId');
      if (alertId) {
        const alert = MOCK_FRAUD_ALERTS.find(a => a.id === alertId);
        if (alert) {
          form.setValue('transactionData', `Transaction ID: ${alert.transactionId}\nDate: ${alert.date}\nDetails: ${alert.reason}\nInitial Risk Score: ${alert.riskScore}\nStatus: ${alert.status}\n\nProvide further details or context for re-analysis.`);
          toast({
            title: "Alert Loaded",
            description: `Loaded details for Alert ID: ${alertId} for re-analysis.`,
          });
        }
      }
    }
  }, [form, toast]);


  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileScan className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl font-headline">Analyze Transaction Pattern</CardTitle>
              <CardDescription>Input transaction details for AI-powered fraud detection.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="transactionData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="transactionData" className="text-base">Transaction Data</FormLabel>
                    <FormControl>
                      <Textarea
                        id="transactionData"
                        placeholder={`Paste transaction details here (e.g., JSON, CSV, or plain text description).
Example:
{
  "transactionId": "TXN12345ABC",
  "timestamp": "2024-07-28T10:30:00Z",
  "amount": 50000.00,
  "currency": "USD_CBDC",
  "sender": { "bankId": "CBUS001", "accountId": "ACC_SENDER_001" },
  "receiver": { "bankId": "CBUK005", "accountId": "ACC_RECEIVER_007", "country": "GB" },
  "metadata": { "type": "cross_border_payment", "purpose": "Trade settlement" }
}`}
                        rows={12}
                        className="text-sm bg-card"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                   <BotMessageSquare className="mr-2 h-4 w-4" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
           <div className="flex items-center space-x-3">
            <BotMessageSquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl font-headline">AI Analysis Result</CardTitle>
              <CardDescription>Outcome of the fraud detection analysis.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col items-center justify-center">
          {isLoading && (
            <div className="text-center space-y-3">
              <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground">AI is processing the transaction data...</p>
              <Progress value={50} className="w-full animate-pulse" />
            </div>
          )}
          {!isLoading && !analysisResult && (
            <div className="text-center text-muted-foreground space-y-3">
              <FileScan className="h-12 w-12 mx-auto" />
              <p>Submit transaction data to see the analysis result here.</p>
            </div>
          )}
          {!isLoading && analysisResult && analysisResult.error && (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Analysis Error</AlertTitle>
              <AlertDescription>{analysisResult.error}</AlertDescription>
            </Alert>
          )}
          {!isLoading && analysisResult && !analysisResult.error && (
            <div className="w-full space-y-4">
              <Alert variant={analysisResult.isFraudulent ? "destructive" : "default"} className="bg-opacity-50">
                {analysisResult.isFraudulent ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5 text-accent"/>}
                <AlertTitle className="text-lg">
                  {analysisResult.isFraudulent ? 'Potential Fraud Detected!' : 'Transaction Appears Normal'}
                </AlertTitle>
                <AlertDescription className="mt-1">
                  {analysisResult.isFraudulent 
                    ? "This transaction has been flagged as potentially fraudulent based on AI analysis."
                    : "The AI analysis did not find significant indicators of fraud for this transaction."}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3 p-4 border rounded-md bg-card">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Risk Score:</span>
                  <span className={`text-2xl font-bold ${analysisResult.riskScore > 70 ? 'text-destructive' : analysisResult.riskScore > 40 ? 'text-yellow-500' : 'text-accent'}`}>
                    {analysisResult.riskScore} / 100
                  </span>
                </div>
                <Progress 
                  value={analysisResult.riskScore} 
                  className={`h-3 ${
                    analysisResult.riskScore > 70 ? 'bg-destructive/20 [&>div]:bg-destructive' : 
                    analysisResult.riskScore > 40 ? 'bg-yellow-500/20 [&>div]:bg-yellow-500' : 
                    'bg-accent/20 [&>div]:bg-accent'
                  }`} 
                />
              </div>

              <div>
                <h3 className="font-semibold mb-1 text-muted-foreground">AI Explanation:</h3>
                <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {analysisResult.fraudExplanation || "No specific concerns raised."}
                </p>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                  This AI analysis provides an indication and should be used in conjunction with other fraud detection measures. Final decisions should be made by human reviewers.
                </AlertDescription>
              </Alert>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
