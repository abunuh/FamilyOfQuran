
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { XCircle, ArrowLeft, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DonationCancelPage() {
  return (
    <>
      <Helmet>
        <title>Donation Cancelled | Family of the Quran</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-lg overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                  <XCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                
                <h1 className="text-2xl font-bold text-foreground mb-3 font-serif">Donation Cancelled</h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Your donation process was cancelled and no charges were made. If you experienced any issues, please feel free to try again.
                </p>

                <div className="space-y-3 w-full">
                  <Button asChild className="w-full h-12 text-lg">
                    <Link to="/">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Return to Home
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground pt-4">
                    Still want to support us? You can click the "Support Us" button on the home page anytime.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
