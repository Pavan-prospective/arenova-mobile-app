import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, TextInput } from '@/components/ui';
import { useAuthStore } from '@/store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

export default function CoachRegistrationScreen() {
  const router = useRouter();
  const { fromLogin } = useLocalSearchParams<{ fromLogin?: string }>();
  const setUser = useAuthStore(state => state.setUser);
  const user = useAuthStore(state => state.user);

  const [step, setStep] = useState<2 | 3>(user?.status === 'under_review' ? 3 : 2);
  
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [achievements, setAchievements] = useState<string[]>(['']);
  const [idProofs, setIdProofs] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Fetch latest coach profile status dynamically to sync state and clear cached pending statuses
  const { data: profileData } = useQuery({
    queryKey: ['coachOnboardingProfile'],
    queryFn: async () => {
      const res = await api.get('/coaches/my/profile');
      return res.data?.data || res.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profileData && user) {
      const kycStatus = profileData.kyc || profileData.profile?.kyc || profileData.status;
      if (kycStatus === 'approved' || kycStatus === 'active') {
        setUser({ ...user, status: 'active' });
        router.replace('/(coach)/(coach-tabs)/coach-dashboard');
      } else if (kycStatus === 'under_review') {
        setStep(3);
        setUser({ ...user, status: 'under_review' });
      }
    }
  }, [profileData]);

  const handlePickIdProof = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to upload proof!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      const fileName = selectedUri.split('/').pop() || `id_proof_${idProofs.length + 1}.jpg`;
      setIdProofs([...idProofs, fileName]);
    }
  };

  const handlePickCertificate = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions are required to upload certificates!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      const fileName = selectedUri.split('/').pop() || `certificate_${certificates.length + 1}.jpg`;
      setCertificates([...certificates, fileName]);
    }
  };

  const descriptionWordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).length;

  const handleDescriptionChange = (text: string) => {
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
    if (words.length <= 150 || text.length < description.length) {
      setDescription(text);
    }
  };

  const onboardingMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        experience: parseInt(experience) || 0,
        bio: description,
        address: { city: location },
        achievements: achievements.join('\n'),
      };
      const response = await api.put('/coach-app/onboarding', payload);
      return response.data;
    },
    onSuccess: (data) => {
      setStep(3);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || 'Onboarding failed');
    }
  });

  const handleSubmit = () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      alert('Error: You are not logged in.');
      return;
    }
    onboardingMutation.mutate();
  };

  const finishRegistration = () => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      setUser({
        ...currentUser,
        location,
        experience,
        description,
        achievements: achievements.join('\n'),
        certificates,
        status: 'under_review'
      });
    }
  };

  useEffect(() => {
    if (user) {
      if (user.status === 'under_review') {
        setStep(3);
      } else if (user.status !== 'active') {
        setStep(2);
      }
    }
  }, [user]);

  useEffect(() => {
    if (step === 3) {
      finishRegistration();
    }
  }, [step]);

  if (step === 3) {
    return (
      <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-full bg-white rounded-[32px] p-6 shadow-md items-center border border-gray-100">
            <View className="w-24 h-24 rounded-full bg-orange-50 items-center justify-center mb-6 border border-orange-100">
              <Ionicons name="hourglass-outline" size={48} color="#FF5100" />
            </View>
            <Typography variant="h2" color="secondary" weight="bold" className="text-center mb-4 text-2xl">
              Application Under Review
            </Typography>
            <Typography variant="body1" color="muted" align="center" className="text-gray-500 mb-6 leading-6">
              Thanks for applying to become a coach! Your application is under review. We'll update you once it's approved.
            </Typography>
            <View className="flex-row items-center bg-orange-50 border border-orange-200 px-4 py-2.5 rounded-full mb-6">
              <View className="w-2.5 h-2.5 rounded-full bg-orange-600 mr-2" />
              <Typography variant="body2" className="text-orange-700 font-bold">
                Status: Under Review
              </Typography>
            </View>
            <Typography variant="body2" color="muted" align="center" className="text-gray-400 mb-8 font-medium">
              Got any questions? Feel free to ask anytime!
            </Typography>
            <Button 
              title="Logout for now" 
              variant="primary" 
              onPress={() => {
                useAuthStore.getState().logout();
                router.replace('/(auth)');
              }} 
              className="mb-3"
            />
            <Button 
              title="Contact Us" 
              variant="outline" 
              onPress={() => require('react-native').Alert.alert(
                'Contact Us',
                'Have questions? Contact our support team:\n\n📞 +91 98765 43210\n✉️ support@arenovasports.com'
              )} 
              className="mb-3"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-200 shadow-sm z-10">
          <TouchableOpacity 
            onPress={() => {
              useAuthStore.getState().logout();
              router.replace('/(auth)/role-selection');
            }} 
            className="p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Typography variant="subtitle1" color="secondary" weight="bold">Professional Details</Typography>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === 'ios' ? 140 : 80 }}>
          <View className="px-6 pt-6 pb-12">
            <Typography variant="h2" color="secondary" weight="bold" className="mb-6">
              Professional Details
            </Typography>

            <View className="space-y-4">
              <TextInput placeholder="Location" value={location} onChangeText={setLocation} />
              <TextInput placeholder="Experience (e.g. 5 Years)" value={experience} onChangeText={setExperience} />
              
              <View className="mt-2">
                <View className="flex-row justify-between items-center px-1 mb-1">
                  <Typography variant="caption" color="secondary" weight="semibold">About Me</Typography>
                  <Typography variant="caption" color={descriptionWordCount >= 150 ? 'error' : 'muted'} className="text-[10px]">
                    {descriptionWordCount}/150 words
                  </Typography>
                </View>
                <TextInput 
                  placeholder="Write something about yourself..." 
                  value={description} 
                  onChangeText={handleDescriptionChange} 
                  multiline 
                  style={{ minHeight: 100 }} 
                  className="mb-0"
                />
              </View>

              <View className="mt-2">
                <Typography variant="caption" color="secondary" weight="semibold" className="mb-1 ml-1">Key Achievements</Typography>
                {achievements.map((ach, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Typography variant="body1" color="secondary" weight="bold" className="mr-2">{index + 1}.</Typography>
                    <View className="flex-1">
                      <TextInput 
                        placeholder="e.g. State Level Champion 2023" 
                        value={ach} 
                        onChangeText={(text) => {
                          const newAch = [...achievements];
                          newAch[index] = text;
                          setAchievements(newAch);
                        }}
                        className="mb-0"
                      />
                    </View>
                    {achievements.length > 1 && (
                      <TouchableOpacity onPress={() => setAchievements(achievements.filter((_, i) => i !== index))} className="ml-2 p-2">
                        <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity onPress={() => setAchievements([...achievements, ''])} className="flex-row items-center mt-1 mb-2">
                  <Ionicons name="add-circle-outline" size={20} color="#FF5100" />
                  <Typography variant="body2" color="primary" weight="bold" className="ml-1">Add Another</Typography>
                </TouchableOpacity>
              </View>

              <View className="mt-2">
                <Typography variant="caption" color="secondary" weight="semibold" className="mb-1 ml-1">Upload ID Proof (Aadhar/License)</Typography>
                {idProofs.map((doc, index) => (
                  <View key={index} className="relative mb-2">
                    <TextInput value={doc} editable={false} className="mb-0 pr-12" />
                    <TouchableOpacity onPress={() => setIdProofs(idProofs.filter((_, i) => i !== index))} className="absolute right-4 top-4">
                      <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {idProofs.length < 3 && (
                  <TouchableOpacity 
                    onPress={handlePickIdProof}
                    className="flex-row items-center border border-dashed border-gray-300 rounded-xl p-4 justify-center bg-gray-50"
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FF5100" />
                    <Typography variant="body2" color="primary" weight="bold" className="ml-2">
                      {idProofs.length === 0 ? "Upload ID Proof" : "Add Another ID Proof"}
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>

              <View className="mt-4 mb-6">
                <Typography variant="caption" color="secondary" weight="semibold" className="mb-1 ml-1">Upload Certificates (Optional)</Typography>
                {certificates.map((doc, index) => (
                  <View key={index} className="relative mb-2">
                    <TextInput value={doc} editable={false} className="mb-0 pr-12" />
                    <TouchableOpacity onPress={() => setCertificates(certificates.filter((_, i) => i !== index))} className="absolute right-4 top-4">
                      <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {certificates.length < 3 && (
                  <TouchableOpacity 
                    onPress={handlePickCertificate}
                    className="flex-row items-center border border-dashed border-gray-300 rounded-xl p-4 justify-center bg-gray-50"
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#FF5100" />
                    <Typography variant="body2" color="primary" weight="bold" className="ml-2">
                      {certificates.length === 0 ? "Upload Certificate" : "Add Another Certificate"}
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>

              <Button 
                title="Submit Registration" 
                onPress={handleSubmit} 
                isLoading={onboardingMutation.isPending} 
                disabled={!location || !experience || onboardingMutation.isPending}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
