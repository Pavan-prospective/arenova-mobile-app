import React from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface CoachProfile {
  _id: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  sports?: string[];
  sport?: string;
  rating?: number | string;
  reviews?: number | string;
  reviewsCount?: number;
  experience?: number | string;
  exp?: string;
  bio?: string;
  city?: string;
  specialties?: string[];
}

export default function PublicCoachProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Fetch coach details
  const { data: coachResponse, isLoading } = useQuery({
    queryKey: ['coachProfile', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/coaches/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const coach: CoachProfile | null = coachResponse?.data || null;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF5100" />
        </View>
      </SafeAreaView>
    );
  }

  if (!coach) {
    return (
      <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
        <View className="px-4 py-4 flex-row items-center bg-white border-b border-gray-100 shadow-sm z-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#0F2C59" />
          </TouchableOpacity>
          <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold ml-4">
            Profile Not Found
          </Typography>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <Typography variant="subtitle1" color="secondary" className="mb-4 text-center font-outfit-semibold">
            We couldn't retrieve this coach's profile details.
          </Typography>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const coachName = coach.name || `${coach.firstName || ''} ${coach.lastName || ''}`.trim() || 'Coach';
  const coachInitials = coachName.split(' ').map(n => n[0]).join('');
  const coachSport = coach.sport || coach.sports?.[0] || 'Sports Expert';
  const rating = coach.rating || '4.8';
  const reviews = coach.reviewsCount || coach.reviews || '120';
  const specialties = coach.specialties || [];
  const bio = coach.bio || "Professional coach with verified experience in training students of all ages. Let's improve your game!";

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
          Coach Profile
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Main Info Card */}
        <View className="bg-white rounded-2xl p-6 mb-5 shadow-sm items-center border border-gray-50">
          <View className="w-24 h-24 rounded-full bg-[#F5CEAA] items-center justify-center mb-4 shadow-md">
            <Typography variant="h1" color="primary" weight="bold" className="font-outfit-bold text-[28px]">{coachInitials}</Typography>
          </View>
          <Typography variant="h3" color="secondary" weight="bold" className="font-outfit-bold mb-1">{coachName}</Typography>
          <Typography variant="body1" color="primary" weight="bold" className="mb-3 font-outfit-bold">{coachSport}</Typography>
          <View className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <Ionicons name="star" size={16} color="#F59E0B" className="mr-1.5" />
            <Typography variant="subtitle2" color="secondary" weight="bold" className="font-outfit-bold">{rating} • {reviews} Reviews</Typography>
          </View>
        </View>

        {/* Experience Details */}
        <View className="flex-row justify-between mb-5 gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50 items-center">
            <Ionicons name="ribbon-outline" size={24} color="#FF5100" className="mb-1" />
            <Typography variant="caption" color="muted" className="font-outfit mb-0.5">Experience</Typography>
            <Typography variant="subtitle2" color="secondary" weight="bold" className="font-outfit-bold">{coach.experience || '3+'} Years</Typography>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-50 items-center">
            <Ionicons name="location-outline" size={24} color="#FF5100" className="mb-1" />
            <Typography variant="caption" color="muted" className="font-outfit mb-0.5">City</Typography>
            <Typography variant="subtitle2" color="secondary" weight="bold" className="font-outfit-bold">{coach.city || 'Hyderabad'}</Typography>
          </View>
        </View>

        {/* About/Bio Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm mb-5 border border-gray-50">
          <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-2 font-outfit-bold">About</Typography>
          <Typography variant="body2" color="text" className="leading-5 font-outfit text-gray-600">
            {bio}
          </Typography>
        </View>

        {/* Specialties/Skills */}
        {specialties.length > 0 && (
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-5 border border-gray-50">
            <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-3 font-outfit-bold">Specialties & Skills</Typography>
            <View className="flex-row flex-wrap gap-2">
              {specialties.map((spec, i) => (
                <View key={i} className="bg-orange-50 border border-orange-100 rounded-full px-3 py-1">
                  <Typography variant="caption" color="primary" weight="bold" className="font-outfit-bold">{spec}</Typography>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View className="absolute bottom-0 w-full bg-white p-4 shadow-lg border-t border-gray-100 pb-8 z-20">
        <Button 
          title="Book Session" 
          onPress={() => router.push({
            pathname: '/(shared)/select-date',
            params: { coachId: id }
          })}
        />
      </View>
    </SafeAreaView>
  );
}
