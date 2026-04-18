import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Rectangle, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers issue in React
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

const indiaCenter = [20.5937, 78.9629];

// Refined Mainland India Boundary (approximate polygon)
const indiaMainland = [
  [35.5, 74.5], [37.0, 76.0], [34.5, 77.5], [31.5, 79.0], [29.5, 80.5], 
  [27.5, 84.5], [27.0, 88.5], [28.5, 95.5], [26.5, 97.0], [24.5, 94.5], 
  [22.5, 91.5], [20.5, 92.5], [22.0, 88.5], [19.0, 84.5], [15.0, 82.5], 
  [12.0, 80.5], [8.0, 77.5], [10.0, 76.5], [15.5, 73.5], [20.0, 72.5], 
  [23.5, 68.5], [25.0, 71.5], [28.0, 70.5], [33.0, 73.5], [35.5, 74.5]
];

// Ray casting algorithm for point-in-polygon check
const isInsideIndia = (lat, lng) => {
  let inside = false;
  for (let i = 0, j = indiaMainland.length - 1; i < indiaMainland.length; j = i++) {
    const [latI, lngI] = indiaMainland[i];
    const [latJ, lngJ] = indiaMainland[j];
    const intersect = ((lngI > lng) !== (lngJ > lng)) &&
      (lat < (latJ - latI) * (lng - lngI) / (lngJ - lngI) + latI);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Generate Dynamic Red Zones to cover ~45% of India
const generatePublicReserves = () => {
  const reserves = [];
  const startLat = 8, endLat = 37.5;
  const startLng = 68, endLng = 97.5;
  const step = 0.45; // significantly smaller boxes
  
  for (let lat = startLat; lat < endLat; lat += step) {
    for (let lng = startLng; lng < endLng; lng += step) {
      // Check if the block center is within India's mainland
      if (isInsideIndia(lat + step/2, lng + step/2)) {
        // Pseudo-random selection for ~45% coverage
        if ((Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1 > 0.55) {
          reserves.push([[lat, lng], [lat + step, lng + step]]);
        }
      }
    }
  }
  return reserves;
};

const publicReserves = generatePublicReserves();

const MapEvents = ({ onPlotClick }) => {
  useMapEvents({
    click(e) {
      // Create a small 0.05x0.05 degree block from the clicked coordinate
      const size = 0.05;
      const lat = parseFloat(e.latlng.lat.toFixed(2));
      const lng = parseFloat(e.latlng.lng.toFixed(2));
      
      const bounds = [
        [lat, lng],
        [lat + size, lng + size]
      ];
      
      const propertyID = `PLOT-${lat.toString().replace('.','_')}-${lng.toString().replace('.','_')}`;
      
      onPlotClick(propertyID, bounds, lat, lng);
    },
  });
  return null;
};

const MapSelection = () => {
  const [publicLands, setPublicLands] = useState([]);
  const [forSaleLands, setForSaleLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllLands = async () => {
      try {
        const { data } = await axios.get('/api/land/all-public');
        // Extract those that are taken/private
        const privatePlots = data.filter(l => !l.isForSale).map(l => l.propertyID);
        const salePlots = data.filter(l => l.isForSale).map(l => ({ id: l.propertyID, price: l.price }));
        
        setPublicLands(privatePlots);
        setForSaleLands(salePlots);
      } catch (err) {
        console.error("Failed to fetch lands", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLands();
  }, []);

  const handlePlotClick = async (propertyID, bounds, clickLat, clickLng) => {
    // Check if within Government Reserve (Red Zone)
    const isPublic = publicReserves.some(res => {
      const [[bLat1, bLng1], [bLat2, bLng2]] = res;
      return clickLat >= Math.min(bLat1, bLat2) && clickLat <= Math.max(bLat1, bLat2) &&
             clickLng >= Math.min(bLng1, bLng2) && clickLng <= Math.max(bLng1, bLng2);
    });

    if (isPublic) {
      alert("⚠️ This is Government Restricted Land. You cannot register or buy this territory.");
      return;
    }

    // Check if it's already private or for sale
    if (publicLands.includes(propertyID)) {
      alert("Private Land Details: Redirecting to verify/request...");
      navigate(`/search-land?query=${propertyID}`);
      return;
    }
    
    const saleMatch = forSaleLands.find(s => s.id === propertyID);
    if (saleMatch) {
      alert(`Property For Sale: ${saleMatch.price} tokens. Redirecting to Purchase Flow...`);
      navigate(`/search-land?query=${propertyID}`);
      return;
    }

    try {
      let geoAddress = "Unknown Terrain";
      if (clickLat && clickLng) {
         const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickLat}&lon=${clickLng}`);
         if (res.data && res.data.display_name) {
           geoAddress = res.data.display_name;
         }
      }
      navigate(`/register-land?propertyID=${propertyID}&address=${encodeURIComponent(geoAddress)}`);
    } catch(err) {
      console.error("Geocoding failed", err);
      navigate(`/register-land?propertyID=${propertyID}`);
    }
  };

  // Helper to visually render registered blocks
  // Since we use propertyID "PLOT-lat-lng", we can reverse it to draw rectangles
  const renderDbPlots = () => {
    const draws = [];
    
    publicLands.forEach(id => {
      if(id.startsWith('PLOT-')) {
        const parts = id.split('-');
        if(parts.length === 3) {
          const lat = parseFloat(parts[1].replace('_','.'));
          const lng = parseFloat(parts[2].replace('_','.'));
          if(!isNaN(lat) && !isNaN(lng)) {
             draws.push(
               <Rectangle 
                 key={id} 
                 bounds={[[lat, lng], [lat+0.05, lng+0.05]]} 
                 pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.7 }}
                 eventHandlers={{ click: (e) => { L.DomEvent.stopPropagation(e); handlePlotClick(id, null, lat, lng); } }}
               >
                 <Tooltip>Private Land: {id}</Tooltip>
               </Rectangle>
             );
          }
        }
      }
    });

    forSaleLands.forEach(plot => {
      if(plot.id.startsWith('PLOT-')) {
        const parts = plot.id.split('-');
        if(parts.length === 3) {
          const lat = parseFloat(parts[1].replace('_','.'));
          const lng = parseFloat(parts[2].replace('_','.'));
          if(!isNaN(lat) && !isNaN(lng)) {
             draws.push(
               <Rectangle key={plot.id} bounds={[[lat, lng], [lat+0.05, lng+0.05]]} pathOptions={{ color: '#9333ea', fillColor: '#9333ea', fillOpacity: 0.7 }} eventHandlers={{ click: () => handlePlotClick(plot.id) }}>
                 <Tooltip>For Sale: {plot.id} - {plot.price}</Tooltip>
               </Rectangle>
             );
          }
        }
      }
    });

    return draws;
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '50vh' }}>Loading Map Data...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h2>Live Property Geography</h2>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid var(--card-border)'}}>
           Back to Dashboard
        </button>
      </div>
      
      <div className="glass-card" style={{ padding: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '20px', height: '20px', background: '#ef4444', borderRadius: '4px' }}></div>
             <span>Public Unbuyable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '20px', height: '20px', background: '#eab308', borderRadius: '4px' }}></div>
             <span>Already Bought</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '20px', height: '20px', background: '#9333ea', borderRadius: '4px' }}></div>
             <span>For Sale</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <div style={{ width: '20px', height: '20px', background: 'transparent', border: '2px dashed #9ca3af', borderRadius: '4px' }}></div>
             <span>Click Anywhere for Free Land</span>
          </div>
        </div>

        <div style={{ height: '600px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--card-border)' }}>
          <MapContainer center={indiaCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draw Public Reserves */}
            {publicReserves.map((bounds, idx) => (
              <Rectangle 
                key={`reserve-${idx}`} 
                bounds={bounds} 
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.5 }}
                eventHandlers={{ 
                  click: (e) => { 
                    L.DomEvent.stopPropagation(e);
                    alert("⚠️ Restricted Government Land - Unclickable Zone."); 
                  } 
                }}
              >
                <Tooltip>Government Restricted Land</Tooltip>
              </Rectangle>
            ))}

            {/* Draw DB Plots */}
            {renderDbPlots()}

            {/* Click Event Handler */}
            <MapEvents onPlotClick={handlePlotClick} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapSelection;
