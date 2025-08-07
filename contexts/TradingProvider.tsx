import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchInstruments, fetchTrades, executeTrade } from "../services/tradingService";
const TradingContext = createContext();

export const TradingProvider = ({ children }) => {
  const [instruments, setInstruments] = useState([]);
  const [trades, setTrades] = useState([]);
  const [automationActive, setAutomationActive] = useState(false);

  useEffect(() => {
    fetchInstruments().then(setInstruments);
    fetchTrades().then(setTrades);
  }, []);

  const handleTrade = async (tradeDetails) => {
    const result = await executeTrade(tradeDetails);
    setTrades((prev) => [...prev, result]);
  };

  return (
    <TradingContext.Provider
      value={{
        instruments,
        setInstruments,
        trades,
        setTrades,
        automationActive,
        setAutomationActive,
        handleTrade
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => useContext(TradingContext);