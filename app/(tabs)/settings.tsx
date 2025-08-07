import React from "react";
import { View, Text, TextInput, Switch } from "react-native";
import { useTrading } from "../../contexts/TradingProvider";
import Colors from "../../constants/Colors";

export default function SettingsScreen() {
  const { instruments, setInstruments } = useTrading();
  // Add fields for Broker API, instrument management, etc.
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, padding: 20 }}>
      <Text style={{ color: Colors.text, fontSize: 22, fontWeight: "bold" }}>Settings</Text>
      {/* Broker API Fields */}
      <Text style={{ color: Colors.textMuted, marginTop: 16 }}>Broker API Credentials</Text>
      <TextInput placeholder="API Key" style={{ backgroundColor: Colors.card, color: Colors.text, marginVertical: 8 }} />
      <TextInput placeholder="API Secret" style={{ backgroundColor: Colors.card, color: Colors.text, marginVertical: 8 }} />
      {/* Instrument Management */}
      <Text style={{ color: Colors.textMuted, marginTop: 24 }}>My Instruments</Text>
      {instruments.map((inst) => (
        <View key={inst.id} style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}>
          <Text style={{ color: Colors.text }}>{inst.symbol}</Text>
          <Switch value={inst.is_active} />
        </View>
      ))}
    </View>
  );
}