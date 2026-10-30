import { useState } from 'react';
import type { POI, POICategory } from '../types/spatial';
import { ClipboardCheck, X } from 'lucide-react';

export interface AddPOIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: [number, number, number] | null;
  onSavePOI: (newPoi: POI) => void;
  initialName?: string;
  initialCategory?: POICategory;
}

interface FormInnerProps {
  coordinates: [number, number, number];
  initialName?: string;
  initialCategory?: POICategory;
  onClose: () => void;
  onSavePOI: (newPoi: POI) => void;
}

function AddPOIDialogForm({
  coordinates,
  initialName = '',
  initialCategory = 'sop',
  onClose,
  onSavePOI
}: FormInnerProps) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<POICategory>(initialCategory);
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState(
    initialName ? `Standard Operating Procedure (SOP) checkpoint for ${initialName}.` : ''
  );
  const [tagInput, setTagInput] = useState(
    initialName
      ? `sop, procedure, ${initialName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      : 'sop, procedure'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newPoi: POI = {
      id: `poi-sop-${Date.now()}`,
      name: name.trim(),
      category,
      position: coordinates,
      description: description.trim() || 'SOP inspection checkpoint.',
      floor: 1,
      roomNumber: roomNumber.trim() || 'SOP-POINT',
      tags: tags.length > 0 ? tags : ['sop', 'procedure']
    };

    onSavePOI(newPoi);
    onClose();
  };

  return (
    <div className="google-modal-backdrop" onClick={onClose}>
      <div className="google-dialog-card" onClick={(e) => e.stopPropagation()}>
        <div className="google-dialog-header">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-amber-500" size={20} />
            <h3 className="dialog-title">Name Object / SOP Checkpoint</h3>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="coordinate-pill">
          <span>Target Contact: X: {coordinates[0]}m • Z: {coordinates[2]}m</span>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form-body">
          <div className="google-field-group">
            <label className="field-label">SOP / Object Name *</label>
            <input
              type="text"
              required
              className="google-text-input"
              placeholder="e.g., Workstation 1 SOP, Coffee Machine SOP, Kitchen Prep SOP"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="google-field-group flex-1">
              <label className="field-label">Type</label>
              <select
                className="google-select-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as POICategory)}
              >
                <option value="sop">SOP (Standard Procedure)</option>
                <option value="amenity">Furniture / Amenity</option>
                <option value="tech">Tech / Workstation</option>
                <option value="safety">Safety / Emergency</option>
                <option value="room">Room / Area</option>
              </select>
            </div>

            <div className="google-field-group flex-1">
              <label className="field-label">SOP Code / Room</label>
              <input
                type="text"
                className="google-text-input"
                placeholder="e.g., SOP-101 or ZONE-01"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="google-field-group">
            <label className="field-label">SOP Instructions / Description</label>
            <textarea
              className="google-textarea-input"
              rows={2}
              placeholder="Operational procedure, inspection frequency, handling steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="google-field-group">
            <label className="field-label">Tags (comma separated)</label>
            <input
              type="text"
              className="google-text-input"
              placeholder="sop, inspection, safety, maintenance"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </div>

          <div className="dialog-actions-row">
            <button type="button" className="google-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="google-btn-primary bg-amber-600 hover:bg-amber-700">
              Save SOP Landmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddPOIDialog({
  isOpen,
  onClose,
  coordinates,
  onSavePOI,
  initialName = '',
  initialCategory = 'sop'
}: AddPOIDialogProps) {
  if (!isOpen || !coordinates) return null;

  return (
    <AddPOIDialogForm
      key={`${coordinates[0]}_${coordinates[2]}_${initialName}`}
      coordinates={coordinates}
      initialName={initialName}
      initialCategory={initialCategory}
      onClose={onClose}
      onSavePOI={onSavePOI}
    />
  );
}
