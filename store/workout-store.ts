import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'https';

export interface WorkoutSet {
    id: string;
    reps: string;
    weight: string;
    weightUnit: "kg" | "lbs";
    isCompleted: boolean;
}

interface WorkoutExercise {
    id: string;
    sanityId: string; // Store the Sanity _id
    name: string;
    sets: WorkoutSet[];
}

interface WorkoutStore {
    // These are the state variables
    workoutExercises: WorkoutExercise[];
    weightUnit: "kg" | "lbs";

    // These are the actions to modify the state
    addExerciseToWorkout: (exercise: { name: string; sanityId: string }) => void;
    setWorkoutExercises: (exercises: WorkoutExercise[] | ((prev: WorkoutExercise[]) => WorkoutExercise[])) => void;
    setWeightUnit: (unit: "kg" | "lbs") => void;
    resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
    persist(
        (set) => ({
            workoutExercises: [],
            weightUnit: "lbs",

            addExerciseToWorkout: (exercise) => set((state) => {
                // Check if the exercise already exists in the workout
                const newExercise: WorkoutExercise = {
                    id: Math.random().toString(),// simple unique id
                    sanityId: exercise.sanityId,
                    name: exercise.name,
                    sets: []
                };
                return {
                    workoutExercises: [...state.workoutExercises, newExercise]
                };
            }),
            setWorkoutExercises: (exercises) => set((state) => ({
                workoutExercises: typeof exercises === 'function' ? exercises(state.workoutExercises) : exercises,
            })),
            setWeightUnit: (unit) => set({ weightUnit: unit }),
            resetWorkout: () => set({ workoutExercises: [], })
        }),
        {
            name: 'workout-store',
            storage: createJSONStorage(() => AsyncStorage),
            // selects the partial state to persist
            partialize: (state) => ({ weightUnit: state.weightUnit })
        }
    )
);