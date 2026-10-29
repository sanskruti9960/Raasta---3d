import { useState } from 'react';
import type { ViewMode, EnvironmentPreset, LightingTime, UtilityLayer } from '../types/spatial';
import {
  Search,
  Video,
  FileText,
  Plus,
  X,
  Eye,
  User,
  Footprints,
  Smartphone,
  Sparkles,
  Sliders,
  ChevronLeft,
  Sun,
  Sunrise
} from 'lucide-react';

export interface TopNavbarProps {
  mode: ViewMode;
  onSetMode: (mode: ViewMode) => void;
  preset: EnvironmentPreset;
  onSetPreset: (preset: EnvironmentPreset) => void;
  hasCustomRoom?: boolean;
  lightingTime: LightingTime;
  onSetLightingTime: (time: LightingTime) => void;
  utilityLayer: UtilityLayer;
  onSetUtilityLayer: (layer: UtilityLayer) => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenDocs: () => void;
  onToggleFloorplan?: () => void;
  isAddingPOI: boolean;
  onToggleAddPOI: () => void;
  fps: number;
}

export default function TopNavbar({
  mode,
  onSetMode,
  preset,
  onSetPreset,
  hasCustomRoom = false,
  lightingTime,
  onSetLightingTime,
  utilityLayer,
  onSetUtilityLayer,
  onOpenSearch,
  onOpenUpload,
  onOpenDocs,
  onToggleFloorplan,
  isAddingPOI,
  onToggleAddPOI,
  fps
}: TopNavbarProps) {
  const [showUtilitiesBar, setShowUtilitiesBar] = useState(true);

  return (
    <div className="fuselab-top-nav-container">
      {/* 1. Top-Left: Reference Image Utilities Bar & Lighting Selector */}
      <div className="fuselab-left-cluster">
        {/* Back / Minimizer Button */}
        <button
          className="fuselab-icon-btn"
          onClick={() => setShowUtilitiesBar(!showUtilitiesBar)}
          title="Toggle Utilities Bar"
        >
          <ChevronLeft size={16} className={`transition-transform ${!showUtilitiesBar ? 'rotate-180' : ''}`} />
        </button>

        {/* Utilities Panel */}
        {showUtilitiesBar && (
          <div className="fuselab-utilities-panel">
            <div className="utilities-header-row">
              <div className="utilities-title">
                <Sliders size={13} className="text-slate-400" />
                <span>Utilities</span>
              </div>

              {/* Water, Daylight, Electricity, Gas, AC segmented switch */}
              <div className="utilities-tabs">
                {(['water', 'daylight', 'electricity', 'gas', 'ac'] as UtilityLayer[]).map((layer) => (
                  <button
                    key={layer}
                    className={`utility-tab-btn ${utilityLayer === layer ? 'active' : ''}`}
                    onClick={() => onSetUtilityLayer(utilityLayer === layer ? 'none' : layer)}
                  >
                    {layer.charAt(0).toUpperCase() + layer.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time of Day Radio Selectors (Morning / Afternoon) */}
            <div className="lighting-radio-row">
              <label className={`lighting-radio-label ${lightingTime === 'morning' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="lighting"
                  checked={lightingTime === 'morning'}
                  onChange={() => onSetLightingTime('morning')}
                />
                <Sunrise size={13} />
                <span>Morning</span>
              </label>

              <label className={`lighting-radio-label ${lightingTime === 'afternoon' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="lighting"
                  checked={lightingTime === 'afternoon'}
                  onChange={() => onSetLightingTime('afternoon')}
                />
                <Sun size={13} />
                <span>Afternoon</span>
              </label>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="fuselab-search-bar" onClick={onOpenSearch}>
          <Search size={15} className="text-slate-400" />
          <span className="search-text">Search room, item, desk...</span>
          <kbd className="search-kbd">Ctrl+K</kbd>
        </div>
      </div>

      {/* 2. Top-Center: Preset & Camera Mode Switchers */}
      <div className="fuselab-center-cluster">
        {/* Dataset Switcher */}
        <div className="fuselab-segmented-group">
          <button
            className={`fuselab-seg-btn ${preset === 'home' ? 'active' : ''}`}
            onClick={() => onSetPreset('home')}
            title="Smart Home Floorplan (Round 1 Dataset)"
          >
            Home Twin
          </button>
          <button
            className={`fuselab-seg-btn ${preset === 'office' ? 'active' : ''}`}
            onClick={() => onSetPreset('office')}
            title="Corporate Innovation Hub"
          >
            Corporate
          </button>
          {(hasCustomRoom || preset === 'custom_room') && (
            <button
              className={`fuselab-seg-btn ${preset === 'custom_room' ? 'active' : ''}`}
              onClick={() => onSetPreset('custom_room')}
              title="Reconstructed Video Room Digital Twin"
            >
              <Sparkles size={12} className="inline mr-1 text-amber-400" />
              <span>My Video Room</span>
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="fuselab-segmented-group">
          <button
            className={`fuselab-seg-btn ${mode === 'orbit' ? 'active' : ''}`}
            onClick={() => onSetMode('orbit')}
            title="3D Overview (Rotate & Zoom)"
          >
            <Eye size={13} />
            <span>3D View</span>
          </button>
          <button
            className={`fuselab-seg-btn ${mode === 'third' ? 'active' : ''}`}
            onClick={() => onSetMode('third')}
            title="3rd-Person Follow"
          >
            <User size={13} />
            <span>3rd Person</span>
          </button>
          <button
            className={`fuselab-seg-btn ${mode === 'walk' ? 'active' : ''}`}
            onClick={() => onSetMode('walk')}
            title="1st-Person Walkthrough (WASD + Mouse)"
          >
            <Footprints size={13} />
            <span>Walk</span>
          </button>
          <button
            className={`fuselab-seg-btn ${mode === 'ar' ? 'active' : ''}`}
            onClick={() => onSetMode('ar')}
            title="AR Navigation Mode"
          >
            <Smartphone size={13} />
            <span>AR</span>
          </button>
        </div>
      </div>

      {/* 3. Top-Right: Brand Title, View Floor plan, Upload & Hub */}
      <div className="fuselab-right-cluster">
        {/* Reference Image Floor Plan Button */}
        <button
          className="fuselab-floorplan-btn"
          onClick={onToggleFloorplan || onOpenDocs}
          title="Open Architectural 2D Floor Plan Blueprint"
        >
          <div className="floorplan-text-col">
            <span className="floorplan-view-title">View</span>
            <span className="floorplan-view-sub">Floor plan ↗</span>
          </div>
          {/* Blueprint schematic icon */}
          <div className="blueprint-thumbnail-icon">
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="26" height="22" rx="2" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="1" y1="12" x2="27" y2="12" stroke="currentColor" strokeWidth="1" />
              <line x1="14" y1="1" x2="14" y2="23" stroke="currentColor" strokeWidth="1" />
              <rect x="3" y="3" width="9" height="7" fill="currentColor" fillOpacity="0.2" />
              <rect x="16" y="14" width="9" height="7" fill="currentColor" fillOpacity="0.2" />
            </svg>
          </div>
        </button>

        {/* Brand Label from reference image */}
        <div className="fuselab-brand-badge">
          <div className="brand-dot-cluster">
            <span className="brand-circle brand-c1" />
            <span className="brand-circle brand-c2" />
          </div>
          <span className="brand-name">Raasta-3D</span>
        </div>

        {/* Video Upload Button */}
        <button
          className="fuselab-action-btn fuselab-scan-btn"
          onClick={onOpenUpload}
          title="Upload or Scan Room Video to Convert into 3D Digital Twin"
        >
          <Video size={14} className="text-sky-400" />
          <span>Scan Video</span>
        </button>

        {/* Tag POI */}
        <button
          className={`fuselab-action-btn ${isAddingPOI ? 'active' : ''}`}
          onClick={onToggleAddPOI}
          title={isAddingPOI ? 'Cancel Point Placement' : 'Click on floor to tag a POI'}
        >
          {isAddingPOI ? <X size={14} /> : <Plus size={14} />}
          <span>{isAddingPOI ? 'Cancel' : 'Tag POI'}</span>
        </button>

        {/* Round 1 Hub */}
        <button
          className="fuselab-action-btn fuselab-hub-btn"
          onClick={onOpenDocs}
          title="Round 1 Submission Package & SOP"
        >
          <FileText size={14} />
          <span>Round 1</span>
        </button>

        {/* FPS Counter */}
        <div className="fuselab-fps-badge">
          <span className="fps-val">{fps}</span>
          <span className="fps-unit">FPS</span>
        </div>
      </div>
    </div>
  );
}
