
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, TextInput, Chip, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTrading } from '../../hooks/useTrading';
import { Colors, Gradients } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { QUICK_ACCESS_SYMBOLS, ALL_MARKETS, searchMarkets, MarketInfo, MARKET_CATEGORIES } from '../../constants/Markets';

export default function Trading() {
  const { trades, selectedSymbol, setSelectedSymbol, executeTrade } = useTrading();
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllMarkets, setShowAllMarkets] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const symbols = QUICK_ACCESS_SYMBOLS;

  // Filter markets based on search query and category
  const getFilteredMarkets = (): MarketInfo[] => {
    let filteredMarkets = searchQuery ? searchMarkets(searchQuery) : ALL_MARKETS;
    
    if (selectedCategory !== 'All') {
      filteredMarkets = filteredMarkets.filter(market => market.category === selectedCategory);
    }
    
    return filteredMarkets;
  };

  const handleMarketSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    setShowAllMarkets(false);
    setSearchQuery('');
  };

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
        {/* Quick Access Markets */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Quick Access</Text>
              <MaterialIcons name="flash-on" size={24} color={Colors.primary} />
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
            colors={[Colors.primary + '10', Colors.surface]}
            style={styles.tradeCardGradient}
          >
            <View style={styles.tradeHeader}>
              <View>
                <Text style={styles.tradeTitle}>Execute Trade</Text>
                <Text style={styles.selectedSymbolText}>{selectedSymbol}</Text>
              </View>
              <View style={styles.symbolIcon}>
                <MaterialIcons name="account-balance" size={24} color={Colors.primary} />
              </View>
            </View>
            
            <TextInput
              label="Quantity (Lots)"
              value={quantity}
              onChangeText={setQuantity}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder="Enter trade size"
              theme={{
                colors: {
                  primary: Colors.primary,
                  onSurface: Colors.textPrimary,
                  outline: Colors.border,
                  surface: Colors.inputBackground,
                }
              }}
              textColor={Colors.textPrimary}
              left={<TextInput.Icon icon="chart-line" iconColor={Colors.textMuted} />}
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
                icon="trending-up"
                labelStyle={styles.tradeButtonText}
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
                textColor={Colors.background}
                icon="trending-down"
                labelStyle={styles.tradeButtonText}
              >
                SELL
              </Button>
            </View>
          </LinearGradient>
        </Card>
        {/* Recent Trades & Positions */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Recent Activity</Text>
              <MaterialIcons name="history" size={24} color={Colors.accent} />
            </View>

            {trades.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="trending-up" size={64} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No trades executed</Text>
                <Text style={styles.emptyStateSubtext}>
                  Execute your first trade to start building your portfolio
                </Text>
              </View>
            ) : (
              <View style={styles.tradesContainer}>
                {trades.slice(0, 5).map((trade, index) => (
                  <View 
                    key={trade.id} 
                    style={[
                      styles.tradeRow,
                      index === Math.min(4, trades.length - 1) && styles.lastTradeRow
                    ]}
                  >
                    <View style={styles.tradeMainInfo}>
                      <View style={styles.tradeSymbolContainer}>
                        <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                        <View style={[
                          styles.tradeTypeBadge,
                          { backgroundColor: trade.type === 'BUY' ? Colors.bullish : Colors.bearish }
                        ]}>
                          <Text style={[
                            styles.tradeType,
                            { color: Colors.background }
                          ]}>
                            {trade.type}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.tradeDetails}>
                        <Text style={styles.tradeQuantity}>
                          Qty: {trade.quantity}
                        </Text>
                        <Text style={styles.tradeStatus}>
                          {trade.status}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.tradeProfitContainer}>
                      <MaterialIcons 
                        name={(trade.profit || 0) >= 0 ? "trending-up" : "trending-down"} 
                        size={20} 
                        color={(trade.profit || 0) >= 0 ? Colors.bullish : Colors.bearish} 
                      />
                      <Text style={[
                        styles.tradeProfit,
                        { color: (trade.profit || 0) >= 0 ? Colors.bullish : Colors.bearish }
                      ]}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}${(trade.profit || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* All Markets with Search */}
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>All Markets</Text>
              <Button
                mode="text"
                onPress={() => setShowAllMarkets(!showAllMarkets)}
                textColor={Colors.primary}
                icon={showAllMarkets ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                compact
              >
                {showAllMarkets ? 'Hide' : 'Show'}
              </Button>
            </View>

            {showAllMarkets && (
              <View style={styles.marketSearchContainer}>
                <Searchbar
                  placeholder="Search markets..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchBar}
                  inputStyle={styles.searchInput}
                  theme={{
                    colors: {
                      primary: Colors.primary,
                      onSurface: Colors.textPrimary,
                      surface: Colors.inputBackground,
                    }
                  }}
                />

                {/* Category Filter */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                  contentContainerStyle={styles.categoryScrollContent}
                >
                  <Chip
                    selected={selectedCategory === 'All'}
                    onPress={() => setSelectedCategory('All')}
                    style={[
                      styles.categoryChip,
                      selectedCategory === 'All' && styles.selectedCategoryChip
                    ]}
                    textStyle={[
                      styles.categoryChipText,
                      selectedCategory === 'All' && styles.selectedCategoryChipText
                    ]}
                  >
                    All
                  </Chip>
                  {MARKET_CATEGORIES.map((category) => (
                    <Chip
                      key={category}
                      selected={selectedCategory === category}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category && styles.selectedCategoryChip
                      ]}
                      textStyle={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.selectedCategoryChipText
                      ]}
                    >
                      {category}
                    </Chip>
                  ))}
                </ScrollView>

                {/* Market List */}
                <View style={styles.marketList}>
                  {getFilteredMarkets().slice(0, 20).map((market) => (
                    <View key={market.symbol} style={styles.marketItem}>
                      <Button
                        mode="text"
                        onPress={() => handleMarketSelect(market.symbol)}
                        style={[
                          styles.marketButton,
                          selectedSymbol === market.symbol && styles.selectedMarketButton
                        ]}
                        labelStyle={[
                          styles.marketButtonLabel,
                          selectedSymbol === market.symbol && styles.selectedMarketButtonLabel
                        ]}
                        contentStyle={styles.marketButtonContent}
                      >
                        <View style={styles.marketButtonInfo}>
                          <View style={styles.marketButtonTop}>
                            <Text style={[
                              styles.marketSymbol,
                              selectedSymbol === market.symbol && styles.selectedMarketSymbol
                            ]}>
                              {market.symbol}
                            </Text>
                            <Text style={[
                              styles.marketCategory,
                              selectedSymbol === market.symbol && styles.selectedMarketCategory
                            ]}>
                              {market.category}
                            </Text>
                          </View>
                          <Text style={[
                            styles.marketName,
                            selectedSymbol === market.symbol && styles.selectedMarketName
                          ]}>
                            {market.name}
                          </Text>
                        </View>
                      </Button>
                    </View>
                  ))}
                  
                  {getFilteredMarkets().length > 20 && (
                    <View style={styles.moreMarketsInfo}>
                      <Text style={styles.moreMarketsText}>
                        +{getFilteredMarkets().length - 20} more markets available
                      </Text>
                      <Text style={styles.moreMarketsSubtext}>
                        Refine your search to see more specific results
                      </Text>
                    </View>
                  )}
                  
                  {getFilteredMarkets().length === 0 && (
                    <View style={styles.noMarketsFound}>
                      <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
                      <Text style={styles.noMarketsText}>No markets found</Text>
                      <Text style={styles.noMarketsSubtext}>Try adjusting your search or category filter</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView> {/* This closing tag was missing */}
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
  marketSearchContainer: {
    marginTop: 16,
  },
  searchBar: {
    backgroundColor: Colors.inputBackground,
    marginBottom: 16,
  },
  searchInput: {
    color: Colors.textPrimary,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryScrollContent: {
    paddingRight: 16,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: Colors.cardElevated,
    borderColor: Colors.border,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.secondary,
  },
  categoryChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: Colors.background,
    fontWeight: '600',
  },
  marketList: {
    maxHeight: 400,
  },
  marketItem: {
    marginBottom: 8,
  },
  marketButton: {
    borderRadius: 8,
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedMarketButton: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  marketButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  marketButtonLabel: {
    width: '100%',
  },
  selectedMarketButtonLabel: {
    color: Colors.primary,
  },
  marketButtonInfo: {
    width: '100%',
    alignItems: 'flex-start',
  },
  marketButtonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  marketSymbol: {
    ...Typography.h6,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  selectedMarketSymbol: {
    color: Colors.primary,
  },
  marketCategory: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  selectedMarketCategory: {
    color: Colors.primary,
  },
  marketName: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  selectedMarketName: {
    color: Colors.primary,
  },
  moreMarketsInfo: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  moreMarketsText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  moreMarketsSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  noMarketsFound: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noMarketsText: {
    ...Typography.h6,
    color: Colors.textMuted,
    marginTop: 12,
  },
  noMarketsSubtext: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
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
