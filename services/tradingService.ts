// Example trading service for broker API integration
export async function fetchInstruments() {
  // Fetch from Supabase instruments table
  // Replace with your DB/API logic
  return [
    { id: 1, symbol: "AAPL", is_active: true },
    { id: 2, symbol: "EURUSD", is_active: false },
  ];
}

export async function fetchTrades() {
  // Fetch from Supabase trades table
  return [];
}

export async function executeTrade({ symbol, type, quantity, apiKey, apiSecret }) {
  // Example: send request to broker API
  // Replace with actual broker API integration
  return {
    id: Math.random(),
    symbol,
    type,
    quantity,
    status: "pending",
    created_at: new Date().toISOString(),
  };
}