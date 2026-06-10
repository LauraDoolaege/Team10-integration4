import Root from "./root.jsx";
import HomePage from "./routes/home.jsx";

import TripPage from "./routes/trip.jsx";
import {
  tripLoader,
  tripAction
} from "./routes/trip.data.js";

import Initiator from "./routes/initiator.jsx";
import {
  initiatorAction
} from "./routes/initiator.data.js";

import Coupon from "./routes/coupon.jsx";
import {
  couponLoader,
  couponAction
} from "./routes/coupon.data.js";

import Leaderboard from "./routes/leaderboard.jsx";
import {
  LeaderboardLoader
} from "./routes/leaderboard.data.js";

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