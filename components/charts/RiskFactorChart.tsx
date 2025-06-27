import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface RiskFactorChartProps {
  riskFactors: string[];
}

export const RiskFactorChart: React.FC<RiskFactorChartProps> = ({
  riskFactors = []
}) => {
  const getRiskLevel = (index: number) => {
    if (index < 2) return 'high';
    if (index < 4) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      default: return '#28a745';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'high': return '#f8d7da';
      case 'medium': return '#fff3cd';
      default: return '#d4edda';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>リスク要因分析</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {riskFactors.length > 0 ? (
          riskFactors.map((risk, index) => {
            const level = getRiskLevel(index);
            return (
              <View
                key={index}
                style={[
                  styles.riskCard,
                  {
                    backgroundColor: getRiskBgColor(level),
                    borderLeftColor: getRiskColor(level),
                  }
                ]}
              >
                <Text style={styles.riskTitle}>
                  リスク {index + 1} ({level === 'high' ? '高' : level === 'medium' ? '中' : '低'})
                </Text>
                <Text style={styles.riskText}>
                  {risk.length > 100 ? risk.substring(0, 100) + '...' : risk}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>リスク要因データがありません</Text>
          </View>
        )}
      </ScrollView>
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
    maxHeight: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  riskCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  riskText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
