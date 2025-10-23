import React, { use } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { formatDuration } from "lib/utils";

export const getWorkoutsQuery = defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc){
 _id,
  date,
  duration,
  exercises[] {
    exercise->{
      _id,
      name,
    },
    sets[] {
      reps,
      weight,
      weightUnit,
      _type,
      _key
    },
    _type,
    _key
  }
}`);

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [workouts, setWorkouts] = React.useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchWorkouts = async () => {
    if (!user?.id) return;
    try {
      const results = await client.fetch(getWorkoutsQuery, { userId: user.id });
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  // Calculate Stats
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Calculate days since joining (using createdAt from clerk)
  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  }

  // Implement sign-out functionality here
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [{ text: "Cancel", style: "cancel" }, { text: "Sign Out", style: "destructive", onPress: () => signOut() }]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-3xl font-bold text-gray-900">Profile</Text>
          <Text className="text-lg text-gray-600 mt-1">Manage your account and stats</Text>
        </View>

        {/* User Info */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
                <Image
                  source={{
                    uri: user.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                  }}
                  style={{ width: 64, height: 64 }}
                  className="rounded-full"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName
                      ? user.firstName
                      : "User"}
                </Text>
                <Text className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Joined {formatJoinDate(joinDate)} &middot; {daysSinceJoining} days ago
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Your Fitness Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600">{totalWorkouts}</Text>
                <Text className="text-gray-600 text-sm text-center">Total{"\n"}Workouts</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-green-600">{formatDuration(totalDuration)}</Text>
                <Text className="text-gray-600 text-sm text-center">Total{"\n"}Time</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-purple-600">{daysSinceJoining}</Text>
                <Text className="text-gray-600 text-sm text-center">Days{"\n"}Active</Text>
              </View>
            </View>
            {/* Average Duration */}
            {totalWorkouts > 0 && (
              <View className="mt-4 pt-4 border-t border-gray-100">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-900">Average Workout Duration</Text>
                  <Text className="font-semibold text-gray-900">{formatDuration(averageDuration)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Account settings */}

        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Account Settings</Text>
            <TouchableOpacity
              className="py-3 border-b border-gray-100"
              onPress={() => Alert.alert("Change Email", "This feature is not implemented yet.")}
              activeOpacity={0.7}
            >
              <Text className="text-gray-900">Change Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3"
              onPress={() => Alert.alert("Change Password", "This feature is not implemented yet.")}
              activeOpacity={0.7}
            >
              <Text className="text-gray-900">Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            className="bg-red-600 rounded-2xl p-4 shadow-sm"
            onPress={handleSignOut} // Implement handleSignOut function
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}