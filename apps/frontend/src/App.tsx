import { useRef, useEffect, useState, useMemo } from 'react'; // 1. Import useMemo
import { Map, Marker } from 'maplibre-gl';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';

// --- Styled Components ---
const MapWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`;

// 2. --- NEW: Styled Components for Filter Bar ---
const FilterBar = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px; // For shadow visibility
`;

const FilterChip = styled.button<{ $isActive: boolean }>`
  background: ${props => (props.$isActive ? '#333' : '#fff')};
  color: ${props => (props.$isActive ? '#fff' : '#333')};
  border: 1px solid ${props => (props.$isActive ? '#333' : '#ccc')};
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap; // Keep chip text on one line
  
  &:hover {
    background: #f0f0f0;
  }
`;

// --- Card Styled Components (no change) ---
const CardWrapper = styled.div<{ $isActive: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transform: translateY(${props => (props.$isActive ? '0%' : '100%')});
  transition: transform 0.3s ease-in-out;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

const CloseButton = styled.button`
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

// --- Type Definition (no change) ---
type StayCard = {
  id: string;
  name: string;
  type: string;
  geo_latitude: number;
  geo_longitude: number;
  location_tags: string[]; // e.g., ["NORTH_CLIFF"]
  traveler_tags: string[];
  price_band: string;
  amenities: string[];
  hero_photo: string | null;
};

// --- Card React Component (no change) ---
type StayCardProps = {
  stay: StayCard | null;
  onClose: () => void;
};

const StayCardComponent = ({ stay, onClose }: StayCardProps) => {
  return (
    <CardWrapper $isActive={!!stay}>
      {stay && (
        <>
          <CardHeader>
            <div>
              <h2>{stay.name}</h2>
              <p>{stay.location_tags.join(', ').replace('_', ' ')}</p>
            </div>
            <CloseButton onClick={onClose}>X</CloseButton>
          </CardHeader>

          {stay.hero_photo ? (
            <img 
              src={`https://via.placeholder.com/300x150.png?text=${stay.name.replace(' ', '+')}`} 
              alt={stay.name} 
              style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} 
            />
          ) : (
            <div style={{ width: '100%', height: '150px', background: '#f0f0f0', display: 'grid', placeItems: 'center', borderRadius: '8px' }}>No Image</div>
          )}

          <ActionButtons>
            <button>Call</button>
            <button>WhatsApp</button>
            <button>Navigate</button>
            <button>Details</button>
          </ActionButtons>
        </>
      )}
    </CardWrapper>
  );
};

// --- Main Map Component ---

// 3. Define our filter options
const locationTags = ['ALL', 'NORTH_CLIFF', 'SOUTH_CLIFF', 'NEAR_BEACH', 'TOWN_INLAND'];

const StaysMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [selectedStay, setSelectedStay] = useState<StayCard | null>(null);

  // 4. --- NEW: State for the active filter ---
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Data fetching hook
  const { data: staysData } = useQuery<StayCard[]>({
    queryKey: ['stays'],
    queryFn: () =>
      fetch('http://localhost:3000/stays').then((res) => res.json()),
  });

  // 5. --- NEW: Create a memoized list of filtered stays ---
  const filteredStays = useMemo(() => {
    if (!staysData) return []; // Return empty if data is not loaded
    if (locationFilter === 'ALL') return staysData; // Return all if 'ALL' is selected

    // Otherwise, filter the list
    return staysData.filter(stay => 
      stay.location_tags.includes(locationFilter)
    );
  }, [staysData, locationFilter]); // This recalculates when data or filter changes

  // Effect to initialize the map
  useEffect(() => {
    if (mapContainerRef.current && !map) {
      const newMap = new Map({
        container: mapContainerRef.current,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=2jz9YJtLmRvm5TOU1fCY', // <-- Don't forget your key!
        center: [76.71, 8.73], // Centered on Varkala
        zoom: 13,
      });
      newMap.on('click', () => {
        setSelectedStay(null);
      });
      setMap(newMap);
    }
  }, [mapContainerRef, map]);

  // 6. --- MODIFIED EFFECT TO ADD MARKERS ---
  // This effect now depends on 'filteredStays' instead of 'staysData'
  useEffect(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Make sure the map exists before trying to add markers
    if (map && filteredStays) {
      // 7. Loop over the 'filteredStays' list
      const newMarkers = filteredStays.map(stay => {
        const marker = new Marker()
          .setLngLat([stay.geo_longitude, stay.geo_latitude])
          .addTo(map);

        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedStay(stay);
          // 8. (Optional) Fly to the marker when clicked
          map.flyTo({ center: [stay.geo_longitude, stay.geo_latitude], zoom: 15 });
        });
        
        return marker;
      });
      markersRef.current = newMarkers;
    }
  }, [map, filteredStays]); // <-- This now re-runs when 'filteredStays' changes

  return (
    <MapWrapper>
      {/* 9. --- NEW: Render the Filter Bar --- */}
      <FilterBar>
        {locationTags.map(tag => (
          <FilterChip
            key={tag}
            $isActive={locationFilter === tag}
            onClick={() => {
              setLocationFilter(tag);
              setSelectedStay(null); // Close card when filter changes
            }}
          >
            {/* Format the text for display, e.g., NORTH_CLIFF -> North Cliff */}
            {tag.charAt(0) + tag.slice(1).toLowerCase().replace('_', ' ')}
          </FilterChip>
        ))}
      </FilterBar>

      <MapContainer ref={mapContainerRef} />
      
      <StayCardComponent 
        stay={selectedStay} 
        onClose={() => setSelectedStay(null)} 
      />
    </MapWrapper>
  );
};

// Main App component
function App() {
  return (
    <StaysMap />
  );
}

export default App;