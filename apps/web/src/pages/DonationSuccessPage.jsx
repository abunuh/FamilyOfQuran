
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle2, Loader2, ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import apiServerClient from '@/lib/apiServerClient.js';

export default function DonationSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found.');
      setLoading(false);
      return;
    }

    apiServerClient.fetch(`/stripe/session/${sessionId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to verify session');
        return res.json();
      })
      .then(data => {
        setDetails(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Session verification error:', err);
        setError('Could not verify donation details, but your payment may have still been successful.');
        setLoading(false);
      });
  }, [sessionId]);

  return (
    <>
      <Helmet>
        <title>Donation Successful | Family of the Quran</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-lg overflow-hidden">
            <div className="h-2 bg-primary w-full"></div>
            <CardContent className="p-8 text-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">Verifying your donation...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-secondary-foreground" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2 font-serif">Thank You!</h1>
                  <p className="text-muted-foreground mb-8">{error}</p>
                  <Button asChild className="w-full">
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <h1 className="text-3xl font-bold text-foreground mb-3 font-serif">Jazakallah Khair</h1>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    May Allah reward you abundantly for your generous support. Your contribution helps us continue spreading the light of the Quran.
                  </p>

                  <div className="w-full bg-muted/50 rounded-xl p-6 mb-8 text-left space-y-4 border border-border/50">
                    <div className="flex justify-between items-center border-b border-border/50 pb-4">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-xl font-semibold text-foreground">
                        ${(details.amountTotal / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground text-sm">Transaction ID</span>
                      <span className="text-sm font-medium text-foreground truncate max-w-[150px]" title={details.id}>
                        {details.id.substring(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Date</span>
                      <span className="text-sm font-medium text-foreground">
                        {new Date(details.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button asChild className="w-full h-12 text-lg">
                    <Link to="/">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Return to Home
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
