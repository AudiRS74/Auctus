import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, DataTable, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function RealTime() {
  const { 
    realTimeData, 
    mt5Config, 
    refreshAccountData, 
    selectedSymbol,
    setSelectedSymbol,
    automationStatus 
  } = useTrading();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccountData();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (mt5Config.connected) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [mt5Config.connected]);

  const formatPrice = (price: number, digits: number = 5) => {
    return price.toFixed(digits);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getSpreadInPips = (symbol: any) => {
    if (!symbol) return 0;
    return (symbol.spread * Math.pow(10, symbol.digits)).toFixed(1);
  };

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
          <View style={styles.headerStatus}>
            <View style={[styles.statusIndicator, { 
              backgroundColor: mt5Config.connected ? Colors.bullish + '20' : Colors.bearish + '20' 
            }]}>
              <MaterialIcons 
                name={mt5Config.connected ? "wifi" : "wifi-off"} 
                size={16} 
                color={mt5Config.connected ? Colors.bullish : Colors.bearish} 
              />
              <Text style={[styles.statusText, { 
                color: mt5Config.connected ? Colors.bullish : Colors.bearish 
              }]}>
                {mt5Config.connected ? 'Live' : 'Offline'}
              </Text>
            </View>
            <MaterialIcons name="speed" size={28} color={Colors.primary} />
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
        {!mt5Config.connected && (
          <Card style={styles.warningCard}>
            <Card.Content style={styles.warningContent}>
              <MaterialIcons name="warning" size={24} color={Colors.accent} />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>MT5 Connection Required</Text>
                <Text style={styles.warningSubtitle}>
                  Connect to MT5 in Settings to view real-time data
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Account Information */}
        {realTimeData.accountInfo && (
          <Card style={styles.accountCard}>
            <LinearGradient
              colors={[Colors.bullish + '10', Colors.surface]}
              style={styles.accountGradient}
            >
              <View style={styles.accountHeader}>
                <Text style={styles.accountTitle}>Account Overview</Text>
                <Text style={styles.accountSubtitle}>
                  Last updated: {formatTime(lastUpdate)}
                </Text>
              </View>

              <View style={styles.accountGrid}>
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Balance</Text>
                  <Text style={[styles.accountValue, { color: Colors.bullish }]}>
                    {realTimeData.accountInfo.currency} {realTimeData.accountInfo.balance.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Equity</Text>
                  <Text style={styles.accountValue}>
                    {realTimeData.accountInfo.currency} {realTimeData.accountInfo.equity.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Free Margin</Text>
                  <Text style={styles.accountValue}>
                    {realTimeData.accountInfo.currency} {realTimeData.accountInfo.freeMargin.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>Margin Level</Text>
                  <Text style={[styles.accountValue, { 
                    color: realTimeData.accountInfo.marginLevel > 200 ? Colors.bullish : 
                           realTimeData.accountInfo.marginLevel > 100 ? Colors.primary : Colors.bearish 
                  }]}>
                    {realTimeData.accountInfo.marginLevel.toFixed(2)}%
                  </Text>
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
              <MaterialIcons name="trending-up" size={24} color={Colors.secondary} />
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
                >
                  {symbol}
                </Chip>
              ))}
            </ScrollView>

            {/* Price Data Table */}
            <DataTable style={styles.dataTable}>
              <DataTable.Header>
                <DataTable.Title>Symbol</DataTable.Title>
                <DataTable.Title numeric>Bid</DataTable.Title>
                <DataTable.Title numeric>Ask</DataTable.Title>
                <DataTable.Title numeric>Spread</DataTable.Title>
              </DataTable.Header>

              {symbols.map((symbol) => {
                const symbolData = realTimeData.symbols[symbol];
                return (
                  <DataTable.Row key={symbol}>
                    <DataTable.Cell>
                      <Text style={[styles.symbolName, {
                        color: selectedSymbol === symbol ? Colors.primary : Colors.textPrimary
                      }]}>
                        {symbol}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={[styles.priceValue, { color: Colors.bearish }]}>
                        {symbolData ? formatPrice(symbolData.bid, symbolData.digits) : 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={[styles.priceValue, { color: Colors.bullish }]}>
                        {symbolData ? formatPrice(symbolData.ask, symbolData.digits) : 'N/A'}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={styles.spreadValue}>
                        {symbolData ? getSpreadInPips(symbolData) : '0.0'}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
            </DataTable>
          </Card.Content>
        </Card>

        {/* Open Positions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Open Positions</Text>
              <Text style={styles.sectionSubtitle}>
                {realTimeData.positions.length} positions
              </Text>
            </View>

            {realTimeData.positions.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="portfolio" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No open positions</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your active trades will appear here
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <DataTable style={styles.positionsTable}>
                  <DataTable.Header>
                    <DataTable.Title style={styles.positionColumn}>Symbol</DataTable.Title>
                    <DataTable.Title style={styles.positionColumn}>Type</DataTable.Title>
                    <DataTable.Title style={styles.positionColumn} numeric>Volume</DataTable.Title>
                    <DataTable.Title style={styles.positionColumn} numeric>Open Price</DataTable.Title>
                    <DataTable.Title style={styles.positionColumn} numeric>Current</DataTable.Title>
                    <DataTable.Title style={styles.positionColumn} numeric>P&L</DataTable.Title>
                  </DataTable.Header>

                  {realTimeData.positions.map((position) => (
                    <DataTable.Row key={position.ticket}>
                      <DataTable.Cell style={styles.positionColumn}>
                        <Text style={styles.positionSymbol}>{position.symbol}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.positionColumn}>
                        <View style={[styles.positionTypeBadge, {
                          backgroundColor: position.type === 'BUY' ? Colors.bullish + '20' : Colors.bearish + '20'
                        }]}>
                          <Text style={[styles.positionType, {
                            color: position.type === 'BUY' ? Colors.bullish : Colors.bearish
                          }]}>
                            {position.type}
                          </Text>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.positionColumn} numeric>
                        <Text style={styles.positionValue}>{position.volume.toFixed(2)}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.positionColumn} numeric>
                        <Text style={styles.positionValue}>{position.openPrice.toFixed(5)}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.positionColumn} numeric>
                        <Text style={styles.positionValue}>{position.currentPrice.toFixed(5)}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.positionColumn} numeric>
                        <Text style={[styles.positionProfit, {
                          color: position.profit >= 0 ? Colors.bullish : Colors.bearish
                        }]}>
                          {position.profit >= 0 ? '+' : ''}{position.profit.toFixed(2)}
                        </Text>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              </ScrollView>
            )}
          </Card.Content>
        </Card>

        {/* Automation Status */}
        {automationStatus.isRunning && (
          <Card style={styles.automationCard}>
            <LinearGradient
              colors={[Colors.primary + '10', Colors.surface]}
              style={styles.automationGradient}
            >
              <View style={styles.automationHeader}>
                <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
                <View style={styles.automationInfo}>
                  <Text style={styles.automationTitle}>Automation Active</Text>
                  <Text style={styles.automationSubtitle}>
                    {automationStatus.activeStrategies} strategies running
                  </Text>
                </View>
                <View style={styles.pulseDot} />
              </View>
            </LinearGradient>
          </Card>
        )}
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
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  warningCard: {
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: Colors.accent + '20',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  warningText: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  warningSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  accountCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  accountGradient: {
    borderRadius: 16,
    padding: 20,
  },
  accountHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  accountTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  accountSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  accountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  accountItem: {
    width: '48%',
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  accountLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  accountValue: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    ...Typography.number,
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
  sectionSubtitle: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  symbolScroll: {
    marginBottom: 16,
  },
  symbolScrollContent: {
    paddingRight: 16,
  },
  symbolChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
  },
  selectedSymbolChip: {
    backgroundColor: Colors.primary,
  },
  symbolChipText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  selectedSymbolChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  dataTable: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 8,
  },
  symbolName: {
    ...Typography.body1,
    fontWeight: '600',
  },
  priceValue: {
    ...Typography.body1,
    fontWeight: '600',
    ...Typography.number,
  },
  spreadValue: {
    ...Typography.body2,
    color: Colors.textSecondary,
    ...Typography.number,
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
  positionsTable: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 8,
    minWidth: 600,
  },
  positionColumn: {
    minWidth: 100,
  },
  positionSymbol: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  positionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 50,
  },
  positionType: {
    ...Typography.caption,
    fontWeight: '600',
  },
  positionValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  positionProfit: {
    ...Typography.body1,
    fontWeight: '600',
    ...Typography.number,
  },
  automationCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  automationGradient: {
    borderRadius: 12,
    padding: 16,
  },
  automationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  automationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  automationTitle: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  automationSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.bullish,
  },
});