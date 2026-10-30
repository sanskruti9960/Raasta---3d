import type { ViewMode, EnvironmentPreset } from '../types/spatial';
import {
  Search,
  UploadCloud,
  FileText,
  Map,
  Eye,
  Footprints,
  Sparkles
} from 'lucide-react';

export interface TopNavbarProps {
  mode: ViewMode;
  onSetMode: (mode: ViewMode) => void;
  preset: EnvironmentPreset;
  onSetPreset: (preset: EnvironmentPreset) => void;
  hasCustomRoom?: boolean;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenDocs: () => void;
  onToggleFloorplan?: () => void;
  fps: number;
}

export default function TopNavbar({
  mode,
  onSetMode,
  preset,
  onSetPreset,
  hasCustomRoom = false,
  onOpenSearch,
  onOpenUpload,
  onOpenDocs,
  onToggleFloorplan,
  fps
}: TopNavbarProps) {
  return (
    <header className="fuselab-top-nav-container">
      {/* 1. Left Cluster: Brand & Quick Search */}
      <div className="fuselab-left-cluster">
        <div className="fuselab-brand-badge">
          <div className="brand-dot-cluster">
            <span className="brand-circle brand-c1" />
            <span className="brand-circle brand-c2" />
          </div>
          <div className="brand-title-col">
            <span className="brand-name">Raasta-3D</span>
            <span className="brand-sub">Techfest IITB × Juspay</span>
          </div>
        </div>

        <button
          className="fuselab-search-bar"
          onClick={onOpenSearch}
          title="Search rooms, furniture, POIs (Ctrl+K)"
        >
          <Search size={14} className="text-slate-400" />
          <span className="search-text">Search...</span>
          <kbd className="search-kbd">⌘K</kbd>
        </button>
      </div>

      {/* 2. Center Cluster: Environment Preset & View Mode Switcher */}
      <div className="fuselab-center-cluster">
        {/* Environment Preset */}
        <div className="fuselab-segmented-group" title="Select 3D Environment">
          <button
            className={`fuselab-seg-btn ${preset === 'home' ? 'active' : ''}`}
            onClick={() => onSetPreset('home')}
          >
            Home Twin
          </button>
          <button
            className={`fuselab-seg-btn ${preset === 'office' ? 'active' : ''}`}
            onClick={() => onSetPreset('office')}
          >
            Corporate
          </button>
          {(hasCustomRoom || preset === 'custom_room') && (
            <button
              className={`fuselab-seg-btn ${preset === 'custom_room' ? 'active' : ''}`}
              onClick={() => onSetPreset('custom_room')}
            >
              <Sparkles size={12} className="inline mr-1 text-sky-400" />
              <span>Video Twin</span>
            </button>
          )}
        </div>

        {/* View Mode: 3D Orbit vs Walk */}
        <div className="fuselab-segmented-group">
          <button
            className={`fuselab-seg-btn ${mode === 'orbit' ? 'active' : ''}`}
            onClick={() => onSetMode('orbit')}
            title="3D Overview (Rotate, Pan & Zoom)"
          >
            <Eye size={13} />
            <span>3D Orbit</span>
          </button>
          <button
            className={`fuselab-seg-btn ${mode === 'walk' ? 'active' : ''}`}
            onClick={() => onSetMode('walk')}
            title="1st-Person Walkthrough (WASD / Arrows to walk)"
          >
            <Footprints size={13} />
            <span>Walk</span>
          </button>
        </div>
      </div>

      {/* 3. Right Cluster: Upload Video, Floor Plan, Round 1 Docs, FPS */}
      <div className="fuselab-right-cluster">
        {/* Upload Video CTA */}
        <button
          className="fuselab-action-btn fuselab-scan-btn"
          onClick={onOpenUpload}
          title="Upload room video to reconstruct 3D digital twin"
        >
          <UploadCloud size={14} />
          <span>Upload Video</span>
        </button>

        {/* 2D Blueprint Floor Plan */}
        <button
          className="fuselab-action-btn"
          onClick={onToggleFloorplan || onOpenDocs}
          title="Open Architectural 2D Floor Plan Blueprint"
        >
          <Map size={14} />
          <span>Floor Plan</span>
        </button>

        {/* Round 1 Submission Docs */}
        <button
          className="fuselab-action-btn fuselab-hub-btn"
          onClick={onOpenDocs}
          title="Round 1 Submission Package & Architecture Specs"
        >
          <FileText size={14} />
          <span>Round 1</span>
        </button>

        {/* Performance FPS Badge */}
        <div className="fuselab-fps-badge" title="Real-time rendering frame rate">
          <span className="fps-val">{fps}</span>
          <span className="fps-unit">FPS</span>
        </div>
      </div>
    </header>
  );
}
