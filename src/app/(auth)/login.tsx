import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button, TextInput } from '@/components/ui';
import { useAuthStore } from '@/store';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { auth } from '@/services/firebase';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';

export default function LoginScreen() {
  const { role } = useLocalSearchParams<{ role: string }>();
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  
  const setToken = useAuthStore(state => state.setToken);
  const setUser = useAuthStore(state => state.setUser);

  const directLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      return response.data;
    },
    onSuccess: (data) => {
      const realToken = data.token || data.jwt || data.access_token || (data.data && data.data.token);
      setToken(realToken);
      const userObj = data.user || data.data?.user;
      setUser({
        id: userObj?._id || userObj?.id || '1',
        name: userObj?.name || `${userObj?.firstName || ''} ${userObj?.lastName || ''}`.trim() || '',
        phone: userObj?.phone || userObj?.phoneNumber || '',
        email: userObj?.email || email || '',
        role: role || userObj?.role || 'individual',
        status: 'active',
        isRegistered: true,
      });
      setIsLoading(false);
    },
    onError: (error: any) => {
      setIsLoading(false);
      Alert.alert('Login Error', error?.response?.data?.message || 'Verification failed');
    }
  });

  const verifyFirebaseMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const endpoint = role === 'coach' ? '/auth/coach/verify-firebase' : '/auth/verify-firebase';
      const response = await api.post(endpoint, {
        firebaseIdToken: idToken
      });
      return response.data;
    },
    onSuccess: async (data) => {
      const realToken = data.token || data.jwt || data.access_token || (data.data && data.data.token);
      setToken(realToken);
      const userObj = data.user || data.data?.user;
      let resolvedStatus = 'active';

      if (role === 'coach') {
        try {
          const profileRes = await api.get('/coaches/my/profile');
          const profileObj = profileRes.data?.data || profileRes.data;
          const kycStatus = profileObj?.kyc || profileObj?.profile?.kyc || profileObj?.status || userObj?.kyc || 'pending';
          resolvedStatus = kycStatus === 'approved' ? 'active' : kycStatus;
        } catch (e) {
          const userKyc = userObj?.kyc || userObj?.status || 'pending';
          resolvedStatus = userKyc === 'approved' ? 'active' : userKyc;
        }
      } else {
        resolvedStatus = userObj?.status || 'active';
      }

      setUser({
        id: userObj?._id || userObj?.id || '1',
        name: userObj?.name || userObj?.firstName || '',
        phone: userObj?.phone || userObj?.phoneNumber || '',
        email: userObj?.email || '',
        role: role || userObj?.role || 'individual',
        status: resolvedStatus,
        isRegistered: true,
      });
      setIsLoading(false);
    },
    onError: (error: any) => {
      setIsLoading(false);
      Alert.alert('Login Error', error?.response?.data?.message || 'Verification failed');
    }
  });

  const validateEmail = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text.trim());
  };

  const validateField = (field: string, val: string) => {
    let err = '';
    if (field === 'email') {
      if (!val.trim()) {
        err = 'Email address is required';
      } else if (!validateEmail(val)) {
        err = 'Please enter a valid email address';
      }
    } else if (field === 'password') {
      if (!val) {
        err = 'Password is required';
      } else if (val.length < 6) {
        err = 'Password must be at least 6 characters';
      }
    }

    setErrors(prev => {
      const next = { ...prev };
      if (err) {
        next[field] = err;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleEmailLogin = async () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setIsLoading(true);
    if (role === 'coach') {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await getIdToken(userCredential.user, true);
        verifyFirebaseMutation.mutate(idToken);
      } catch (err: any) {
        setIsLoading(false);
        Alert.alert('Login Error', err.message);
      }
    } else {
      directLoginMutation.mutate();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="px-6 py-4 z-10">
          <TouchableOpacity onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/role-selection');
            }
          }} className="p-2 -ml-2 w-12">
            <Ionicons name="arrow-back" size={28} color="#0F2C59" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          
          <View className="mb-10 items-center">
            <Typography variant="h1" color="secondary" className="mb-2 font-bold text-center font-outfit-bold">
              Login to Arenova
            </Typography>
            <Typography variant="body1" color="muted" className="text-center font-outfit">
              {authMode === 'phone' ? 'Enter your mobile number to receive a one-time OTP.' : 'Enter your email and password to login.'}
            </Typography>
          </View>

          {/* Toggle Button */}
          <View className="flex-row bg-gray-200 rounded-full p-1 mb-8">
            <TouchableOpacity 
              onPress={() => setAuthMode('email')} 
              className="flex-1 py-3 rounded-full items-center"
              style={authMode === 'email' ? {
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
                elevation: 1
              } : {}}
            >
              <Typography variant="subtitle2" color={authMode === 'email' ? 'secondary' : 'muted'} weight="bold" className="font-outfit-bold">Email</Typography>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setAuthMode('phone')} 
              className="flex-1 py-3 rounded-full items-center"
              style={authMode === 'phone' ? {
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
                elevation: 1
              } : {}}
            >
              <Typography variant="subtitle2" color={authMode === 'phone' ? 'secondary' : 'muted'} weight="bold" className="font-outfit-bold">Phone</Typography>
            </TouchableOpacity>
          </View>

          <View className="space-y-4 mb-8">
            {authMode === 'phone' ? (
              <TextInput 
                label="Mobile Number"
                placeholder="Enter Mobile Number" 
                keyboardType="phone-pad" 
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            ) : (
              <>
                <TextInput 
                  label="Email Address"
                  placeholder="Enter your email" 
                  keyboardType="email-address" 
                  value={email} 
                  onChangeText={(text) => {
                    setEmail(text);
                    validateField('email', text);
                  }}
                  onBlur={() => validateField('email', email)}
                  autoCapitalize="none"
                  error={errors.email}
                />
                
                <TextInput 
                  label="Password"
                  placeholder="Enter your password" 
                  secureTextEntry
                  isPassword
                  value={password} 
                  onChangeText={(text) => {
                    setPassword(text);
                    validateField('password', text);
                  }}
                  onBlur={() => validateField('password', password)}
                  error={errors.password}
                />
              </>
            )}
          </View>

          <View className="mb-8">
            {authMode === 'phone' ? (
              <Button 
                title="Send OTP" 
                disabled={phoneNumber.length < 10}
                onPress={() => {
                  Alert.alert(
                    'Phone Authentication', 
                    'Phone login is currently under maintenance. Please use Email & Password to log in for now.'
                  );
                }}
              />
            ) : (
              <Button 
                title="Login" 
                isLoading={isLoading}
                onPress={handleEmailLogin}
              />
            )}
          </View>

          <View className="flex-row justify-center items-center mb-10">
            <Typography variant="body2" color="muted" className="font-outfit">
              Don't have an account?{' '}
            </Typography>
            <TouchableOpacity onPress={() => {
              router.push({ pathname: '/(auth)/register', params: { role } });
            }}>
              <Typography variant="body2" color="secondary" weight="bold" className="font-outfit-bold">
                Register
              </Typography>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
