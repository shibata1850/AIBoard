import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface ProfitLossChartProps {
  revenue?: number;
  expenses?: number;
  profit?: number;
}

const screenWidth = Dimensions.get('window').width;

export const ProfitLossChart: React.FC<ProfitLossChartProps> = ({
  revenue = 0,
  expenses = 0,
  profit = 0
}) => {
  const data = {
    labels: ['売上高', '総費用', '純利益'],
    datasets: [
      {
        data: [
          Math.abs(revenue) / 1000, // Convert to thousands for better display
          Math.abs(expenses) / 1000,
          Math.abs(profit) / 1000
        ]
      }
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>収益性分析</Text>
      <BarChart
        data={data}
        width={screenWidth - 60}
        height={220}
        yAxisLabel="¥"
        yAxisSuffix="k"
        chartConfig={chartConfig}
      />
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          売上高: ¥{revenue.toLocaleString('ja-JP')}千円
        </Text>
        <Text style={[styles.summaryText, { color: profit > 0 ? '#28a745' : '#dc3545' }]}>
          純利益: ¥{profit.toLocaleString('ja-JP')}千円
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summary: {
    marginTop: 15,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginVertical: 2,
  },
});
