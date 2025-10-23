/*
 * Formats a duration in seconds into a human-readable string.
 * @param seconds The duration in seconds.
 * @returns A formatted duration string.
 */
export const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds} s`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        if (remainingSeconds > 0) {
            return `${hours} h ${minutes} m ${remainingSeconds} s`;
        } else if (minutes > 0) {
            return `${hours} h ${minutes} m`;
        } else {
            return `${hours} h`;
        }
    } else {
        if (remainingSeconds > 0) {
            return `${minutes} m ${remainingSeconds} s`;
        } else {
            return `${minutes} m`;
        }
    }
};