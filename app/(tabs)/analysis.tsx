import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from 'react-native-paper';
import { useTrading } from '../../hooks/useTrading';

export default function Analysis() {
  const { indicators, selectedSymbol, updateIndicators, automationRules } = useTrading();

  const handleRefresh = () => {
    updateIndicators(selectedSymbol);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Technical Analysis</Text>
          <Text style={styles.subtitle}>{selectedSymbol}</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Indicators</Text>
              <Button mode="outlined" onPress={handleRefresh} compact>
                Refresh
              </Button>
            </View>
            
            <View style={styles.indicatorRow}>
              <Text style={styles.indicatorLabel}>RSI:</Text>
              <Text style={[styles.indicatorValue, { 
                color: indicators.rsi > 70 ? '#F44336' : indicators.rsi < 30 ? '#4CAF50' : '#333' 
              }]}>
                {indicators.rsi.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.indicatorRow}>
              <Text style={styles.indicatorLabel}>Moving Average:</Text>
              <Text style={styles.indicatorValue}>{indicators.movingAverage.toFixed(4)}</Text>
            </View>
            
            <View style={styles.indicatorRow}>
              <Text style={styles.indicatorLabel}>MACD Signal:</Text>
              <Text style={[styles.indicatorValue, { 
                color: indicators.macd.signal > 0 ? '#4CAF50' : '#F44336' 
              }]}>
                {indicators.macd.signal.toFixed(4)}
              </Text>
            </View>
            
            <View style={styles.indicatorRow}>
              <Text style={styles.indicatorLabel}>MACD Histogram:</Text>
              <Text style={[styles.indicatorValue, { 
                color: indicators.macd.histogram > 0 ? '#4CAF50' : '#F44336' 
              }]}>
                {indicators.macd.histogram.toFixed(4)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Fibonacci Levels</Text>
            <View style={styles.fibonacciContainer}>
              {indicators.fibonacciLevels.map((level, index) => (
                <View key={index} style={styles.fibonacciRow}>
                  <Text style={styles.fibonacciLabel}>{level.toFixed(3)}</Text>
                  <View style={[styles.fibonacciBar, { 
                    width: `${(level / 1.618) * 100}%`,
                    backgroundColor: level > 1 ? '#FF9800' : '#2196F3'
                  }]} />
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Automation Rules</Text>
            {automationRules.length === 0 ? (
              <Text style={styles.noRules}>No automation rules configured</Text>
            ) : (
              automationRules.map((rule) => (
                <View key={rule.id} style={styles.ruleRow}>
                  <View style={styles.ruleInfo}>
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Text style={styles.ruleDescription}>{rule.description}</Text>
                  </View>
                  <View style={[styles.ruleStatus, { 
                    backgroundColor: rule.isActive ? '#4CAF50' : '#F44336' 
                  }]}>
                    <Text style={styles.ruleStatusText}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Text>
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  card: {
    margin: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  indicatorLabel: {
    fontSize: 16,
    color: '#666',
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  fibonacciContainer: {
    marginTop: 10,
  },
  fibonacciRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fibonacciLabel: {
    width: 60,
    fontSize: 14,
    color: '#666',
  },
  fibonacciBar: {
    height: 20,
    borderRadius: 10,
    marginLeft: 10,
  },
  noRules: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
  },
  ruleStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ruleStatusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});