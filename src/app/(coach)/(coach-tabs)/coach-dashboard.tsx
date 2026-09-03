import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Button } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/store';

export default function CoachDashboard() {
  const router = useRouter();

  const [metricsModalVisible, setMetricsModalVisible] = React.useState(false);
  const [selectedMetricTab, setSelectedMetricTab] = React.useState<'earnings' | 'sessions' | 'rating'>('earnings');

  const { selectedLocationId } = useAuthStore();

  const { data: locationsResponse } = useQuery({
    queryKey: ['coachLocations'],
    queryFn: async () => {
      const res = await api.get('/coach-app/locations');
      return res.data;
    }
  });

  const locations = locationsResponse?.data || [];
  const activeLocation = locations.find((loc: any) => loc._id === selectedLocationId || loc.id === selectedLocationId) || locations[0];

  const { data: notificationsResponse } = useQuery({
    queryKey: ['notificationsCount'],
    queryFn: async () => {
      const res = await api.get('/notifications', { params: { page: 1, limit: 1, unread: 'true' } });
      return res.data;
    }
  });

  const unreadCount = notificationsResponse?.unreadCount ?? 0;

  const { data: dashboardData } = useQuery({
    queryKey: ['coachDashboard'],
    queryFn: async () => {
      const res = await api.get('/coach-app/dashboard');
      return res.data;
    }
  });

  const { data: segmentedSessions } = useQuery({
    queryKey: ['segmentedSessions'],
    queryFn: async () => {
      const res = await api.get('/coach-app/sessions/segmented');
      return res.data;
    }
  });

  const openMetricsModal = (tab: 'earnings' | 'sessions' | 'rating') => {
    setSelectedMetricTab(tab);
    setMetricsModalVisible(true);
  };

  const metrics = dashboardData?.data?.metrics;
  const avgRating = metrics?.averageRating ?? 0;

  const mapSessionToUI = (session: any) => {
    const studentName = 
      session.bookedBy?.name || 
      session.participant?.name || 
      session.student?.name || 
      session.user?.name || 
      session.studentName || 
      'Student';
    const sportName = session.slot?.title || session.sport || session.title || 'Coaching';
    
    const formatTime12 = (timeStr: string) => {
      if (!timeStr) return '';
      if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
      const [hStr, mStr] = timeStr.split(':');
      const h = parseInt(hStr);
      if (isNaN(h)) return timeStr;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      return `${String(displayHour).padStart(2, '0')}:${mStr} ${ampm}`;
    };

    const formatDateShort = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const rawTime = session.slot?.startTime || session.startTime || session.time || '';
    const rawDate = session.slot?.date || session.date || session.startDate || '';

    return {
      id: session._id || session.id || Math.random().toString(),
      name: studentName,
      sport: sportName,
      startedAt: session.startedAt ? formatTime12(session.startedAt) : undefined,
      time: formatTime12(rawTime),
      date: formatDateShort(rawDate),
      delayStatus: session.delayStatus,
      delayMinutes: session.delayMinutes
    };
  };

  const dedupe = (list: any[]) => {
    const seenIds = new Set();
    const seenSlots = new Set();
    return list.filter(item => {
      const slotKey = `${item.name}_${item.date}_${item.time}`;
      if (seenIds.has(item.id) || (item.date && item.time && seenSlots.has(slotKey))) return false;
      seenIds.add(item.id);
      if (item.date && item.time) seenSlots.add(slotKey);
      return true;
    });
  };

  const currentSessionsList = dedupe((dashboardData?.data?.activeSessions || []).map(mapSessionToUI));
  const upcomingSessionsList = dedupe((dashboardData?.data?.upcomingSessions || []).map(mapSessionToUI));
  const completedSessionsList = dedupe((segmentedSessions?.data?.completed || []).map(mapSessionToUI));

  const learningTips = [
    {
      id: '1',
      title: '10 Tips Engage',
      subtitle: 'Young Students In Sports Training',
      description: 'discover effective strategies to keep kids engaged and motivated during ses',
      imageBg: 'bg-[#FFEAE1]'
    },
    {
      id: '2',
      title: '10 Tips Engage',
      subtitle: 'Young Students In Sports Training',
      description: 'discover effective strategies to keep kids engaged and motivated during ses',
      imageBg: 'bg-[#FFEAE1]'
    }
  ];

  const banners = [
    { id: '1', title: 'Welcome Coach!', desc: 'Register and start coaching kids in your local community.', color: 'bg-secondary' },
    { id: '2', title: 'Boost Your Earnings', desc: 'Host group sessions this weekend to double your income.', color: 'bg-[#4B9C73]' },
    { id: '3', title: 'New Feature Alert', desc: 'You can now set your availability by specific dates!', color: 'bg-[#F58220]', route: '/coach/schedule', buttonText: 'Set Availability' }
  ];

  const [activeBannerIndex, setActiveBannerIndex] = React.useState(0);
  const bannerScrollRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % banners.length;
      const width = require('react-native').Dimensions.get('window').width;
      bannerScrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveBannerIndex(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeBannerIndex, banners.length]);

  return (
    <View className="flex-1 bg-[#EEF3F9]">
      {/* Sticky Header Section */}
      <View className="z-10">
        {/* Header / Banner Carousel */}
        <View className="relative">
          <ScrollView 
            ref={bannerScrollRef}
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slideSize = e.nativeEvent.layoutMeasurement.width;
              const index = e.nativeEvent.contentOffset.x / slideSize;
              setActiveBannerIndex(Math.round(index));
            }}
            scrollEventThrottle={16}
          >
            {banners.map((banner, index) => (
              <View 
                key={banner.id} 
                className={`${banner.color} pt-28 pb-16 rounded-b-3xl`}
                style={{ width: require('react-native').Dimensions.get('window').width }}
              >
                <View className="px-6 flex-row justify-between items-start">
                  <View className="flex-1">
                    <Typography variant="h1" color="white" weight="bold" className="mb-2">
                      {banner.title}
                    </Typography>
                    <Typography variant="body2" color="white" className="opacity-90">
                      {banner.desc}
                    </Typography>
                    {banner.route && (
                      <TouchableOpacity 
                        onPress={() => router.push(banner.route as any)}
                        className="mt-3 bg-white/20 self-start px-4 py-1.5 rounded-full"
                      >
                        <Typography variant="caption" color="white" weight="bold">{banner.buttonText}</Typography>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          <View className="absolute bottom-12 left-0 right-0 flex-row justify-center pointer-events-none">
            {banners.map((_, i) => (
              <View 
                key={i} 
                className={`w-2 h-2 rounded-full mx-1 ${activeBannerIndex === i ? 'bg-white' : 'bg-white/50'}`} 
              />
            ))}
          </View>

          {/* Header Row (Left: Location, Right: Settings & Notifications) */}
          <View className="flex-row items-center justify-between absolute top-12 left-6 right-6 z-20 pointer-events-box-none">
            {/* Active Location Display on the Left */}
            <TouchableOpacity 
              onPress={() => router.push('/locations')}
              className="flex-row items-center bg-white border border-gray-100 shadow-sm px-3.5 py-1.5 rounded-full active:opacity-75"
              activeOpacity={0.8}
            >
              <Ionicons name="location-sharp" size={14} color="#FF5100" />
              <Typography variant="caption" color="secondary" weight="semibold" className="ml-1 mr-1 max-w-[120px] font-outfit-semibold text-[11px]" numberOfLines={1}>
                {activeLocation ? activeLocation.name : "Select Location"}
              </Typography>
              <Ionicons name="chevron-down" size={10} color="#0F2C59" />
            </TouchableOpacity>

            {/* Sticky Header Icons */}
            <View className="flex-row items-center pointer-events-box-none">
              <TouchableOpacity className="relative p-1" onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={24} color="white" />
                {unreadCount > 0 && (
                  <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border border-secondary" />
                )}
              </TouchableOpacity>
              <TouchableOpacity className="p-1 ml-3" onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Metrics Cards (Overlapping header) */}
        <View className="px-6 -mt-8 mb-6 flex-row justify-between gap-3">
          <TouchableOpacity 
            onPress={() => openMetricsModal('earnings')}
            className="flex-1 py-3 px-1 rounded-xl bg-[#4B9C73] justify-center items-center"
            activeOpacity={0.8}
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 4
            }}
          >
            <Typography variant="subtitle1" color="white" weight="bold" className="mb-0.5">
              ₹{metrics?.totalEarnings ?? 0}
            </Typography>
            <Typography variant="caption" color="white" className="text-center opacity-90 text-[10px]">Total{'\n'}Earnings</Typography>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => openMetricsModal('sessions')}
            className="flex-1 py-3 px-1 rounded-xl bg-[#4A90E2] justify-center items-center"
            activeOpacity={0.8}
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 4
            }}
          >
            <Typography variant="subtitle1" color="white" weight="bold" className="mb-0.5">
              {metrics?.weeklySessionsCompleted ?? 0}/{metrics?.weeklySessionsTotal ?? 0}
            </Typography>
            <Typography variant="caption" color="white" className="text-center opacity-90 text-[10px]">Sessions{'\n'}This Week</Typography>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => openMetricsModal('rating')}
            className="flex-1 py-3 px-1 rounded-xl bg-[#F58220] justify-center items-center"
            activeOpacity={0.8}
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 4
            }}
          >
            <Typography variant="subtitle1" color="white" weight="bold" className="mb-0.5">
              {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
            </Typography>
            <View className="flex-row mb-0.5">
              {[1,2,3,4,5].map(i => (
                <Ionicons 
                  key={i} 
                  name="star" 
                  size={8} 
                  color={i <= Math.round(avgRating) ? "#FFD700" : "#D1D5DB"} 
                  className="mx-[1px]" 
                />
              ))}
            </View>
            <Typography variant="caption" color="white" className="text-center opacity-90 text-[10px]">Avg Rating</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pt-2">
        {/* Current Sessions */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Typography variant="h3" color="secondary" weight="bold">
                Current Sessions
              </Typography>
              {currentSessionsList.length > 0 && (
                <View className="w-2 h-2 rounded-full bg-red-500 ml-2 shadow-sm" style={{ shadowColor: 'red' }} />
              )}
            </View>
          </View>

          {currentSessionsList.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center justify-center border border-gray-100 shadow-sm">
              <Ionicons name="play-circle-outline" size={32} color="#9CA3AF" className="mb-2" />
              <Typography variant="body2" color="muted" align="center">No active sessions running right now.</Typography>
            </View>
          ) : (
            currentSessionsList.map((session: any, index: number) => (
              <View key={session.id} className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-red-500 mb-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Typography variant="subtitle1" color="text" weight="bold">
                      {session.name}
                    </Typography>
                    <Typography variant="body2" color="primary" weight="bold" className="mb-2">
                      {session.sport}
                    </Typography>
                    
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="play-circle-outline" size={16} color="#10B981" className="mr-2" />
                      <Typography variant="caption" color="text" weight="bold">
                        {session.startedAt ? `Started at ${session.startedAt}` : 'Not Started'}
                      </Typography>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="#6B7280" className="mr-2" />
                      <Typography variant="caption" color="muted">
                        Scheduled: {session.time}
                      </Typography>
                    </View>
                  </View>

                  <View className="w-20">
                    <Button 
                      title="View" 
                      size="sm" 
                      onPress={() => router.push({
                        pathname: '/(shared)/session-summary',
                        params: { id: session.id }
                      })} 
                    />
                  </View>
                </View>

                {/* Delay Warning Remarks */}
                {session.delayStatus === 'started-late' && (
                  <View className="flex-row items-center bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl mt-3">
                    <Ionicons name="time" size={14} color="#C2410C" className="mr-1.5" />
                    <Typography variant="caption" className="flex-1 text-orange-700 font-semibold text-[11px]">
                      Started Late ({session.delayMinutes}m delay) • Rating Penalty Applied (-0.1★)
                    </Typography>
                  </View>
                )}
                {session.delayStatus === 'rushing' && (
                  <View className="flex-row items-center bg-red-50 border border-red-200 px-3 py-2 rounded-xl mt-3">
                    <Ionicons name="warning" size={14} color="#DC2626" className="mr-1.5" />
                    <Typography variant="caption" className="flex-1 text-red-700 font-bold text-[11px]">
                      ⚠️ Rushing! Started near 1hr limit ({session.delayMinutes}m delay) • Earnings & Rating Penalty
                    </Typography>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Upcoming Sessions */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Typography variant="h3" color="secondary" weight="bold">
              Upcoming Sessions
            </Typography>
            <TouchableOpacity className="flex-row items-center" onPress={() => router.push('/activity')}>
              <Typography variant="body2" color="secondary" weight="semibold">
                See All
              </Typography>
              <Ionicons name="chevron-forward" size={16} color="#0F2C59" />
            </TouchableOpacity>
          </View>

          {upcomingSessionsList.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center justify-center border border-gray-100 shadow-sm">
              <Ionicons name="calendar-outline" size={32} color="#9CA3AF" className="mb-2" />
              <Typography variant="body2" color="muted" align="center">No upcoming sessions scheduled.</Typography>
            </View>
          ) : (
            upcomingSessionsList.map((session: any, index: number) => (
              <View key={session.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Typography variant="subtitle1" color="text" weight="bold">
                      {session.name}
                    </Typography>
                    <Typography variant="body2" color="primary" weight="bold" className="mb-2">
                      {session.sport}
                    </Typography>
                    
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" className="mr-2" />
                      <Typography variant="caption" color="muted">
                        {session.date}
                      </Typography>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={16} color="#6B7280" className="mr-2" />
                      <Typography variant="caption" color="muted">
                        {session.time}
                      </Typography>
                    </View>
                  </View>

                  <View className="w-20">
                    <Button 
                      title="View" 
                      size="sm" 
                      onPress={() => router.push({
                        pathname: '/(shared)/session-summary',
                        params: { id: session.id }
                      })} 
                    />
                  </View>
                </View>

                {/* Delay Warning Remarks */}
                {session.delayStatus === 'warning-delay' && (
                  <View className="flex-row items-center bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl mt-3">
                    <Ionicons name="hourglass-outline" size={14} color="#D97706" className="mr-1.5" />
                    <Typography variant="caption" className="flex-1 text-amber-800 font-bold text-[11px]">
                      ⚠️ Delayed by {session.delayMinutes}m! Start in {60 - session.delayMinutes}m or session will cancel
                    </Typography>
                  </View>
                )}
                {session.delayStatus === 'out-of-time' && (
                  <View className="flex-row items-center bg-red-50 border border-red-200 px-3 py-2 rounded-xl mt-3">
                    <Ionicons name="alert-circle" size={14} color="#B91C1C" className="mr-1.5" />
                    <Typography variant="caption" className="flex-1 text-red-800 font-bold text-[11px]">
                      ❌ Out of Time! Delay &gt; 1hr ({session.delayMinutes}m delay) • Ratings & Weekly Count impacted
                    </Typography>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Completed Sessions */}
        <View className="pb-6">
          <View className="flex-row justify-between items-center mb-4 px-6">
            <Typography variant="h3" color="secondary" weight="bold">
              Completed Sessions
            </Typography>
            <TouchableOpacity className="flex-row items-center" onPress={() => router.push('/activity')}>
              <Typography variant="body2" color="secondary" weight="semibold">
                See All
              </Typography>
              <Ionicons name="chevron-forward" size={16} color="#0F2C59" />
            </TouchableOpacity>
          </View>

          {completedSessionsList.length === 0 ? (
            <View className="mx-6 bg-white rounded-2xl p-6 items-center justify-center border border-gray-100 shadow-sm">
              <Ionicons name="checkmark-circle-outline" size={32} color="#9CA3AF" className="mb-2" />
              <Typography variant="body2" color="muted" align="center">No completed sessions yet.</Typography>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingLeft: 24, paddingRight: 8 }}
            >
              {completedSessionsList.map((session: any, index: number) => (
                <View 
                  key={session.id} 
                  className="bg-[#3b8c4c] rounded-[24px] p-5 mr-4 shadow-md justify-between"
                  style={{ width: 280 }}
                >
                  <View>
                    <View className="bg-white/20 px-3 py-1 rounded-full self-start mb-3">
                      <Typography variant="caption" color="white" weight="bold" className="text-white text-[11px]">
                        {session.date}
                      </Typography>
                    </View>
                    <Typography variant="h3" color="white" weight="bold" className="text-white text-xl">
                      {session.name}
                    </Typography>
                    <Typography variant="body2" color="white" className="text-white/80 mt-1 mb-6">
                      {session.sport}
                    </Typography>
                  </View>

                  <TouchableOpacity 
                    className="flex-row items-center bg-white px-4 py-2.5 rounded-2xl self-start"
                    onPress={() => router.push({
                      pathname: '/(shared)/session-summary',
                      params: { id: session.id }
                    })}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#3b8c4c" className="mr-2" />
                    <Typography variant="body2" className="text-[#3b8c4c] font-bold">
                      View Summary
                    </Typography>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Learning & Tips */}
        <View className="px-6 pb-12">
          <View className="flex-row justify-between items-center mb-4">
            <Typography variant="h3" color="secondary" weight="bold">
              Learning & Tips
            </Typography>
            <TouchableOpacity className="flex-row items-center">
              <Typography variant="body2" color="secondary" weight="semibold">
                See All
              </Typography>
              <Ionicons name="chevron-forward" size={16} color="#0F2C59" />
            </TouchableOpacity>
          </View>

          {learningTips.map((tip, index) => (
            <TouchableOpacity 
              key={index} 
              className="flex-row bg-white rounded-3xl p-3 mb-4 shadow-sm border border-gray-100 items-center"
            >
              {/* Left Side: Soft Pastel Background for Icon */}
              <View className={`w-24 h-24 rounded-2xl ${tip.imageBg} items-center justify-center mr-4`}>
                <Ionicons 
                  name={tip.id === '1' ? "american-football-outline" : "ribbon-outline"} 
                  size={36} 
                  color="#FF5100" 
                />
              </View>

              {/* Right Side: Text details */}
              <View className="flex-1 pr-2">
                <Typography variant="subtitle2" color="secondary" weight="bold" className="text-secondary text-[16px] leading-5 mb-0.5">
                  {tip.title}
                </Typography>
                <Typography variant="body2" color="primary" weight="bold" className="text-primary text-[14px] leading-5 mb-1">
                  {tip.subtitle}
                </Typography>
                <Typography variant="caption" color="muted" className="text-gray-500 text-[12px] leading-4" numberOfLines={2}>
                  {tip.description}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Metrics Detail Overlay (Modal replacement) */}
      {metricsModalVisible && (
        <View className="absolute inset-0 bg-black/50 justify-end z-50">
          <TouchableOpacity 
            className="absolute inset-0" 
            activeOpacity={1} 
            onPress={() => setMetricsModalVisible(false)} 
          />
          <View 
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
            className="bg-white rounded-t-[32px] px-6 pt-4 pb-10 shadow-2xl border-t border-gray-200"
          >
            {/* Drag Handle Indicator */}
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

            {/* Modal Title */}
            <View className="flex-row justify-between items-center mb-6">
              <Typography variant="h3" color="secondary" weight="bold" className="text-xl">
                Metrics Dashboard
              </Typography>
              <TouchableOpacity 
                onPress={() => setMetricsModalVisible(false)}
                className="w-8 h-8 rounded-full bg-gray-100 justify-center items-center"
              >
                <Ionicons name="close" size={18} color="#0F2C59" />
              </TouchableOpacity>
            </View>

            {/* Tabs Row */}
            <View className="flex-row bg-[#EEF3F9] rounded-full p-1.5 mb-6">
              <TouchableOpacity 
                onPress={() => setSelectedMetricTab('earnings')}
                className="flex-1 flex-row justify-center items-center py-2.5 rounded-full"
                style={selectedMetricTab === 'earnings' ? {
                  backgroundColor: '#4B9C73',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 2,
                  elevation: 2
                } : {}}
              >
                <Ionicons 
                  name="wallet-outline" 
                  size={16} 
                  color={selectedMetricTab === 'earnings' ? 'white' : '#0F2C59'} 
                  className="mr-1.5" 
                />
                <Typography 
                  variant="body2" 
                  color={selectedMetricTab === 'earnings' ? 'white' : 'secondary'} 
                  weight="bold"
                >
                  Earnings
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedMetricTab('sessions')}
                className="flex-1 flex-row justify-center items-center py-2.5 rounded-full"
                style={selectedMetricTab === 'sessions' ? {
                  backgroundColor: '#4A90E2',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 2,
                  elevation: 2
                } : {}}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={selectedMetricTab === 'sessions' ? 'white' : '#0F2C59'} 
                  className="mr-1.5" 
                />
                <Typography 
                  variant="body2" 
                  color={selectedMetricTab === 'sessions' ? 'white' : 'secondary'} 
                  weight="bold"
                >
                  Sessions
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedMetricTab('rating')}
                className="flex-1 flex-row justify-center items-center py-2.5 rounded-full"
                style={selectedMetricTab === 'rating' ? {
                  backgroundColor: '#F58220',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 2,
                  elevation: 2
                } : {}}
              >
                <Ionicons 
                  name="star-outline" 
                  size={16} 
                  color={selectedMetricTab === 'rating' ? 'white' : '#0F2C59'} 
                  className="mr-1.5" 
                />
                <Typography 
                  variant="body2" 
                  color={selectedMetricTab === 'rating' ? 'white' : 'secondary'} 
                  weight="bold"
                >
                  Rating
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Tab Contents */}
            <View className="mb-6 min-h-[220px]">
              {selectedMetricTab === 'earnings' && (
                <View>
                  <View className="flex-row justify-between items-center bg-green-50 border border-green-100 p-4 rounded-2xl mb-4">
                    <View>
                      <Typography variant="caption" className="text-green-800 font-semibold mb-0.5">Available Balance</Typography>
                      <Typography variant="h2" className="text-[#2b7a43] text-2xl font-bold">₹{metrics?.availableBalance ?? 0}</Typography>
                    </View>
                    <Ionicons name="cash-outline" size={32} color="#4B9C73" />
                  </View>
                  
                  <View>
                    <View className="flex-row justify-between items-center border-b border-gray-100 pb-2 mb-3">
                      <Typography variant="body2" color="muted">Completed Sessions ({metrics?.totalSessions ?? 0})</Typography>
                      <Typography variant="body2" color="secondary" weight="bold">₹{metrics?.totalEarnings ?? 0}</Typography>
                    </View>
                    <View className="flex-row justify-between items-center border-b border-gray-100 pb-2 mb-3">
                      <Typography variant="body2" color="muted">Pending Balance</Typography>
                      <Typography variant="body2" className="text-orange-600 font-bold">₹{metrics?.pendingBalance ?? 0}</Typography>
                    </View>
                    <View className="flex-row justify-between items-center pt-1">
                      <Typography variant="body1" color="secondary" weight="bold">Net Income</Typography>
                      <Typography variant="body1" className="text-[#2b7a43] font-bold">₹{metrics?.totalEarnings ?? 0}</Typography>
                    </View>
                  </View>
                </View>
              )}

              {selectedMetricTab === 'sessions' && (
                <View>
                  <View className="flex-row justify-between items-center bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-4">
                    <View className="flex-1 pr-4">
                      <Typography variant="caption" className="text-blue-800 font-semibold mb-1">Weekly Target Progress</Typography>
                      <Typography variant="h3" color="secondary" weight="bold" className="mb-2">
                        {metrics?.weeklySessionsCompleted ?? 0} of {metrics?.weeklySessionsTotal ?? 0} Completed
                      </Typography>
                      {/* Fake progress bar */}
                      <View className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <View 
                          className="h-full bg-[#4A90E2] rounded-full" 
                          style={{ 
                            width: `${metrics?.weeklySessionsTotal > 0 ? (metrics.weeklySessionsCompleted / metrics.weeklySessionsTotal) * 100 : 0}%` 
                          }} 
                        />
                      </View>
                    </View>
                    <Typography variant="h2" className="text-[#4A90E2] font-bold">
                      {metrics?.weeklySessionsTotal > 0 ? Math.round((metrics.weeklySessionsCompleted / metrics.weeklySessionsTotal) * 100) : 0}%
                    </Typography>
                  </View>

                  <View>
                    <View className="flex-row justify-between items-center border-b border-gray-100 pb-2 mb-3">
                      <Typography variant="body2" color="muted">Total Completed Sessions</Typography>
                      <Typography variant="body2" className="text-green-700 font-bold">{metrics?.totalSessions ?? 0} Sessions</Typography>
                    </View>
                  </View>
                </View>
              )}

              {selectedMetricTab === 'rating' && (
                <View>
                  <View className="flex-row justify-between items-center bg-orange-50 border border-orange-100 p-4 rounded-2xl mb-4">
                    <View>
                      <Typography variant="caption" className="text-orange-800 font-semibold mb-0.5">Average Coach Rating</Typography>
                      <View className="flex-row items-center">
                        <Typography variant="h2" className="text-[#F58220] text-3xl font-bold mr-2">
                          {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
                        </Typography>
                        <View className="flex-row">
                          {[1,2,3,4,5].map(i => (
                            <Ionicons 
                              key={i} 
                              name="star" 
                              size={16} 
                              color={i <= Math.round(avgRating) ? "#FFD700" : "#D1D5DB"} 
                              className="mx-[1px]" 
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Ionicons name="star" size={32} color="#F58220" />
                  </View>

                  {metrics?.totalRatings === 0 ? (
                    <View className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <Typography variant="body2" color="muted" className="italic text-[13px] leading-4 text-center">
                        No reviews submitted yet.
                      </Typography>
                    </View>
                  ) : (
                    <View className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <Typography variant="caption" color="secondary" weight="bold" className="mb-1 text-[11px]">RECENT REVIEW SUMMARY</Typography>
                      <Typography variant="body2" color="muted" className="italic text-[13px] leading-4">
                        "Coach is very supportive. Always coordinates well with the children and does an amazing job training."
                      </Typography>
                      <Typography variant="caption" color="secondary" weight="semibold" className="text-right mt-1">— Verified Parent</Typography>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Bottom Close Button / Withdraw Button */}
            {selectedMetricTab === 'earnings' ? (
              <Button 
                title="Withdraw Balance" 
                variant="primary"
                onPress={() => {
                  setMetricsModalVisible(false);
                  router.push('/(coach)/wallet' as any);
                }} 
              />
            ) : (
              <Button 
                title="Done" 
                variant="secondary"
                onPress={() => setMetricsModalVisible(false)} 
              />
            )}
            </View>
        </View>
      )}
    </View>
  );
}
