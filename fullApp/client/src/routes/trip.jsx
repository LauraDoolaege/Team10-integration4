import { useLoaderData, useActionData } from "react-router-dom";
import TripForm from "../components/tripForm";

export default function Trip() {
  const { receivedTrip, playerId, allTrips } = useLoaderData();
  console.log("all trips:", { allTrips });
  console.log("Loader data:", { receivedTrip });
  const actionData = useActionData();


  return (
    <>
        <TripForm  receivedTrip={receivedTrip} playerId={playerId} actionData={actionData} />
    </>

  );
}