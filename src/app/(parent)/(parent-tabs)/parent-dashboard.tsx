import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface Child {
  _id: string;
  name: string;
  age: number;
  sport?: string;
  school?: string;
}

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [activeChildFilter, setActiveChildFilter] = useState<string>('all');

  // Fetch children list
  const { data: childrenResponse, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await api.get('/users/me/children');
      return res.data;
    }
  });

  const children: Child[] = childrenResponse?.data || [];
  const colors = ['bg-emerald-500', 'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500'];

  return (
    <View className="flex-1 bg-[#EEF3F9]">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Header Section */}
        <View className="bg-secondary px-6 pt-16 pb-8 rounded-b-3xl shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Typography variant="h2" color="white" weight="bold" className="font-outfit-bold">
                Hello, {user?.name || 'Parent'}!
              </Typography>
              <Typography variant="caption" color="light" className="opacity-80 font-outfit">
                Manage and track bookings for your family.
              </Typography>
            </View>
          </View>

          {/* Children Profiles Shortcuts */}
          <Typography variant="subtitle2" color="white" weight="semibold" className="mb-3 opacity-90 font-outfit-semibold">
            Family Members
          </Typography>
          <View className="flex-row items-center gap-3 flex-wrap">
            <TouchableOpacity 
              onPress={() => setActiveChildFilter('all')}
              activeOpacity={0.8}
              className={`px-4 py-2 rounded-full border ${activeChildFilter === 'all' ? 'bg-primary border-primary' : 'bg-white/10 border-white/20'}`}
            >
              <Typography variant="body2" color="white" weight="bold" className="font-outfit-bold">All</Typography>
            </TouchableOpacity>

            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" className="mx-2" />
            ) : (
              children.map((child, index) => {
                const childId = child._id;
                const isSelected = activeChildFilter === childId;
                const initials = child.name.substring(0, 2).toUpperCase();
                const color = colors[index % colors.length];

                return (
                  <TouchableOpacity 
                    key={childId}
                    onPress={() => setActiveChildFilter(childId)}
                    activeOpacity={0.8}
                    className={`px-3 py-1.5 rounded-full flex-row items-center border ${
                      isSelected ? 'bg-primary border-primary' : 'bg-white/10 border-white/20'
                    }`}
                  >
                    <View className={`w-6 h-6 rounded-full ${color} items-center justify-center mr-2 shadow-sm`}>
                      <Typography variant="overline" color="white" weight="bold" className="font-outfit-bold">{initials}</Typography>
                    </View>
                    <Typography variant="body2" color="white" weight="bold" className="font-outfit-bold">{child.name}</Typography>
                  </TouchableOpacity>
                );
              })
            )}

            <TouchableOpacity 
              onPress={() => router.push('/(parent)/family/add-child')}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-full bg-white/20 items-center justify-center border border-dashed border-white/40"
            >
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Find Coach Prominent Banner */}
        <View className="mx-6 mt-6 bg-primary rounded-3xl p-5 shadow-sm overflow-hidden relative">
          <View className="w-2/3">
            <Typography variant="h3" color="white" weight="bold" className="mb-2 font-outfit-bold">
              Book Best Local Coaches
            </Typography>
            <Typography variant="caption" color="white" className="mb-4 opacity-90 leading-4 font-outfit">
              Select verified expert trainers in sports, swimming, fitness & yoga for your kids.
            </Typography>
            <TouchableOpacity 
              onPress={() => router.push('/(shared)/search')}
              activeOpacity={0.8}
              className="bg-secondary px-4 py-2 rounded-full self-start"
            >
              <Typography variant="body2" color="white" weight="bold" className="font-outfit-bold">Find a Coach</Typography>
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
            activeOpacity={0.8}
            className="w-[30%] aspect-square rounded-2xl bg-[#4B9C73] p-3 justify-end shadow-sm"
          >
            <Ionicons name="football-outline" size={24} color="white" className="mb-2" />
            <Typography variant="body2" color="white" weight="bold" className="font-outfit-bold">
              Sports
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-[30%] aspect-square rounded-2xl bg-[#4A90E2] p-3 justify-end shadow-sm"
          >
            <Ionicons name="people-outline" size={24} color="white" className="mb-2" />
            <Typography variant="body2" color="white" weight="bold" className="font-outfit-bold">
              Community
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.8}
            className="w-[30%] aspect-square rounded-2xl bg-[#F58220] p-3 justify-end shadow-sm"
          >
            <Ionicons name="location-outline" size={24} color="white" className="mb-2" />
            <Typography variant="body2" color="white" weight="bold" className="font-outfit-bold">
              Venues
            </Typography>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
