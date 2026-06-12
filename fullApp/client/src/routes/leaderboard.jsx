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
        <div className="leaderboard-container">
            <h1>Leaderboard for trip to {leaderboard.trip.cafe}</h1>
            
            <ul className="leaderboard__list">
                {players.map((player, index) => (
                    <li key={player.playerId} className="leaderboard__player">
                        <div className="leaderboard__seperator">
                            <span className="leaderboard__rank">{index + 1}</span>
                            <span className="leaderboard__username">{player.username}</span>
                        </div>
                        <span className="leaderboard__score">{player.score}</span>
                        <img
                            src={player.image}
                            alt={`${player.username}'s profile`}
                            className="leaderboard__image"
                        />
                    </li>
                ))}
            </ul>

            {initiatorPage && (
                <div className="leaderboard__share">
                    <a href={url}>{url}</a>
                    <button onClick={handleShare} className="button-primary">
                        Share
                    </button>
                </div>
            )}
        </div>
    );
}