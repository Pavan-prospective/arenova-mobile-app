import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface Child {
  _id: string;
  name: string;
  age: number;
  sport?: string;
  school?: string;
}

import { useAuthStore } from '@/store';

export default function FamilyTreeScreen() {
  const router = useRouter();
  const { children: storedChildren } = useAuthStore();
  const [selectedProfileId, setSelectedProfileId] = useState<string>('self');

  // Fetch children list
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

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
          Family Tree
        </Typography>
        <View className="p-2 w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4 pb-8">
        {/* Date Time Overview Card */}
        <View className="bg-[#F5CEAA] rounded-2xl p-4 mb-5 flex-row items-center justify-between border border-[#EBA86A]">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-white mr-4 items-center justify-center shadow-sm">
              <Ionicons name="time" size={24} color="#FF5100" />
            </View>
            <View className="flex-1">
              <Typography variant="subtitle1" color="secondary" weight="bold" className="font-outfit-bold">
                Select Profile
              </Typography>
              <Typography variant="caption" color="text" className="opacity-75 font-outfit">
                Manage accounts & verify session activities
              </Typography>
            </View>
          </View>
        </View>

        <Typography variant="subtitle2" color="muted" weight="bold" className="mb-3 ml-1 uppercase font-outfit-bold">
          Account Profiles
        </Typography>

        {/* Profiles List */}
        
        {/* Parent Profile */}
        <TouchableOpacity 
          className={`bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between border-2 transition-all ${
            selectedProfileId === 'self' ? 'border-primary shadow-sm' : 'border-transparent'
          }`}
          onPress={() => setSelectedProfileId('self')}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center flex-1 mr-4">
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="person" size={22} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Typography variant="subtitle1" color="secondary" weight="bold" className="font-outfit-bold mb-0.5">
                Yourself
              </Typography>
              <Typography variant="caption" color="muted" className="font-outfit">
                Account Owner
              </Typography>
            </View>
          </View>
          <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedProfileId === 'self' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
            {selectedProfileId === 'self' && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
        </TouchableOpacity>

        {/* Children Profiles */}
        {isLoading ? (
          <View className="py-10 justify-center items-center">
            <ActivityIndicator size="small" color="#FF5100" />
          </View>
        ) : (
          children.map((child) => (
            <TouchableOpacity 
              key={child._id}
              className={`bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between border-2 transition-all ${
                selectedProfileId === child._id ? 'border-primary shadow-sm' : 'border-transparent'
              }`}
              onPress={() => setSelectedProfileId(child._id)}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center flex-1 mr-4">
                <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mr-3">
                  <Ionicons name="people" size={22} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Typography variant="subtitle1" color="secondary" weight="bold" className="font-outfit-bold mb-0.5">
                    {child.name}
                  </Typography>
                  <Typography variant="body2" color="secondary" weight="medium" className="font-outfit-medium mb-0.5">
                    {child.sport || 'Sports'}
                  </Typography>
                  <Typography variant="caption" color="muted" className="font-outfit">
                    {child.age} Years Old {child.school ? `• ${child.school}` : ''}
                  </Typography>
                </View>
              </View>
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedProfileId === child._id ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                {selectedProfileId === child._id && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Add New Child Profile Button */}
        <TouchableOpacity 
          className="bg-white rounded-2xl p-4 mb-8 flex-row items-center justify-between border border-dashed border-gray-300"
          onPress={() => router.push('/(parent)/family/add-child')}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mr-3">
              <Ionicons name="add-circle" size={26} color="#FF5100" />
            </View>
            <View>
              <Typography variant="subtitle1" color="secondary" weight="bold" className="font-outfit-bold mb-0.5">
                Add New Child
              </Typography>
              <Typography variant="caption" color="muted" className="font-outfit">
                Add Child Profile to Family Tree
              </Typography>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
