
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeartHandshake, Loader2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

export default function DonationModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const presets = [5, 10, 25, 50, 100];

  const handlePresetClick = (val) => {
    setIsCustom(false);
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setIsCustom(true);
    setCustomAmount(e.target.value);
  };

  const handleDonate = async () => {
    const finalAmount = isCustom ? parseFloat(customAmount) : amount;
    
    if (!finalAmount || isNaN(finalAmount) || finalAmount < 1) {
      toast.error('Please enter a valid amount (minimum $1)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiServerClient.fetch('/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100), // Convert to cents
          donationMessage: 'Support for Family of the Quran'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize checkout');
      }

      const data = await response.json();
      
      // Use window.open to bypass iframe navigation restrictions
      window.open(data.url, '_blank');
      onClose();
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Unable to process donation at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 shadow-xl">
        <DialogHeader className="text-center sm:text-center pb-4 border-b border-border/50">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <HeartHandshake className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground font-serif">
            Support Our Mission
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 text-base">
            Your generous contribution helps us maintain and expand the Family of the Quran platform, keeping Islamic knowledge accessible to everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Select Amount</label>
            <div className="grid grid-cols-3 gap-3">
              {presets.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={!isCustom && amount === preset ? 'default' : 'outline'}
                  className={`h-12 text-lg transition-all ${
                    !isCustom && amount === preset 
                      ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' 
                      : 'bg-transparent hover:bg-primary/5 hover:text-primary hover:border-primary/30'
                  }`}
                  onClick={() => handlePresetClick(preset)}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Custom Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                $
              </span>
              <Input
                type="number"
                min="1"
                step="1"
                placeholder="Other amount"
                value={customAmount}
                onChange={handleCustomChange}
                onFocus={() => setIsCustom(true)}
                className={`pl-8 h-12 text-lg bg-background transition-all ${
                  isCustom ? 'border-primary ring-1 ring-primary/20' : ''
                }`}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <Button 
            onClick={handleDonate} 
            disabled={isLoading}
            className="w-full h-12 text-lg font-medium shadow-md transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Donate $${isCustom ? (customAmount || '0') : amount}`
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Secure payment processing powered by Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
