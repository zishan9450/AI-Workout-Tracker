import React, { use } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";

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
    <SafeAreaView className="flex flex-1">
      <ScrollView className="flex-1">
        <StatusBar barStyle="dark-content" />
        <Text>Profile</Text>

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
