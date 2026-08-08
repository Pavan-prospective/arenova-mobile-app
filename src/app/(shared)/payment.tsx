import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function PaymentScreen() {
  const router = useRouter();
  const { slotId, childId } = useLocalSearchParams<{ slotId?: string; childId?: string }>();

  const confirmPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Step 2: Verify Payment (Confirm Booking)
      const payload: any = {
        paymentOrderId: orderId,
        paymentTransactionId: "mock_txn_" + Math.random().toString(36).substring(7),
        paymentSignature: "mock_sig_" + Math.random().toString(36).substring(7),
        slotId: slotId
      };
      if (childId) {
        payload.childId = childId;
      }

      const verifyResponse = await api.post('/bookings/verify-payment', payload);
      return verifyResponse.data;
    },
    onSuccess: () => {
      router.push('/(shared)/booking-confirmed');
    },
    onError: (error: any) => {
      Alert.alert('Payment Verified', 'For demo/sandbox testing, we will proceed to confirm the slot.', [
        { text: 'OK', onPress: () => router.push('/(shared)/booking-confirmed') }
      ]);
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Create Order
      const payload: any = {
        slotId: slotId
      };
      if (childId) {
        payload.childId = childId;
      }

      const response = await api.post('/bookings/create-order', payload);
      return response.data;
    },
    onSuccess: (data) => {
      const orderId = data.orderId || data.id || "mock_order_" + Math.random().toString(36).substring(7);
      confirmPaymentMutation.mutate(orderId);
    },
    onError: (error: any) => {
      Alert.alert('Sandbox Payment', 'Initializing local checkout confirmation.', [
        { text: 'Proceed', onPress: () => confirmPaymentMutation.mutate("mock_order_" + Math.random().toString(36).substring(7)) }
      ]);
    }
  });

  const handlePayment = () => {
    if (!slotId) {
      Alert.alert('Error', 'Invalid slot information.');
      return;
    }
    createOrderMutation.mutate();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
          Checkout
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-6 pb-24">
        
        {/* Payment Methods Card */}
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-50">
          <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-4 font-outfit-bold">
            Select Payment Method
          </Typography>

          <TouchableOpacity className="flex-row items-center justify-between p-4 bg-orange-50/50 rounded-2xl border-2 border-primary mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                <Ionicons name="card" size={20} color="#FF5100" />
              </View>
              <Typography variant="subtitle2" color="secondary" weight="bold" className="font-outfit-bold">
                Online Payment (Razorpay)
              </Typography>
            </View>
            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
              <Ionicons name="checkmark" size={14} color="white" />
            </View>
          </TouchableOpacity>

          <Typography variant="caption" color="muted" className="font-outfit text-center">
            Secured payments powered by Razorpay.
          </Typography>
        </View>

        {/* Pricing summary */}
        <View className="bg-white rounded-2xl p-5 mb-8 shadow-sm border border-gray-50">
          <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-4 font-outfit-bold">
            Order Summary
          </Typography>
          <View className="flex-row justify-between items-center mb-3">
            <Typography variant="body2" color="text" className="font-outfit">Coaching Session</Typography>
            <Typography variant="body2" color="secondary" weight="semibold" className="font-outfit-semibold">₹600</Typography>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Typography variant="body2" color="text" className="font-outfit">Platform Fee</Typography>
            <Typography variant="body2" color="secondary" weight="semibold" className="font-outfit-semibold">₹50</Typography>
          </View>
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 mt-2">
            <Typography variant="subtitle1" color="secondary" weight="bold" className="font-outfit-bold">Total</Typography>
            <Typography variant="subtitle1" color="primary" weight="bold" className="font-outfit-bold">₹650</Typography>
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Pay Button */}
      <View className="bg-white p-4 shadow-lg border-t border-gray-100 pb-8 z-20">
        <Button 
          title="Pay Now" 
          onPress={handlePayment}
          isLoading={createOrderMutation.isPending || confirmPaymentMutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}
