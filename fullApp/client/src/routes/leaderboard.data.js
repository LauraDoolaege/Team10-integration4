import { getLeaderboard } from "../services/services";

export async function LeaderboardLoader({ params }) {
    const tripId = params.tripId;
    const leaderboard = await getLeaderboard(tripId);
    return { tripId, leaderboard };
}
