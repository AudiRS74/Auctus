import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Chip } from 'react-native-paper';
import { useTrading } from '../../hooks/useTrading';

export default function Trading() {
  const { trades, selectedSymbol, setSelectedSymbol, executeTrade } = useTrading();
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      const message = 'Please enter a valid quantity';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
      return;
    }

    setLoading(true);
    try {
      await executeTrade(selectedSymbol, type, qty);
      setQuantity('1');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Trade execution failed';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Error', message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Trading</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Symbol Selection</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symbolScroll}>
              {symbols.map((symbol) => (
                <Chip
                  key={symbol}
                  selected={selectedSymbol === symbol}
                  onPress={() => setSelectedSymbol(symbol)}
                  style={styles.symbolChip}
                >
                  {symbol}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Execute Trade</Text>
            <Text style={styles.selectedSymbol}>Selected: {selectedSymbol}</Text>
            
            <TextInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
            
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => handleTrade('BUY')}
                loading={loading}
                disabled={loading}
                style={[styles.tradeButton, styles.buyButton]}
                buttonColor="#4CAF50"
              >
                BUY
              </Button>
              
              <Button
                mode="contained"
                onPress={() => handleTrade('SELL')}
                loading={loading}
                disabled={loading}
                style={[styles.tradeButton, styles.sellButton]}
                buttonColor="#F44336"
              >
                SELL
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Recent Trades</Text>
            {trades.length === 0 ? (
              <Text style={styles.noTrades}>No trades yet</Text>
            ) : (
              trades.slice(0, 5).map((trade) => (
                <View key={trade.id} style={styles.tradeRow}>
                  <View style={styles.tradeInfo}>
                    <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                    <Text style={[styles.tradeType, { color: trade.type === 'BUY' ? '#4CAF50' : '#F44336' }]}>
                      {trade.type}
                    </Text>
                  </View>
                  <View style={styles.tradeDetails}>
                    <Text style={styles.tradeQuantity}>Qty: {trade.quantity}</Text>
                    <Text style={styles.tradeStatus}>{trade.status}</Text>
                    {trade.profit !== undefined && (
                      <Text style={[styles.tradeProfit, { color: trade.profit >= 0 ? '#4CAF50' : '#F44336' }]}>
                        ${trade.profit.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  symbolScroll: {
    marginBottom: 10,
  },
  symbolChip: {
    marginRight: 10,
  },
  selectedSymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 15,
  },
  input: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tradeButton: {
    flex: 1,
  },
  buyButton: {
    marginRight: 10,
  },
  sellButton: {
    marginLeft: 10,
  },
  noTrades: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tradeInfo: {
    flex: 1,
  },
  tradeSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tradeType: {
    fontSize: 14,
    fontWeight: '500',
  },
  tradeDetails: {
    alignItems: 'flex-end',
  },
  tradeQuantity: {
    fontSize: 14,
    color: '#666',
  },
  tradeStatus: {
    fontSize: 12,
    color: '#999',
  },
  tradeProfit: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});