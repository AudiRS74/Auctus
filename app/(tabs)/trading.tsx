import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Chip, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '@/hooks/useTrading';

const POPULAR_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF', 'NZDUSD'];

export default function TradingPage() {
  const { selectedSymbol, setSelectedSymbol, executeTrade, mt5Config } = useTrading();
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('1.0');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExecuteTrade = async () => {
    if (!mt5Config.connected) {
      Alert.alert('Error', 'Please connect to MT5 first in Settings');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      await executeTrade(selectedSymbol, tradeType, parseFloat(quantity));
      Alert.alert('Success', `${tradeType} order for ${quantity} lots of ${selectedSymbol} executed!`);
      setQuantity('1.0');
      setStopLoss('');
      setTakeProfit('');
    } catch (error) {
      Alert.alert('Error', 'Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Trading Terminal</Text>
          <View style={[styles.connectionStatus, mt5Config.connected && styles.connected]}>
            <MaterialIcons
              name={mt5Config.connected ? "cloud-done" : "cloud-off"}
              size={16}
              color={mt5Config.connected ? "#10B981" : "#EF4444"}
            />
          </View>
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.instrumentCard}>
            <Card.Title
              title="Select Instrument"
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.symbolChips}>
                {POPULAR_SYMBOLS.map((symbol) => (
                  <Chip
                    key={symbol}
                    selected={selectedSymbol === symbol}
                    onPress={() => setSelectedSymbol(symbol)}
                    style={[
                      styles.symbolChip,
                      selectedSymbol === symbol && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      selectedSymbol === symbol && styles.selectedChipText
                    ]}
                  >
                    {symbol}
                  </Chip>
                ))}
              </View>
              
              <TextInput
                label="Custom Symbol"
                value={selectedSymbol}
                onChangeText={setSelectedSymbol}
                mode="outlined"
                style={styles.input}
                theme={{
                  colors: {
                    primary: '#00C896',
                    outline: '#475569',
                    onSurfaceVariant: '#94A3B8',
                  }
                }}
              />
            </Card.Content>
          </Card>

          <Card style={styles.orderCard}>
            <Card.Title
              title="Order Details"
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <View style={styles.tradeTypeButtons}>
                <Button
                  mode={tradeType === 'BUY' ? 'contained' : 'outlined'}
                  onPress={() => setTradeType('BUY')}
                  style={[
                    styles.typeButton,
                    tradeType === 'BUY' && styles.buyButton
                  ]}
                  labelStyle={styles.typeButtonText}
                >
                  BUY
                </Button>
                <Button
                  mode={tradeType === 'SELL' ? 'contained' : 'outlined'}
                  onPress={() => setTradeType('SELL')}
                  style={[
                    styles.typeButton,
                    tradeType === 'SELL' && styles.sellButton
                  ]}
                  labelStyle={styles.typeButtonText}
                >
                  SELL
                </Button>
              </View>

              <TextInput
                label="Volume (Lots)"
                value={quantity}
                onChangeText={setQuantity}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                theme={{
                  colors: {
                    primary: '#00C896',
                    outline: '#475569',
                    onSurfaceVariant: '#94A3B8',
                  }
                }}
              />

              <TextInput
                label="Stop Loss (Optional)"
                value={stopLoss}
                onChangeText={setStopLoss}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                theme={{
                  colors: {
                    primary: '#00C896',
                    outline: '#475569',
                    onSurfaceVariant: '#94A3B8',
                  }
                }}
              />

              <TextInput
                label="Take Profit (Optional)"
                value={takeProfit}
                onChangeText={setTakeProfit}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                theme={{
                  colors: {
                    primary: '#00C896',
                    outline: '#475569',
                    onSurfaceVariant: '#94A3B8',
                  }
                }}
              />
            </Card.Content>
          </Card>

          <Card style={styles.riskCard}>
            <Card.Title
              title="Risk Management"
              titleStyle={styles.cardTitle}
              left={() => <MaterialIcons name="security" size={24} color="#F59E0B" />}
            />
            <Card.Content>
              <View style={styles.riskInfo}>
                <Text style={styles.riskLabel}>Position Size:</Text>
                <Text style={styles.riskValue}>${(parseFloat(quantity || '0') * 100000).toLocaleString()}</Text>
              </View>
              <View style={styles.riskInfo}>
                <Text style={styles.riskLabel}>Estimated Risk:</Text>
                <Text style={styles.riskValue}>$50.00</Text>
              </View>
              <View style={styles.riskInfo}>
                <Text style={styles.riskLabel}>Margin Required:</Text>
                <Text style={styles.riskValue}>$200.00</Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        <View style={styles.executeSection}>
          <Button
            mode="contained"
            onPress={handleExecuteTrade}
            loading={loading}
            disabled={loading || !mt5Config.connected}
            style={[
              styles.executeButton,
              tradeType === 'BUY' ? styles.buyExecuteButton : styles.sellExecuteButton
            ]}
            labelStyle={styles.executeButtonText}
            icon={tradeType === 'BUY' ? 'trending-up' : 'trending-down'}
          >
            {loading ? 'Executing...' : `${tradeType} ${selectedSymbol}`}
          </Button>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  connectionStatus: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  connected: {
    borderColor: '#10B981',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instrumentCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  orderCard: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderRadius: 12,
  },
  riskCard: {
    backgroundColor: '#1E293B',
    marginBottom: 20,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  symbolChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  symbolChip: {
    backgroundColor: '#334155',
  },
  selectedChip: {
    backgroundColor: '#00C896',
  },
  chipText: {
    color: '#94A3B8',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#334155',
  },
  tradeTypeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    borderColor: '#475569',
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  sellButton: {
    backgroundColor: '#EF4444',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  riskLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  riskValue: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  executeSection: {
    padding: 20,
    paddingTop: 0,
  },
  executeButton: {
    paddingVertical: 12,
  },
  buyExecuteButton: {
    backgroundColor: '#10B981',
  },
  sellExecuteButton: {
    backgroundColor: '#EF4444',
  },
  executeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});