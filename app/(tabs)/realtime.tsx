import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function RealTime() {
  const { 
    mt5Config, 
    realTimeData, 
    selectedSymbol, 
    setSelectedSymbol, 
    refreshAccountData,
    connectionError 
  } = useTrading();
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccountData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  if (!mt5Config.connected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={Gradients.header}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Real-Time Trading</Text>
              <Text style={styles.subtitle}>Live MT5 connection required</Text>
            </View>
            <MaterialIcons name="wifi-off" size={28} color={Colors.bearish} />
          </View>
        </LinearGradient>

        <View style={styles.disconnectedContainer}>
          <MaterialIcons name="cloud-off" size={64} color={Colors.textMuted} />
          <Text style={styles.disconnectedTitle}>Not Connected to MT5</Text>
          <Text style={styles.disconnectedText}>
            Connect to your MT5 broker account in Settings to access real-time trading data and execute live trades.
          </Text>
          {connectionError && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={20} color={Colors.bearish} />
              <Text style={styles.errorText}>{connectionError}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Live Trading</Text>
            <Text style={styles.subtitle}>Real-time MT5 data</Text>
          </View>
          <View style={styles.connectionIndicator}>
            <MaterialIcons name="wifi" size={28} color={Colors.bullish} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Account Summary */}
        {realTimeData.accountInfo && (
          <Card style={styles.accountCard}>
            <LinearGradient
              colors={[Colors.primary + '20', Colors.surface]}
              style={styles.accountGradient}
            >
              <View style={styles.accountHeader}>
                <Text style={styles.accountTitle}>Account Summary</Text>
                <Text style={styles.lastUpdateText}>
                  Updated: {formatTime(realTimeData.lastUpdate)}
                </Text>
              </View>
              
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={styles.balanceValue}>
                  {formatCurrency(realTimeData.accountInfo.balance, realTimeData.accountInfo.currency)}
                </Text>
              </View>
              
              <View style={styles.accountStatsGrid}>
                <View style={styles.accountStat}>
                  <Text style={styles.accountStatValue}>
                    {formatCurrency(realTimeData.accountInfo.equity, realTimeData.accountInfo.currency)}
                  </Text>
                  <Text style={styles.accountStatLabel}>Equity</Text>
                </View>
                <View style={styles.accountStat}>
                  <Text style={styles.accountStatValue}>
                    {formatCurrency(realTimeData.accountInfo.freeMargin, realTimeData.accountInfo.currency)}
                  </Text>
                  <Text style={styles.accountStatLabel}>Free Margin</Text>
                </View>
                <View style={styles.accountStat}>
                  <Text style={styles.accountStatValue}>
                    {realTimeData.accountInfo.marginLevel.toFixed(2)}%
                  </Text>
                  <Text style={styles.accountStatLabel}>Margin Level</Text>
                </View>
                <View style={styles.accountStat}>
                  <Text style={styles.accountStatValue}>
                    1:{realTimeData.accountInfo.leverage}
                  </Text>
                  <Text style={styles.accountStatLabel}>Leverage</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        )}

        {/* Market Prices */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Live Market Prices</Text>
              <MaterialIcons name="show-chart" size={24} color={Colors.primary} />
            </View>
            
            {Object.keys(realTimeData.symbols).length > 0 ? (
              <View style={styles.symbolsList}>
                {Object.entries(realTimeData.symbols).map(([symbol, data]) => (
                  <View key={symbol} style={styles.symbolRow}>
                    <View style={styles.symbolInfo}>
                      <Text style={styles.symbolName}>{symbol}</Text>
                      <Text style={styles.symbolSpread}>
                        Spread: {(data.spread * Math.pow(10, data.digits)).toFixed(1)} pips
                      </Text>
                    </View>
                    <View style={styles.symbolPrices}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Bid</Text>
                        <Text style={[styles.priceValue, { color: Colors.bearish }]}>
                          {data.bid.toFixed(data.digits)}
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceLabel}>Ask</Text>
                        <Text style={[styles.priceValue, { color: Colors.bullish }]}>
                          {data.ask.toFixed(data.digits)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="timeline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No live prices yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Market data will appear once subscribed to symbols
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Open Positions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Open Positions</Text>
              <MaterialIcons name="account-balance" size={24} color={Colors.secondary} />
            </View>
            
            {realTimeData.positions.length > 0 ? (
              <View style={styles.positionsList}>
                {realTimeData.positions.map((position, index) => (
                  <View key={position.ticket}>
                    <View style={styles.positionRow}>
                      <View style={styles.positionHeader}>
                        <View style={styles.positionSymbolContainer}>
                          <Text style={styles.positionSymbol}>{position.symbol}</Text>
                          <Chip
                            style={[
                              styles.positionTypeChip,
                              { backgroundColor: position.type === 'BUY' ? Colors.bullish + '20' : Colors.bearish + '20' }
                            ]}
                            textStyle={[
                              styles.positionTypeText,
                              { color: position.type === 'BUY' ? Colors.bullish : Colors.bearish }
                            ]}
                            compact
                          >
                            {position.type}
                          </Chip>
                        </View>
                        <Text style={[
                          styles.positionProfit,
                          { color: position.profit >= 0 ? Colors.bullish : Colors.bearish }
                        ]}>
                          {position.profit >= 0 ? '+' : ''}{position.profit.toFixed(2)}
                        </Text>
                      </View>
                      
                      <View style={styles.positionDetails}>
                        <View style={styles.positionDetailItem}>
                          <Text style={styles.positionDetailLabel}>Volume</Text>
                          <Text style={styles.positionDetailValue}>{position.volume}</Text>
                        </View>
                        <View style={styles.positionDetailItem}>
                          <Text style={styles.positionDetailLabel}>Open Price</Text>
                          <Text style={styles.positionDetailValue}>{position.openPrice.toFixed(5)}</Text>
                        </View>
                        <View style={styles.positionDetailItem}>
                          <Text style={styles.positionDetailLabel}>Current</Text>
                          <Text style={styles.positionDetailValue}>{position.currentPrice.toFixed(5)}</Text>
                        </View>
                        <View style={styles.positionDetailItem}>
                          <Text style={styles.positionDetailLabel}>Ticket</Text>
                          <Text style={styles.positionDetailValue}>#{position.ticket}</Text>
                        </View>
                      </View>
                    </View>
                    {index < realTimeData.positions.length - 1 && (
                      <View style={styles.positionDivider} />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="account-balance-wallet" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No open positions</Text>
                <Text style={styles.emptyStateSubtext}>
                  Your open trades will appear here
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Connection Status */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Connection Status</Text>
              <MaterialIcons name="settings-ethernet" size={24} color={Colors.accent} />
            </View>
            
            <View style={styles.connectionDetails}>
              <View style={styles.connectionDetailRow}>
                <Text style={styles.connectionDetailLabel}>Server</Text>
                <Text style={styles.connectionDetailValue}>{mt5Config.server}</Text>
              </View>
              <View style={styles.connectionDetailRow}>
                <Text style={styles.connectionDetailLabel}>Account</Text>
                <Text style={styles.connectionDetailValue}>{mt5Config.login}</Text>
              </View>
              <View style={styles.connectionDetailRow}>
                <Text style={styles.connectionDetailLabel}>Status</Text>
                <View style={styles.statusContainer}>
                  <MaterialIcons name="wifi" size={16} color={Colors.bullish} />
                  <Text style={[styles.statusText, { color: Colors.bullish }]}>
                    Connected - Live Trading Active
                  </Text>
                </View>
              </View>
              <View style={styles.connectionDetailRow}>
                <Text style={styles.connectionDetailLabel}>Last Update</Text>
                <Text style={styles.connectionDetailValue}>
                  {formatTime(realTimeData.lastUpdate)}
                </Text>
              </View>
            </View>
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
  connectionIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  disconnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  disconnectedTitle: {
    ...Typography.h5,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 16,
  },
  disconnectedText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bearish + '15',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  errorText: {
    ...Typography.body2,
    color: Colors.bearish,
    marginLeft: 8,
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  accountTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  lastUpdateText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  balanceValue: {
    ...Typography.h1,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  accountStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  accountStat: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountStatValue: {
    ...Typography.h6,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  accountStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
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
  symbolsList: {
    gap: 16,
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
  },
  symbolInfo: {
    flex: 1,
  },
  symbolName: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  symbolSpread: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  symbolPrices: {
    flexDirection: 'row',
    gap: 20,
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  priceValue: {
    ...Typography.body1,
    fontWeight: '600',
    ...Typography.number,
  },
  positionsList: {
    gap: 0,
  },
  positionRow: {
    paddingVertical: 16,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionSymbol: {
    ...Typography.h6,
    color: Colors.textPrimary,
    marginRight: 12,
  },
  positionTypeChip: {
    height: 24,
  },
  positionTypeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  positionProfit: {
    ...Typography.h6,
    ...Typography.number,
    fontWeight: '600',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionDetailItem: {
    alignItems: 'center',
  },
  positionDetailLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  positionDetailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  positionDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  connectionDetails: {
    gap: 12,
  },
  connectionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionDetailLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  connectionDetailValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    ...Typography.body2,
    fontWeight: '500',
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
});