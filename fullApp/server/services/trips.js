const API_BASE_URL = process.env.API_BASE_URL;
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

//redeem Coupon
const redeemCoupon = async (couponId) => {
    await db.query(
        `
        UPDATE coupons
        SET status = 'redeemed'
        WHERE id = ?
        `,
        [couponId]
    );
};

const getCoupon = async (couponId) => {
    const [couponRows] = await db.query(
        `SELECT * FROM coupons WHERE id = ?`,
        [couponId]
    );

    const coupon = couponRows[0];
    const tripId = coupon.trip_id;

    const [tripRows] = await db.query(
        `
        SELECT 
            t.*,
            c.name AS cafe_name,
            c.location,
            c.description
        FROM trips t
        JOIN cafes c ON c.id = t.cafe_id
        WHERE t.id = ?
        `,
        [tripId]
    );

    if (tripRows.length === 0) {
        throw new Error("Trip not found");
    }

    const trip = tripRows[0];

    return {
        ...coupon,
        trip: {
            ...trip,
            cafe: {
                id: trip.cafe_id,
                name: trip.cafe_name,
                location: trip.location,
                description: trip.description,
            },
        },
    };
};

async function createCoupon(couponId, tripId) {
    await db.query(
        `
    INSERT IGNORE INTO coupons (id, trip_id)
    VALUES (?, ?)
    `,
        [couponId, tripId]
    );
}

async function getHighestTripScore(tripId) {
    //fetch player with hgihest score and fastest response time as tiebreaker.
    const [rows] = await db.query(
        `
    SELECT player_id, email, username, score, created_at
    FROM trip_players
    WHERE trip_id = ?
    ORDER BY score DESC, created_at ASC
    LIMIT 1
    `,
        [tripId]
    );

    return rows[0] || null;
}


async function addPlayerToTrip(playerId, tripId, email = "", username = "", score = 10, image = null) {
    // Insert the player into the trip_players table if they are not already linked to this trip, while storing their email, username, starting score, and captured image.
    await db.query(
        `
    INSERT IGNORE INTO trip_players (trip_id, player_id, email, username, score, image)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
        [tripId, playerId, email, username, score, image]
    );
}


async function checkVoted(playerId, tripId) {
    // Check whether this player already exists in trip_voters for the given trip so the app can prevent duplicate voting.
    const [rows] = await db.query(
        `
    SELECT 1
    FROM trip_voters
    WHERE trip_id = ? AND player_id = ?
    LIMIT 1
    `,
        [tripId, playerId]
    );


    return rows.length > 0;
}


async function placeVote(playerId, tripId, selectedDates = []) {
    for (const date of selectedDates) {
        // Insert one vote row into the votes table for the current trip, player, and selected date.
        await db.query(
            `
      INSERT INTO votes (trip_id, player_id, date)
      VALUES (?, ?, ?)
      `,
            [tripId, playerId, date]
        );
    }
}


async function setAsVoter(playerId, tripId) {
    // Mark this player as someone who has voted in the trip by inserting them into trip_voters.
    await db.query(
        `
    INSERT INTO trip_voters (trip_id, player_id)
    VALUES (?, ?)
    `,
        [tripId, playerId]
    );
}


async function getVoterAmount(tripId) {
    // Count how many players have been registered as voters for this trip in the trip_voters table.
    const [rows] = await db.query(
        `
    SELECT COUNT(*) AS count
    FROM trip_voters
    WHERE trip_id = ?
    `,
        [tripId]
    );


    return rows[0].count;
}


async function closeTrip(tripId) {
    // Update the matching trip row and set its status to closed.
    await db.query(
        `
    UPDATE trips
    SET status = 'closed'
    WHERE id = ?
    `,
        [tripId]
    );
}


async function getPlayersDetailsByTripId(tripId) {
    // Fetch all players attached to this trip, returning their player id, email, username, and score from trip_players.
    const [rows] = await db.query(
        `
    SELECT tp.player_id AS id, tp.email, tp.username, tp.score
    FROM trip_players tp
    WHERE tp.trip_id = ?
    `,
        [tripId]
    );


    return rows;
}


async function getDateVotesByTripId(tripId) {
    // Fetch every recorded vote for this trip so the results can be grouped by date in application code.
    const [rows] = await db.query(
        `
    SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, player_id
    FROM votes
    WHERE trip_id = ?
    `,
        [tripId]
    );


    const votes = {};


    for (const row of rows) {
        if (!votes[row.date]) votes[row.date] = [];
        votes[row.date].push(row.player_id);
    }


    return votes;
}


const getAllTrips = async () => {
    try {
        // Fetch every trip row from the trips table.
        const [trip] = await db.query(`SELECT * FROM trips`);
        return trip;
    } catch (error) {
        console.error("Error fetching trips:", error);
        throw error;
    }
};
/** 
 * TRIPS CRUD Operations
 */


// Get all trips
// const getAllTrips = async () => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/trips`);
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching trips:', error);
//         throw error;
//     }
// };


// Get a single trip by ID
const getTripById = async (tripId, playerId) => {
    try {
        // 1. Get trip + cafe
        // Fetch the trip by id and join its related cafe details so the response includes both trip data and cafe metadata.
        const [tripRows] = await db.query(
            `
      SELECT 
        t.*,
        c.name AS cafe_name,
        c.location,
        c.description
      FROM trips t
      JOIN cafes c ON c.id = t.cafe_id
      WHERE t.id = ?
      `,
            [tripId]
        );


        if (tripRows.length === 0) {
            throw new Error("Trip not found");
        }


        const trip = tripRows[0];


        // 2. Get players in trip
        // Fetch all players linked to this trip from trip_players so they can be included in the trip payload.
        const [players] = await db.query(
            `
      SELECT 
        tp.player_id AS playerId,
        tp.email,
        tp.username,
        tp.score
      FROM trip_players tp
      WHERE tp.trip_id = ?
      `,
            [tripId]
        );


        // 3. Get ALL possible dates (structure source of truth)
        // Fetch all possible trip dates from trip_dates and format them as YYYY-MM-DD strings.
        const [dateRows] = await db.query(
            `
 SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date
FROM trip_dates
WHERE trip_id = ?
      `,
            [tripId]
        );


        // 4. Get votes (actual data)
        // Fetch all submitted votes for this trip so they can be mapped by date.
        const [voteRows] = await db.query(
            `
      SELECT player_id, DATE_FORMAT(date, '%Y-%m-%d') AS date
      FROM votes
      WHERE trip_id = ?
      `,
            [tripId]
        );


        // 5. Build votes object (EVERY date must exist)
        const votes = {};


        for (const d of dateRows) {
            votes[d.date] = [];
        }


        for (const v of voteRows) {
            if (!votes[v.date]) votes[v.date] = [];
            votes[v.date].push(v.player_id);
        }


        // 6. Check if user already voted (trip_voters)
        // Check whether the current player already appears in trip_voters for this trip.
        const [voterRows] = await db.query(
            `
      SELECT 1
      FROM trip_voters
      WHERE trip_id = ? AND player_id = ?
      LIMIT 1
      `,
            [tripId, playerId]
        );


        const alreadyVoted = voterRows.length > 0;


        // 7. Return fully hydrated object
        return {
            alreadyVoted,


            trip: {
                ...trip,


                cafe: {
                    id: trip.cafe_id,
                    name: trip.cafe_name,
                    location: trip.location,
                    description: trip.description,
                },


                players,
                possibleDates: dateRows.map(d => d.date),
                votes,
            },
        };
    } catch (error) {
        console.error("Error in getTripById:", error);
        throw error;
    }
};
// const getTripById = async (tripId) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);
//         if (!response.ok) throw new Error('Trip not found');
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching trip:', error);
//         throw error;
//     }
// };


// Create a new trip


const createTrip = async (tripData) => {
    const moods = [
        "Beer & Banter",
        "Cocktails, darling",
        "Mocktails & chill",
        "Wine & refined",
    ];


    try {
        // 1. Resolve mood
        let finalMood = tripData.mood;


        if (finalMood === "random") {
            finalMood = moods[Math.floor(Math.random() * moods.length)];
        }


        // 2. Pick random cafe based on mood
        // Select one random cafe id whose mood matches the resolved trip mood.
        const [cafes] = await db.query(
            `
      SELECT id
      FROM cafes
      WHERE mood = ?
      ORDER BY RAND()
      LIMIT 1
      `,
            [finalMood]
        );


        if (cafes.length === 0) {
            throw new Error(`No cafes found for mood: ${finalMood}`);
        }


        const cafeId = cafes[0].id;


        // 3. Insert trip
        // Insert the new trip into the trips table with its selected cafe and core trip settings.
        await db.query(
            `
      INSERT INTO trips (
        id,
        initiator_id,
        cafe_id,
        budget,
        mood,
        expected_players,
        created_at,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
            [
                tripData.id,
                tripData.initiatorId,
                cafeId,
                tripData.budget,
                finalMood,
                tripData.expectedPlayers,
                tripData.createdAt,
                tripData.status,
            ]
        );


        // 5. Add creator to trip
        const creator = (tripData.players && tripData.players[0]) || {};
        const initiatorEmail = creator.email || tripData.email || ""; //We look for the nested player email first. If it isn't there, we look for the root-level email
        const initiatorUsername = creator.username || tripData.username || "";
        const initiatorScore = creator.score || tripData.score || "";


        // Insert the trip creator into trip_players so they are registered as a participant in the new trip.
        await db.query(
            `
      INSERT INTO trip_players (
        trip_id,
        player_id,
        email,
        username,
        score,
        image
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
            [
                tripData.id,
                tripData.initiatorId,
                initiatorEmail,
                initiatorUsername,
                initiatorScore,
                tripData.image
            ]
        );


        // Insert the trip creator into trip_voters so they count as an initial voter for the trip.
        await db.query(
            `
            INSERT INTO trip_voters (
              trip_id,
              player_id
            )
            VALUES (?, ?)
            `,
            [tripData.id, tripData.initiatorId]
        );




        // 6. Insert dates
        for (const date of tripData.possibleDates) {
            // Insert one possible date for the trip into trip_dates.
            await db.query(
                `
        INSERT INTO trip_dates (
          trip_id,
          date
        )
        VALUES (?, ?)
        `,
                [tripData.id, date]
            );
        }


        return {
            ...tripData,
            mood: finalMood,
            cafeId,
        };
    } catch (error) {
        console.error("Error creating trip:", error);
        throw error;
    }
};


// const createTrip = async (tripData) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/trips`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(tripData)
//         });
//         return await response.json();
//     } catch (error) {
//         console.error('Error creating trip:', error);
//         throw error;
//     }
// };


// Update a trip
const updateTrip = async (tripId, tripData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
};


// Delete a trip
const deleteTrip = async (tripId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            method: 'DELETE'
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
    }
};


// Get leaderboard for a trip (sorted by score)
const getLeaderboard = async (tripId) => {
    try {
        const players = await getPlayersDetailsByTripId(tripId);
        return players.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
};




//AI generated function to determine finale date based on votes and tie breaking rules
const getFinalDate = (trip) => {
    const { votes = {}, possibleDates = [] } = trip;


    let highestCount = -1;
    let candidates = [];


    possibleDates.forEach((date) => {
        const count = (votes[date] || []).length;


        if (count > highestCount) {
            highestCount = count;
            candidates = [date];
        } else if (count === highestCount) {
            candidates.push(date);
        }
    });


    if (candidates.length === 1) return candidates[0];


    const today = new Date();


    let closestDate = candidates[0];
    let smallestDiff = Infinity;


    candidates.forEach((date) => {
        const diff = Math.abs(new Date(date) - today);


        if (diff < smallestDiff) {
            smallestDiff = diff;
            closestDate = date;
        }
    });


    return closestDate;
};



module.exports = {
    getCoupon, 
    redeemCoupon,
    createCoupon,
    getFinalDate,
    getAllTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    getLeaderboard,
    addPlayerToTrip,
    checkVoted,
    placeVote,
    setAsVoter,
    getVoterAmount,
    closeTrip,
    getPlayersDetailsByTripId,
    getDateVotesByTripId,
    getHighestTripScore,
};