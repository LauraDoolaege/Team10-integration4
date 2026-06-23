import { useLoaderData, useActionData } from "react-router-dom";
import { useState } from "react";
import TripForm from "../components/tripForm";
import TripOnboarding from "../components/tripOnboarding";

export default function Trip() {
  const { receivedTrip, playerId, allTrips } = useLoaderData();
  console.log("all trips:", { allTrips });
  console.log("Loader data:", { receivedTrip });
  const actionData = useActionData();
  const [tripState, setTripState] = useState(0);


  return (
    <> 
      {tripState === 0 && (
        <TripOnboarding setTripState={setTripState}/>
      )}

      {tripState === 1 && (
        <TripForm  receivedTrip={receivedTrip} playerId={playerId} actionData={actionData} />
      )}
    </>

  );
}