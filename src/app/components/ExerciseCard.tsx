import { View, Text, TouchableOpacity, Image } from 'react-native'
import type { ExercisesQueryResult } from '@/lib/sanity/types'
import { urlFor } from '@/lib/sanity/client';
import { Ionicons } from '@expo/vector-icons';

// Extract the single exercise type from the query result
type ExerciseItem = ExercisesQueryResult[0]

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

interface ExerciseCardProps {
    item: ExerciseItem;
    onPress: () => void;
    showChevron?: boolean;
}


const ExerciseCard = ({ item, onPress, showChevron = false }: ExerciseCardProps) => {
    return (
        <TouchableOpacity onPress={onPress} className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row p-6">
                <View className="w-20 h-20 bg-white rounded-xl mr-4 overflow-hidden">
                    {item.image ? (
                        <Image
                            source={{ uri: urlFor(item.image?.asset?._ref).url() }}
                            className='w-full h-full'
                            resizeMode='contain'
                        />
                    ) : (
                        <View className="w-full h-full bg-gradient-to-br from-blue-400">
                            <Ionicons name="fitness" size={24} color="white" />
                        </View>
                    )}
                </View>
                <View className='flex-1 justify-between'>
                    <View>
                        <Text className="text-lg font-semibold text-gray-900 mb-1">
                            {item.name}
                        </Text>
                        <Text className='text-sm text-gray-600 mb-2' numberOfLines={2}>
                            {item.description || 'No description available.'}
                        </Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <View className={`px-3 py-1 rounded-full ${getDifficultyColor(item.difficulty || '')} self-start`}>
                            <Text className='text-white text-xs font-semibold'>
                                {getDifficultyText(item.difficulty || '')}
                            </Text>
                        </View>
                        {showChevron && (
                            <TouchableOpacity className='p-2'>
                                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ExerciseCard