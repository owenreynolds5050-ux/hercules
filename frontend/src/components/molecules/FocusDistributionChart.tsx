import React, { useMemo, useState } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import PieChart from 'react-native-chart-kit/dist/PieChart';

import { Text } from '@/components/atoms/Text';
import { colors, spacing, radius } from '@/constants/theme';
import { useWorkoutSessionsStore } from '@/store/workoutSessionsStore';

// Import data
import exercisesData from '@/data/exercises.json';
import muscleWeightsData from '@/data/exercise_muscle_weights.json';
import hierarchyData from '@/data/hierarchy.json';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

// Extended Orange Palette for complex charts
const ORANGE_PALETTE = [
  '#FF6B4A', // Primary
  '#E76F51', // Warning/Burnt
  '#FFB88C', // Orange Light
  '#F4A261', // Sandy Orange
  '#E9C46A', // Muted Yellow-Orange
  '#D64045', // Deep Red-Orange
  '#FE5F55', // Bright Coral
  '#8C2F00', // Dark Rust
  '#F08080', // Light Coral
  '#FFA07A', // Light Salmon
  '#CD5C5C', // Indian Red
  '#FF7F50', // Coral
  '#FF4500', // Orange Red
  '#B22222', // Firebrick
  '#FA8072', // Salmon
];

// Build Maps
const buildMaps = () => {
  const leafToL1: Record<string, string> = {}; // Specific -> Body Part (Upper/Lower/Core)
  const leafToL2: Record<string, string> = {}; // Specific -> Muscle Group (Chest/Back/etc)
  const leafToL3: Record<string, string> = {}; // Specific -> Specific (Identity)

  const hierarchy = hierarchyData.muscle_hierarchy;

  Object.entries(hierarchy).forEach(([l1, l2Group]) => {
    Object.entries(l2Group).forEach(([l2, l3Array]) => {
      // l2 is "Chest", l3Array is ["Chest"]
      // l2 is "Back", l3Array is ["Back", "Lats", "Traps"]
      
      // Map the Group Name itself (sometimes used as a key in weights)
      leafToL1[l2] = l1;
      leafToL2[l2] = l2;
      leafToL3[l2] = l2;

      if (Array.isArray(l3Array)) {
        l3Array.forEach(leaf => {
          leafToL1[leaf] = l1;
          leafToL2[leaf] = l2;
          leafToL3[leaf] = leaf;
        });
      }
    });
  });

  return { leafToL1, leafToL2, leafToL3 };
};

const { leafToL1, leafToL2, leafToL3 } = buildMaps();

const EXERCISE_NAME_TO_ID = exercisesData.reduce((acc, ex) => {
  acc[ex.name] = ex.id;
  return acc;
}, {} as Record<string, string>);

interface ChartPageProps {
  title: string;
  data: Array<{
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
}

const ChartPage: React.FC<ChartPageProps> = ({ title, data }) => (
  <View style={styles.pageContainer}>
    <Text variant="heading3" color="primary" style={styles.chartTitle}>{title}</Text>
    {data.length > 0 ? (
      <PieChart
        data={data}
        width={CHART_WIDTH}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => colors.text.primary,
        }}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        center={[10, 0]}
        absolute
        hasLegend={true}
      />
    ) : (
      <View style={styles.emptyChart}>
        <Text variant="body" color="secondary">No data available</Text>
      </View>
    )}
  </View>
);

export const FocusDistributionChart: React.FC = () => {
  const workouts = useWorkoutSessionsStore((state) => state.workouts);
  const [currentPage, setCurrentPage] = useState(0);

  const { dataL1, dataL2, dataL3 } = useMemo(() => {
    const distL1: Record<string, number> = {};
    const distL2: Record<string, number> = {};
    const distL3: Record<string, number> = {};

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const exerciseId = EXERCISE_NAME_TO_ID[exercise.name];
        if (!exerciseId) return;

        const weights = (muscleWeightsData as Record<string, Record<string, number>>)[exerciseId];
        if (!weights) return;

        // Exclude sets with 0 weight
        const completedSets = exercise.sets.filter(s => s.completed && s.weight > 0).length;
        if (completedSets === 0) return;

        Object.entries(weights).forEach(([muscle, weight]) => {
            const contribution = completedSets * weight;
            
            // Level 1
            const cat1 = leafToL1[muscle];
            if (cat1) distL1[cat1] = (distL1[cat1] || 0) + contribution;

            // Level 2
            const cat2 = leafToL2[muscle];
            if (cat2) distL2[cat2] = (distL2[cat2] || 0) + contribution;

            // Level 3
            const cat3 = leafToL3[muscle];
            if (cat3) distL3[cat3] = (distL3[cat3] || 0) + contribution;
        });
      });
    });

    const formatData = (dist: Record<string, number>, palette: string[]) => {
        return Object.entries(dist)
            .sort((a, b) => b[1] - a[1]) // Sort by value descending
            .map(([name, value], index) => ({
                name,
                population: Math.round(value),
                color: palette[index % palette.length],
                legendFontColor: colors.text.primary,
                legendFontSize: 12,
            }))
            .filter(item => item.population > 0);
    };

    // Specific Level 1 Colors
    const l1Colors = {
        'Upper Body': colors.accent.primary,
        'Lower Body': colors.accent.warning,
        'Core': colors.accent.orangeLight,
    };
    
    const dataL1 = Object.entries(distL1).map(([name, value]) => ({
        name,
        population: Math.round(value),
        color: l1Colors[name as keyof typeof l1Colors] || colors.neutral.gray600,
        legendFontColor: colors.text.primary,
        legendFontSize: 12,
    })).filter(i => i.population > 0);

    const dataL2 = formatData(distL2, ORANGE_PALETTE);
    const dataL3 = formatData(distL3, ORANGE_PALETTE);

    return { dataL1, dataL2, dataL3 };
  }, [workouts]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / CHART_WIDTH);
    if (pageIndex !== currentPage) {
        setCurrentPage(pageIndex);
    }
  };

  if (workouts.length === 0) {
    return (
        <View style={styles.emptyContainer}>
            <Text variant="body" color="secondary">No workout data available yet.</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.pagination}>
        {[0, 1, 2].map((index) => (
            <View
                key={index}
                style={[
                    styles.dot,
                    index === currentPage ? styles.activeDot : styles.inactiveDot
                ]}
            />
        ))}
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ width: CHART_WIDTH }}
      >
        <ChartPage title="By Body Region" data={dataL1} />
        <ChartPage title="By Muscle Group" data={dataL2} />
        <ChartPage title="By Specific Muscle" data={dataL3} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageContainer: {
    width: CHART_WIDTH,
    alignItems: 'center',
  },
  chartTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  activeDot: {
    backgroundColor: colors.accent.primary,
  },
  inactiveDot: {
    backgroundColor: colors.neutral.gray400,
  }
});
