import { View, Text, StatusBar, TouchableOpacity, ScrollView, Image, ActivityIndicator, Linking } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { urlFor, client } from '@/lib/sanity/client';
import { Exercise } from '@/lib/sanity/types';
import { defineQuery } from 'groq';
import Markdown from 'react-native-markdown-display';

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'bg-green-500';
        case 'intermediate':
            return 'bg-yellow-500';
        case 'advanced':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
};

const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner':
            return 'Beginner';
        case 'intermediate':
            return 'Intermediate';
        case 'advanced':
            return 'Advanced';
        default:
            return 'Unknown';
    }
};

const singleExerciseQuery = defineQuery(`*[_type == "exercise" && _id == $id][0]{
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

const ExerciseDetail = () => {
    const [exercise, setExercise] = React.useState<Exercise | null>(null);
    const [loading, setLoading] = React.useState(true);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [aiGuidance, setAiGuidance] = React.useState<string>("");
    const [aiLoading, setAiLoading] = React.useState<boolean>(false);
    const router = useRouter();

    React.useEffect(() => {
        const fetchExercise = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const exerciseData = await client.fetch(singleExerciseQuery, { id });
                setExercise(exerciseData);
            } catch (error) {
                console.error('Error fetching exercise:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercise();
    }, [id]);

    const getAiGuidance = async () => {
        if (!exercise) return;

        setAiLoading(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ exerciseName: exercise.name }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch AI guidance');
            }

            const data = await response.json();
            setAiGuidance(data.message);
        } catch (error) {
            console.error('Error fetching AI guidance:', error);
            setAiGuidance("Sorry, there was an error generating AI guidance. Please try again later.");
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className='flex-1 bg-white'>
                <View className='flex-1 justify-center items-center'>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className='text-gray-600 mt-4'>Loading exercise...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!exercise) {
        return (
            <SafeAreaView className='flex-1 bg-white'>
                <View className='flex-1 justify-center items-center'>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className='text-xl font-semibold text-gray-900 mt-4'>Exercise Not Found</Text>
                    <Text className='text-gray-600 mt-2'>This exercise could not be loaded.</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className='bg-blue-600 px-6 py-3 rounded-xl mt-6'
                    >
                        <Text className='text-white font-semibold'>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            {/* Header with close button */}
            <View className="absolute top-12 left-0 right-0 z-10 px-4">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/20 rounded-full items-center justify-center backdrop-blur-sm">
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
            >
                {/* Exercise details go here */}
                <View className='h-80 bg-white relative'>
                    {/* Placeholder for exercise image */}
                    {exercise?.image?.asset?._ref ? (
                        <Image
                            source={{ uri: urlFor(exercise.image?.asset?._ref).url() }}
                            className='h-full w-full'
                            resizeMode='contain'
                        />
                    ) : (
                        <View className='h-full w-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center'>
                            <Ionicons name="fitness" size={80} color="white" />
                        </View>
                    )}
                    {/* Gradient overlay */}
                    <View className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent' />
                </View>

                {/* Exercise Information */}
                <View className='px-6 py-6'>
                    {/* Name and Difficulty */}
                    <View className='flex-row items-start justify-between mb-4'>
                        <View className='flex-1 mr-4'>
                            <Text className='text-3xl font-bold text-gray-800 mb-2'>
                                {exercise.name || 'Exercise Name'}
                            </Text>
                            <View className={`self-start px-4 py-2 rounded-full ${getDifficultyColor(exercise.difficulty || '')}`}>
                                <Text className='text-white text-sm font-semibold'>
                                    {getDifficultyText(exercise.difficulty || '')}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {/* Description */}
                    <View className='mb-6'>
                        <Text className='text-xl font-semibold text-gray-800 mb-3'>
                            Description
                        </Text>
                        <Text className='text-gray-600 leading-6 text-base'>
                            {exercise.description || 'No description available for this exercise.'}
                        </Text>
                    </View>
                    {/* Video section */}
                    {exercise.videoUrl && (
                        <View className='mb-6'>
                            <Text className='text-xl font-semibold text-gray-800 mb-3'>
                                Video Tutorial
                            </Text>
                            <TouchableOpacity
                                className='bg-red-500 rounded-xl py-4 flex-row items-center'
                                onPress={() => {
                                    Linking.openURL(exercise.videoUrl!);
                                }}
                            >
                                <View className='w-12 h-12 bg-white rounded-full items-center justify-center mr-4 ml-4'>
                                    <Ionicons name="play" size={20} color="#EF4444" />
                                </View>
                                <View>
                                    <Text className='text-white font-semibold text-lg'>
                                        Watch Tutorial
                                    </Text>
                                    <Text className='text-red-100 text-sm'>
                                        Learn how to perform this exercise
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    {/* AI Guidance */}
                    {(aiGuidance || aiLoading) && (
                        <View className='mb-6'>
                            <View className='flex-row items-center mb-3'>
                                <Ionicons name="fitness" size={24} color="#3B82F6" />
                                <Text className='text-xl font-semibold text-gray-800 ml-2'>AI Coach says...</Text>
                            </View>
                            {aiLoading ? (
                                <View className='bg-gray-50 rounded-xl py-4 items-center'>
                                    <ActivityIndicator size="small" color="#3B82F6" />
                                    <Text className='text-gray-600 mt-2'>Generating personalized guidance...</Text>
                                </View>
                            ) : (
                                <View className='bg-blue-50 rounded-xl py-4 border-l-4 border-blue-500'>
                                    <Markdown
                                        style={{
                                            body: {
                                                paddingBottom: 20,
                                            },
                                            heading2: {
                                                fontSize: 18,
                                                fontWeight: 'bold',
                                                color: '#1f2937',
                                                marginBottom: 6,
                                                marginTop: 12,
                                            },
                                            heading3: {
                                                fontSize: 16,
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                marginBottom: 4,
                                                marginTop: 8,
                                            }
                                        }}
                                    >
                                        {aiGuidance}
                                    </Markdown>

                                </View>
                            )}
                        </View>
                    )}
                    {/* ------- */}

                    {/* Action Buttons */}
                    <View className='mt-8 gap-2'>
                        {/* AI Coach Button */}
                        <TouchableOpacity
                            className={`rounded-xl py-4 items-center ${aiLoading ? 'bg-gray-400' : aiGuidance ? 'bg-green-500' : 'bg-blue-500'}`}
                            onPress={getAiGuidance}
                            disabled={aiLoading}
                        >
                            {aiLoading ? (
                                <View className='flex-row items-center'>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text className='text-white font-bold text-lg ml-2'>
                                        Generating Guidance...
                                    </Text>
                                </View>
                            ) : (
                                <Text className='text-white font-bold text-lg'>
                                    {aiGuidance ? 'Refresh AI Guidance' : 'Get AI Guidance on Form & Technique'}
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className='bg-gray-200 rounded-xl py-4 items-center'
                        >
                            <Text className='text-gray-800 font-bold text-lg'>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ExerciseDetail;