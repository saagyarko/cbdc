
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BotMessageSquare, Banknote, BarChartBig } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <h1 className="text-3xl font-bold text-primary font-headline">CBDC Connect</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="max-w-3xl mx-auto shadow-2xl">
            <CardHeader>
              <div className="relative w-full h-60 md:h-80 rounded-t-lg overflow-hidden">
                <Image
                  src="https://placehold.co/1200x600.png"
                  alt="Global Finance Network"
                  fill
                  data-ai-hint="finance network"
                  className="opacity-80 object-cover"
                />
                <div className="absolute inset-0 bg-primary/30 flex flex-col items-center justify-center p-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 font-headline">
                    Revolutionizing Global CBDC Settlements
                  </h2>
                  <p className="text-lg md:text-xl text-primary-foreground/90">
                    Secure, real-time cross-border transactions powered by AI for enhanced fraud detection and compliance.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-8 text-lg">
                CBDC Connect offers a state-of-the-art platform for central banks, designed to streamline international payments, reduce operational costs, and ensure robust regulatory adherence.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center p-4 rounded-lg border">
                  <Banknote className="h-12 w-12 text-accent mb-3" />
                  <h3 className="text-lg font-semibold mb-1">Real-Time Settlements</h3>
                  <p className="text-sm text-muted-foreground">Instant cross-border CBDC transactions.</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border">
                  <BotMessageSquare className="h-12 w-12 text-accent mb-3" />
                  <h3 className="text-lg font-semibold mb-1">AI Fraud Detection</h3>
                  <p className="text-sm text-muted-foreground">Proactive anomaly and fraud identification.</p>
                </div>
                <div className="flex flex-col items-center p-4 rounded-lg border">
                  <BarChartBig className="h-12 w-12 text-accent mb-3" />
                  <h3 className="text-lg font-semibold mb-1">Compliance Reporting</h3>
                  <p className="text-sm text-muted-foreground">Automated AML/KYC reporting.</p>
                </div>
              </div>

              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/dashboard">
                  Explore the Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CBDC Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}
