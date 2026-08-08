import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function SelectPlayerScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { user } = useAuthStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const isParent = user?.role === 'parent';

  // Fetch children list if user is a parent
  const { data: childrenResponse, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await api.get('/users/me/children');
      return res.data;
    },
    enabled: isParent
  });

  const children = childrenResponse?.data || [];

  const players = [
    { id: 'self', name: 'Myself', role: 'Account Owner', color: 'bg-blue-100' }
  ];

  if (isParent && children.length > 0) {
    children.forEach((child: any) => {
      players.push({
        id: child._id || child.id,
        name: child.name,
        role: `Child (${child.sport || 'Sports'})`,
        color: 'bg-emerald-100'
      });
    });
  }

  const handleContinue = () => {
    if (!selectedPlayerId) {
      Alert.alert('Error', 'Please select a player for this booking.');
      return;
    }
    
    // Determine target params
    const childId = selectedPlayerId !== 'self' ? selectedPlayerId : undefined;
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    
    router.push({
      pathname: '/(shared)/session-summary',
      params: {
        ...searchParams,
        childId: childId || '',
        studentName: selectedPlayer?.name || ''
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
          Who is Playing?
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-6 pb-24">
        <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-4 font-outfit-bold">
          Select Player Profile
        </Typography>

        {isLoading ? (
          <View className="py-10 justify-center items-center">
            <ActivityIndicator size="small" color="#FF5100" />
          </View>
        ) : (
          players.map(player => (
            <TouchableOpacity 
              key={player.id}
              onPress={() => setSelectedPlayerId(player.id)}
              activeOpacity={0.8}
              className={`bg-white rounded-2xl p-4 mb-4 shadow-sm border-2 transition-all ${
                selectedPlayerId === player.id ? 'border-primary' : 'border-transparent'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 rounded-full ${player.color} items-center justify-center mr-4 shadow-sm`}>
                    <Typography variant="subtitle1" color="primary" weight="bold" className="font-outfit-bold">
                      {player.name.substring(0, 2).toUpperCase()}
                    </Typography>
                  </View>
                  <View>
                    <Typography variant="subtitle1" color="secondary" weight="bold" className="font-outfit-bold">
                      {player.name}
                    </Typography>
                    <Typography variant="caption" color="muted" className="font-outfit">
                      {player.role}
                    </Typography>
                  </View>
                </View>
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedPlayerId === player.id ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                  {selectedPlayerId === player.id && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {isParent && (
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-dashed border-gray-300 flex-row items-center justify-center"
            onPress={() => router.push('/(parent)/family/add-child')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FF5100" className="mr-2" />
            <Typography variant="subtitle2" color="primary" weight="bold" className="font-outfit-bold">
              Add New Child
            </Typography>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="bg-white p-4 shadow-lg border-t border-gray-100 pb-8">
        <Button 
          title="Continue" 
          onPress={handleContinue}
          disabled={!selectedPlayerId}
        />
      </View>
    </SafeAreaView>
  );
}
