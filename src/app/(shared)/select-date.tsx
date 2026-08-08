import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface Slot {
  _id: string;
  id?: string;
  startTime: string;
  endTime: string;
  status: string;
  price?: number;
}

export default function SelectDateScreen() {
  const router = useRouter();
  const { coachId } = useLocalSearchParams<{ coachId?: string }>();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch coach details
  const { data: coachResponse, isLoading: isLoadingCoach } = useQuery({
    queryKey: ['coachProfile', coachId],
    queryFn: async () => {
      if (!coachId) return null;
      const res = await api.get(`/coaches/${coachId}`);
      return res.data;
    },
    enabled: !!coachId
  });

  const coach = coachResponse?.data || null;
  const coachName = coach?.name || `${coach?.firstName || ''} ${coach?.lastName || ''}`.trim() || 'Coach';
  const coachSport = coach?.sport || coach?.sports?.[0] || 'Sports';

  // Fetch available slots for the selected date
  const { data: slotsResponse, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['coachSlots', coachId, selectedDate],
    queryFn: async () => {
      if (!coachId || !selectedDate) return null;
      const res = await api.get(`/slots/coaches/${coachId}/slots`, {
        params: { date: selectedDate }
      });
      return res.data;
    },
    enabled: !!coachId && !!selectedDate
  });

  const slots: Slot[] = slotsResponse?.data || [];

  const handleSelectSlot = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!selectedSlotId) {
      Alert.alert('Error', 'Please select an available time slot');
      return;
    }
    
    router.push({
      pathname: '/(shared)/select-player',
      params: {
        coachId: coachId || '',
        slotId: selectedSlotId
      }
    });
  };

  const selectedSlot = slots.find(s => (s._id || s.id) === selectedSlotId);

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
          Select Date & Time
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Coach Header Card */}
        {isLoadingCoach ? (
          <ActivityIndicator size="small" color="#FF5100" className="my-4" />
        ) : (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-50">
            <Typography variant="subtitle2" color="muted" weight="bold" className="mb-3 uppercase font-outfit-bold">
              Selected Trainer
            </Typography>
            <View className="flex-row items-center border-t border-gray-50 pt-3">
              <View className="w-12 h-12 rounded-full bg-[#F5E6D3] mr-3 items-center justify-center shadow-sm">
                <Typography variant="subtitle2" color="primary" weight="bold" className="font-outfit-bold">
                  {coachName.split(' ').map((n: string) => n[0]).join('')}
                </Typography>
              </View>
              <View className="flex-1">
                <Typography variant="body1" color="secondary" weight="bold" className="font-outfit-bold">
                  {coachName}
                </Typography>
                <Typography variant="caption" color="primary" weight="medium" className="font-outfit-medium">
                  {coachSport}
                </Typography>
                {selectedDate && selectedSlot && (
                  <Typography variant="caption" color="text" className="mt-1 font-outfit text-gray-500 text-[10px]">
                    {selectedDate} | {selectedSlot.startTime} - {selectedSlot.endTime}
                  </Typography>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Real Calendar Card */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-50">
          <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-2 font-outfit-bold">
            Select Date
          </Typography>
          <Calendar
            minDate={today}
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
              setSelectedSlotId(null); // Clear selected slot when date changes
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#FF5100' }
            }}
            theme={{
              todayTextColor: '#FF5100',
              selectedDayBackgroundColor: '#FF5100',
              arrowColor: '#9CA3AF',
              textDayFontFamily: 'sans',
              textMonthFontFamily: 'sans',
              textDayHeaderFontFamily: 'sans',
            }}
          />
        </View>

        {/* Time Selector Card */}
        {selectedDate && (
          <View className="bg-white rounded-2xl p-4 mb-8 shadow-sm border border-gray-50">
            <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-3 font-outfit-bold">
              Available Slots
            </Typography>

            {isLoadingSlots ? (
              <ActivityIndicator size="small" color="#FF5100" className="my-6" />
            ) : slots.length === 0 ? (
              <View className="py-6 items-center">
                <Ionicons name="time-outline" size={28} color="#9CA3AF" className="mb-2" />
                <Typography variant="caption" color="muted" align="center" className="font-outfit">
                  No slots available on this date.
                </Typography>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2 pt-2">
                {slots.map((slot) => {
                  const isSelected = selectedSlotId === (slot._id || slot.id);
                  return (
                    <TouchableOpacity
                      key={slot._id || slot.id}
                      onPress={() => setSelectedSlotId(slot._id || slot.id || null)}
                      activeOpacity={0.8}
                      className={`px-4 py-2.5 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'bg-primary border-primary' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Typography 
                        variant="body2" 
                        color={isSelected ? 'white' : 'secondary'} 
                        weight="bold"
                        className="font-outfit-bold"
                      >
                        {slot.startTime}
                      </Typography>
                      {slot.price && (
                        <Typography 
                          variant="caption" 
                          color={isSelected ? 'white' : 'muted'} 
                          align="center"
                          className="mt-0.5 font-outfit text-[9px]"
                        >
                          ₹{slot.price}
                        </Typography>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View className="mb-8">
          <Button 
            title="Continue" 
            onPress={handleSelectSlot}
            disabled={!selectedDate || !selectedSlotId}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
