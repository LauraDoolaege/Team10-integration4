import { useLoaderData } from "react-router";

export default function Leaderboard() {
    const {tripId, leaderboard} = useLoaderData();
    const players = leaderboard.players;
    const initiatorPage = leaderboard.trip.initiatorId === localStorage.getItem("playerId");
    const url = `${window.location.origin}/friend/${tripId}`


    async function handleShare() {
        if (!url) return;

        await navigator.share({
            title: "Hey, come and compete for a drink!",
            text: "Let's all meet up and compete for a drink.",
            url: url,
        });
    }


    return (
        <>

        <h1>Leaderboard for trip to {leaderboard.trip.cafe}</h1>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Score</th>
                    <th>Photo</th>
                </tr>
            </thead>

            <tbody>
                {players.map((player, index) => (
                    <tr key={player.playerId}>
                        <td>{index + 1}</td>
                        <td>{player.username}</td>
                        <td>{player.score}</td>
                        <td>
                            <img
                                src={player.image}
                                alt={`${player.username}'s profile`}
                                width={50}
                                height={50}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {initiatorPage &&(
         <>
          <a href={url}>{url}</a>
          <button onClick={handleShare}>
            Share
          </button>
          </>
        )}
        </>
    );
}