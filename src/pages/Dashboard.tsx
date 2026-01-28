import { useState } from "react";
import { CreditCard, User, Calendar, Lock, Shield, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showCashout, setShowCashout] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsProcessing(false);
    setShowBalance(true);
  };

  const handleProceed = () => {
    setShowBalance(false);
    setShowCashout(true);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold gold-text">SecureVault</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Secure Session</span>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-6">
          <p className="text-xs text-destructive text-center font-medium">
            ⚠️ EDUCATIONAL DEMO - No real card details should be entered
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">Link Your Card</h2>
              <p className="text-sm text-muted-foreground">Enter your card details to check balance</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cardholder Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Cardholder Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-11 h-12 bg-input border-border focus:border-primary input-glow"
                  required
                />
              </div>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="pl-11 h-12 bg-input border-border focus:border-primary input-glow font-mono tracking-wider"
                  required
                />
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="pl-11 h-12 bg-input border-border focus:border-primary input-glow font-mono"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">CVV</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    className="pl-11 h-12 bg-input border-border focus:border-primary input-glow font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {isProcessing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Verifying Card...</span>
                </div>
              ) : (
                "Check Balance"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-6">
          Your data is protected with bank-level security
        </p>
      </div>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-card rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-2">Processing</h3>
            <p className="text-sm text-muted-foreground">Securely verifying your card details...</p>
          </div>
        </div>
      )}

      {/* Balance Dialog */}
      <Dialog open={showBalance} onOpenChange={setShowBalance}>
        <DialogContent className="glass-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <span className="text-lg font-display">Card Verified Successfully</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-2">Available Balance</p>
            <p className="text-4xl font-display font-bold gold-text">$9,876</p>
            <p className="text-xs text-muted-foreground mt-2">Ready for withdrawal</p>
          </div>
          <Button
            onClick={handleProceed}
            className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Proceed to Cashout
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogContent>
      </Dialog>

      {/* Cashout Dialog */}
      <Dialog open={showCashout} onOpenChange={setShowCashout}>
        <DialogContent className="glass-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <span className="text-lg font-display text-destructive">Fraud Alert!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-foreground font-medium mb-3">
              🚨 This is how scammers steal your money!
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 text-left text-sm text-muted-foreground space-y-2">
              <p className="text-muted-foreground">• Never enter real card details on unknown websites</p>
              <p className="text-muted-foreground">• Legitimate services don't promise instant cashouts</p>
              <p>• Always verify website authenticity</p>
              <p>• Report suspicious sites to authorities</p>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            This demo is for educational purposes only
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
