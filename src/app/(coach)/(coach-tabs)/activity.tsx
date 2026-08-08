import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export default function CoachActivityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming' | 'completed'>('current');

  const { data: sessionsResponse, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['coachSessions'],
    queryFn: async () => {
      const res = await api.get('/coaches/my/sessions');
      return res.data?.data || res.data || [];
    }
  });

  const allSessions = Array.isArray(sessionsResponse) ? sessionsResponse : [];

  const formatSessionDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
  };

  const formatSessionTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
      }
    }
    return timeStr;
  };

  const mapSessionToUI = (session: any) => {
    const id = session._id || session.id || Math.random().toString();
    const studentName = session.student?.name || session.user?.name || session.studentName || 'Student';
    const subtitle = session.sport || 'Session';
    const rawDate = session.date || '';
    const rawTime = session.time || '';
    const status = session.status || 'requested';

    let uiStatus = status;
    if (status === 'confirmed' || status === 'accepted') {
      uiStatus = 'Confirmed';
    } else if (status === 'requested') {
      uiStatus = 'Requested';
    } else if (status === 'completed') {
      uiStatus = 'Completed';
    } else if (status === 'cancelled') {
      uiStatus = 'Cancelled';
    } else if (status === 'no_show') {
      uiStatus = 'No Show';
    }

    return {
      id,
      name: studentName,
      subtitle: `${subtitle} • ${session.credits ? session.credits + ' Credits' : (session.amountInr ? '₹' + session.amountInr : '')}`,
      date: formatSessionDate(rawDate),
      time: formatSessionTime(rawTime),
      status: uiStatus,
      rawStatus: status,
      location: session.location || '',
      startedLate: session.startedLate || false,
      delayStatus: session.delayStatus || '',
      delayMinutes: session.delayMinutes || 0,
      absent: session.absent || 0,
      injured: session.injured || 0
    };
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const currentBookings = allSessions.filter((s: any) => {
    const isToday = s.date && s.date.includes(todayStr);
    const isActive = s.status === 'accepted' || s.status === 'confirmed';
    return isActive && isToday;
  }).map(mapSessionToUI);

  const coachBookings = allSessions.filter((s: any) => {
    const isToday = s.date && s.date.includes(todayStr);
    const isActive = s.status === 'accepted' || s.status === 'confirmed' || s.status === 'requested';
    return isActive && !isToday;
  }).map(mapSessionToUI);

  const coachCompleted = allSessions.filter((s: any) => {
    return s.status === 'completed' || s.status === 'cancelled' || s.status === 'no_show';
  }).map(mapSessionToUI);

  const displayBookings = activeTab === 'current' ? currentBookings : activeTab === 'upcoming' ? coachBookings : coachCompleted;

  return (
    <SafeAreaView className="flex-1 bg-[#EEF3F9]">
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#0F2C59" />
        </TouchableOpacity>
        <Typography variant="h2" color="secondary" weight="bold">
          My Activity
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <View className="px-4 pt-4 pb-2">
        <View className="flex-row bg-white rounded-full border border-gray-200 overflow-hidden h-12">
          <TouchableOpacity 
            className={`flex-1 justify-center items-center ${activeTab === 'current' ? 'bg-secondary' : 'bg-transparent'}`}
            onPress={() => setActiveTab('current')}
          >
            <Typography variant="subtitle2" color={activeTab === 'current' ? 'white' : 'secondary'} weight="bold">
              Current
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 justify-center items-center ${activeTab === 'upcoming' ? 'bg-secondary' : 'bg-transparent'}`}
            onPress={() => setActiveTab('upcoming')}
          >
            <Typography variant="subtitle2" color={activeTab === 'upcoming' ? 'white' : 'secondary'} weight="bold">
              Upcoming
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 justify-center items-center ${activeTab === 'completed' ? 'bg-secondary' : 'bg-transparent'}`}
            onPress={() => setActiveTab('completed')}
          >
            <Typography variant="subtitle2" color={activeTab === 'completed' ? 'white' : 'secondary'} weight="bold">
              Completed
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-4 pb-8">
        
        {isSessionsLoading ? (
          <ActivityIndicator size="large" color="#FF5100" style={{ marginTop: 24 }} />
        ) : displayBookings.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Typography variant="body1" color="muted">No sessions found</Typography>
          </View>
        ) : (
          displayBookings.map(booking => (
          <View key={booking.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 border border-gray-100">
            <View className="flex-row justify-between items-center mb-3 border-b border-gray-100 pb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-100 mr-3 items-center justify-center">
                  <Typography variant="subtitle1" color="primary" weight="bold">{booking.name.charAt(0)}</Typography>
                </View>
                <View>
                  <Typography variant="subtitle1" color="secondary" weight="bold">
                    {booking.name}
                  </Typography>
                  <Typography variant="caption" color="muted" weight="bold">
                    {booking.subtitle}
                  </Typography>
                </View>
              </View>
              <View className={`px-2 py-1 rounded-md ${
                booking.status === 'Ongoing' ? 'bg-red-100' : 
                booking.status === 'Confirmed' || booking.status === 'Upcoming' ? 'bg-green-100' : 
                booking.status === 'Completed' ? 'bg-gray-100' : 
                booking.status === 'Delayed Warning' ? 'bg-amber-100' :
                booking.status === 'Out of Time' || booking.status === 'Penalized' ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <Typography 
                  variant="caption" 
                  className={
                    booking.status === 'Ongoing' ? 'text-red-700' : 
                    booking.status === 'Confirmed' || booking.status === 'Upcoming' ? 'text-green-700' : 
                    booking.status === 'Completed' ? 'text-gray-700' : 
                    booking.status === 'Delayed Warning' ? 'text-amber-700' :
                    booking.status === 'Out of Time' || booking.status === 'Penalized' ? 'text-red-700' : 'text-orange-700'
                  } 
                  weight="bold"
                >
                  {booking.status}
                </Typography>
              </View>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" className="mr-2" />
                <Typography variant="body2" color="text">{booking.date}</Typography>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" className="mr-2" />
                <Typography variant="body2" color="text">{booking.time}</Typography>
              </View>
            </View>

            {booking.status === 'Ongoing' && booking.delayStatus === 'started-late' && (
              <View className="flex-row items-center bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl mt-1 mb-3">
                <Ionicons name="time" size={14} color="#C2410C" className="mr-1.5" />
                <Typography variant="caption" className="flex-1 text-orange-700 font-semibold text-[11px]">
                  Started Late ({booking.delayMinutes}m delay) • Rating Penalty Applied (-0.1★)
                </Typography>
              </View>
            )}
            {booking.status === 'Ongoing' && booking.delayStatus === 'rushing' && (
              <View className="flex-row items-center bg-red-50 border border-red-200 px-3 py-2 rounded-xl mt-1 mb-3">
                <Ionicons name="warning" size={14} color="#DC2626" className="mr-1.5" />
                <Typography variant="caption" className="flex-1 text-red-700 font-bold text-[11px]">
                  ⚠️ Rushing! Started near 1hr limit ({booking.delayMinutes}m delay) • Earnings & Rating Penalty
                </Typography>
              </View>
            )}
            {booking.delayStatus === 'warning-delay' && (
              <View className="flex-row items-center bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl mt-1 mb-3">
                <Ionicons name="hourglass-outline" size={14} color="#D97706" className="mr-1.5" />
                <Typography variant="caption" className="flex-1 text-amber-800 font-bold text-[11px]">
                  ⚠️ Delayed by {booking.delayMinutes}m! Start in {60 - (booking.delayMinutes || 0)}m to avoid cancellation
                </Typography>
              </View>
            )}
            {booking.delayStatus === 'out-of-time' && booking.status !== 'Penalized' && (
              <View className="flex-row items-center bg-red-50 border border-red-200 px-3 py-2 rounded-xl mt-1 mb-3">
                <Ionicons name="alert-circle" size={14} color="#B91C1C" className="mr-1.5" />
                <Typography variant="caption" className="flex-1 text-red-800 font-bold text-[11px]">
                  ❌ Out of Time! Delay &gt; 1hr exceeded ({booking.delayMinutes}m delay) • Ratings & Target Count impacted
                </Typography>
              </View>
            )}

            {(booking.status === 'Completed' || booking.status === 'Penalized') && (
              <View className="flex-row flex-wrap border-t border-gray-100 pt-3 mb-3">
                {booking.delayStatus === 'started-late' && (
                  <View className="flex-row items-center bg-orange-100 px-2 py-1 rounded-md mr-2 mb-2">
                    <Ionicons name="time" size={12} color="#C2410C" className="mr-1" />
                    <Typography variant="caption" className="text-orange-700 font-bold text-[10px]">Started Late ({booking.delayMinutes}m)</Typography>
                  </View>
                )}
                {booking.delayStatus === 'out-of-time' && (
                  <View className="flex-row items-center bg-red-100 px-2 py-1 rounded-md mr-2 mb-2">
                    <Ionicons name="alert-circle" size={12} color="#B91C1C" className="mr-1" />
                    <Typography variant="caption" className="text-red-700 font-bold text-[10px]">Out of Time Limit ({booking.delayMinutes}m delay) • Lost Stars & Earnings</Typography>
                  </View>
                )}
                {booking.startedLate && booking.delayStatus !== 'started-late' && booking.delayStatus !== 'out-of-time' && (
                  <View className="flex-row items-center bg-orange-100 px-2 py-1 rounded-md mr-2 mb-2">
                    <Ionicons name="time" size={12} color="#C2410C" className="mr-1" />
                    <Typography variant="caption" className="text-orange-700 font-bold text-[10px]">Started Late</Typography>
                  </View>
                )}
                {booking.absent > 0 && (
                  <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-md mr-2 mb-2">
                    <Ionicons name="person-remove" size={12} color="#4B5563" className="mr-1" />
                    <Typography variant="caption" className="text-gray-700 font-bold text-[10px]">{booking.absent} Absent</Typography>
                  </View>
                )}
                {booking.injured > 0 && (
                  <View className="flex-row items-center bg-red-100 px-2 py-1 rounded-md mr-2 mb-2">
                    <Ionicons name="medkit" size={12} color="#B91C1C" className="mr-1" />
                    <Typography variant="caption" className="text-red-700 font-bold text-[10px]">{booking.injured} Injured</Typography>
                  </View>
                )}
                {booking.delayStatus !== 'started-late' && booking.delayStatus !== 'out-of-time' && !booking.startedLate && booking.absent === 0 && booking.injured === 0 && (
                  <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-md mb-2">
                    <Ionicons name="checkmark-circle" size={12} color="#047857" className="mr-1" />
                    <Typography variant="caption" className="text-green-700 font-bold text-[10px]">Perfect Session</Typography>
                  </View>
                )}
              </View>
            )}

            <View className="flex-row justify-end mt-1">
              <View className="w-28">
                <Button 
                  title="View Details" 
                  size="sm"
                  onPress={() => router.push({
                    pathname: '/(shared)/session-summary',
                    params: { 
                      id: booking.id,
                      status: booking.rawStatus,
                      studentName: booking.name,
                      date: booking.date,
                      time: booking.time,
                      location: booking.location
                    }
                  })}
                />
              </View>
            </View>
          </View>
        )))}

      </ScrollView>
    </SafeAreaView>
  );
}
