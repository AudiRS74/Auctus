import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

export default function Dashboard() {
    const { user, signOut } = useAuth();
  const { trades, mt5Config, indicators, realTimeData } = useTrading();

  const activeTrades = trades.filter(trade => trade.status === 'EXECUTED');
  const totalProfit = activeTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  
  // Use real account data if connected, otherwise use simulated data
  const displayBalance = mt5Config.connected && realTimeData.accountInfo 
    ? realTimeData.accountInfo.balance 
    : 10000; // Simulated balance
  
  const displayEquity = mt5Config.connected && realTimeData.accountInfo 
    ? realTimeData.accountInfo.equity 
    : displayBalance + totalProfit;
    
  const displayCurrency = mt5Config.connected && realTimeData.accountInfo 
    ? realTimeData.accountInfo.currency 
    : 'USD';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Trader'}</Text>
          </View>
          <View style={styles.headerIcon}>
            <MaterialIcons name="trending-up" size={32} color={Colors.primary} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Portfolio Overview */}
        <Card style={styles.portfolioCard}>
          <LinearGradient
            colors={[Colors.primary + '20', Colors.surface]}
            style={styles.cardGradient}
          >
            <View style={styles.portfolioHeader}>
              <Text style={styles.portfolioTitle}>Portfolio Overview</Text>
              <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primary} />
            </View>
            
            <View style={styles.profitContainer}>
              <Text style={styles.profitLabel}>
                {mt5Config.connected ? 'Account Balance' : 'Total P&L'}
              </Text>
              <Text style={[styles.profitValue, { 
                color: mt5Config.connected 
                  ? Colors.textPrimary 
                  : totalProfit >= 0 ? Colors.bullish : Colors.bearish 
              }]}>
                {mt5Config.connected 
                  ? `${displayCurrency} ${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)}`
                }
              </Text>
              {mt5Config.connected && (
                <Text style={styles.equityLabel}>
                  Equity: {displayCurrency} {displayEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              )}
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {mt5Config.connected ? realTimeData.positions.length : trades.length}
                </Text>
                <Text style={styles.statLabel}>
                  {mt5Config.connected ? 'Open Positions' : 'Total Trades'}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeTrades.length}</Text>
                <Text style={styles.statLabel}>
                  {mt5Config.connected ? 'Today\'s Trades' : 'Active Trades'}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.primary }]}>
                  {mt5Config.connected && realTimeData.accountInfo 
                    ? `1:${realTimeData.accountInfo.leverage}`
                    : trades.length > 0 
                      ? `${((activeTrades.filter(t => (t.profit || 0) > 0).length / trades.length) * 100).toFixed(0)}%`
                      : '0%'
                  }
                </Text>
                <Text style={styles.statLabel}>
                  {mt5Config.connected ? 'Leverage' : 'Win Rate'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Connection Status */}
        <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: mt5Config.connected ? Colors.bullish : Colors.bearish }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.connectionHeader}>
              <View style={styles.connectionTitleContainer}>
                <MaterialIcons 
                  name={mt5Config.connected ? "cloud-done" : "cloud-off"} 
                  size={24} 
                  color={mt5Config.connected ? Colors.bullish : Colors.bearish} 
                />
                <Text style={styles.cardTitle}>MT5 Connection</Text>
              </View>
              <View style={[styles.statusBadge, { 
                backgroundColor: mt5Config.connected ? Colors.bullish + '20' : Colors.bearish + '20' 
              }]}>
                <Text style={[styles.statusText, { 
                  color: mt5Config.connected ? Colors.bullish : Colors.bearish 
                }]}>
                  {mt5Config.connected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
            </View>
            
            {mt5Config.connected && mt5Config.server && (
              <View style={styles.connectionDetails}>
                <Text style={styles.connectionLabel}>Server:</Text>
                <Text style={styles.connectionValue}>{mt5Config.server}</Text>
              </View>
            )}
            {mt5Config.connected && realTimeData.accountInfo && (
              <View style={styles.connectionDetails}>
                <Text style={styles.connectionLabel}>Account:</Text>
                <Text style={styles.connectionValue}>{realTimeData.accountInfo.name}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Market Indicators */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.indicatorsHeader}>
              <Text style={styles.cardTitle}>Market Indicators</Text>
              <MaterialIcons name="show-chart" size={24} color={Colors.accent} />
            </View>
            
            <View style={styles.indicatorsGrid}>
              <View style={styles.indicatorItem}>
                <View style={styles.indicatorIcon}>
                  <MaterialIcons name="speed" size={20} color={Colors.primary} />
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorLabel}>RSI</Text>
                  <Text style={[styles.indicatorValue, { 
                    color: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary 
                  }]}>
                    {indicators.rsi.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.indicatorItem}>
                <View style={styles.indicatorIcon}>
                  <MaterialIcons name="timeline" size={20} color={Colors.secondary} />
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorLabel}>MA</Text>
                  <Text style={styles.indicatorValue}>{indicators.movingAverage.toFixed(4)}</Text>
                </View>
              </View>
              
              <View style={styles.indicatorItem}>
                <View style={styles.indicatorIcon}>
                  <MaterialIcons name="trending-up" size={20} color={Colors.accent} />
                </View>
                <View style={styles.indicatorContent}>
                  <Text style={styles.indicatorLabel}>MACD</Text>
                  <Text style={[styles.indicatorValue, { 
                    color: indicators.macd.signal > 0 ? Colors.bullish : Colors.bearish 
                  }]}>
                    {indicators.macd.signal.toFixed(4)}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                buttonColor={Colors.primary}
                textColor={Colors.background}
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
                icon="chart-line"
              >
                View Charts
              </Button>
              <Button
                mode="contained"
                buttonColor={Colors.secondary}
                textColor={Colors.background}
                style={styles.actionButton}
                labelStyle={styles.actionButtonText}
                icon="swap-horizontal"
              >
                Quick Trade
              </Button>
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
  welcomeText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  headerIcon: {
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
  portfolioCard: {
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  portfolioTitle: {
    ...Typography.h5,
    color: Colors.textPrimary,
  },
  profitContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profitLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  profitValue: {
    ...Typography.h1,
    ...Typography.number,
  },
  equityLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
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
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  connectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  connectionLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  connectionValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  indicatorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  indicatorsGrid: {
    gap: 16,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    padding: 16,
    borderRadius: 8,
  },
  indicatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  indicatorContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicatorLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  indicatorValue: {
    ...Typography.h6,
    color: Colors.textPrimary,
    ...Typography.number,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  actionButtonText: {
    ...Typography.button,
  },
});