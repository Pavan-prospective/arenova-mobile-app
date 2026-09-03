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
  const { user, children: storedChildren } = useAuthStore();
  const [activeChildFilter, setActiveChildFilter] = useState<string>('all');

  const { data: childrenResponse, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await api.get('/users/me/children');
      return res.data;
    }
  });

  const rawServer = childrenResponse?.data || childrenResponse?.children || (Array.isArray(childrenResponse) ? childrenResponse : []);
  const serverChildren: Child[] = Array.isArray(rawServer) ? rawServer : [];

  // Merge server children with persistent AuthStore children
  const childrenMap = new Map<string, Child>();
  (storedChildren || []).forEach(c => childrenMap.set(c._id || c.name, c));
  serverChildren.forEach(c => childrenMap.set(c._id || c.name, c));
  const children: Child[] = Array.from(childrenMap.values());

  const selectedChild = children.find(c => c._id === activeChildFilter);
  const selectedSport = selectedChild?.sport;

  // Fetch recommended coaches (filtered by child sport if selected)
  const { data: coachesResponse, isLoading: isLoadingCoaches } = useQuery({
    queryKey: ['featuredCoaches', selectedSport],
    queryFn: async () => {
      const params: any = {};
      if (selectedSport) params.sport = selectedSport;
      const res = await api.get('/coaches', { params });
      return res.data;
    }
  });

  const coaches = coachesResponse?.data || [];
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

        {/* Recommended Coaches */}
        <View className="px-6 pb-12">
          <View className="flex-row justify-between items-center mb-4">
            <Typography variant="h3" color="secondary" weight="bold" className="font-outfit-bold">
              Recommended Coaches
            </Typography>
            <TouchableOpacity onPress={() => router.push('/(shared)/search')}>
              <Typography variant="body2" color="primary" weight="bold" className="font-outfit-bold">
                See All
              </Typography>
            </TouchableOpacity>
          </View>

          {isLoadingCoaches ? (
            <ActivityIndicator size="small" color="#FF5100" />
          ) : coaches.length === 0 ? (
            <Typography variant="body2" color="muted" className="font-outfit italic text-center py-4">
              No recommended coaches available.
            </Typography>
          ) : (
            coaches.slice(0, 3).map((coach: any) => {
              const coachId = coach._id || coach.id;
              const coachName = coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'Coach';
              const coachSport = coach.sport || coach.sports?.[0] || 'Sports';
              const coachInitials = coachName.split(' ').map((n: string) => n[0]).join('');
              const rating = coach.rating || '4.8';

              return (
                <TouchableOpacity 
                  key={coachId}
                  onPress={() => router.push({
                    pathname: '/(shared)/coach-profile',
                    params: { id: coachId }
                  })}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center"
                >
                  <View className="w-14 h-14 rounded-full bg-[#F5E6D3] mr-4 items-center justify-center shadow-sm">
                    <Typography variant="subtitle1" color="primary" weight="bold" className="font-outfit-bold">
                      {coachInitials}
                    </Typography>
                  </View>
                  <View className="flex-1">
                    <Typography variant="subtitle1" color="secondary" weight="bold" className="font-outfit-bold mb-0.5">
                      {coachName}
                    </Typography>
                    <Typography variant="body2" color="muted" className="font-outfit mb-1">
                      {coachSport}
                    </Typography>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#FFD700" className="mr-1" />
                      <Typography variant="caption" color="secondary" weight="bold" className="font-outfit-bold">
                        {rating}
                      </Typography>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}
