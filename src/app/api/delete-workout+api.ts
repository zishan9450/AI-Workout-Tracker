import { adminClient } from "@/lib/sanity/client";

export async function POST(request: Request) {
    const { workoutId }: { workoutId: string } = await request.json();
    if (!workoutId) {
        return new Response("Missing workoutId", { status: 400 });
    }
    try {
        await adminClient.delete(workoutId as string);
        console.log("Workout deleted successfully", workoutId);
        return Response.json({ message: "Workout deleted successfully", success: true });
    } catch (error) {
        console.error("Error deleting workout:", error);
        return Response.json({ message: "Error deleting workout", success: false }, { status: 500 });
    }
}