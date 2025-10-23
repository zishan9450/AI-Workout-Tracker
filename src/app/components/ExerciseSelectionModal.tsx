import { View, Text, Modal, StatusBar, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native'
import React, { use, useEffect } from 'react'
import { useRouter } from 'expo-router';
import { Exercise } from '@/lib/sanity/types';
import { useWorkoutStore } from 'store/workout-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ExerciseCard from './ExerciseCard';
import { client } from '@/lib/sanity/client';
import { exercisesQuery } from '../(app)/(tabs)/exercises';

interface ExerciseSelectionModalProps {
    visible: boolean;
    onClose: () => void;
}

const ExerciseSelectionModal = ({ visible, onClose }: ExerciseSelectionModalProps) => {
    const router = useRouter();
    const { addExerciseToWorkout } = useWorkoutStore();
    const [exercises, setExercises] = React.useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filteredExercises, setFilteredExercises] = React.useState<Exercise[]>([]);
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        if (visible) {
            fetchExercises();
        }
    }, [visible]);

    useEffect(() => {
        const filtered = exercises.filter((exercise) =>
            exercise.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredExercises(filtered);
    }, [searchQuery, exercises]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchExercises();
        setRefreshing(false);
    };

    const fetchExercises = async () => {
        try {
            const exercises = await client.fetch(exercisesQuery);
            setExercises(exercises);
            setFilteredExercises(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    };

    const handleExercisePress = (exercise: Exercise) => {
        addExerciseToWorkout({ name: exercise.name, sanityId: exercise._id });
        onClose();
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle='pageSheet'
            onRequestClose={onClose}
        >
            <SafeAreaView className='flex-1 bg-white'>
                <StatusBar barStyle="dark-content" />
                <View className='bg-white px-4 pt-4 pb-6 shadow-sm border-b border-gray-100'>
                    {/* Header */}
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className='text-2xl font-bold text-gray-800'>Select Exercise</Text>

                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 items-center justify-center"
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    <Text className='text-gray-600 mb-4'>Choose an exercise to add to your workout</Text>

                    {/* Search Bar */}
                    <View className='flex-row items-center px-4 py-3 rounded-xl bg-gray-100'>
                        <Ionicons name='search' size={20} color="#6B7280" />
                        <TextInput
                            placeholder='Search exercises...'
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            className='flex-1 ml-2'
                        />
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
                    renderItem={({ item }) => (
                        <ExerciseCard
                            item={item}
                            onPress={() => {
                                handleExercisePress(item);
                            }}
                            showChevron={false}
                        />
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32, paddingHorizontal: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3B82F6']} // Android
                            tintColor="#3B82F6" // iOS
                        />
                    }
                    ListEmptyComponent={
                        <View className='flex-1 justify-center py-20 items-center'>
                            <Ionicons name='fitness-outline' size={64} color="#D1D5DB" />
                            <Text className='text-gray-400 text-lg font-semibold mt-4'>
                                {searchQuery ? 'No exercises found.' : 'Loading exercises...'}
                            </Text>
                            <Text className='text-gray-400 text-sm mt-2'>
                                {searchQuery ? 'Try adjusting your search criteria.' : 'Please add exercises in the main library first.'}
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </Modal>
    )
}

export default ExerciseSelectionModal