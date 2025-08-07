import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { 
    realTimeData, 
    mt5Config, 
    trades, 
    automationStatus,
    refreshAccountData 
  } = useTrading();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAccountData();
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return Number(value).toFixed(decimals);
  };

  const getRecentTrades = () => {
    return trades.slice(0, 5);
  };

  const getTotalProfit = () => {
    return trades.reduce((total, trade) => total + (trade.profit || 0), 0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.userNameText}>{user?.name || 'Trader'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => logout()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="account-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Account Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Overview</Text>
          
          <View style={styles.card}>
            {realTimeData.accountInfo ? (
              <>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Balance</Text>
                  <Text style={styles.cardValue}>
                    {formatCurrency(realTimeData.accountInfo.balance)}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Equity</Text>
                  <Text style={styles.cardValue}>
                    {formatCurrency(realTimeData.accountInfo.equity)}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Free Margin</Text>
                  <Text style={styles.cardValue}>
                    {formatCurrency(realTimeData.accountInfo.freeMargin)}
                  </Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Leverage</Text>
                  <Text style={styles.cardValue}>
                    1:{realTimeData.accountInfo.leverage}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <MaterialIcons name="account-balance-wallet" size={48} color={Colors.textMuted} />
                <Text style={styles.noDataText}>
                  {mt5Config.connected ? 'Loading account data...' : 'MT5 not connected'}
                </Text>
                <Text style={styles.noDataSubtext}>
                  {mt5Config.connected 
                    ? 'Please wait while we fetch your account information'
                    : 'Connect to MT5 to view your account details'
                  }
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Trading Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trading Statistics</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="trending-up" size={24} color={Colors.bullish} />
              <Text style={styles.statValue}>{trades.length}</Text>
              <Text style={styles.statLabel}>Total Trades</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons 
                name={getTotalProfit() >= 0 ? "attach-money" : "money-off"} 
                size={24} 
                color={getTotalProfit() >= 0 ? Colors.bullish : Colors.bearish} 
              />
              <Text style={[
                styles.statValue,
                { color: getTotalProfit() >= 0 ? Colors.bullish : Colors.bearish }
              ]}>
                {formatCurrency(getTotalProfit())}
              </Text>
              <Text style={styles.statLabel}>P&L</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="smart-toy" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{automationStatus.activeStrategies}</Text>
              <Text style={styles.statLabel}>Auto Strategies</Text>
            </View>
          </View>
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <MaterialIcons name="cloud" size={20} color={Colors.textSecondary} />
                <Text style={styles.statusLabel}>MT5 Connection</Text>
              </View>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: mt5Config.connected ? Colors.bullish : Colors.bearish }
              ]}>
                <Text style={styles.statusText}>
                  {mt5Config.connected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusRow}>
              <View style={styles.statusInfo}>
                <MaterialIcons name="auto-awesome" size={20} color={Colors.textSecondary} />
                <Text style={styles.statusLabel}>Automation</Text>
              </View>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: automationStatus.isRunning ? Colors.bullish : Colors.textMuted }
              ]}>
                <Text style={styles.statusText}>
                  {automationStatus.isRunning ? 'Running' : 'Stopped'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Trades */}
        {trades.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Trades</Text>
            
            <View style={styles.card}>
              {getRecentTrades().map((trade, index) => (
                <View key={trade.id} style={[
                  styles.tradeRow,
                  index < getRecentTrades().length - 1 && styles.tradeRowBorder
                ]}>
                  <View style={styles.tradeInfo}>
                    <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                    <Text style={styles.tradeType}>{trade.type}</Text>
                  </View>
                  <View style={styles.tradeDetails}>
                    <Text style={styles.tradeQuantity}>
                      {formatNumber(trade.quantity)} lots
                    </Text>
                    <Text style={[
                      styles.tradeProfit,
                      { 
                        color: (trade.profit || 0) >= 0 ? Colors.bullish : Colors.bearish 
                      }
                    ]}>
                      {trade.profit ? formatCurrency(trade.profit) : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Market Data Preview */}
        {Object.keys(realTimeData.symbols).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Prices</Text>
            
            <View style={styles.card}>
              {Object.entries(realTimeData.symbols).slice(0, 4).map(([symbol, data]) => (
                <View key={symbol} style={styles.marketRow}>
                  <Text style={styles.marketSymbol}>{symbol}</Text>
                  <View style={styles.marketPrices}>
                    <Text style={styles.marketBid}>
                      {formatNumber(data.bid, symbol.includes('JPY') ? 3 : 5)}
                    </Text>
                    <Text style={styles.marketAsk}>
                      {formatNumber(data.ask, symbol.includes('JPY') ? 3 : 5)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileButton: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tradeRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tradeInfo: {
    flex: 1,
  },
  tradeSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tradeType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tradeDetails: {
    alignItems: 'flex-end',
  },
  tradeQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  tradeProfit: {
    fontSize: 14,
    fontWeight: '600',
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  marketSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  marketPrices: {
    flexDirection: 'row',
    gap: 16,
  },
  marketBid: {
    fontSize: 14,
    color: Colors.bearish,
    fontWeight: '500',
  },
  marketAsk: {
    fontSize: 14,
    color: Colors.bullish,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});