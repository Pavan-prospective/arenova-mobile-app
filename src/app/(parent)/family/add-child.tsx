import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, TextInput } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

import { useAuthStore } from '@/store';

export default function AddChildScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addChild } = useAuthStore();
  const params = useLocalSearchParams<{ coachSport?: string; sport?: string; slotId?: string }>();
  const coachSport = params.coachSport || params.sport || '';

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sport, setSport] = useState(coachSport || 'Football');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [school, setSchool] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const baseSports = ['Football', 'Basketball', 'Tennis', 'Cricket', 'Swimming', 'Yoga', 'Fitness', 'Badminton'];
  const sportsList = coachSport 
    ? [coachSport, ...baseSports.filter(s => s.toLowerCase() !== coachSport.toLowerCase())]
    : baseSports;

  const createChildMutation = useMutation({
    mutationFn: async (payload: { name: string; age: number; sport?: string; school?: string }) => {
      const res = await api.post('/users/me/children', payload);
      return res.data;
    },
    onSuccess: (resData) => {
      const createdChild = {
        _id: resData?.data?.[0]?._id || ('child_' + Date.now()),
        id: resData?.data?.[0]?._id || ('child_' + Date.now()),
        name: name.trim(),
        age: parseInt(age) || 0,
        sport: sport.trim(),
        school: school.trim() || undefined
      };

      // Persist permanently in AuthStore & SecureStore
      addChild(createdChild);

      // Optimistically update React Query children cache
      queryClient.setQueryData(['children'], (old: any) => {
        const existing = Array.isArray(old?.data) ? old.data : (Array.isArray(old) ? old : []);
        return { success: true, data: [...existing, createdChild] };
      });

      // If in booking flow, immediately assign this child to the coach slot and continue
      if (params.slotId) {
        Alert.alert('Child Added', `${name.trim()} has been added and assigned to this session.`);
        router.replace({
          pathname: '/(shared)/session-summary',
          params: {
            ...params,
            childId: createdChild._id,
            studentName: createdChild.name
          }
        });
      } else {
        Alert.alert('Success', `${name.trim()} added successfully!`);
        router.back();
      }
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
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', zIndex: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
          Add Child Profile
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Photo Upload Mockup */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <TouchableOpacity 
              style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFEAE0', borderWidth: 2, borderStyle: 'dashed', borderColor: '#FF5100', alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' }}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={32} color="#FF5100" />
              <Typography variant="caption" color="primary" weight="bold" className="font-outfit-bold mt-1 text-[11px]">Upload Photo</Typography>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16, marginBottom: 32 }}>
            <TextInput 
              label="Child's Name"
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

            {/* Gender Switcher tabs */}
            <View style={{ marginBottom: 8 }}>
              <Typography variant="caption" color="secondary" weight="bold" className="mb-2 ml-1 font-outfit-bold text-gray-500 uppercase tracking-wider">
                Gender
              </Typography>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity 
                  onPress={() => setGender('Male')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 9999,
                    borderWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: gender === 'Male' ? '#FF5100' : '#ffffff',
                    borderColor: gender === 'Male' ? '#FF5100' : '#e5e7eb'
                  }}
                >
                  <Typography color={gender === 'Male' ? 'white' : 'secondary'} weight="bold" className="font-outfit-bold text-sm">
                    Male
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setGender('Female')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 9999,
                    borderWidth: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: gender === 'Female' ? '#FF5100' : '#ffffff',
                    borderColor: gender === 'Female' ? '#FF5100' : '#e5e7eb'
                  }}
                >
                  <Typography color={gender === 'Female' ? 'white' : 'secondary'} weight="bold" className="font-outfit-bold text-sm">
                    Female
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
            
            <TextInput 
              label="Age"
              placeholder="Enter age" 
              keyboardType="numeric" 
              value={age}
              onChangeText={setAge}
              error={errors.age}
            />

            {/* Sport Toggle selection */}
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Typography variant="caption" color="secondary" weight="bold" className="ml-1 font-outfit-bold text-gray-500 uppercase tracking-wider">
                  Sport Interest
                </Typography>
                {coachSport ? (
                  <View style={{ backgroundColor: '#fff7ed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#ffedd5' }}>
                    <Typography variant="caption" color="primary" weight="bold" className="font-outfit-bold text-[10px]">
                      Coach's Sport: {coachSport}
                    </Typography>
                  </View>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                {sportsList.map((s) => {
                  const isSelected = sport === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSport(s)}
                      activeOpacity={0.8}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 9999,
                        borderWidth: 1,
                        marginRight: 12,
                        backgroundColor: isSelected ? '#0F2C59' : '#ffffff',
                        borderColor: isSelected ? '#0F2C59' : '#e5e7eb'
                      }}
                    >
                      <Typography color={isSelected ? 'white' : 'secondary'} weight="bold" className="font-outfit-bold text-xs">
                        {s}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

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
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingBottom: 32 }}>
        <Button 
          title="Save Profile" 
          onPress={handleSave}
          isLoading={createChildMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
