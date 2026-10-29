import { useState } from 'react';
import type { POI, POICategory } from '../types/spatial';
import { MapPin, X } from 'lucide-react';

export interface AddPOIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: [number, number, number] | null;
  onSavePOI: (newPoi: POI) => void;
}

export default function AddPOIDialog({
  isOpen,
  onClose,
  coordinates,
  onSavePOI
}: AddPOIDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<POICategory>('room');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (!isOpen || !coordinates) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newPoi: POI = {
      id: `poi-custom-${Date.now()}`,
      name: name.trim(),
      category,
      position: coordinates,
      description: description.trim() || 'Custom spatial marker.',
      floor: 1,
      roomNumber: roomNumber.trim() || undefined,
      tags
    };

    onSavePOI(newPoi);
    onClose();
    setName('');
    setDescription('');
    setRoomNumber('');
    setTagInput('');
  };

  return (
    <div className="google-modal-backdrop" onClick={onClose}>
      <div className="google-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="google-dialog-header">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue" size={20} />
            <h3 className="dialog-title">Tag New Point of Interest</h3>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="coordinate-pill">
          <span>Coordinates: X: {coordinates[0]}m • Z: {coordinates[2]}m</span>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form-body">
          <div className="google-field-group">
            <label className="field-label">Location / Item Name *</label>
            <input
              type="text"
              required
              className="google-text-input"
              placeholder="e.g., Reading Nook, Dining Table, Refrigerator"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="google-field-group flex-1">
              <label className="field-label">Category</label>
              <select
                className="google-select-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as POICategory)}
              >
                <option value="room">Room / Area</option>
                <option value="amenity">Furniture / Amenity</option>
                <option value="tech">Tech / Workstation</option>
                <option value="safety">Safety / Exit</option>
              </select>
            </div>

            <div className="google-field-group flex-1">
              <label className="field-label">Zone / Code</label>
              <input
                type="text"
                className="google-text-input"
                placeholder="e.g., LIVING-02"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="google-field-group">
            <label className="field-label">Description</label>
            <textarea
              className="google-textarea-input"
              rows={2}
              placeholder="Brief details about this location..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="google-field-group">
            <label className="field-label">Tags (comma separated)</label>
            <input
              type="text"
              className="google-text-input"
              placeholder="sofa, relaxation, reading"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="google-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="google-btn-primary">
              Save Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
