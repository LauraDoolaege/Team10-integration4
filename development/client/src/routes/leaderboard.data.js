import { getLeaderboard, endTrip, getTrip} from "../services/services";
import { redirect } from "react-router";

export async function LeaderboardLoader({ params }) {
    const tripId = params.tripId;

    let playerId = localStorage.getItem("playerId");
    if (!playerId) {
        playerId = crypto.randomUUID();
        localStorage.setItem("playerId", playerId);
    }

    const receivedTrip = await getTrip(tripId, playerId);

    if (receivedTrip?.closed) {
        return redirect(`/error/closed`);
    }

    const leaderboard = await getLeaderboard(tripId);
    return { tripId, leaderboard };
}

export async function LeaderboardAction({ params }) {
    const tripId = params.tripId;
    await endTrip(tripId);
    return redirect(`/error/closed`);
}
