import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  Upload,
  FileCode,
  Link,
  X,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
  Download,
  Footprints,
  Compass,
  Layers
} from 'lucide-react';
import type { CustomRoomData } from '../types/spatial';
import {
  convertRoomVideoTo3D,
  createSampleRoomVideoBlob,
  type ConversionProgress
} from '../utils/videoTo3DConverter';

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadModel: (url: string, name: string) => void;
  currentModelName: string;
  onCustomRoomLoaded?: (room: CustomRoomData) => void;
  initialVideoFile?: File | null;
}

export default function UploadModal({
  isOpen,
  onClose,
  onLoadModel,
  currentModelName,
  onCustomRoomLoaded,
  initialVideoFile
}: UploadModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'video' | 'file' | 'url'>('video');

  // Video Conversion State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [roomNameInput, setRoomNameInput] = useState('My Indoor Space 3D Twin');
  const [roomTypeInput, setRoomTypeInput] = useState<'multi_room' | 'apartment' | 'bedroom' | 'living' | 'study' | 'office' | 'general'>('apartment');
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null);
  const [convertedRoom, setConvertedRoom] = useState<CustomRoomData | null>(null);

  // File / URL fallback state
  const [urlInput, setUrlInput] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastProcessedVideoRef = useRef<File | null>(null);

  // Execute end-to-end video grinding and multi-room 3D reconstruction
  const startConversion = useCallback(
    async (
      fileToConvert: File,
      nameToUse: string,
      typeToUse: 'multi_room' | 'apartment' | 'bedroom' | 'living' | 'study' | 'office' | 'general'
    ) => {
      setIsConverting(true);
      setConversionProgress({
        stage: 'Initializing video-to-3D grinding pipeline...',
        percent: 5,
        details: 'Preparing monocular spatial frame extraction & feature tracker...'
      });

      try {
        const roomData = await convertRoomVideoTo3D(
          fileToConvert,
          nameToUse.trim() || 'My Indoor Space Digital Twin',
          typeToUse,
          (progress) => {
            setConversionProgress(progress);
          }
        );

        setConvertedRoom(roomData);
        setIsConverting(false);
      } catch (err) {
        console.error('Video conversion failed:', err);
        setIsConverting(false);
      }
    },
    []
  );

  // Handle Video Selection - Automatically initiates grinding in one go
  const handleVideoFileSelected = useCallback(
    (file: File) => {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      setConvertedRoom(null);
      setConversionProgress(null);

      // Format human-readable model name from file
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const formattedName = cleanName && cleanName.length > 2
        ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + ' 3D Twin'
        : 'Indoor Space 3D Twin';
      setRoomNameInput(formattedName);

      // Auto-start the grinding immediately whenever video is added
      startConversion(file, formattedName, roomTypeInput);
    },
    [roomTypeInput, startConversion]
  );

  // Auto-grind dropped initial video whenever modal opens with one
  useEffect(() => {
    if (initialVideoFile && isOpen && lastProcessedVideoRef.current !== initialVideoFile) {
      lastProcessedVideoRef.current = initialVideoFile;
      const timer = setTimeout(() => {
        setActiveTab('video');
        handleVideoFileSelected(initialVideoFile);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialVideoFile, isOpen, handleVideoFileSelected]);

  if (!isOpen) return null;

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleVideoFileSelected(file);
    }
  };

  // 1-Click Sample Multi-Room Video Scan Test
  const handleLoadSampleVideo = async () => {
    setIsConverting(true);
    setConversionProgress({
      stage: 'Generating multi-room camera tour stream...',
      percent: 5,
      details: 'Simulating slow-pan walkthrough across Foyer, Living, Kitchen & Bedroom...'
    });

    try {
      const sampleFile = await createSampleRoomVideoBlob();
      handleVideoFileSelected(sampleFile);
      setRoomNameInput('Sample Apartment Digital Twin');
    } catch (err) {
      console.error('Failed to create sample video:', err);
      setIsConverting(false);
    }
  };

  // Launch reconstructed 3D room into application
  const handleEnter3DRoom = () => {
    if (!convertedRoom) return;
    onCustomRoomLoaded?.(convertedRoom);
    onClose();
  };

  // Download converted files
  const handleDownloadSplat = () => {
    if (!convertedRoom?.splatBlobUrl) return;
    const a = document.createElement('a');
    a.href = convertedRoom.splatBlobUrl;
    a.download = `${convertedRoom.name.toLowerCase().replace(/\s+/g, '_')}_digital_twin.splat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPly = () => {
    if (!convertedRoom?.plyBlobUrl) return;
    const a = document.createElement('a');
    a.href = convertedRoom.plyBlobUrl;
    a.download = `${convertedRoom.name.toLowerCase().replace(/\s+/g, '_')}_pointcloud.ply`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Direct 3D File Handler (.ply, .splat)
  const handleDirectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    onLoadModel(objectUrl, file.name);
    onClose();
  };

  // Web URL Handler
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const name = urlInput.split('/').pop() || 'Remote 3D Model';
    onLoadModel(urlInput.trim(), name);
    onClose();
  };

  const handleResetToDefault = () => {
    onLoadModel('', 'Smart Home Digital Twin (Round 1 Dataset)');
    onClose();
  };

  return (
    <div className="google-modal-backdrop" onClick={onClose}>
      <div className="google-dialog-card video-converter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="google-dialog-header">
          <div className="flex items-center gap-2">
            <Compass className="text-blue" size={22} />
            <h2 className="dialog-title">Indoor 3D Spatial Reconstruction Engine</h2>
          </div>
          <button className="dialog-close-btn" onClick={onClose} title="Close dialog">
            <X size={18} />
          </button>
        </div>

        <p className="dialog-subtitle">
          Active: <span className="font-semibold text-gray-800">{currentModelName}</span> • Drop any indoor video capture to extract multi-room boundaries and generate an interactive 3D digital twin.
        </p>

        {/* Tab switch */}
        <div className="google-tabs-bar">
          <button
            className={`tab-item ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <Video size={15} />
            <span>Room Video to 3D</span>
          </button>
          <button
            className={`tab-item ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <FileCode size={15} />
            <span>Direct 3D File (.splat, .ply)</span>
          </button>
          <button
            className={`tab-item ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            <Link size={15} />
            <span>Web URL</span>
          </button>
        </div>

        {/* TAB 1: VIDEO TO 3D CONVERTER */}
        {activeTab === 'video' && (
          <div className="dialog-tab-body">
            {!convertedRoom ? (
              <>
                {/* Video Dropzone */}
                {!videoFile ? (
                  <div className="video-upload-area">
                    <div
                      className={`google-dropzone video-dropzone-large ${isDragging ? 'border-sky-500 bg-sky-500/10' : ''}`}
                      onClick={() => videoInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Video size={42} className="text-blue mx-auto mb-2" />
                      <p className="dropzone-text-main">
                        {isDragging ? 'Drop video here to start grinding immediately' : 'Drop video here or click to browse'}
                      </p>
                      <p className="dropzone-text-sub">
                        Whenever you add a video, the engine automatically grinds it, detects all connected rooms, and converts it to 3D.
                      </p>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm,video/*"
                        onChange={handleVideoInputChange}
                        style={{ display: 'none' }}
                      />
                    </div>

                    {/* Quick action buttons */}
                    <div className="video-quick-options">
                      <button
                        className="google-action-pill-primary w-full justify-center"
                        onClick={handleLoadSampleVideo}
                        disabled={isConverting}
                      >
                        <Sparkles size={14} />
                        <span>Try Sample Multi-Room Tour Video (Instant Grinding Test)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Processing / Selected Video View */
                  <div className="selected-video-container">
                    <div className="video-preview-row">
                      {videoPreviewUrl && (
                        <div className="video-preview-box">
                          <video
                            src={videoPreviewUrl}
                            className="video-player-thumb"
                            controls
                            muted
                            playsInline
                            autoPlay
                            loop
                          />
                        </div>
                      )}
                      <div className="video-meta-box">
                        <div className="video-title-line">
                          <span className="font-semibold text-gray-800 text-sm truncate">
                            {videoFile.name}
                          </span>
                          {!isConverting && (
                            <button
                              className="change-video-btn"
                              onClick={() => {
                                setVideoFile(null);
                                setVideoPreviewUrl(null);
                                setConversionProgress(null);
                              }}
                            >
                              Change
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Multi-Room 3D Grinding Pipeline Active
                        </span>

                        <div className="speed-badge">
                          <Zap size={12} className="text-amber-500" />
                          <span>Multi-zone segmentation & 3D Gaussian Splats generation</span>
                        </div>
                      </div>
                    </div>

                    {/* Space Name & Multi-Room Blueprint Preset Selector */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Space Name</label>
                        <input
                          type="text"
                          className="google-text-input text-xs"
                          value={roomNameInput}
                          onChange={(e) => setRoomNameInput(e.target.value)}
                          placeholder="e.g. My Apartment Digital Twin"
                          disabled={isConverting}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Decomposition Mode</label>
                        <select
                          className="google-select-input text-xs"
                          value={roomTypeInput}
                          onChange={(e) => setRoomTypeInput(e.target.value as 'multi_room' | 'apartment' | 'bedroom' | 'living' | 'study' | 'office' | 'general')}
                          disabled={isConverting}
                        >
                          <option value="apartment">Multi-Room Apartment (6 Connected Rooms)</option>
                          <option value="office">Innovation Hub (5 Zones: Boardroom, Pods, etc.)</option>
                          <option value="bedroom">Master Bedroom Suite + Ensuite & Dressing</option>
                          <option value="living">Living Lounge + Dining & Balcony</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Grinding Progress Bar */}
                    {isConverting && conversionProgress && (
                      <div className="conversion-progress-box mt-3">
                        <div className="progress-top-line">
                          <span className="stage-name font-medium text-xs text-blue">
                            {conversionProgress.stage}
                          </span>
                          <span className="percent-text font-bold text-xs text-gray-700">
                            {conversionProgress.percent}%
                          </span>
                        </div>

                        <div className="google-progress-track">
                          <div
                            className="google-progress-fill"
                            style={{ width: `${conversionProgress.percent}%` }}
                          />
                        </div>

                        {conversionProgress.details && (
                          <span className="progress-subtext text-xs text-gray-600 mt-1 block">
                            {conversionProgress.details}
                          </span>
                        )}

                        {/* Extracted Keyframe Strip Preview */}
                        {conversionProgress.keyframeThumbnails &&
                          conversionProgress.keyframeThumbnails.length > 0 && (
                            <div className="extracted-frames-preview">
                              <span className="text-[11px] font-semibold text-gray-700 mb-1 block">
                                Extracted Spatial Keyframes ({conversionProgress.keyframeThumbnails.length}):
                              </span>
                              <div className="frames-mini-strip">
                                {conversionProgress.keyframeThumbnails.map((thumb, idx) => (
                                  <img
                                    key={idx}
                                    src={thumb}
                                    alt={`frame-${idx}`}
                                    className="frame-mini-thumb"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Optional Re-grind trigger if not currently converting */}
                    {!isConverting && (
                      <div className="flex gap-2 mt-3">
                        <button
                          className="google-btn-primary flex-1"
                          onClick={() => startConversion(videoFile, roomNameInput, roomTypeInput)}
                        >
                          <RefreshCw size={15} />
                          <span>Re-grind Video to 3D</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Success / Conversion Completed State with Multi-Room Breakdown */
              <div className="conversion-success-container">
                <div className="success-banner">
                  <CheckCircle2 size={28} className="text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="success-heading">Multi-Room 3D Digital Twin Reconstructed!</h3>
                    <p className="success-sub">
                      Reconstructed <span className="font-bold text-green-700">{convertedRoom.zones.length} connected rooms</span> in {convertedRoom.reconstructionTimeSec}s. Floor navigation & POIs compiled.
                    </p>
                  </div>
                </div>

                {/* Recognized Multi-Room Zones Pill Grid */}
                <div className="detected-rooms-container my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-800 block mb-2 flex items-center gap-1.5">
                    <Layers size={13} className="text-blue" />
                    <span>Recognized Rooms & Usable Areas ({convertedRoom.zones.length}):</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {convertedRoom.zones.map((zone) => (
                      <div key={zone.id} className="p-2 bg-white rounded border border-slate-200 shadow-sm text-xs">
                        <span className="font-semibold text-slate-800 block truncate">📍 {zone.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{zone.areaSqFt} sq.ft • Level {zone.floor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specs pill grid */}
                <div className="room-summary-grid">
                  <div className="summary-pill">
                    <span className="summary-lbl">Overall Footprint</span>
                    <span className="summary-val">
                      {convertedRoom.dimensions.width}m × {convertedRoom.dimensions.depth}m
                    </span>
                  </div>
                  <div className="summary-pill">
                    <span className="summary-lbl">Gaussian Splats</span>
                    <span className="summary-val">{convertedRoom.pointCount.toLocaleString()} points</span>
                  </div>
                  <div className="summary-pill">
                    <span className="summary-lbl">Walkway Waypoints</span>
                    <span className="summary-val">{Object.keys(convertedRoom.navGraph).length} NavNodes</span>
                  </div>
                  <div className="summary-pill">
                    <span className="summary-lbl">Indoor POIs</span>
                    <span className="summary-val">{convertedRoom.pois.length} registered</span>
                  </div>
                </div>

                {/* Keyframes Strip */}
                {convertedRoom.keyframes && convertedRoom.keyframes.length > 0 && (
                  <div className="frames-strip-container">
                    <span className="text-xs font-semibold text-gray-700">Video Spatial Keyframes:</span>
                    <div className="frames-mini-strip mt-1">
                      {convertedRoom.keyframes.map((thumb, idx) => (
                        <img key={idx} src={thumb} alt={`keyframe-${idx}`} className="frame-mini-thumb" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="success-actions-col mt-4">
                  <button className="google-btn-primary full-width" onClick={handleEnter3DRoom}>
                    <Footprints size={16} />
                    <span>Enter & Roam 3D Twin Now</span>
                  </button>

                  <div className="flex gap-2">
                    <button className="google-btn-secondary flex-1" onClick={handleDownloadSplat}>
                      <Download size={14} />
                      <span>Download .splat File</span>
                    </button>
                    <button className="google-btn-secondary flex-1" onClick={handleDownloadPly}>
                      <Download size={14} />
                      <span>Download .ply File</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIRECT 3D FILE */}
        {activeTab === 'file' && (
          <div className="dialog-tab-body">
            <div className="google-dropzone" onClick={() => fileInputRef.current?.click()}>
              <Upload size={36} className="text-blue mx-auto mb-2" />
              <p className="dropzone-text-main">Click to select pre-trained .splat or .ply file</p>
              <p className="dropzone-text-sub">Supported formats: .splat, .ksplat, .ply (Nerfstudio/COLMAP)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ply,.splat,.ksplat"
                onChange={handleDirectFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {selectedFileName && (
              <div className="selected-badge">
                <CheckCircle2 size={16} className="text-green-600" />
                <span>Selected: {selectedFileName}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WEB URL */}
        {activeTab === 'url' && (
          <form className="dialog-tab-body" onSubmit={handleUrlSubmit}>
            <div className="google-field-group">
              <label className="field-label">Public 3D Splat Model URL</label>
              <input
                type="url"
                className="google-text-input"
                placeholder="https://example.com/assets/my-space.splat"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
            <button type="submit" className="google-btn-primary full-width" disabled={!urlInput.trim()}>
              Load from URL
            </button>
          </form>
        )}

        {/* Footer / Reset */}
        <div className="dialog-footer-actions">
          <button className="google-btn-secondary full-width" onClick={handleResetToDefault}>
            <RefreshCw size={14} />
            <span>Reset to Standard Twin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
