import Root from "./root.jsx";
import HomePage from "./routes/home.jsx";

import TripPage, {
  tripLoader,
  tripAction
} from "./routes/trip.jsx";

import Initiator, {
  initiatorAction
} from "./routes/initiator.jsx";

import Coupon, {
  couponLoader,
  couponAction
} from "./routes/coupon.jsx";

import Leaderboard, {
  LeaderboardLoader
} from "./routes/leaderboard.jsx";

export default [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "friend/:tripId",
        element: <TripPage />,
        loader: tripLoader,
        action: tripAction
      },
      {
        path: "initiator",
        element: <Initiator />,
        action: initiatorAction
      },
      {
        path: "coupon/:couponId",
        element: <Coupon />,
        loader: couponLoader,
        action: couponAction
      },
      {
        path: "leaderboard/:tripId",
        element: <Leaderboard />,
        loader: LeaderboardLoader
      }
    ]
  }
];