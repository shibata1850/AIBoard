import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface RecommendationCardsProps {
  recommendations: string[];
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  recommendations = []
}) => {
  const getPriorityLevel = (index: number) => {
    if (index === 0) return 'high';
    if (index === 1) return 'medium';
    return 'normal';
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      default: return '#28a745';
    }
  };

  const getPriorityBgColor = (level: string) => {
    switch (level) {
      case 'high': return '#f8d7da';
      case 'medium': return '#fff3cd';
      default: return '#d4edda';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>改善提案</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => {
            const priority = getPriorityLevel(index);
            return (
              <View
                key={index}
                style={[
                  styles.recommendationCard,
                  {
                    backgroundColor: getPriorityBgColor(priority),
                    borderLeftColor: getPriorityColor(priority),
                  }
                ]}
              >
                <Text style={styles.recommendationTitle}>
                  提案 {index + 1} ({priority === 'high' ? '優先度高' : priority === 'medium' ? '優先度中' : '優先度低'})
                </Text>
                <Text style={styles.recommendationText}>
                  {recommendation.length > 150 ? recommendation.substring(0, 150) + '...' : recommendation}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>改善提案データがありません</Text>
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
    maxHeight: 350,
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
  recommendationCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  recommendationText: {
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
