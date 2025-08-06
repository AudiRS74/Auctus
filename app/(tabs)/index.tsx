import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTrading } from '../../hooks/useTrading';
import { LoadingScreen } from '../../components/LoadingScreen';
import { SafeComponentWrapper } from '../../components/SafeComponentWrapper';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';

const { width } = Dimensions.get('window');

function DashboardContent() {
  const { user } = useAuth();
  const { 
    trades, 
    mt5Config, 
    indicators, 
    selectedSymbol, 
    realTimeData, 
    automationStatus,
    refreshAccountData,
    initialized: tradingInitialized,
    loading: tradingLoading,
    error: tradingError
  } = useTrading();

  // Auto-refresh data when connected
  useEffect(() => {
    if (mt5Config.connected && tradingInitialized) {
      refreshAccountData();
      const interval = setInterval(refreshAccountData, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [mt5Config.connected, tradingInitialized]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentTrades = trades.slice(0, 3);
  const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0);
  const winRate = trades.length > 0 
    ? (trades.filter(trade => (trade.profit || 0) > 0).length / trades.length * 100).toFixed(1)
    : '0.0';

  const QuickStatCard = ({ title, value, subtitle, icon, color = Colors.primary, trend }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: string;
    color?: string;
    trend?: 'up' | 'down';
  }) => (
    <Card style={[styles.statCard, { width: (width - 48) / 2 - 8 }]}>
      <LinearGradient
        colors={[color + '15', Colors.surface]}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <MaterialIcons name={icon as any} size={24} color={color} />
          {trend && (
            <MaterialIcons 
              name={trend === 'up' ? 'trending-up' : 'trending-down'} 
              size={16} 
              color={trend === 'up' ? Colors.bullish : Colors.bearish} 
            />
          )}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={Gradients.header}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.username}>{user?.name || 'Demo Trader'}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.connectionBadge, { 
              backgroundColor: mt5Config.connected ? Colors.bullish + '20' : Colors.bearish + '20' 
            }]}>
              <MaterialIcons 
                name={mt5Config.connected ? "wifi" : "wifi-off"} 
                size={16} 
                color={mt5Config.connected ? Colors.bullish : Colors.bearish} 
              />
              <Text style={[styles.connectionText, { 
                color: mt5Config.connected ? Colors.bullish : Colors.bearish 
              }]}>
                {mt5Config.connected ? 'Demo Live' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Demo Mode Banner */}
        {!mt5Config.connected && (
          <Card style={styles.demoBanner}>
            <Card.Content style={styles.demoBannerContent}>
              <View style={styles.demoBannerHeader}>
                <MaterialIcons name="info" size={24} color={Colors.primary} />
                <Text style={styles.demoBannerTitle}>Demo Mode</Text>
              </View>
              <Text style={styles.demoBannerText}>
                Connect to MT5 demo server to start live trading simulation. 
                Go to Settings to configure your connection.
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  console.log('Navigate to settings');
                }}
                style={styles.demoBannerButton}
                textColor={Colors.primary}
                icon="settings"
                compact
              >
                Open Settings
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Account Balance */}
        {realTimeData.accountInfo && (
          <Card style={styles.balanceCard}>
            <LinearGradient
              colors={[Colors.primary + '20', Colors.surface]}
              style={styles.balanceGradient}
            >
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Demo Account Balance</Text>
                <Chip 
                  icon="account-balance-wallet" 
                  textStyle={styles.chipText}
                  style={styles.balanceChip}
                >
                  {realTimeData.accountInfo.company}
                </Chip>
              </View>
              <Text style={styles.balanceValue}>
                {realTimeData.accountInfo.currency} {realTimeData.accountInfo.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>Equity</Text>
                  <Text style={styles.balanceItemValue}>
                    {realTimeData.accountInfo.currency} {realTimeData.accountInfo.equity.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>Free Margin</Text>
                  <Text style={styles.balanceItemValue}>
                    {realTimeData.accountInfo.currency} {realTimeData.accountInfo.freeMargin.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceItemLabel}>Leverage</Text>
                  <Text style={styles.balanceItemValue}>1:{realTimeData.accountInfo.leverage}</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <QuickStatCard
              title="Total Trades"
              value={trades.length.toString()}
              subtitle="This session"
              icon="trending-up"
              color={Colors.primary}
            />
            <QuickStatCard
              title="Win Rate"
              value={`${winRate}%`}
              subtitle="Success ratio"
              icon="target"
              color={Colors.bullish}
              trend="up"
            />
            <QuickStatCard
              title="Total Profit"
              value={`$${totalProfit.toFixed(2)}`}
              subtitle="Demo profits"
              icon="attach-money"
              color={totalProfit >= 0 ? Colors.bullish : Colors.bearish}
              trend={totalProfit >= 0 ? 'up' : 'down'}
            />
            <QuickStatCard
              title="Active Positions"
              value={realTimeData.positions.length.toString()}
              subtitle="Open trades"
              icon="donut-large"
              color={Colors.accent}
            />
          </View>
        </View>

        {/* Market Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Market Overview</Text>
              <Text style={styles.cardSubtitle}>Live demo prices</Text>
            </View>
            
            <View style={styles.symbolContainer}>
              <View style={styles.symbolHeader}>
                <Text style={styles.selectedSymbol}>{selectedSymbol}</Text>
                <View style={styles.symbolPrices}>
                  {realTimeData.symbols[selectedSymbol] && (
                    <>
                      <Text style={styles.bidPrice}>
                        Bid: {realTimeData.symbols[selectedSymbol].bid.toFixed(5)}
                      </Text>
                      <Text style={styles.askPrice}>
                        Ask: {realTimeData.symbols[selectedSymbol].ask.toFixed(5)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              
              <View style={styles.indicatorsGrid}>
                <View style={styles.indicator}>
                  <Text style={styles.indicatorLabel}>RSI</Text>
                  <Text style={[styles.indicatorValue, { 
                    color: indicators.rsi > 70 ? Colors.bearish : indicators.rsi < 30 ? Colors.bullish : Colors.textPrimary 
                  }]}>
                    {indicators.rsi.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.indicator}>
                  <Text style={styles.indicatorLabel}>MA</Text>
                  <Text style={styles.indicatorValue}>{indicators.movingAverage.toFixed(4)}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Trades */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Recent Trades</Text>
              <Text style={styles.cardSubtitle}>{trades.length} total</Text>
            </View>
            
            {recentTrades.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="trending-up" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No trades yet</Text>
                <Text style={styles.emptyStateSubtext}>Start trading to see your activity here</Text>
              </View>
            ) : (
              <View style={styles.tradesContainer}>
                {recentTrades.map((trade) => (
                  <View key={trade.id} style={styles.tradeItem}>
                    <View style={styles.tradeHeader}>
                      <View style={styles.tradeSymbol}>
                        <MaterialIcons 
                          name={trade.type === 'BUY' ? 'trending-up' : 'trending-down'} 
                          size={20} 
                          color={trade.type === 'BUY' ? Colors.bullish : Colors.bearish} 
                        />
                        <Text style={styles.tradeSymbolText}>{trade.symbol}</Text>
                        <Chip 
                          textStyle={[styles.tradeTypeChip, { 
                            color: trade.type === 'BUY' ? Colors.bullish : Colors.bearish 
                          }]}
                          style={[styles.tradeTypeChipContainer, { 
                            backgroundColor: trade.type === 'BUY' ? Colors.bullish + '20' : Colors.bearish + '20' 
                          }]}
                        >
                          {trade.type}
                        </Chip>
                      </View>
                      <Text style={[styles.tradeProfit, { 
                        color: (trade.profit || 0) >= 0 ? Colors.bullish : Colors.bearish 
                      }]}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                      </Text>
                    </View>
                    
                    <View style={styles.tradeDetails}>
                      <Text style={styles.tradeDetailText}>
                        Volume: {trade.quantity} • Price: ${trade.price.toFixed(5)}
                      </Text>
                      <Text style={styles.tradeTime}>
                        {trade.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Automation Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Automation Status</Text>
              <View style={[styles.automationStatus, { 
                backgroundColor: automationStatus.isRunning ? Colors.bullish + '20' : Colors.textMuted + '20' 
              }]}>
                <MaterialIcons 
                  name={automationStatus.isRunning ? "play-circle-filled" : "pause-circle-filled"} 
                  size={16} 
                  color={automationStatus.isRunning ? Colors.bullish : Colors.textMuted} 
                />
                <Text style={[styles.automationStatusText, { 
                  color: automationStatus.isRunning ? Colors.bullish : Colors.textMuted 
                }]}>
                  {automationStatus.isRunning ? 'Running' : 'Stopped'}
                </Text>
              </View>
            </View>
            
            <View style={styles.automationGrid}>
              <View style={styles.automationStat}>
                <Text style={styles.automationStatValue}>{automationStatus.activeStrategies}</Text>
                <Text style={styles.automationStatLabel}>Active Strategies</Text>
              </View>
              <View style={styles.automationStat}>
                <Text style={styles.automationStatValue}>{automationStatus.totalSignals}</Text>
                <Text style={styles.automationStatLabel}>Signals Generated</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Dashboard() {
  const { initialized: authInitialized, loading: authLoading } = useAuth();
  const { initialized: tradingInitialized, loading: tradingLoading, error: tradingError } = useTrading();

  // Show loading screen while contexts are initializing
  if (authLoading || tradingLoading || !authInitialized || !tradingInitialized) {
    return (
      <LoadingScreen 
        message="Loading Dashboard..."
        submessage="Initializing trading services and data feeds"
        icon="dashboard"
      />
    );
  }

  return (
    <SafeComponentWrapper
      loading={tradingLoading}
      error={tradingError}
      loadingMessage="Loading dashboard data..."
      errorTitle="Dashboard Error"
      errorMessage="Failed to load dashboard. Please check your connection and try again."
      onRetry={() => window.location.reload()}
    >
      <DashboardContent />
    </SafeComponentWrapper>
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
  greeting: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  username: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectionText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  demoBanner: {
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  demoBannerContent: {
    paddingVertical: 16,
  },
  demoBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoBannerTitle: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  demoBannerText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  demoBannerButton: {
    borderColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  balanceCard: {
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 8,
  },
  balanceGradient: {
    borderRadius: 16,
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  balanceChip: {
    backgroundColor: Colors.primary + '20',
  },
  chipText: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 10,
  },
  balanceValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  balanceItemValue: {
    ...Typography.body2,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  quickStatsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    borderRadius: 12,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  card: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...Typography.body2,
    color: Colors.textMuted,
  },
  symbolContainer: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
  },
  symbolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedSymbol: {
    ...Typography.h6,
    color: Colors.primary,
    fontWeight: '600',
  },
  symbolPrices: {
    alignItems: 'flex-end',
  },
  bidPrice: {
    ...Typography.body2,
    color: Colors.bearish,
    fontWeight: '500',
  },
  askPrice: {
    ...Typography.body2,
    color: Colors.bullish,
    fontWeight: '500',
  },
  indicatorsGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  indicator: {
    alignItems: 'center',
  },
  indicatorLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  indicatorValue: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  tradesContainer: {
    gap: 12,
  },
  tradeItem: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tradeSymbol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradeSymbolText: {
    ...Typography.body1,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  tradeTypeChipContainer: {
    height: 24,
  },
  tradeTypeChip: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  tradeProfit: {
    ...Typography.body1,
    fontWeight: '600',
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeDetailText: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  tradeTime: {
    ...Typography.caption,
    color: Colors.textMuted,
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
  automationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  automationStatusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  automationGrid: {
    flexDirection: 'row',
    gap: 32,
  },
  automationStat: {
    alignItems: 'center',
  },
  automationStatValue: {
    ...Typography.h5,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  automationStatLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});