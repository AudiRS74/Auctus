import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

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
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Trading Terminal</Text>
            <Text style={styles.subtitle}>Execute trades with precision</Text>
          </View>
          <MaterialIcons name="trending-up" size={28} color={Colors.primary} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Symbol Selection */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Market Selection</Text>
              <MaterialIcons name="public" size={24} color={Colors.primary} />
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.symbolScroll}
              contentContainerStyle={styles.symbolScrollContent}
            >
              {symbols.map((symbol) => (
                <Chip
                  key={symbol}
                  selected={selectedSymbol === symbol}
                  onPress={() => setSelectedSymbol(symbol)}
                  style={[
                    styles.symbolChip,
                    selectedSymbol === symbol && styles.selectedSymbolChip
                  ]}
                  textStyle={[
                    styles.symbolChipText,
                    selectedSymbol === symbol && styles.selectedSymbolChipText
                  ]}
                  selectedColor={Colors.background}
                >
                  {symbol}
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Trade Execution */}
        <Card style={styles.tradeCard}>
          <LinearGradient
            colors={[Colors.surface, Colors.cardElevated]}
            style={styles.tradeCardGradient}
          >
            <View style={styles.tradeHeader}>
              <View>
                <Text style={styles.tradeTitle}>Execute Trade</Text>
                <Text style={styles.selectedSymbolText}>{selectedSymbol}</Text>
              </View>
              <View style={styles.symbolIcon}>
                <MaterialIcons name="swap-horiz" size={24} color={Colors.accent} />
              </View>
            </View>
            
            <TextInput
              label="Position Size"
              value={quantity}
              onChangeText={setQuantity}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              theme={{
                colors: {
                  primary: Colors.primary,
                  onSurface: Colors.textPrimary,
                  outline: Colors.border,
                  surface: Colors.inputBackground,
                }
              }}
              textColor={Colors.textPrimary}
              placeholderTextColor={Colors.textMuted}
            />
            
            <View style={styles.buttonRow}>
              <Button
                mode="contained"
                onPress={() => handleTrade('BUY')}
                loading={loading}
                disabled={loading}
                style={[styles.tradeButton, styles.buyButton]}
                buttonColor={Colors.bullish}
                textColor={Colors.background}
                labelStyle={styles.tradeButtonText}
                icon="trending-up"
              >
                BUY
              </Button>
              
              <Button
                mode="contained"
                onPress={() => handleTrade('SELL')}
                loading={loading}
                disabled={loading}
                style={[styles.tradeButton, styles.sellButton]}
                buttonColor={Colors.bearish}
                textColor={Colors.textPrimary}
                labelStyle={styles.tradeButtonText}
                icon="trending-down"
              >
                SELL
              </Button>
            </View>
          </LinearGradient>
        </Card>

        {/* Trade History */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Recent Trades</Text>
              <MaterialIcons name="history" size={24} color={Colors.secondary} />
            </View>
            
            {trades.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="trending-flat" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No trades executed yet</Text>
                <Text style={styles.emptyStateSubtext}>Start trading to see your history here</Text>
              </View>
            ) : (
              <View style={styles.tradesContainer}>
                {trades.slice(0, 10).map((trade, index) => (
                  <View key={trade.id} style={[styles.tradeRow, index === trades.length - 1 && styles.lastTradeRow]}>
                    <View style={styles.tradeMainInfo}>
                      <View style={styles.tradeSymbolContainer}>
                        <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                        <View style={[
                          styles.tradeTypeBadge,
                          { backgroundColor: trade.type === 'BUY' ? Colors.bullish + '20' : Colors.bearish + '20' }
                        ]}>
                          <Text style={[
                            styles.tradeType,
                            { color: trade.type === 'BUY' ? Colors.bullish : Colors.bearish }
                          ]}>
                            {trade.type}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.tradeDetails}>
                        <Text style={styles.tradeQuantity}>Size: {trade.quantity}</Text>
                        <Text style={styles.tradeStatus}>{trade.status}</Text>
                      </View>
                    </View>
                    
                    {trade.profit !== undefined && (
                      <View style={styles.tradeProfitContainer}>
                        <Text style={[
                          styles.tradeProfit,
                          { color: trade.profit >= 0 ? Colors.bullish : Colors.bearish }
                        ]}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </Text>
                        <MaterialIcons 
                          name={trade.profit >= 0 ? "trending-up" : "trending-down"} 
                          size={16} 
                          color={trade.profit >= 0 ? Colors.bullish : Colors.bearish} 
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
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
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  cardContent: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  symbolScroll: {
    marginTop: 8,
  },
  symbolScrollContent: {
    paddingRight: 16,
  },
  symbolChip: {
    marginRight: 12,
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  selectedSymbolChip: {
    backgroundColor: Colors.primary,
  },
  symbolChipText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedSymbolChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  tradeCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tradeCardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  tradeTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  selectedSymbolText: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  symbolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 24,
    backgroundColor: Colors.inputBackground,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  tradeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  buyButton: {
    elevation: 4,
    shadowColor: Colors.bullish,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sellButton: {
    elevation: 4,
    shadowColor: Colors.bearish,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tradeButtonText: {
    ...Typography.button,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    ...Typography.h6,
    color: Colors.textMuted,
    marginTop: 16,
  },
  emptyStateSubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  tradesContainer: {
    marginTop: 8,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastTradeRow: {
    borderBottomWidth: 0,
  },
  tradeMainInfo: {
    flex: 1,
  },
  tradeSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tradeSymbol: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginRight: 12,
  },
  tradeTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tradeType: {
    ...Typography.caption,
    fontWeight: '600',
  },
  tradeDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  tradeQuantity: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  tradeStatus: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  tradeProfitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tradeProfit: {
    ...Typography.h6,
    ...Typography.number,
  },
});