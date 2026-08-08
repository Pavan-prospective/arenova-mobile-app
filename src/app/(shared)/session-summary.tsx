import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function SessionSummaryScreen() {
  const router = useRouter();
  const { id, status, studentName, date, time, location } = useLocalSearchParams<{
    id?: string;
    status?: string;
    studentName?: string;
    date?: string;
    time?: string;
    location?: string;
  }>();

  const statusParam = status || 'requested';
  const { user } = useAuthStore();
  
  // Fake state for generated OTP for coach
  const [sessionOtp, setSessionOtp] = useState<string | null>(null);

  React.useEffect(() => {
    if (statusParam === 'ongoing' || statusParam === 'confirmed') {
      setSessionOtp('8249');
    } else {
      setSessionOtp(null);
    }
  }, [statusParam]);

  const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await api.put(`/coaches/my/sessions/${id}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coachSessions'] });
      Alert.alert('Status Updated', `Session status successfully updated to ${variables}.`);
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update session status');
    }
  });

  const handleStartSession = () => {
    // Generate a random 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setSessionOtp(otp);
    Alert.alert('Session Started', `Your Session OTP is: ${otp}\nShare this with your students to verify attendance.`);
    updateStatusMutation.mutate('confirmed');
  };

  const isCoach = user?.role === 'coach';

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]">
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold">
          {isCoach ? 'Session Details' : 'Session Summary'}
        </Typography>
        <TouchableOpacity className="p-2 -mr-2">
          <Ionicons name="ellipsis-vertical" size={24} color="#0F2C59" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4 pb-24">
        
        {isCoach ? (
          // COACH VIEW: Show Students & Session Details
          <>
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <Typography variant="subtitle1" color="secondary" weight="bold">
                  Attendees
                </Typography>
                <View className="bg-[#EEFCA6] px-2 py-1 rounded">
                  <Typography variant="caption" color="secondary" weight="bold">
                    1-on-1
                  </Typography>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-100 mr-3 items-center justify-center">
                    <Typography variant="subtitle1" color="primary" weight="bold">
                      {studentName ? studentName.charAt(0) : 'S'}
                    </Typography>
                  </View>
                  <View>
                    <Typography variant="body2" color="secondary" weight="bold">
                      {studentName || 'Student'}
                    </Typography>
                    <Typography variant="caption" color="muted">Attendee</Typography>
                  </View>
                </View>
                {statusParam === 'completed' && (
                  <TouchableOpacity onPress={() => router.push('/(shared)/review-player')} className="px-3 py-1.5 bg-[#EEF3F9] rounded-full">
                    <Typography variant="caption" color="primary" weight="bold">Review</Typography>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm space-y-4">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#FF5100" className="mr-3" />
                <Typography variant="body2" color="secondary" weight="medium" className="ml-2">
                  {date || '24 March, 2026'}
                </Typography>
              </View>
              <View className="flex-row items-center mt-3">
                <Ionicons name="time-outline" size={20} color="#FF5100" className="mr-3" />
                <Typography variant="body2" color="secondary" weight="medium" className="ml-2">
                  {time || '5:00 PM - 6:00 PM'}
                </Typography>
              </View>
              <View className="flex-row items-center mt-3">
                <Ionicons name="location-outline" size={20} color="#FF5100" className="mr-3" />
                <View className="ml-2 flex-1">
                  <Typography variant="body2" color="secondary" weight="medium">
                    {location || 'Central Sports Arena'}
                  </Typography>
                </View>
              </View>
            </View>
            
            {sessionOtp && (
              <>
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border-l-4 border-green-500">
                  <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-4">
                    Active Session Metrics
                  </Typography>
                  <View className="flex-row justify-between mb-4">
                    <View className="flex-1 items-center bg-[#EEF3F9] p-3 rounded-xl mr-2">
                      <Typography variant="h3" color="primary" weight="bold">45m</Typography>
                      <Typography variant="caption" color="muted">Elapsed</Typography>
                    </View>
                    <View className="flex-1 items-center bg-[#EEF3F9] p-3 rounded-xl mx-1">
                      <Typography variant="h3" color="secondary" weight="bold">15m</Typography>
                      <Typography variant="caption" color="muted">Remaining</Typography>
                    </View>
                    <View className="flex-1 items-center bg-[#EEF3F9] p-3 rounded-xl ml-2">
                      <Typography variant="h3" color="text" weight="bold">2/4</Typography>
                      <Typography variant="caption" color="muted">Joined</Typography>
                    </View>
                  </View>
                  
                  <View className="bg-green-50 rounded-xl p-4 items-center mb-4">
                    <Typography variant="caption" color="text" className="mb-1 text-green-700">
                      Attendance OTP
                    </Typography>
                    <Typography variant="h2" color="primary" weight="bold" className="tracking-widest">
                      {sessionOtp}
                    </Typography>
                  </View>
                </View>
              </>
            )}
          </>
        ) : (
          // USER/PARENT VIEW: Show Coach & Pricing Details
          <>
            {/* Coach Details Card */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <View className="flex-row items-center border-b border-gray-100 pb-4 mb-4">
                <View className="w-14 h-14 rounded-full bg-[#F5E6D3] mr-4" />
                <View className="flex-1">
                  <Typography variant="subtitle1" color="secondary" weight="bold">
                    Ravi Sharma
                  </Typography>
                  <Typography variant="body2" color="primary" weight="medium" className="mb-1">
                    Badminton Coach
                  </Typography>
                  <Typography variant="caption" color="text" className="leading-4">
                    Akshya Nagar 1st Block 1st Cross,
                  </Typography>
                  <Typography variant="caption" color="text" className="leading-4">
                    Rammurthy Nagar, Hyderabad - 560016
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>

              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={16} color="#0F2C59" className="mr-3" />
                <Typography variant="body2" color="text" weight="medium" className="ml-2">
                  24 March, 2026
                </Typography>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#0F2C59" className="mr-3" />
                <Typography variant="body2" color="text" weight="medium" className="ml-2">
                  5:00 PM - 6:00 PM
                </Typography>
              </View>
            </View>

            {/* Pricing Details Card */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-4">
                <Typography variant="body1" color="secondary" weight="bold">
                  Session Fee
                </Typography>
                <Typography variant="body1" color="secondary" weight="bold">
                  ₹600
                </Typography>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <Typography variant="body1" color="secondary" weight="bold">
                  Platform Fee
                </Typography>
                <Typography variant="body1" color="secondary" weight="bold">
                  ₹50
                </Typography>
              </View>
              <View className="flex-row justify-between items-center pt-4 mt-2 border-t border-gray-100">
                <Typography variant="h3" color="secondary" weight="bold">
                  Total Amount
                </Typography>
                <Typography variant="h3" color="primary" weight="bold">
                  ₹650
                </Typography>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar - Only show if not completed */}
      {statusParam !== 'completed' && statusParam !== 'cancelled' && statusParam !== 'no_show' && (
        <View className="absolute bottom-0 w-full bg-white p-4 shadow-lg border-t border-gray-100 pb-8">
          {isCoach ? (
            statusParam === 'requested' ? (
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Button 
                    title="Decline" 
                    onPress={() => updateStatusMutation.mutate('cancelled')}
                    variant="outline"
                    isLoading={updateStatusMutation.isPending}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Button 
                    title="Accept" 
                    onPress={() => updateStatusMutation.mutate('accepted')}
                    isLoading={updateStatusMutation.isPending}
                  />
                </View>
              </View>
            ) : (
              <Button 
                title={statusParam === 'confirmed' || statusParam === 'ongoing' || sessionOtp ? "End Session" : "Start Session"} 
                onPress={() => {
                  if (statusParam === 'confirmed' || statusParam === 'ongoing' || sessionOtp) {
                    updateStatusMutation.mutate('completed');
                  } else {
                    handleStartSession();
                  }
                }}
                isLoading={updateStatusMutation.isPending}
                variant={statusParam === 'confirmed' || statusParam === 'ongoing' || sessionOtp ? 'outline' : 'primary'}
              />
            )
          ) : (
            <Button 
              title="Proceed To Pay" 
              onPress={() => router.push('/(shared)/payment')}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
