import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface FinancialRatioChartProps {
  debtRatio?: number;
  currentRatio?: number;
  fixedRatio?: number;
}

const screenWidth = Dimensions.get('window').width;

export const FinancialRatioChart: React.FC<FinancialRatioChartProps> = ({
  debtRatio = 32.2,
  currentRatio = 2.47,
  fixedRatio = 1.43
}) => {
  const data = [
    {
      name: '負債比率',
      population: debtRatio,
      color: '#dc3545',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: '自己資本比率',
      population: 100 - debtRatio,
      color: '#28a745',
      legendFontColor: '#333',
      legendFontSize: 14,
    }
  ];

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>財務比率分析</Text>
      <PieChart
        data={data}
        width={screenWidth - 60}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 50]}
        absolute
      />
      <View style={styles.ratioInfo}>
        <Text style={styles.ratioText}>流動比率: {currentRatio}</Text>
        <Text style={styles.ratioText}>固定比率: {fixedRatio}</Text>
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
  ratioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  ratioText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
