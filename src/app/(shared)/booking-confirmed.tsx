import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';

export default function BookingConfirmedScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-12 pb-24">
        
        {/* Success Header */}
        <View className="items-center mb-10">
          <View className="w-24 h-24 rounded-full bg-[#4B9C73] items-center justify-center mb-6 relative">
            <Ionicons name="checkmark" size={48} color="white" />
            <View className="absolute -top-1 -right-1 w-2 h-2 bg-[#4B9C73] rounded-full opacity-30" />
            <View className="absolute top-2 -left-3 w-1.5 h-1.5 bg-[#4B9C73] rounded-full opacity-30" />
            <View className="absolute -bottom-2 right-2 w-2 h-2 bg-[#4B9C73] rounded-full opacity-30" />
          </View>
          <Typography variant="h1" color="secondary" weight="bold" className="mb-2">
            Booking Confirmed!
          </Typography>
          <Typography variant="body2" color="muted">
            Your Session Been Successfully Booked.
          </Typography>
        </View>

        {/* Booking Details Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center border-b border-gray-100 pb-4 mb-4">
            <View className="w-12 h-12 rounded-full bg-[#F5E6D3] mr-4" />
            <View>
              <Typography variant="caption" color="text" className="mb-0.5 opacity-80">
                Coach
              </Typography>
              <Typography variant="subtitle1" color="secondary" weight="bold">
                Ravi Sharma
              </Typography>
            </View>
          </View>

          <View className="flex-row items-center border-b border-gray-100 pb-4 mb-4">
            <View className="w-12 h-12 rounded-full bg-[#F5E6D3] mr-4" />
            <View>
              <Typography variant="caption" color="text" className="mb-0.5 opacity-80">
                Player
              </Typography>
              <Typography variant="subtitle1" color="secondary" weight="bold">
                Ravi Sharma <Typography variant="body2" color="secondary" weight="medium">(10 yrs)</Typography>
              </Typography>
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 border-r border-gray-100 pr-2">
              <Typography variant="caption" color="text" className="mb-1 opacity-80">
                Sport
              </Typography>
              <Typography variant="body2" color="text" weight="bold">
                Badminton
              </Typography>
            </View>
            <View className="flex-1 pl-4 flex-row items-start">
              <Ionicons name="calendar-outline" size={16} color="#9CA3AF" className="mr-2 mt-0.5" />
              <View>
                <Typography variant="caption" color="text" className="mb-1 opacity-80">
                  Date
                </Typography>
                <Typography variant="body2" color="text" weight="bold">
                  Wed, Apr 02
                </Typography>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 border-r border-gray-100 pr-2 flex-row items-start">
              <Ionicons name="time-outline" size={16} color="#9CA3AF" className="mr-2 mt-0.5" />
              <View>
                <Typography variant="caption" color="text" className="mb-1 opacity-80">
                  Time
                </Typography>
                <Typography variant="body2" color="text" weight="bold">
                  6:00 PM - 7:00pm
                </Typography>
              </View>
            </View>
            <View className="flex-1 pl-4 flex-row items-start">
              <Ionicons name="location-outline" size={16} color="#9CA3AF" className="mr-2 mt-0.5" />
              <View>
                <Typography variant="caption" color="text" className="mb-1 opacity-80">
                  Location
                </Typography>
                <Typography variant="body2" color="text" weight="bold">
                  Rammurthy Nagar,
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Success Card */}
        <View className="bg-white rounded-2xl p-5 mb-8 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-6">
            <Ionicons name="checkmark-circle-outline" size={20} color="#4B9C73" className="mr-2" />
            <Typography variant="subtitle1" color="text" weight="bold">
              Payment Successful
            </Typography>
          </View>

          <View className="flex-row justify-between mb-4">
            <View>
              <Typography variant="caption" color="text" className="mb-1 opacity-80">
                Paid Amount
              </Typography>
              <Typography variant="h2" color="secondary" weight="bold">
                ₹570
              </Typography>
            </View>
            <View className="items-end">
              <Typography variant="caption" color="text" className="mb-1 opacity-80">
                Payment Method
              </Typography>
              <Typography variant="body2" color="text" weight="bold">
                Name@Upi
              </Typography>
            </View>
          </View>

          <View className="items-end">
            <Typography variant="caption" color="text" className="mb-0.5 opacity-80">
              Transaction ID
            </Typography>
            <Typography variant="caption" color="text" weight="bold">
              TXN123456789
            </Typography>
          </View>
        </View>

        <View className="space-y-4 pb-10">
          {user?.role === 'parent' && (
            <View className="mb-4">
              <Button 
                title="Book Another Session" 
                onPress={() => router.push('/(parent)/(parent-tabs)/family-tree')}
              />
            </View>
          )}
          <TouchableOpacity 
            className="w-full h-14 bg-[#F5E6D3] rounded-full items-center justify-center border border-[#EBA86A]"
            onPress={() => router.push(user?.role === 'parent' ? '/(parent)/(parent-tabs)/parent-dashboard' : '/(individual)/(individual-tabs)/individual-dashboard')}
          >
            <Typography variant="subtitle1" color="secondary" weight="bold">
              Back To Home
            </Typography>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
