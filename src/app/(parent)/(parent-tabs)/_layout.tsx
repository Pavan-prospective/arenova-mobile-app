import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function ParentTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF5100' }}>
      <Tabs.Screen
        name="parent-dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen name="family-tree" options={{ href: null }} />
    </Tabs>
  );
}
