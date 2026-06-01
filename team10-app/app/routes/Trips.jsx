import { useLoaderData } from 'react-router-dom';

export async function loader() {
  // TODO: Fetch trips from API
  return { trips: [] };
}

export default function Trips() {
  const { trips } = useLoaderData();

  return (
    <div>
      <h1>Trips</h1>
      <p>Total trips: {trips.length}</p>
      {/* TODO: Render trip list */}
    </div>
  );
}
