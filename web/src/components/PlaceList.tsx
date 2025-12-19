import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the shape of our API response (GeoJSON)
type Place = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [Lon, Lat]
  };
  properties: {
    id: string;
    name: string;
    category: string;
    description: {
      String: string;
      Valid: boolean;
    };
  };
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Place[];
};

const fetchPlaces = async (lat: number, lng: number) => {
  const { data } = await axios.get<FeatureCollection>(`/api/places`, {
    params: { lat, long: lng },
  });
  return data;
};

export default function PlaceList() {
  const center = { lat: 38.722, lng: -9.139 };

  const { data, isLoading, error } = useQuery({
    queryKey: ["places", center.lat, center.lng],
    queryFn: () => fetchPlaces(center.lat, center.lng),
  });

  if (isLoading) return <div>Loading places...</div>;
  if (error) return <div>Error loading places</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Nearby Places</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
            <th style={tableHeaderStyle}>Name</th>
            <th style={tableHeaderStyle}>Category</th>
            <th style={tableHeaderStyle}>Description</th>
            <th style={tableHeaderStyle}>Coordinates (Lat, Lon)</th>
          </tr>
        </thead>
        <tbody>
          {data?.features.map((place) => (
            <tr
              key={place.properties.id}
              style={{ borderBottom: "1px solid #ddd" }}
            >
              <td>{place.properties.name}</td>
              <td>{place.properties.category}</td>
              <td>{place.properties.description.String}</td>
              <td>
                {place.geometry.coordinates[1].toFixed(4)},{" "}
                {place.geometry.coordinates[0].toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data?.features.length === 0 && <p>No places found in this area.</p>}
    </div>
  );
}

// Simple inline styles for clarity
const tableHeaderStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "2px solid #ccc",
};
