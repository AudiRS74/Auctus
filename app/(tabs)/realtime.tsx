import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { QUICK_ACCESS_SYMBOLS } from '../../constants/Markets';

export default function RealTime() {
  const { 
    realTimeData, 
    mt5Config, 
    selectedSymbol, 
    setSelectedSymbol, 
    refreshAccountData,
    getMarketData 
  } = useTrading();
  
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccountData();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getConnectionStatusColor = () => {
    return mt5Config.connected ? Colors.bullish : Colors.bearish;
  };

  const symbols = QUICK_ACCESS_SYMBOLS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Real-time Data</Text>
            <Text style={styles.subtitle}>Live market feeds & positions</Text>
          </View>
          <View style={[styles.statusIndicator, { 
            backgroundColor: getConnectionStatusColor() + '20' 
          }]}>
            <MaterialIcons 
              name="fiber-manual-record" 
              size={12} 
              color={getConnectionStatusColor()} 
            />
            <Text style={[styles.statusText, { 
              color: getConnectionStatusColor() 
            }]}>
              {mt5Config.connected ? 'LIVE' : 'OFFLINE'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Connection Status */}
        <Card style={styles.statusCard}>
          <LinearGradient
            colors={[getConnectionStatusColor() + '10', Colors.surface]}
            style={styles.statusGradient}
          >
            <View style={styles.statusHeader}>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Connection Status</Text>
                <Text style={styles.statusSubtitle}>
                  {mt5Config.connected ? 
                    `Connected to ${mt5Config.server}` : 
                    'Disconnected - Demo data only'
                  }
                </Text>
              </View>
              <MaterialIcons 
                name={mt5Config.connected ? "wifi" : "wifi-off"} 
                size={32} 
                color={getConnectionStatusColor()} 
              />
            </View>
            
            <View style={styles.statusDetails}>
              <View style={styles.statusDetail}>
                <Text style={styles.statusDetailLabel}>Last Update:</Text>
                <Text style={styles.statusDetailValue}>
                  {formatTime(realTimeData.lastUpdate)}
                </Text>
              </View>
              <View style={styles.statusDetail}>
                <Text style={styles.statusDetailLabel}>Data Source:</Text>
                <Text style={styles.statusDetailValue}>
                  {mt5Config.connected ? 'MT5 Server' : 'Demo Feed'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Account Information */}
        {realTimeData.accountInfo && (
          <Card style={styles.accountCard}>
            <LinearGradient
              colors={[Colors.primary + '15', Colors.surface]}
              style={styles.accountGradient}
            >
              <View style={styles.accountHeader}>
                <Text style={styles.accountTitle}>Account Information</Text>
                <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primary} />
              </View>
              
              <View style={styles.balanceRow}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Balance</Text>
                  <Text style={styles.balanceValue}>
                    {formatCurrency(realTimeData.accountInfo.balance, realTimeData.accountInfo.currency)}
                  </Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Equity</Text>
                  <Text style={[styles.balanceValue, { 
                    color: realTimeData.accountInfo.equity >= realTimeData.accountInfo.balance ? 
                           Colors.bullish : Colors.bearish 
                  }]}>
                    {formatCurrency(realTimeData.accountInfo.equity, realTimeData.accountInfo.currency)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.accountDetails}>
                <View style={styles.accountDetail}>
                  <Text style={styles.accountDetailLabel}>Free Margin:</Text>
                  <Text style={styles.accountDetailValue}>
                    {formatCurrency(realTimeData.accountInfo.freeMargin, realTimeData.accountInfo.currency)}
                  </Text>
                </View>
                <View style={styles.accountDetail}>
                  <Text style={styles.accountDetailLabel}>Leverage:</Text>
                  <Text style={styles.accountDetailValue}>1:{realTimeData.accountInfo.leverage}</Text>
                </View>
                <View style={styles.accountDetail}>
                  <Text style={styles.accountDetailLabel}>Server:</Text>
                  <Text style={styles.accountDetailValue}>{realTimeData.accountInfo.server}</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        )}

        {/* Live Prices */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Live Market Prices</Text>
              <MaterialIcons name="trending-up" size={24} color={Colors.accent} />
            </View>
            
            {/* Symbol Selection */}
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

            {/* Price Display */}
            <View style={styles.priceContainer}>
              {realTimeData.symbols[selectedSymbol] ? (
                <View style={styles.priceDisplay}>
                  <View style={styles.priceHeader}>
                    <Text style={styles.selectedSymbolText}>{selectedSymbol}</Text>
                    <Text style={styles.priceTime}>
                      {formatTime(realTimeData.lastUpdate)}
                    </Text>
                  </View>
                  
                  <View style={styles.bidAskContainer}>
                    <View style={styles.priceBox}>
                      <Text style={styles.priceLabel}>BID</Text>
                      <Text style={[styles.priceValue, { color: Colors.bearish }]}>
                        {realTimeData.symbols[selectedSymbol].bid.toFixed(5)}
                      </Text>
                    </View>
                    
                    <View style={styles.spreadContainer}>
                      <Text style={styles.spreadLabel}>Spread</Text>
                      <Text style={styles.spreadValue}>
                        {realTimeData.symbols[selectedSymbol].spread.toFixed(1)} pips
                      </Text>
                    </View>
                    
                    <View style={styles.priceBox}>
                      <Text style={styles.priceLabel}>ASK</Text>
                      <Text style={[styles.priceValue, { color: Colors.bullish }]}>
                        {realTimeData.symbols[selectedSymbol].ask.toFixed(5)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.additionalInfo}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Last:</Text>
                      <Text style={styles.infoValue}>
                        {realTimeData.symbols[selectedSymbol].last.toFixed(5)}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Volume:</Text>
                      <Text style={styles.infoValue}>
                        {realTimeData.symbols[selectedSymbol].volume.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.noPriceData}>
                  <MaterialIcons name="timeline" size={48} color={Colors.textMuted} />
                  <Text style={styles.noPriceText}>No price data available</Text>
                  <Text style={styles.noPriceSubtext}>
                    {mt5Config.connected ? 
                      'Waiting for market data...' : 
                      'Connect to MT5 for live prices'
                    }
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Open Positions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Open Positions</Text>
              <MaterialIcons name="donut-large" size={24} color={Colors.secondary} />
            </View>
            
            {realTimeData.positions.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="donut-large" size={64} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No open positions</Text>
                <Text style={styles.emptyStateSubtext}>
                  Open trades will appear here when active
                </Text>
              </View>
            ) : (
              <View style={styles.positionsContainer}>
                {realTimeData.positions.map((position, index) => (
                  <View 
                    key={position.ticket} 
                    style={[
                      styles.positionItem,
                      index === realTimeData.positions.length - 1 && styles.lastPositionItem
                    ]}
                  >
                    <View style={styles.positionHeader}>
                      <View style={styles.positionSymbol}>
                        <Text style={styles.positionSymbolText}>{position.symbol}</Text>
                        <View style={[styles.positionTypeBadge, { 
                          backgroundColor: position.type === 'BUY' ? Colors.bullish : Colors.bearish 
                        }]}>
                          <Text style={styles.positionTypeText}>{position.type}</Text>
                        </View>
                      </View>
                      <Text style={[styles.positionProfit, { 
                        color: position.profit >= 0 ? Colors.bullish : Colors.bearish 
                      }]}>
                        {position.profit >= 0 ? '+' : ''}${position.profit.toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={styles.positionDetails}>
                      <Text style={styles.positionDetail}>
                        Volume: {position.volume} • Price: {position.price.toFixed(5)}
                      </Text>
                      <Text style={styles.positionDetail}>
                        Ticket: #{position.ticket}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Market Data Summary */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Market Overview</Text>
              <MaterialIcons name="public" size={24} color={Colors.primary} />
            </View>
            
            <View style={styles.marketSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Connected Symbols:</Text>
                <Text style={styles.summaryValue}>
                  {Object.keys(realTimeData.symbols).length}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Market Data:</Text>
                <Text style={styles.summaryValue}>
                  {Object.keys(realTimeData.marketData).length} feeds
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Last Refresh:</Text>
                <Text style={styles.summaryValue}>
                  {formatTime(lastUpdate)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Manual Refresh */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Button
              mode="contained"
              onPress={onRefresh}
              loading={refreshing}
              disabled={refreshing}
              style={styles.refreshButton}
              buttonColor={Colors.primary}
              textColor={Colors.background}
              icon="refresh"
              labelStyle={styles.refreshButtonText}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
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
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  statusGradient: {
    padding: 20,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statusSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusDetail: {
    flex: 1,
  },
  statusDetailLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  statusDetailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  accountCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  accountGradient: {
    padding: 20,
    borderRadius: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  accountTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 16,
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  balanceValue: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  accountDetails: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  accountDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountDetailLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  accountDetailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
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
    marginBottom: 16,
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
    fontSize: 12,
  },
  selectedSymbolChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  priceDisplay: {
    gap: 16,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSymbolText: {
    ...Typography.h5,
    color: Colors.primary,
    fontWeight: '600',
  },
  priceTime: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  bidAskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBox: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  priceValue: {
    ...Typography.h4,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  spreadContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  spreadLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  spreadValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  noPriceData: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noPriceText: {
    ...Typography.h6,
    color: Colors.textMuted,
    marginTop: 12,
  },
  noPriceSubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
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
  positionsContainer: {
    marginTop: 8,
  },
  positionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastPositionItem: {
    borderBottomWidth: 0,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  positionSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  positionSymbolText: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  positionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  positionTypeText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
    fontSize: 10,
  },
  positionProfit: {
    ...Typography.body1,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  positionDetails: {
    gap: 2,
  },
  positionDetail: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  marketSummary: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  refreshButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  refreshButtonText: {
    ...Typography.button,
    fontSize: 16,
  },
});