import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';

export default function IndividualDashboard() {
  const { user } = useAuthStore();
  return (
    <View className="flex-1 bg-[#EEF3F9]">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Header Section */}
        <View className="bg-secondary px-6 pt-16 pb-8 rounded-b-3xl shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Typography variant="h2" color="white" weight="bold">
                Welcome back, {user?.name || 'User'}!
              </Typography>
              <Typography variant="caption" color="light" className="opacity-80">
                Track your personal training progress & bookings.
              </Typography>
            </View>
            

          </View>
        </View>

        {/* Find Coach Prominent Banner */}
        <View className="mx-6 mt-6 bg-primary rounded-3xl p-5 shadow-sm overflow-hidden relative">
          <View className="w-2/3">
            <Typography variant="h3" color="white" weight="bold" className="mb-2">
              Learn From Expert Coaches
            </Typography>
            <Typography variant="caption" color="white" className="mb-4 opacity-90 leading-4">
              Book personal training slots with expert sports coaches in your area.
            </Typography>
            <TouchableOpacity 
              onPress={() => router.push('/(shared)/search')}
              className="bg-secondary px-4 py-2 rounded-full self-start"
            >
              <Typography variant="body2" color="white" weight="bold">Book Session</Typography>
            </TouchableOpacity>
          </View>
          <View className="absolute -right-4 -bottom-4 opacity-20">
            <Ionicons name="ribbon" size={130} color="white" />
          </View>
        </View>

        {/* Fast Action Categories */}
        <View className="px-6 pt-6 pb-12 flex-row justify-between">
          <TouchableOpacity 
            onPress={() => router.push('/(shared)/select-sport')}
            className="w-[30%] aspect-square rounded-2xl bg-[#4B9C73] p-3 justify-end shadow-sm"
          >
            <Ionicons name="football-outline" size={24} color="white" className="mb-2" />
            <Typography variant="body2" color="white" weight="bold">
              Sports
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-[30%] aspect-square rounded-2xl bg-[#4A90E2] p-3 justify-end shadow-sm"
          >
            <Ionicons name="people-outline" size={24} color="white" className="mb-2" />
            <Typography variant="body2" color="white" weight="bold">
              Community
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-[30%] aspect-square rounded-2xl bg-[#F58220] p-3 justify-end shadow-sm"
          >
            <Ionicons name="location-outline" size={24} color="white" className="mb-2" />
            <Typography variant="body2" color="white" weight="bold">
              Venues
            </Typography>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
