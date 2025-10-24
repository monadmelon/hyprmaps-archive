import { useRef, useEffect, useState, useMemo } from 'react';
import { Map, Marker } from 'maplibre-gl';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { Routes, Route, Link, useParams } from 'react-router-dom';

// --- Styled Components (Mostly Unchanged) ---
// ... (MapWrapper, MapContainer, FilterBar, FilterChip, CardWrapper, etc. - no changes needed) ...
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
const FilterBar = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
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
  white-space: nowrap;
`;
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
  flex-wrap: wrap; // Allow buttons to wrap on small screens
`;
// Add simple styling for buttons
const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Detail Page Styled Components (no change)
// ... (DetailPageWrapper, DetailHeader, PhotoGallery, Photo, DetailSection, Checklist) ...
const DetailPageWrapper = styled.div`
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
`;
const DetailHeader = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
`;
const PhotoGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
`;
const Photo = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
`;
const DetailSection = styled.div`
  margin-bottom: 16px;
  h3 {
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
  }
`;
const Checklist = styled.ul`
  list-style: none;
  padding: 0;
  li {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
  li::before {
    content: '✓'; // You can replace with an icon
    color: green;
    margin-right: 8px;
    font-weight: bold;
  }
`;

// --- Type Definitions ---
// 1. UPDATE StayCard type
type StayCard = {
  id: string;
  name: string;
  type: string;
  geo_latitude: number;
  geo_longitude: number;
  location_tags: string[];
  traveler_tags: string[];
  price_band: string;
  amenities: string[];
  phone: string | null; // <-- ADDED
  whatsapp: string | null; // <-- ADDED
  hero_photo: string | null;
};

// Full StayDetail type (no change)
type Photo = { id: string; url: string; caption: string | null; };
type StayDetail = StayCard & { // Inherits from StayCard now
  description: string;
  price_range_low: string | null;
  price_range_high: string | null;
  cleanliness_level: string | null;
  noise_level: string | null;
  wifi_speed_mbps: number | null;
  wifi_reliability: string | null;
  kitchen_quality: string | null;
  real_cooking_flag: boolean;
  laundry_machine: boolean;
  google_review_rating: number | null;
  google_review_count: number | null;
  photos: Photo[];
};

// 2. --- NEW: Helper Functions for Actions ---
const handleCall = (phoneNumber: string | null | undefined) => {
  if (phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
  } else {
    alert('Phone number not available.');
  }
};

const handleWhatsApp = (whatsappNumber: string | null | undefined) => {
  if (whatsappNumber) {
    // Basic format check (remove '+' if present for the API)
    const number = whatsappNumber.startsWith('+') ? whatsappNumber.substring(1) : whatsappNumber;
    window.open(`https://wa.me/${number}`, '_blank');
  } else {
    alert('WhatsApp number not available.');
  }
};

const handleNavigate = (lat: number, lon: number) => {
  // Opens Google Maps in a new tab
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank');
};


// --- Card React Component (Updated) ---
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
          {/* 3. Use ActionButton and wire up onClick handlers */}
          <ActionButtons>
            <ActionButton onClick={() => handleCall(stay.phone)} disabled={!stay.phone}>Call</ActionButton>
            <ActionButton onClick={() => handleWhatsApp(stay.whatsapp)} disabled={!stay.whatsapp}>WhatsApp</ActionButton>
            <ActionButton onClick={() => handleNavigate(stay.geo_latitude, stay.geo_longitude)}>Navigate</ActionButton>
            <Link to={`/stay/${stay.id}`}>
              <ActionButton>Details</ActionButton>
            </Link>
          </ActionButtons>
        </>
      )}
    </CardWrapper>
  );
};

// --- Filter constants (no change) ---
const locationTags = ['ALL', 'NORTH_CLIFF', 'SOUTH_CLIFF', 'NEAR_BEACH', 'TOWN_INLAND'];

// --- MapLayout Component (no change) ---
// ... (no changes needed inside MapLayout) ...
const MapLayout = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [selectedStay, setSelectedStay] = useState<StayCard | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  const { data: staysData } = useQuery<StayCard[]>({
    queryKey: ['stays'],
    queryFn: () =>
      fetch('http://localhost:3000/stays').then((res) => res.json()),
  });

  const filteredStays = useMemo(() => {
    if (!staysData) return [];
    if (locationFilter === 'ALL') return staysData;
    return staysData.filter(stay => 
      stay.location_tags.includes(locationFilter)
    );
  }, [staysData, locationFilter]);

  useEffect(() => {
    if (mapContainerRef.current && !map) {
      const newMap = new Map({
        container: mapContainerRef.current,
        style: 'https://api.maptiler.com/maps/streets/style.json?key=2jz9YJtLmRvm5TOU1fCY', // <-- Don't forget your key!
        center: [76.71, 8.73],
        zoom: 13,
      });
      newMap.on('click', () => {
        setSelectedStay(null);
      });
      setMap(newMap);
    }
  }, [mapContainerRef, map]);

  useEffect(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (map && filteredStays) {
      const newMarkers = filteredStays.map(stay => {
        const marker = new Marker()
          .setLngLat([stay.geo_longitude, stay.geo_latitude])
          .addTo(map);

        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedStay(stay);
          map.flyTo({ center: [stay.geo_longitude, stay.geo_latitude], zoom: 15 });
        });
        
        return marker;
      });
      markersRef.current = newMarkers;
    }
  }, [map, filteredStays]);

  return (
    <MapWrapper>
      <FilterBar>
        {locationTags.map(tag => (
          <FilterChip
            key={tag}
            $isActive={locationFilter === tag}
            onClick={() => {
              setLocationFilter(tag);
              setSelectedStay(null);
            }}
          >
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
}

// --- StayDetailPage Component (Updated) ---
const StayDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  // Use the FULL StayDetail type here
  const { isLoading, error, data: stay } = useQuery<StayDetail>({
    queryKey: ['stay', id],
    queryFn: () =>
      fetch(`http://localhost:3000/stays/${id}`).then((res) => {
        if (!res.ok) {
          throw new Error('Stay not found');
        }
        return res.json();
      }),
  });

  if (isLoading) return <DetailPageWrapper><p>Loading details...</p></DetailPageWrapper>;
  // Handle specific 404 error from fetch
  if (error && (error as Error).message === 'Stay not found') {
     return <DetailPageWrapper><p>Stay not found.</p><Link to="/">Back to Map</Link></DetailPageWrapper>;
  }
  if (error) return <DetailPageWrapper><p>Error: {(error as Error).message}</p><Link to="/">Back to Map</Link></DetailPageWrapper>;
  if (!stay) return <DetailPageWrapper><p>Stay could not be loaded.</p><Link to="/">Back to Map</Link></DetailPageWrapper>;


  return (
    <DetailPageWrapper>
      <Link to="/">&larr; Back to Map</Link>
      
      <DetailHeader>
        <h1>{stay.name}</h1>
        <p><strong>{stay.type.replace('_', ' ')}</strong> &bull; {stay.location_tags.join(', ').replace('_', ' ')}</p>
        <p>
          {stay.google_review_rating} ★ ({stay.google_review_count} Google Reviews)
        </p>
        {/* 4. Add Action Buttons to Detail Page */}
        <ActionButtons style={{ marginTop: '16px' }}>
            <ActionButton onClick={() => handleCall(stay.phone)} disabled={!stay.phone}>Call</ActionButton>
            <ActionButton onClick={() => handleWhatsApp(stay.whatsapp)} disabled={!stay.whatsapp}>WhatsApp</ActionButton>
            <ActionButton onClick={() => handleNavigate(stay.geo_latitude, stay.geo_longitude)}>Navigate</ActionButton>
        </ActionButtons>
      </DetailHeader>

      <PhotoGallery>
        {stay.photos.map(photo => (
          <Photo 
            key={photo.id} 
            // Use placeholder for now
            src={`https://via.placeholder.com/300x150.png?text=${photo.caption || 'Stay Photo'}`} 
            alt={photo.caption || 'Photo of ' + stay.name} 
          />
        ))}
        {/* Add a fallback if there are no photos */}
        {stay.photos.length === 0 && <p>No photos available.</p>}
      </PhotoGallery>

      <DetailSection>
        <h3>Overview</h3>
        <p>{stay.description}</p>
      </DetailSection>

      <DetailSection>
        <h3>Core Amenities</h3>
        <Checklist>
          {stay.amenities.map(item => (
            <li key={item}>{item.replace('_', ' ')}</li>
          ))}
          {stay.amenities.length === 0 && <li>No listed amenities.</li>}
        </Checklist>
      </DetailSection>

      <DetailSection>
        <h3>Long-Term & Quality</h3>
        <Checklist>
          {/* We use conditional rendering based on our mock data */}
          {stay.noise_level && <li>Noise: {stay.noise_level}</li>}
          {stay.wifi_reliability && <li>WiFi: {stay.wifi_reliability}</li>}
          {stay.kitchen_quality && <li>Kitchen: {stay.kitchen_quality.replace('_', ' ')}</li>}
          {stay.laundry_machine && <li>Washing Machine</li>}
          {/* Add more checks here as needed */}
          {!stay.noise_level && !stay.wifi_reliability && !stay.kitchen_quality && !stay.laundry_machine && <li>No specific quality details available.</li>}
        </Checklist>
      </DetailSection>

    </DetailPageWrapper>
  );
};

// --- App component (no change) ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<MapLayout />} />
      <Route path="/stay/:id" element={<StayDetailPage />} />
    </Routes>
  );
}

export default App;