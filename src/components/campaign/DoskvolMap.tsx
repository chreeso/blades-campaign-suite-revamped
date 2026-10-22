'use client';

import React, { useRef, useState } from 'react';
import { Crew, Faction, MapPin as MapPinType, ProceduralStreet } from '@/types/blades';
import {
  DistrictInfo,
  DOSKVOL_DISTRICTS,
  findDistrictAtPoint,
  findNearestDistrict,
  getDistrictById
} from '@/lib/constants/districts';
import { getPinCategory, MapPinDraft } from '@/lib/mapPins';
import { StreetGeneratorModal } from '@/components/campaign/StreetGeneratorModal';
import { MapPinEditor } from '@/components/campaign/MapPinEditor';
import { MapPin, Shield, Users, Home, EyeOff, Sparkles, Navigation, Crosshair } from 'lucide-react';

interface DoskvolMapProps {
  crew: Crew;
  factions: Faction[];
  isGm: boolean;
  /** Campaign pins already filtered for the viewer's role. */
  pins: MapPinType[];
  onLogStreet: (street: ProceduralStreet, districtName: string) => void;
  onAddPin: (draft: MapPinDraft) => void;
  onUpdatePin: (id: string, draft: MapPinDraft) => void;
  onDeletePin: (id: string) => void;
}

/** Pending pin location (new pin) or the pin being edited. */
type PinEditorState =
  | { mode: 'create'; x: number; y: number; district: DistrictInfo; inDistrict: boolean }
  | { mode: 'edit'; pin: MapPinType };

export function DoskvolMap({
  crew,
  factions,
  isGm,
  pins,
  onLogStreet,
  onAddPin,
  onUpdatePin,
  onDeletePin
}: DoskvolMapProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(DOSKVOL_DISTRICTS[0]);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [showStreetGenerator, setShowStreetGenerator] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [pinEditor, setPinEditor] = useState<PinEditorState | null>(null);
  const [attachedStreet, setAttachedStreet] = useState<ProceduralStreet | undefined>(undefined);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const districtPins = pins.filter((p) => p.district_id === selectedDistrict.id);

  /** Converts a mouse event's client coordinates into SVG viewBox coordinates. */
  const toMapPoint = (e: React.MouseEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const { x, y } = pt.matrixTransform(ctm.inverse());
    return {
      x: Math.round(Math.min(600, Math.max(0, x))),
      y: Math.round(Math.min(560, Math.max(0, y)))
    };
  };

  const startPinAt = (e: React.MouseEvent) => {
    const point = toMapPoint(e);
    if (!point) return;
    const hit = findDistrictAtPoint(point.x, point.y);
    const district = hit ?? findNearestDistrict(point.x, point.y);
    setSelectedDistrict(district);
    setAttachedStreet(undefined);
    setPinEditor({ mode: 'create', ...point, district, inDistrict: hit !== null });
    setPinMode(false);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (pinMode) startPinAt(e);
  };

  const handleMapContextMenu = (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    startPinAt(e);
  };

  const openPin = (pin: MapPinType) => {
    if (pin.district_id) setSelectedDistrict(getDistrictById(pin.district_id));
    setAttachedStreet(undefined);
    setPinEditor({ mode: 'edit', pin });
  };

  const closeEditor = () => {
    setPinEditor(null);
    setAttachedStreet(undefined);
  };

  const handleSavePin = (draft: MapPinDraft) => {
    if (pinEditor?.mode === 'edit') {
      onUpdatePin(pinEditor.pin.id, draft);
    } else {
      onAddPin(draft);
    }
    closeEditor();
  };

  const editorDistrict: DistrictInfo | null = pinEditor
    ? pinEditor.mode === 'create'
      ? pinEditor.district
      : pinEditor.pin.district_id
      ? getDistrictById(pinEditor.pin.district_id)
      : null
    : null;

  // Generator is district-locked when attached to a pin location.
  const generatorDistrict = editorDistrict ?? selectedDistrict;

  // Check crew presence in district
  const hasLair = (d: DistrictInfo) =>
    crew.lair?.toLowerCase().includes(d.name.toLowerCase()) ||
    (d.id === 'silkshore' && crew.lair?.toLowerCase().includes('silkshore'));

  const hasHunting = (d: DistrictInfo) =>
    crew.hunting_grounds?.toLowerCase().includes(d.name.toLowerCase()) ||
    (d.id === 'crows_foot' && crew.hunting_grounds?.toLowerCase().includes("crowâ€™s foot"));

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Map Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-zinc-100 flex items-center gap-2">
              The City of Doskvol â€” Turf &amp; District Cartography
            </h2>
            <p className="text-xs text-zinc-400">
              Interactive map of the industrial capital beneath the lightning barrier
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Home className="w-3.5 h-3.5" /> Crew Lair
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <MapPin className="w-3.5 h-3.5" /> Hunting Grounds
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Shield className="w-3.5 h-3.5" /> Faction Strongholds
          </span>
          <button
            type="button"
            onClick={() => setPinMode((m) => !m)}
            aria-pressed={pinMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
              pinMode
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:text-amber-300'
            }`}
            title="Click the map to drop a landmark pin (or right-click anywhere)"
          >
            <Crosshair className="w-3.5 h-3.5" /> {pinMode ? 'Click map to dropâ€¦' : 'Drop Pin'}
          </button>
        </div>
      </div>

      {/* Main Grid: SVG Map on Left, District Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SVG Map Card */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden min-h-[480px]">
          {/* Mobile pin-drop toggle */}
          <button
            type="button"
            onClick={() => setPinMode((m) => !m)}
            aria-pressed={pinMode}
            className={`sm:hidden absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold ${
              pinMode ? 'bg-amber-500/20 border-amber-500/60 text-amber-300' : 'bg-zinc-900 border-zinc-700 text-zinc-300'
            }`}
          >
            <Crosshair className="w-3 h-3" /> {pinMode ? 'Tap map' : 'Drop Pin'}
          </button>
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 font-mono pointer-events-none">
            Right-click anywhere to drop a landmark pin
          </p>
          {/* Subtle background grid & River Sheaf */}
          <svg
            ref={svgRef}
            viewBox="0 0 600 560"
            className={`w-full max-w-xl h-auto select-none ${pinMode ? 'cursor-crosshair' : ''}`}
            style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}
            onClick={handleMapClick}
            onContextMenu={handleMapContextMenu}
          >
            <defs>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0c1e28" />
                <stop offset="50%" stopColor="#082d38" />
                <stop offset="100%" stopColor="#05141c" />
              </linearGradient>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#27272a" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="600" height="560" fill="#09090b" />
            <rect width="600" height="560" fill="url(#grid)" opacity="0.3" />

            {/* Lightning Barrier Perimeter */}
            <rect
              x="15"
              y="15"
              width="570"
              height="530"
              rx="20"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.4"
            />
            <text x="30" y="35" fill="#06b6d4" fontSize="9" fontFamily="monospace" letterSpacing="2">
              âš¡ LIGHTNING BARRIER PERIMETER
            </text>

            {/* River Sheaf running diagonally through Doskvol */}
            <path
              d="M 230 0 Q 300 240 370 300 T 470 560"
              fill="none"
              stroke="url(#riverGradient)"
              strokeWidth="38"
              opacity="0.75"
            />
            <path
              d="M 230 0 Q 300 240 370 300 T 470 560"
              fill="none"
              stroke="#0e7490"
              strokeWidth="2"
              strokeDasharray="4 8"
              opacity="0.4"
            />

            {/* Districts */}
            {DOSKVOL_DISTRICTS.map((district) => {
              const isSelected = selectedDistrict.id === district.id;
              const isHovered = hoveredDistrict === district.id;
              const lair = hasLair(district);
              const hunting = hasHunting(district);

              return (
                <g
                  key={district.id}
                  onClick={() => {
                    if (!pinMode) setSelectedDistrict(district);
                  }}
                  onMouseEnter={() => setHoveredDistrict(district.id)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                  className="cursor-pointer transition-all duration-200"
                >
                  <path
                    d={district.path}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'fill-amber-500/30 stroke-amber-400 stroke-2'
                        : isHovered
                        ? 'fill-zinc-800/80 stroke-zinc-400 stroke-1'
                        : lair
                        ? 'fill-amber-950/20 stroke-amber-500/40 stroke-1'
                        : hunting
                        ? 'fill-red-950/20 stroke-red-500/40 stroke-1'
                        : 'fill-zinc-900/60 stroke-zinc-800 stroke-1 hover:fill-zinc-800/40'
                    }`}
                  />

                  {/* District Label */}
                  <text
                    x={district.center.x}
                    y={district.center.y}
                    textAnchor="middle"
                    className={`text-[9px] font-bold font-serif pointer-events-none tracking-wide ${
                      isSelected
                        ? 'fill-amber-300 font-extrabold'
                        : isHovered
                        ? 'fill-zinc-100'
                        : 'fill-zinc-400'
                    }`}
                  >
                    {district.name}
                  </text>

                  {/* Marker: Lair */}
                  {lair && (
                    <circle
                      cx={district.center.x - 14}
                      cy={district.center.y + 12}
                      r="4"
                      className="fill-amber-400 stroke-zinc-950 stroke-1 animate-pulse"
                    />
                  )}

                  {/* Marker: Hunting Ground */}
                  {hunting && (
                    <circle
                      cx={district.center.x + 14}
                      cy={district.center.y + 12}
                      r="4"
                      className="fill-red-500 stroke-zinc-950 stroke-1"
                    />
                  )}
                </g>
              );
            })}

            {/* Campaign Landmark Pins */}
            {pins.map((pin) => {
              const cat = getPinCategory(pin.category);
              const isActive =
                hoveredPinId === pin.id || (pinEditor?.mode === 'edit' && pinEditor.pin.id === pin.id);
              return (
                <g
                  key={pin.id}
                  transform={`translate(${pin.x} ${pin.y})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPin(pin);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPin(pin);
                  }}
                  onMouseEnter={() => setHoveredPinId(pin.id)}
                  onMouseLeave={() => setHoveredPinId(null)}
                >
                  <title>
                    {`${pin.title} â€” ${cat.label}${pin.visibility === 'gm_only' ? ' (GM only)' : ''}`}
                  </title>
                  <path
                    d="M 0 0 L -5 -9 A 6 6 0 1 1 5 -9 Z"
                    fill={cat.color}
                    stroke={isActive ? '#fafafa' : '#09090b'}
                    strokeWidth={isActive ? 1.5 : 1}
                    strokeDasharray={pin.visibility === 'gm_only' ? '2 1.5' : undefined}
                  />
                  <circle cx="0" cy="-12" r="2" fill="#09090b" />
                  {isActive && (
                    <text
                      y="-20"
                      textAnchor="middle"
                      className="text-[8px] font-bold font-serif fill-zinc-100 pointer-events-none"
                      style={{ paintOrder: 'stroke', stroke: '#09090b', strokeWidth: 3 }}
                    >
                      {pin.title}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Pending pin marker */}
            {pinEditor?.mode === 'create' && (
              <g transform={`translate(${pinEditor.x} ${pinEditor.y})`} className="pointer-events-none">
                <circle r="8" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-ping" />
                <circle r="3" fill="#fbbf24" />
              </g>
            )}
          </svg>
        </div>

        {/* Right Panel: Landmark Editor or District Dossier */}
        {pinEditor && editorDistrict ? (
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
            {pinEditor.mode === 'create' && !pinEditor.inDistrict && (
              <p className="mb-3 text-[11px] text-zinc-500 italic">
                Outside district lines â€” filed under the nearest district, {editorDistrict.name}.
              </p>
            )}
            <MapPinEditor
              key={pinEditor.mode === 'edit' ? pinEditor.pin.id : `${pinEditor.x}-${pinEditor.y}`}
              pin={pinEditor.mode === 'edit' ? pinEditor.pin : undefined}
              point={pinEditor.mode === 'edit' ? { x: pinEditor.pin.x, y: pinEditor.pin.y } : pinEditor}
              districtId={editorDistrict.id}
              districtName={editorDistrict.name}
              isGm={isGm}
              attachedStreet={attachedStreet}
              onSave={handleSavePin}
              onDelete={
                pinEditor.mode === 'edit'
                  ? () => {
                      onDeletePin(pinEditor.pin.id);
                      closeEditor();
                    }
                  : undefined
              }
              onGenerateStreet={() => setShowStreetGenerator(true)}
              onCancel={closeEditor}
            />
          </div>
        ) : (
        /* Selected District Dossier */
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400">
                District Dossier
              </span>
              <h3 className="font-serif text-xl font-black text-zinc-100">
                {selectedDistrict.name}
              </h3>
            </div>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded font-bold uppercase ${
                selectedDistrict.wealth === 'Wealthy'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : selectedDistrict.wealth === 'Moderate'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {selectedDistrict.wealth} Tier
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {selectedDistrict.description}
          </p>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs italic text-zinc-400">
            &ldquo;{selectedDistrict.mood}&rdquo;
          </div>

          {/* Crew Presence in Selected District */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Crew Operations Here
            </span>
            <div className="space-y-1 text-xs">
              {hasLair(selectedDistrict) && (
                <div className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 font-semibold">
                  <Home className="w-3.5 h-3.5 text-amber-400" /> Crew Lair Established Here
                </div>
              )}
              {hasHunting(selectedDistrict) && (
                <div className="p-2 rounded bg-red-950/30 border border-red-500/40 text-red-300 flex items-center gap-1.5 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> Active Hunting Grounds
                </div>
              )}
              {!hasLair(selectedDistrict) && !hasHunting(selectedDistrict) && (
                <span className="text-zinc-500 italic text-[11px]">
                  No formal crew lair or hunting claim established in this district yet.
                </span>
              )}
            </div>
          </div>

          {/* Factions Dominant in this District */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Faction Strongholds &amp; Presence
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedDistrict.factions.map((fName) => {
                const liveFaction = factions.find((f) => f.name.toLowerCase() === fName.toLowerCase());
                const status = liveFaction ? liveFaction.status : 0;
                return (
                  <span
                    key={fName}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{fName}</span>
                    {liveFaction && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1 rounded ${
                          status > 0
                            ? 'bg-emerald-950 text-emerald-400'
                            : status < 0
                            ? 'bg-red-950 text-red-400'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {status > 0 ? `+${status}` : status}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Landmarks in this District */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Landmarks &amp; Pins ({districtPins.length})
            </span>
            {districtPins.length === 0 ? (
              <span className="block text-zinc-500 italic text-[11px]">
                No landmarks pinned here yet. Right-click the map to drop one.
              </span>
            ) : (
              <ul className="space-y-1">
                {districtPins.map((pin) => {
                  const cat = getPinCategory(pin.category);
                  return (
                    <li key={pin.id}>
                      <button
                        type="button"
                        onClick={() => openPin(pin)}
                        onMouseEnter={() => setHoveredPinId(pin.id)}
                        onMouseLeave={() => setHoveredPinId(null)}
                        className="w-full text-left p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-600 flex items-center gap-2 text-xs"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="flex-1 truncate text-zinc-200 font-semibold">{pin.title}</span>
                        <span className={`text-[10px] ${cat.textClass}`}>{cat.label}</span>
                        {pin.visibility === 'gm_only' && (
                          <EyeOff className="w-3 h-3 text-zinc-500" aria-label="GM only" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Street-Level Generator Launcher */}
          <button
            type="button"
            onClick={() => setShowStreetGenerator(true)}
            className="mt-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate a Street in {selectedDistrict.name}
          </button>
        </div>
        )}
      </div>

      {showStreetGenerator && (
        <StreetGeneratorModal
          key={generatorDistrict.id}
          initialDistrictId={generatorDistrict.id}
          lockDistrict={pinEditor !== null}
          onLogStreet={onLogStreet}
          onSaveAsPin={(street) => {
            if (pinEditor) {
              // Attach to the landmark being created/edited.
              setAttachedStreet(street);
              setShowStreetGenerator(false);
            } else {
              // Drop a new pin at the district center.
              const d = getDistrictById(street.districtId);
              onAddPin({
                district_id: d.id,
                x: d.center.x,
                y: d.center.y - 18,
                title: street.name,
                category: 'landmark',
                notes: '',
                visibility: 'campaign_public',
                street
              });
            }
          }}
          onClose={() => setShowStreetGenerator(false)}
        />
      )}
    </div>
  );
}
