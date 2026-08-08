import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Share, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';

export default function SettingsScreen() {
  const router = useRouter();
  const { soundEnabled, vibrationEnabled, setSoundEnabled, setVibrationEnabled } = useAuthStore();
  const [modalDocType, setModalDocType] = useState<'support' | 'privacy' | 'terms' | null>(null);

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Join Arenova! Book professional coaching sessions, training slots, and track activity instantly.',
        url: 'https://arenova.com',
      });
    } catch (e) {
      console.error('Error sharing app:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-4">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
          Settings
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4 pb-12">
        
        {/* Preferences */}
        <Typography variant="subtitle2" color="muted" weight="bold" className="mb-2 ml-1 uppercase font-outfit-bold">
          Preferences
        </Typography>
        <View className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100">
          
          <View className="flex-row items-center justify-between p-4 border-b border-gray-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Ionicons name="volume-medium" size={18} color="#3B82F6" />
              </View>
              <Typography variant="body1" color="secondary" weight="medium" className="font-outfit-medium">Sound</Typography>
            </View>
            <Switch 
              value={soundEnabled} 
              onValueChange={setSoundEnabled} 
              trackColor={{ false: '#D1D5DB', true: '#FF5100' }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-3">
                <Ionicons name="phone-portrait" size={18} color="#F97316" />
              </View>
              <Typography variant="body1" color="secondary" weight="medium" className="font-outfit-medium">Vibration</Typography>
            </View>
            <Switch 
              value={vibrationEnabled} 
              onValueChange={setVibrationEnabled} 
              trackColor={{ false: '#D1D5DB', true: '#FF5100' }}
              thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
            />
          </View>
        </View>

        {/* Account Settings */}
        <Typography variant="subtitle2" color="muted" weight="bold" className="mb-2 ml-1 uppercase font-outfit-bold">
          Account
        </Typography>
        <View className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100">
          <TouchableOpacity 
            onPress={handleShareApp} 
            className="flex-row items-center justify-between p-4 border-b border-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
                <Ionicons name="share-social" size={18} color="#10B981" />
              </View>
              <Typography variant="body1" color="secondary" weight="medium" className="font-outfit-medium">Share App</Typography>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setModalDocType('support')} 
            className="flex-row items-center justify-between p-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-3">
                <Ionicons name="help-circle" size={18} color="#6366F1" />
              </View>
              <Typography variant="body1" color="secondary" weight="medium" className="font-outfit-medium">Help & Support</Typography>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <Typography variant="subtitle2" color="muted" weight="bold" className="mb-2 ml-1 uppercase font-outfit-bold">
          Legal
        </Typography>
        <View className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden border border-gray-100">
          <TouchableOpacity 
            onPress={() => setModalDocType('privacy')}
            className="flex-row items-center justify-between p-4 border-b border-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={18} color="#4B5563" />
              </View>
              <Typography variant="body1" color="secondary" weight="medium" className="font-outfit-medium">Privacy Policy</Typography>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setModalDocType('terms')}
            className="flex-row items-center justify-between p-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
                <Ionicons name="document-text" size={18} color="#4B5563" />
              </View>
              <Typography variant="body1" color="secondary" weight="medium" className="font-outfit-medium">Terms & Conditions</Typography>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Local Document Viewer Modal */}
      <Modal
        visible={modalDocType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalDocType(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl p-6 shadow-xl max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <Typography variant="h3" color="secondary" weight="bold" className="font-outfit-bold">
                {modalDocType === 'support' && "Help & Support"}
                {modalDocType === 'privacy' && "Privacy Policy"}
                {modalDocType === 'terms' && "Terms & Conditions"}
              </Typography>
              <TouchableOpacity onPress={() => setModalDocType(null)} className="p-1">
                <Ionicons name="close" size={24} color="#0F2C59" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              <Typography variant="body1" color="text" className="font-outfit leading-6 text-gray-700">
                {modalDocType === 'support' && "Welcome to Arenova Support.\n\nIf you have any inquiries regarding scheduling, bookings, or wallet withdrawals, please reach out to our administration at contact@arenova.com.\n\nOur team is dedicated to ensuring a seamless experience for coaches, parents, and players alike. We typically respond to email inquiries within 24 business hours."}
                {modalDocType === 'privacy' && "At Arenova, we prioritize the protection and confidentiality of your personal information.\n\nOur platform processes registration profiles, geolocation services, and transaction logs solely to coordinate sports coaching activities, book slots, and ensure secure payouts.\n\nYour data is encrypted in transit and at rest, and is never sold or shared with unauthorized third-party platforms. You may request data deletion at any time by contacting our support team."}
                {modalDocType === 'terms' && "By using the Arenova application, you agree to our guidelines regarding booking schedules, payment verification, and professional conduct.\n\nCoaches are required to submit accurate certifications, maintain availability, and honor confirmed bookings. Players and parents agree to show up for confirmed time slots.\n\nCancellations and refunds are governed by our standard booking policies and administrative oversight."}
              </Typography>
            </ScrollView>

            <Button 
              title="Close" 
              onPress={() => setModalDocType(null)} 
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
