import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, TextInput } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [location, setLocation] = useState(user?.location || '');
  const [description, setDescription] = useState(user?.description || '');
  const [sports, setSports] = useState(user?.sports?.join(', ') || '');
  const [idProof, setIdProof] = useState(user?.idProof || '');

  const handlePickImage = async () => {
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
      const fileName = selectedUri.split('/').pop() || 'ID_Document.jpg';
      setIdProof(fileName);
    }
  };

  const queryClient = useQueryClient();
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['coachProfile'],
    queryFn: async () => {
      if (user?.role !== 'coach') return null;
      const res = await api.get('/coaches/my/profile');
      return res.data?.data || res.data;
    },
    enabled: user?.role === 'coach',
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || profile.phoneNumber || '');
      setExperience(profile.profile?.experience ? profile.profile.experience.toString() : '');
      setLocation(profile.profile?.address?.city || '');
      setDescription(profile.profile?.description || profile.profile?.bio || '');
      setSports(profile.profile?.sports?.join(', ') || '');
    }
  }, [profile]);

  const displayProfile = {
    name: user?.role === 'coach' ? (profile?.name || user?.name || 'Coach Name') : (user?.name || 'User Profile'),
    email: user?.role === 'coach' ? (profile?.email || user?.email || 'N/A') : (user?.email || 'N/A'),
    phone: user?.role === 'coach' ? (profile?.phone || profile?.phoneNumber || user?.phone || '') : (user?.phone || ''),
    location: user?.role === 'coach' ? (profile?.profile?.address?.city || user?.location || 'N/A') : (user?.location || 'N/A'),
    experience: user?.role === 'coach' ? (profile?.profile?.experience ? `${profile.profile.experience} Years` : (user?.experience || 'N/A')) : (user?.experience || 'N/A'),
    sports: user?.role === 'coach' ? (profile?.profile?.sports || []) : (user?.sports || []),
    description: user?.role === 'coach' ? (profile?.profile?.description || profile?.profile?.bio || user?.description || 'N/A') : (user?.description || 'N/A'),
  };

  const descriptionWordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).length;

  const handleDescriptionChange = (text: string) => {
    const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
    if (words.length <= 150 || text.length < description.length) {
      setDescription(text);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await api.put('/coaches/my/profile', updatedData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['coachProfile'], (oldData: any) => {
        if (!oldData) return data?.data || data;
        const updatedUser = data?.data || data;
        
        return {
          ...oldData,
          ...updatedUser,
          profile: {
            ...oldData.profile,
            ...(updatedUser.profile || {}),
            sports: variables.sports !== undefined ? variables.sports : oldData.profile?.sports,
            experience: variables.experience !== undefined ? variables.experience : oldData.profile?.experience,
            bio: variables.bio !== undefined ? variables.bio : oldData.profile?.bio,
            description: variables.description !== undefined ? variables.description : oldData.profile?.description,
            address: variables.address !== undefined ? variables.address : oldData.profile?.address,
          }
        };
      });

      queryClient.invalidateQueries({ queryKey: ['coachProfile'] });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      if (user) {
        setUser({
          ...user,
          name: name,
        });
      }
    },
    onError: (err: any) => {
      Alert.alert('Error Updating Profile', err?.response?.data?.message || err.message);
    }
  });

  const handleSaveProfile = () => {
    if (user?.role === 'coach') {
      const payload: any = {
        name,
        bio: description,
        description,
        experience: parseInt(experience) || 0,
        sports: sports.split(',').map(s => s.trim()).filter(Boolean),
        address: {
          city: location
        }
      };

      payload.profile = {
        bio: description,
        description,
        experience: parseInt(experience) || 0,
        sports: sports.split(',').map(s => s.trim()).filter(Boolean),
        address: {
          city: location
        }
      };
      payload.coach = {
        bio: description,
        description,
        experience: parseInt(experience) || 0,
        sports: sports.split(',').map(s => s.trim()).filter(Boolean),
        address: {
          city: location
        }
      };

      updateProfileMutation.mutate(payload);
    } else {
      if (user) {
        setUser({
          ...user,
          name,
          experience,
          location,
          description,
          idProof
        });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    }
  };

  const standardMenuItems = [
    { id: 'family', title: 'My Family Tree', icon: 'people-outline', route: user?.role === 'parent' ? '/(parent)/(parent-tabs)/family-tree' : null },
    { id: 'settings', title: 'Settings & Preferences', icon: 'settings-outline', route: '/settings' },
    { id: 'logout', title: 'Sign Out', icon: 'log-out-outline', route: '/(auth)' },
  ];

  const coachMenuItems = [
    { id: 'wallet', title: 'Wallet & Withdrawals', icon: 'wallet-outline', route: '/(coach)/wallet' },
    { id: 'locations', title: 'Coaching Locations', icon: 'location-outline', route: '/locations' },
    { id: 'settings', title: 'Settings & Preferences', icon: 'settings-outline', route: '/settings' },
    { id: 'logout', title: 'Sign Out', icon: 'log-out-outline', route: '/(auth)' },
  ];

  const menuItems = user?.role === 'coach' ? coachMenuItems : standardMenuItems;

  const getMenuDetails = (id: string) => {
    switch (id) {
      case 'wallet':
        return {
          title: "Wallet & Withdrawals",
          desc: "Manage balance, coaching earnings, and transfer payouts",
          color: "#10B981", // Emerald
          bgColor: "bg-emerald-50 border-emerald-100/50"
        };
      case 'locations':
        return {
          title: "Coaching Locations",
          desc: "Configure your training arenas and map boundaries",
          color: "#F58220", // Orange
          bgColor: "bg-orange-50 border-orange-100/50"
        };
      case 'family':
        return {
          title: "My Family Tree",
          desc: "Register child players and book coaching schedules",
          color: "#0D9488", // Teal
          bgColor: "bg-teal-50 border-teal-100/50"
        };
      case 'settings':
        return {
          title: "Settings & Preferences",
          desc: "Manage help center support and legal documents",
          color: "#0F2C59", // Navy
          bgColor: "bg-blue-50 border-blue-100/50"
        };
      default:
        return {
          title: "Sign Out",
          desc: "Securely log out of your session on this device",
          color: "#EF4444", // Red
          bgColor: "bg-red-50 border-red-100/50"
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 shadow-sm z-10">
          <Typography variant="h2" color="secondary" weight="bold" className="font-outfit-bold">
            My Profile
          </Typography>
          <TouchableOpacity className="p-2 -mr-2" onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#0F2C59" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4 pb-8">
          {user?.role === 'coach' && isProfileLoading ? (
            <ActivityIndicator size="large" color="#FF5100" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Header Profile Summary Panel */}
              <View className="bg-secondary rounded-3xl p-6 mb-6 shadow-md relative overflow-hidden">
                <View className="absolute right-0 top-0 opacity-10">
                  <Ionicons name="person" size={180} color="white" />
                </View>

                <View className="flex-row items-center">
                  <TouchableOpacity 
                    className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/50 items-center justify-center mr-4 relative overflow-hidden"
                    disabled={!isEditing}
                    onPress={() => isEditing && Alert.alert('Update Photo', 'Photo uploads are enabled inside document proof picking.')}
                  >
                    <Typography variant="h2" color="white" weight="bold" className="font-outfit-bold">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CO'}
                    </Typography>
                  </TouchableOpacity>

                  <View className="flex-1">
                    <Typography variant="h3" color="white" weight="bold" className="font-outfit-bold">
                      {displayProfile.name}
                    </Typography>

                    <Typography variant="caption" color="light" className="opacity-80 mt-1 font-outfit uppercase tracking-wider">
                      {user?.role === 'coach' ? 'Certified Coach' : 'Registered Parent/Player'}
                    </Typography>

                    <View className="flex-row items-center mt-2">
                      <Typography variant="body2" color="white" className="opacity-90 font-outfit">
                        {displayProfile.phone}
                      </Typography>
                      {displayProfile.phone ? (
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" className="ml-1.5" />
                      ) : null}
                    </View>
                  </View>

                  {!isEditing && (
                    <TouchableOpacity 
                      onPress={() => setIsEditing(true)} 
                      className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30"
                    >
                      <Ionicons name="pencil" size={18} color="white" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Quick Stats Banner */}
                {!isEditing && user?.role === 'coach' && (
                  <View className="flex-row pt-4 mt-4 border-t border-white/10">
                    <View className="flex-1 items-center border-r border-white/10">
                      <View className="flex-row items-center mb-0.5">
                        <Ionicons name="star" size={14} color="#F59E0B" className="mr-1" />
                        <Typography variant="subtitle1" color="white" weight="bold" className="font-outfit-bold">
                          {profile?.profile?.rating !== undefined ? profile.profile.rating.toFixed(1) : '0.0'}
                        </Typography>
                      </View>
                      <Typography variant="caption" color="light" className="opacity-70 font-outfit">Rating ({profile?.profile?.totalRatings || 0})</Typography>
                    </View>
                    <View className="flex-1 items-center">
                      <Typography variant="subtitle1" color="white" weight="bold" className="mb-0.5 font-outfit-bold">
                        {profile?.profile?.sessions || 0}
                      </Typography>
                      <Typography variant="caption" color="light" className="opacity-70 font-outfit">Sessions Completed</Typography>
                    </View>
                  </View>
                )}
              </View>

              {/* Account Details Card */}
              <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
                <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-4 font-outfit-bold">
                  Account Details
                </Typography>

                <View className="space-y-4">
                  {/* Name Input (Visible in edit mode) */}
                  {isEditing && (
                    <TextInput 
                      label="Full Name"
                      value={name} 
                      onChangeText={setName} 
                      placeholder="Your Name" 
                    />
                  )}

                  {/* Phone Input (Visible in edit mode) */}
                  {isEditing && (
                    <TextInput 
                      label="Phone Number"
                      value={phone} 
                      onChangeText={setPhone} 
                      placeholder="Phone Number" 
                      keyboardType="phone-pad" 
                    />
                  )}

                  {/* Email (Visible in edit mode as read-only) */}
                  {isEditing && (
                    <TextInput 
                      label="Email Address"
                      value={displayProfile.email} 
                      editable={false}
                      className="bg-gray-100/50 text-gray-500 opacity-80"
                    />
                  )}

                  {/* Email Row (Visible in view mode) */}
                  {!isEditing && (
                    <View className="flex-row items-center py-3">
                      <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                        <Ionicons name="mail" size={16} color="#3B82F6" />
                      </View>
                      <View className="flex-1">
                        <Typography variant="caption" color="muted" className="font-outfit">Email Address</Typography>
                        <Typography variant="body2" color="secondary" weight="medium" className="mt-0.5 font-outfit">
                          {displayProfile.email}
                        </Typography>
                      </View>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    </View>
                  )}

                  {/* Location (Visible in edit mode) */}
                  {isEditing && (
                    <TextInput 
                      label="Location/City"
                      value={location} 
                      onChangeText={setLocation} 
                      placeholder="e.g. Hyderabad" 
                    />
                  )}

                  {/* Location Row (Visible in view mode) */}
                  {!isEditing && (
                    <View className="flex-row items-center py-3">
                      <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center mr-3">
                        <Ionicons name="location" size={16} color="#EF4444" />
                      </View>
                      <View className="flex-1">
                        <Typography variant="caption" color="muted" className="font-outfit">Location/City</Typography>
                        <Typography variant="body2" color="secondary" weight="medium" className="mt-0.5 font-outfit">
                          {displayProfile.location}
                        </Typography>
                      </View>
                    </View>
                  )}

                  {/* Experience (Visible in edit mode) */}
                  {user?.role === 'coach' && isEditing && (
                    <TextInput 
                      label="Coaching Experience (Years)"
                      value={experience} 
                      onChangeText={setExperience} 
                      placeholder="e.g. 5" 
                      keyboardType="numeric"
                    />
                  )}

                  {/* Experience Row (Visible in view mode) */}
                  {user?.role === 'coach' && !isEditing && (
                    <View className="flex-row items-center py-3">
                      <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-3">
                        <Ionicons name="ribbon" size={16} color="#10B981" />
                      </View>
                      <View className="flex-1">
                        <Typography variant="caption" color="muted" className="font-outfit">Coaching Experience</Typography>
                        <Typography variant="body2" color="secondary" weight="medium" className="mt-0.5 font-outfit">
                          {displayProfile.experience}
                        </Typography>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Coaching & Professional Profile Cards */}
              {user?.role === 'coach' && (
                <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
                  <Typography variant="subtitle1" color="secondary" weight="bold" className="mb-2 font-outfit-bold">
                    Professional Profile
                  </Typography>

                  <View>
                    {/* Sports (Rendered as tags, read-only both in view & edit mode) */}
                    <View className="py-2.5">
                      <Typography variant="caption" color="muted" className="font-outfit">Sports Specialization (Read-Only)</Typography>
                      <View className="flex-row flex-wrap mt-2">
                        {displayProfile.sports.length > 0 ? (
                          displayProfile.sports.map((sport: string, index: number) => (
                            <View key={index} className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mr-2 mb-2">
                              <Typography variant="caption" color="primary" weight="bold" className="font-outfit-bold text-[10px]">{sport}</Typography>
                            </View>
                          ))
                        ) : (
                          <Typography variant="body2" color="secondary">None Selected</Typography>
                        )}
                      </View>
                    </View>

                    {/* About Me / Bio */}
                    <View className="py-2.5">
                      <View className="flex-row justify-between items-center">
                        <Typography variant="caption" color="muted" className="font-outfit">Biography</Typography>
                        {isEditing && (
                          <Typography variant="caption" color={descriptionWordCount >= 150 ? 'error' : 'muted'} className="text-[10px]">
                            {descriptionWordCount}/150 words
                          </Typography>
                        )}
                      </View>
                      {isEditing ? (
                        <TextInput 
                          value={description} 
                          onChangeText={handleDescriptionChange} 
                          placeholder="Write something about yourself..." 
                          multiline 
                          className="mb-0 mt-2 min-h-[80px]" 
                        />
                      ) : (
                        <Typography variant="body2" color="text" className="mt-1 leading-5 font-outfit text-gray-600">
                          {displayProfile.description}
                        </Typography>
                      )}
                    </View>

                    {/* KYC Proof */}
                    <View className="flex-row items-center py-2.5">
                      <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                        <Ionicons name="id-card" size={16} color="#4B5563" />
                      </View>
                      <View className="flex-1">
                        <Typography variant="caption" color="muted" className="font-outfit">ID & Certification Proof</Typography>
                        {isEditing ? (
                          <TouchableOpacity 
                            onPress={handlePickImage}
                            className="mt-2 bg-[#EEF3F9] p-3 rounded-xl flex-row justify-between items-center border border-gray-200"
                          >
                            <Typography color="secondary" className="font-outfit text-xs">{idProof ? idProof : 'Upload Document'}</Typography>
                            <Ionicons name="cloud-upload-outline" size={18} color="#0F2C59" />
                          </TouchableOpacity>
                        ) : (
                          <Typography variant="body2" color="secondary" weight="medium" className="mt-0.5 font-outfit">
                            {profile?.profile?.kyc ? `Verified Status: ${profile.profile.kyc.toUpperCase()}` : (idProof ? idProof : 'Pending Certification')}
                          </Typography>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Schedule Management Panel */}
              {user?.role === 'coach' && !isEditing && (
                <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100 flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Typography variant="subtitle2" color="secondary" weight="bold" className="font-outfit-bold">
                      Calendar Availability
                    </Typography>
                    <Typography variant="caption" color="muted" className="mt-1 font-outfit">
                      Manage your coaching dates, time slots, and prices.
                    </Typography>
                  </View>
                  <TouchableOpacity 
                    onPress={() => router.push('/(coach)/(coach-tabs)/schedule')}
                    className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-full"
                  >
                    <Typography variant="caption" color="primary" weight="bold" className="font-outfit-bold text-xs">Set Slots</Typography>
                  </TouchableOpacity>
                </View>
              )}

              {/* Save Changes Buttons */}
              {isEditing && (
                <View className="mb-5">
                  <Button title="Save Profile Changes" onPress={handleSaveProfile} />
                </View>
              )}
            </>
          )}

          {/* Menu Action Sheet - Designed in a highly professional card tile list with spacing */}
          <View className="mb-16">
            {menuItems.map((item) => {
              const details = getMenuDetails(item.id);
              return (
                <TouchableOpacity 
                  key={item.id}
                  onPress={() => {
                    if (item.id === 'logout') {
                      Alert.alert('Confirm Logout', 'Are you sure you want to log out of your account?', [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Logout', 
                          style: 'destructive',
                          onPress: () => {
                            logout();
                            router.replace('/(auth)');
                          }
                        }
                      ]);
                    } else if (item.route) {
                      router.push(item.route as any);
                    }
                  }}
                  activeOpacity={0.8}
                  className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex-row items-center mb-4"
                >
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${details.bgColor} border`}>
                    <Ionicons name={item.icon as any} size={22} color={details.color} />
                  </View>
                  <View className="flex-1">
                    <Typography 
                      variant="subtitle1" 
                      color={item.id === 'logout' ? 'text' : 'secondary'} 
                      weight="bold" 
                      className={`font-outfit-bold ${item.id === 'logout' ? 'text-red-500' : ''}`}
                    >
                      {details.title}
                    </Typography>
                    <Typography variant="caption" color="muted" className="mt-0.5 font-outfit text-xs leading-4">
                      {details.desc}
                    </Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
