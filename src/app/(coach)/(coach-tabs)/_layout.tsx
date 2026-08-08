import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CoachTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF5100' }}>
      <Tabs.Screen 
        name="coach-dashboard" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="schedule" 
        options={{ 
          title: 'Availability',
          tabBarIcon: ({ color }) => <Ionicons name="time-outline" size={24} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="activity" 
        options={{ 
          title: 'Activity',
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color={color} />
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
