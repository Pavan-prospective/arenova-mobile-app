import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, TextInput } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function AddChildScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sport, setSport] = useState('');
  const [school, setSchool] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createChildMutation = useMutation({
    mutationFn: async (payload: { name: string; age: number; sport?: string; school?: string }) => {
      const res = await api.post('/users/me/children', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      Alert.alert('Success', 'Child profile created successfully!');
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create child profile');
    }
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Child's name is required";
    if (!age.trim()) {
      newErrors.age = "Age is required";
    } else if (isNaN(Number(age)) || Number(age) <= 0) {
      newErrors.age = "Please enter a valid age";
    }
    if (!sport.trim()) newErrors.sport = "Primary sport interest is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    createChildMutation.mutate({
      name: name.trim(),
      age: parseInt(age) || 0,
      sport: sport.trim(),
      school: school.trim() || undefined
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
          Add Child Profile
        </Typography>
        <View className="p-2 w-10" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-6 pb-24">
          
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-[#F5CEAA] items-center justify-center mb-4">
              <Ionicons name="person-outline" size={40} color="#FF5100" />
            </View>
            <Typography variant="body2" color="primary" weight="bold" className="font-outfit-bold">
              New Child Profile
            </Typography>
          </View>

          <View className="space-y-5 mb-8">
            <TextInput 
              label="Child's Name"
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />
            
            <TextInput 
              label="Age"
              placeholder="Enter age" 
              keyboardType="numeric" 
              value={age}
              onChangeText={setAge}
              error={errors.age}
            />

            <TextInput 
              label="Primary Sport Interest"
              placeholder="e.g. Football, Badminton, Swimming" 
              value={sport}
              onChangeText={setSport}
              error={errors.sport}
            />

            <TextInput 
              label="School (Optional)"
              placeholder="Enter school name" 
              value={school}
              onChangeText={setSchool}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Bottom Bar */}
      <View className="bg-white p-4 shadow-lg border-t border-gray-100 pb-8">
        <Button 
          title="Save Profile" 
          onPress={handleSave}
          isLoading={createChildMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
