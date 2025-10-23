import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl, StatusBar } from 'react-native'
import React, { use, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import { client } from '@/lib/sanity/client';
import type { Exercise, ExercisesQueryResult } from '@/lib/sanity/types';
import ExerciseCard from '@/app/components/ExerciseCard';

export const exercisesQuery = defineQuery(`*[_type == "exercise"]{
  _id,
  _type,
  _rev,
  _createdAt,
  _updatedAt,
  name,
  description,
  category,
  difficulty,
  equipment,
  primaryMuscles,
  secondaryMuscles,
  instructions,
  tips,
  image,
  videoUrl
}`);


const Exercises = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const [exercises, setExercises] = React.useState<ExercisesQueryResult>([]);
  const [filteredExercises, setFilteredExercises] = React.useState<ExercisesQueryResult>([]);

  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exercisesQuery);
      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    const filtered = exercises.filter((exercise: Exercise) =>
      exercise.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [searchQuery, exercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Fetch new data here
    await fetchExercises();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View className='px-6 py-4 border-b border-gray-200 bg-white'>
        <Text className='text-2xl font-bold text-gray-900'>
          Exercise Library
        </Text>
        <Text className='text-gray-600 mt-1'>
          Discover and master new exercises
        </Text>
        {/* Search Bar */}
        <View className='flex-row items-center px-4 py-3 mt-4 rounded-xl bg-gray-100'>
          <Ionicons name='search' size={20} color="#6B7280" />
          <TextInput className='flex-1 ml-3 text-gray-800' placeholder='Search exercises...' placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name='close-circle' size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => router.push(`/exercise-detail?id=${item._id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']} // Android
            tintColor="#3B82F6" // iOS
            title='Pull to refresh exercises'
            titleColor="#6B7280" // iOS
          />
        }
        ListEmptyComponent={
          <View className='bg-white rounded-2xl p-8 items-center'>
            <Ionicons name='fitness-outline' size={64} color="#9CA3AF" />
            <Text className='text-xl font-semibold text-gray-900 mt-4'>
              {searchQuery ? 'No exercises found.' : 'Loading exercises...'}
            </Text>
            <Text className='text-gray-600 text-center mt-2'>
              {searchQuery ? 'Try adjusting your search' : 'Your exercises will appear here'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

export default Exercises;