import { client } from "@/lib/sanity/client";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getWorkoutsQuery } from "./profile";
import { workout } from "sanity/schemaTypes/workout";
import { formatDuration } from "lib/utils";
import { Ionicons } from "@expo/vector-icons";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [workouts, setWorkouts] = React.useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  const fetchWorkouts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const results = await client.fetch(getWorkoutsQuery, { userId: user.id });
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchWorkouts();
    }
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  // Calculate stats
  const totalWorkouts = workouts.length;
  const lastWorkout = workouts[0];
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getTotalSets = (workout: GetWorkoutQueryResult[number]) => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.length;
    }, 0);
  };


  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading your stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-lg text-gray-600">Welcome Back!</Text>
          <Text className="text-3xl font-bold text-gray-900">
            {user?.firstName || "Athlete"} 💪
          </Text>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Your Stats</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600">{totalWorkouts}</Text>
                <Text className="text-gray-600">Total{"\n"}Workouts</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-green-600">{formatDuration(totalDuration)}</Text>
                <Text className="text-gray-600">Total{"\n"}Time</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-purple-600">{averageDuration > 0 ? formatDuration(averageDuration) : "N/A"}</Text>
                <Text className="text-gray-600">Average{"\n"}Duration</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          {/* Start Workout Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl p-6 mb-4 shadow-sm"
            activeOpacity={0.8}
            onPress={() => router.push("/active-workout")}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Ionicons name="play" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-xl font-semibold">Start New Workout</Text>
                  <Text className="text-blue-200">Begin your training journey</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* Action Grid */}
          <View className="flex-row gap-4">
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 flex-1 items-center shadow-sm border border-gray-100"
              activeOpacity={0.7}
              onPress={() => router.push("/history")}
            >
              <View className="items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="time-outline" size={24} color="#6B7280" />
                </View>
                <Text className="text-gray-900 text-center font-medium">Workout{"\n"}History</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 flex-1 items-center shadow-sm border border-gray-100"
              activeOpacity={0.7}
              onPress={() => router.push("/exercises")}
            >
              <View className="items-center">
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="barbell-outline" size={24} color="#6B7280" />
                </View>
                <Text className="text-gray-900 text-center font-medium">Exercises</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Last Workout Section */}
        {lastWorkout && (
          <View className="px-6 mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Last Workout</Text>
            <TouchableOpacity
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: "/history/workout-record",
                params: { workoutId: lastWorkout._id }
              })}
            >
              <View className="flex-row justify-between mb-4 items-center">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">{formatDate(lastWorkout.date)}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {lastWorkout.duration ? formatDuration(lastWorkout.duration) : "Duration not recorded"}
                    </Text>
                  </View>
                </View>
                <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
                  <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
                </View>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-700">
                  {lastWorkout.exercises.length} Exercises, {getTotalSets(lastWorkout)} Sets
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        )}
        {/* Empty State for no workouts */}
        {totalWorkouts === 0 && (
          <View className="px-6 mb-8">
            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
              <View className="w-15 h-15 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="barbell-outline" size={32} color="#3B82F6" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Crush Your First Workout?
              </Text>
              <Text className="text-gray-600 text-center mb-4">
                Track your progress and stay motivated!
              </Text>
              <TouchableOpacity
                className="bg-blue-500 rounded-full px-6 py-3"
                onPress={() => router.push("/workout")}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">Start New Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}