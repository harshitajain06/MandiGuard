import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { dailyDataRef } from '../../config/firebase';
import { getDocs } from 'firebase/firestore';
import { BarChart, PieChart } from 'react-native-chart-kit';

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    totalInventory: 0,
    wasteThisMonth: 0,
    wasteReduction: 0,
    efficiencyRate: 0,
  });
  const [monthlyWaste, setMonthlyWaste] = useState([]);
  const [wasteByCategory, setWasteByCategory] = useState([]);

  const chartColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6'];

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(dailyDataRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      let totalInventory = 0;
      let wasteThisMonth = 0;
      let wasteLastMonth = 0;
      let categoryWaste = {};

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      data.forEach(entry => {
        const { quantity, shelfLife, createdAt, lastSold, stockType } = entry;
        totalInventory += quantity;

        const averageStock = quantity / shelfLife;
        const remainingDays = Math.max(
          0,
          Math.ceil(
            (new Date(createdAt.toDate ? createdAt.toDate() : createdAt).getTime() +
              shelfLife * 24 * 60 * 60 * 1000 -
              Date.now()) /
              (1000 * 3600 * 24)
          )
        );

        const wasteUnits = Math.max(0, (averageStock - (lastSold || 0)) * remainingDays);

        const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
          wasteThisMonth += wasteUnits;
        } else if (
          createdDate.getMonth() === currentMonth - 1 &&
          createdDate.getFullYear() === currentYear
        ) {
          wasteLastMonth += wasteUnits;
        }

        if (!categoryWaste[stockType]) {
          categoryWaste[stockType] = 0;
        }
        categoryWaste[stockType] += wasteUnits;
      });

      const efficiencyRate =
        totalInventory > 0 ? ((1 - wasteThisMonth / totalInventory) * 100).toFixed(1) : 0;
      const wasteReduction =
        wasteLastMonth > 0
          ? (((wasteLastMonth - wasteThisMonth) / wasteLastMonth) * 100).toFixed(1)
          : 0;

      setStats({
        totalInventory: totalInventory.toFixed(1),
        wasteThisMonth: wasteThisMonth.toFixed(1),
        wasteReduction,
        efficiencyRate,
      });

      // Example monthly waste data
      setMonthlyWaste([
        { month: 'Jan', waste: 30 },
        { month: 'Feb', waste: 20 },
        { month: 'Mar', waste: 15 },
        { month: 'Apr', waste: wasteThisMonth },
      ]);

      setWasteByCategory(
        Object.keys(categoryWaste).map((key, index) => ({
          name: key,
          population: categoryWaste[key],
          color: chartColors[index % chartColors.length],
          legendFontColor: '#333',
          legendFontSize: 12,
        }))
      );
    };

    fetchData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      {/* Stats Row 1 */}
      <View style={styles.statsRow}>
        <StatCard title="Total Inventory" value={`${stats.totalInventory} kg`} />
        <StatCard title="Waste This Month" value={`${stats.wasteThisMonth} kg`} />
      </View>

      {/* Stats Row 2 */}
      <View style={styles.statsRow}>
        <StatCard title="Waste Reduction" value={`${stats.wasteReduction}%`} />
        <StatCard title="Efficiency Rate" value={`${stats.efficiencyRate}%`} />
      </View>

      {/* Bar Chart */}
      <Text style={styles.sectionTitle}>Monthly Waste Trends</Text>
      <BarChart
        data={{
          labels: monthlyWaste.map(item => item.month),
          datasets: [{ data: monthlyWaste.map(item => item.waste) }],
        }}
        width={Dimensions.get('window').width - 20}
        height={220}
        yAxisSuffix="kg"
        chartConfig={chartConfig}
        style={styles.chart}
      />

      {/* Pie Chart */}
      <Text style={styles.sectionTitle}>Waste by Category</Text>
      <PieChart
        data={wasteByCategory}
        width={Dimensions.get('window').width - 20}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </ScrollView>
  );
}

function StatCard({ title, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(77, 150, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 10 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    margin: 5,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: { color: '#777', fontSize: 14 },
  statValue: { color: '#000', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: '#333' },
  chart: { borderRadius: 16, marginVertical: 8 },
});
