import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function IndividualTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF5100' }}>
      <Tabs.Screen 
        name="individual-dashboard" 
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
    </Tabs>
  );
}
