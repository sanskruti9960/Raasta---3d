import { useState, useRef } from 'react';
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
  Footprints
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
}

export default function UploadModal({
  isOpen,
  onClose,
  onLoadModel,
  currentModelName,
  onCustomRoomLoaded
}: UploadModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'video' | 'file' | 'url'>('video');

  // Video Conversion State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [roomNameInput, setRoomNameInput] = useState('My Room Digital Twin');
  const [roomTypeInput, setRoomTypeInput] = useState<'bedroom' | 'living' | 'study' | 'studio' | 'office' | 'general'>('bedroom');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null);
  const [convertedRoom, setConvertedRoom] = useState<CustomRoomData | null>(null);

  // File / URL fallback state
  const [urlInput, setUrlInput] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Video Selection
  const handleVideoFileSelected = (file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    setConvertedRoom(null);
    setConversionProgress(null);
    // Suggest name based on filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    if (cleanName && cleanName.length > 2) {
      setRoomNameInput(cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + ' 3D Twin');
    }
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFileSelected(file);
    }
  };

  // 1-Click Sample Video test
  const handleLoadSampleVideo = async () => {
    setIsConverting(true);
    setConversionProgress({
      stage: 'Generating sample room scan video...',
      percent: 5,
      details: 'Creating camera pan stream across indoor room...'
    });

    try {
      const sampleFile = await createSampleRoomVideoBlob();
      handleVideoFileSelected(sampleFile);
      setRoomNameInput('Sample Room Digital Twin');
      // Automatically trigger conversion for instant test
      await startConversion(sampleFile, 'Sample Room Digital Twin', 'bedroom');
    } catch {
      setIsConverting(false);
    }
  };

  // Execute minimum-time video to 3D conversion
  const startConversion = async (
    fileToConvert: File,
    nameToUse: string,
    typeToUse: 'bedroom' | 'living' | 'study' | 'studio' | 'office' | 'general'
  ) => {
    setIsConverting(true);
    setConversionProgress({
      stage: 'Initializing video-to-3D reconstruction engine',
      percent: 10,
      details: 'Optimized for minimum processing time...'
    });

    try {
      const roomData = await convertRoomVideoTo3D(
        fileToConvert,
        nameToUse.trim() || 'My Room Digital Twin',
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
  };

  const handleStartConversionClick = () => {
    if (!videoFile) return;
    startConversion(videoFile, roomNameInput, roomTypeInput);
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
            <Video className="text-blue" size={22} />
            <h2 className="dialog-title">Indoor 3D Mapping & Video Reconstruction</h2>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="dialog-subtitle">
          Active: <span className="font-semibold text-gray-800">{currentModelName}</span> • Upload a video of your room to convert it into a 3D digital twin in minimum time.
        </p>

        {/* Tab switch */}
        <div className="google-tabs-bar">
          <button
            className={`tab-item ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            <Video size={15} />
            <span>Room Video to 3D (Instant)</span>
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
                      className="google-dropzone video-dropzone-large"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <Video size={42} className="text-blue mx-auto mb-2" />
                      <p className="dropzone-text-main">Click to upload your room scanning video</p>
                      <p className="dropzone-text-sub">
                        Supports standard smartphone video (.mp4, .mov, .webm, .mkv)
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
                        <span>Try Sample Room Scan Video (1-Click Test)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Selected Video Info & Configuration */
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
                          />
                        </div>
                      )}
                      <div className="video-meta-box">
                        <div className="video-title-line">
                          <span className="font-semibold text-gray-800 text-sm truncate">
                            {videoFile.name}
                          </span>
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
                        </div>
                        <span className="text-xs text-gray-500">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Ready for 3D reconstruction
                        </span>

                        <div className="speed-badge">
                          <Zap size={12} className="text-amber-500" />
                          <span>Optimized for minimum processing time (~2s)</span>
                        </div>
                      </div>
                    </div>

                    {/* Room metadata inputs */}
                    <div className="field-row mt-3">
                      <div className="google-field-group flex-1">
                        <label className="field-label">Room Digital Twin Name</label>
                        <input
                          type="text"
                          className="google-text-input"
                          value={roomNameInput}
                          onChange={(e) => setRoomNameInput(e.target.value)}
                          placeholder="e.g. My Bedroom Twin"
                          disabled={isConverting}
                        />
                      </div>
                      <div className="google-field-group flex-1">
                        <label className="field-label">Room Type</label>
                        <select
                          className="google-select-input"
                          value={roomTypeInput}
                          onChange={(e) => setRoomTypeInput(e.target.value as 'bedroom' | 'living' | 'study' | 'studio' | 'office' | 'general')}
                          disabled={isConverting}
                        >
                          <option value="bedroom">Bedroom Suite</option>
                          <option value="living">Living Room & Lounge</option>
                          <option value="studio">Studio Apartment</option>
                          <option value="study">Workstation / Study</option>
                          <option value="office">Office / Commercial</option>
                          <option value="general">General Indoor Space</option>
                        </select>
                      </div>
                    </div>

                    {/* Progress Bar (when active) */}
                    {isConverting && conversionProgress && (
                      <div className="conversion-progress-box">
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
                          <span className="progress-subtext text-xs text-gray-500">
                            {conversionProgress.details}
                          </span>
                        )}

                        {/* Extracted Keyframe Strip Preview */}
                        {conversionProgress.keyframeThumbnails &&
                          conversionProgress.keyframeThumbnails.length > 0 && (
                            <div className="extracted-frames-preview">
                              <span className="text-[11px] font-semibold text-gray-600 mb-1 block">
                                Extracted Keyframes ({conversionProgress.keyframeThumbnails.length}):
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

                    {/* Primary Action Button */}
                    {!isConverting && (
                      <button
                        className="google-btn-primary full-width mt-3"
                        onClick={handleStartConversionClick}
                      >
                        <Sparkles size={16} />
                        <span>Convert Video to 3D Digital Twin</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Success / Conversion Completed State */
              <div className="conversion-success-container">
                <div className="success-banner">
                  <CheckCircle2 size={28} className="text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="success-heading">3D Digital Twin Generated Successfully!</h3>
                    <p className="success-sub">
                      Converted in <span className="font-bold text-green-700">{convertedRoom.reconstructionTimeSec}s</span> (Minimum time). Ready to roam virtually.
                    </p>
                  </div>
                </div>

                {/* Specs pill grid */}
                <div className="room-summary-grid">
                  <div className="summary-pill">
                    <span className="summary-lbl">Room Dimensions</span>
                    <span className="summary-val">
                      {convertedRoom.dimensions.width}m × {convertedRoom.dimensions.depth}m
                    </span>
                  </div>
                  <div className="summary-pill">
                    <span className="summary-lbl">Gaussian Splats</span>
                    <span className="summary-val">{convertedRoom.pointCount.toLocaleString()} points</span>
                  </div>
                  <div className="summary-pill">
                    <span className="summary-lbl">File Formats</span>
                    <span className="summary-val">.splat ({convertedRoom.splatFileSizeKb} KB) & .ply</span>
                  </div>
                  <div className="summary-pill">
                    <span className="summary-lbl">Walkway POIs</span>
                    <span className="summary-val">{convertedRoom.pois.length} registered</span>
                  </div>
                </div>

                {/* Keyframes Strip */}
                {convertedRoom.keyframes && convertedRoom.keyframes.length > 0 && (
                  <div className="frames-strip-container">
                    <span className="text-xs font-semibold text-gray-700">Video Spatial Samples:</span>
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
                    <span>Enter & Roam 3D Room Virtually</span>
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
