import { useState, useMemo, useEffect } from 'react';
import type { POI, POICategory } from '../types/spatial';
import { distance3D } from '../utils/navGraph';
import { Search, X, Navigation } from 'lucide-react';

export interface POISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pois: POI[];
  playerPosition: [number, number, number];
  onSelectPOI: (poi: POI) => void;
  onNavigateToPOI: (poi: POI) => void;
}

export default function POISearchModal({
  isOpen,
  onClose,
  pois,
  playerPosition,
  onSelectPOI,
  onNavigateToPOI
}: POISearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<POICategory | 'all'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredPOIs = useMemo(() => {
    return pois
      .filter((poi) => {
        const matchesCategory = selectedCategory === 'all' || poi.category === selectedCategory;
        const query = searchQuery.toLowerCase().trim();
        if (!query) return matchesCategory;

        const matchesName = poi.name.toLowerCase().includes(query);
        const matchesRoom = poi.roomNumber?.toLowerCase().includes(query);
        const matchesDesc = poi.description.toLowerCase().includes(query);
        const matchesTags = poi.tags.some((t) => t.toLowerCase().includes(query));

        return matchesCategory && (matchesName || matchesRoom || matchesDesc || matchesTags);
      })
      .map((poi) => ({
        ...poi,
        distanceFromUser: Math.round(distance3D(playerPosition, poi.position) * 10) / 10
      }))
      .sort((a, b) => a.distanceFromUser - b.distanceFromUser);
  }, [pois, searchQuery, selectedCategory, playerPosition]);

  if (!isOpen) return null;

  return (
    <div className="google-modal-backdrop" onClick={onClose}>
      <div className="google-search-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header Search Input */}
        <div className="dialog-search-header">
          <Search className="dialog-search-icon" size={18} />
          <input
            type="text"
            className="dialog-search-input"
            placeholder="Search places, rooms, desks, or furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="dialog-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
          <button className="dialog-close-btn" onClick={onClose} title="Close">
            <kbd className="esc-badge">ESC</kbd>
          </button>
        </div>

        {/* Category Filters */}
        <div className="dialog-categories-bar">
          <button
            className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Places ({pois.length})
          </button>
          <button
            className={`category-pill ${selectedCategory === 'room' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('room')}
          >
            Rooms
          </button>
          <button
            className={`category-pill ${selectedCategory === 'amenity' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('amenity')}
          >
            Furniture & Amenities
          </button>
          <button
            className={`category-pill ${selectedCategory === 'tech' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('tech')}
          >
            Workstations & Displays
          </button>
          <button
            className={`category-pill ${selectedCategory === 'safety' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('safety')}
          >
            Safety
          </button>
        </div>

        {/* Results */}
        <div className="dialog-results-container">
          {filteredPOIs.length === 0 ? (
            <div className="dialog-empty-state">
              <p className="empty-title">No matching indoor locations</p>
              <p className="empty-subtitle">Try searching for sofa, bed, desk, kitchen, or entrance</p>
            </div>
          ) : (
            filteredPOIs.map((poi) => (
              <div key={poi.id} className="search-result-item">
                <div
                  className="result-main-col"
                  onClick={() => {
                    onSelectPOI(poi);
                    onClose();
                  }}
                >
                  <div className="result-title-line">
                    <span className="result-title">{poi.name}</span>
                    {poi.roomNumber && <span className="result-badge">{poi.roomNumber}</span>}
                  </div>
                  <p className="result-subtext">{poi.description}</p>
                </div>

                <div className="result-actions-col">
                  <span className="result-distance-text">{poi.distanceFromUser} m</span>
                  <button
                    className="result-directions-btn"
                    onClick={() => {
                      onNavigateToPOI(poi);
                      onClose();
                    }}
                    title="Navigate to destination"
                  >
                    <Navigation size={13} />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
