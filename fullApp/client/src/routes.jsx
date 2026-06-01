import HomePage from "./routes/home.jsx";
import TripsPage from "./routes/trips.jsx";
import TripPage from "./routes/trip.jsx";
import Initiator, { clientAction } from "./routes/initiator.jsx";

export default [
  { index: true, element: <HomePage /> },
  { path: "trips", element: <TripsPage /> },
  { path: "friend/:tripId", element: <TripPage /> },
  { path: "initiator", element: <Initiator />, action: clientAction }
];