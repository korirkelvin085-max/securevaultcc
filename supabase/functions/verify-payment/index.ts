import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TRC20 USDT contract address on Tron
const USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const FEE_ADDRESS = "TZBh3GopUxDr9G6eCD5ShAT3ZgmsLRz8Bz";

interface TRC20Transfer {
  transaction_id: string;
  from: string;
  to: string;
  quant: string;
  block_timestamp: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { minAmount, timeWindowMinutes = 60 } = await req.json();
    
    console.log(`Checking for payments >= $${minAmount} USDT in last ${timeWindowMinutes} minutes`);

    // Use TronGrid public API (more reliable, no API key needed for basic queries)
    const apiUrl = `https://api.trongrid.io/v1/accounts/${FEE_ADDRESS}/transactions/trc20?limit=50&contract_address=${USDT_CONTRACT}&only_to=true`;
    
    console.log(`Querying TronGrid: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TronGrid API error: ${response.status}`, errorText);
      throw new Error(`TronGrid API returned ${response.status}`);
    }

    const data = await response.json();
    const transfers = data.data || [];
    console.log(`Found ${transfers.length} TRC20 transfers`);

    const now = Date.now();
    const cutoffTime = now - (timeWindowMinutes * 60 * 1000);
    
    // Find payments that match our criteria
    const validPayments = transfers.filter((tx: TRC20Transfer) => {
      // Check if it's a recent transaction
      if (tx.block_timestamp < cutoffTime) return false;
      
      // Check if it's TO our address (incoming payment)
      if (tx.to.toLowerCase() !== FEE_ADDRESS.toLowerCase()) return false;
      
      // Calculate USDT amount (6 decimals for USDT)
      const amount = parseFloat(tx.quant) / 1000000;
      
      console.log(`Transaction ${tx.transaction_id}: ${amount} USDT from ${tx.from}`);
      
      // Check if amount is at least what we need (with small tolerance for fees)
      return amount >= (minAmount * 0.99);
    });

    const verified = validPayments.length > 0;
    const latestPayment = validPayments[0];

    if (verified && latestPayment) {
      const amount = parseFloat(latestPayment.quant) / 1000000;
      
      console.log(`✅ Payment verified: ${amount} USDT from ${latestPayment.from}`);
      
      return new Response(JSON.stringify({
        verified: true,
        transaction: {
          id: latestPayment.transaction_id,
          amount: amount,
          from: latestPayment.from,
          timestamp: latestPayment.block_timestamp,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`❌ No valid payments found for amount >= ${minAmount} USDT`);
    
    return new Response(JSON.stringify({
      verified: false,
      message: `No payment of $${minAmount.toFixed(2)} or more found in the last ${timeWindowMinutes} minutes`,
      checkedTransactions: transfers.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    return new Response(JSON.stringify({
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
