import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function FamilyScreen() {
  const router = useRouter();

  const children = [
    { id: '1', name: 'Advik', age: '8 Years Old', sport: 'Football' },
    { id: '2', name: 'Riya', age: '12 Years Old', sport: 'Badminton' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]">
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold">
          My Family
        </Typography>
        <TouchableOpacity className="p-2 -mr-2">
          <Ionicons name="ellipsis-vertical" size={24} color="#0F2C59" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-6 pb-8">
        
        {children.map(child => (
          <View key={child.id} className="bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between border border-gray-100 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-full bg-[#F5E6D3] mr-4 items-center justify-center">
                <Typography variant="subtitle1" color="primary" weight="bold">{child.name[0]}</Typography>
              </View>
              <View>
                <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-0.5">
                  {child.name}
                </Typography>
                <Typography variant="body2" color="secondary" weight="medium" className="mb-0.5">
                  {child.sport}
                </Typography>
                <Typography variant="caption" color="text" className="opacity-80">
                  {child.age}
                </Typography>
              </View>
            </View>
            <TouchableOpacity className="bg-[#EEF3F9] p-2 rounded-full">
              <Ionicons name="create-outline" size={20} color="#0F2C59" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          className="bg-white rounded-2xl p-4 mb-8 flex-row items-center justify-between border-2 border-dashed border-gray-300"
          onPress={() => router.push('/family/add-child')}
        >
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-[#F5CEAA] items-center justify-center mr-4">
              <Ionicons name="add" size={32} color="#FF5100" />
            </View>
            <View>
              <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-0.5">
                Add New Child
              </Typography>
              <Typography variant="caption" color="text" className="opacity-60">
                Create a profile for booking
              </Typography>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
