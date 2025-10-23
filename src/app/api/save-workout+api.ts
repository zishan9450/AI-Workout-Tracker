import { adminClient } from "@/lib/sanity/client";

export interface WorkoutData {
    userId: string;
    duration: number;
    date: string;
    _type: string;
    exercises: {
        _type: string;
        _key: string;
        exercise: {
            _type: string;
            _ref: string;
        };
        sets: {
            _type: string;
            _key: string;
            reps: number;
            weight: number;
            weightUnit: "lbs" | "kg";
        }[];
    }[];
}

export async function POST(request: Request) {
    const { workoutData }: { workoutData: WorkoutData } = await request.json();
    try {
        const result = await adminClient.create(workoutData);
        console.log("Workout saved successfully:", result);

        return Response.json({
            success: true,
            message: "Workout saved successfully",
            workoutId: result._id,
        });
    } catch (error) {
        console.error("Error saving workout:", error);
        return new Response(
            JSON.stringify({ error: "Error saving workout" }),
            { status: 500 }
        );
    }
}
