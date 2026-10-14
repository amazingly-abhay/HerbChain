import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  MapPin, 
  Link as LinkIcon, 
  FileText, 
  ExternalLink, 
  User, 
  Calendar, 
  Clock, 
  Beaker,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { BatchEvent, SupplyChainStage } from '@/lib/types';
import { SUPPLY_CHAIN_STAGES } from '@/lib/constants';
import { formatDateTime, getStageColor } from '@/lib/utils';

interface BatchTimelineProps {
  events: BatchEvent[];
  currentStage: SupplyChainStage;
  completedOnly?: boolean;
  showUpcoming?: boolean;
}

export default function BatchTimeline({ 
  events, 
  currentStage, 
  completedOnly = false,
  showUpcoming = false 
}: BatchTimelineProps) {
  const currentStageIndex = SUPPLY_CHAIN_STAGES.findIndex(s => s.stage === currentStage);

  // Filter out any upcoming stages:
  // - If completedOnly is true: only show stages with an actual logged event
  // - If showUpcoming is false: show only stages up to currentStageIndex (Completed or In Progress), hiding all upcoming future stages
  const stagesToDisplay = SUPPLY_CHAIN_STAGES.filter((s, index) => {
    const event = events.find(e => e.stage === s.stage);
    if (completedOnly) {
      return !!event;
    }
    if (!showUpcoming) {
      return index <= currentStageIndex;
    }
    return true;
  });

  if (stagesToDisplay.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-gray-500">
        No lifecycle events recorded yet for this batch.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-emerald-500/40 ml-4 space-y-6 pb-2">
      {stagesToDisplay.map((s, index) => {
        const stage = s.stage;
        const event = events.find(e => e.stage === stage);
        const hasEvent = !!event;
        const isSealed = hasEvent && !!event.blockchainTxHash && !event.blockchainTxHash.startsWith('mock-');
        const isCompleted = hasEvent;
        const isCurrent = index === currentStageIndex && !hasEvent;

        return (
          <motion.div 
            key={stage}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="relative"
          >
            {/* Timeline node icon */}
            <div 
              className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white
                ${isSealed ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-xs' : 
                  isCompleted ? 'border-blue-500 bg-blue-50 text-blue-600' :
                  isCurrent ? 'border-amber-400 ring-4 ring-amber-100 bg-white' : 'border-gray-300'}
              `}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : 
               isCurrent ? <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> : null}
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm border-gray-100 hover:border-gray-200 transition-all space-y-3">
              {/* Header: Stage name & Status Badge */}
              <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 capitalize text-base tracking-tight flex items-center gap-2">
                    {s.label}
                  </h4>
                  {isSealed ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed & Sealed
                    </span>
                  ) : isCompleted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      Completed (Off-Chain)
                    </span>
                  ) : isCurrent ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      In Progress
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200">
                      Upcoming
                    </span>
                  )}
                </div>

                {event && (
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{formatDateTime(event.timestamp)}</span>
                  </span>
                )}
              </div>

              {event && (
                <div className="space-y-3 text-xs">
                  {/* Operator metadata: User name, User ID & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-herb-green-100 text-herb-green-700 flex items-center justify-center font-bold text-[10px]">
                        <User className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase font-semibold block">Operator</span>
                        <span className="font-semibold text-gray-900">{event.actorName}</span>
                        {event.actorId && (
                          <span className="text-[10px] text-gray-500 font-mono ml-1">({event.actorId.substring(0, 8)})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase font-semibold block">Designated Role</span>
                        <span className="font-semibold text-herb-green-800 capitalize bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-0.5">
                          {event.actorRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Geolocation with full address */}
                  {event.location && (
                    <div className="flex items-start text-xs text-gray-700 gap-2 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-blue-900 block">Verified GPS Origin / Facility:</span>
                        <span className="text-blue-800 font-medium">{event.location.address || 'Location registered'}</span>
                        {event.location.latitude && event.location.longitude && (
                          <span className="text-[10px] text-blue-600/80 font-mono block mt-0.5">
                            Coordinates: {event.location.latitude.toFixed(5)}° N, {event.location.longitude.toFixed(5)}° E
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lab Test Parameters (if testing stage) */}
                  {event.labParameters && (
                    <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 flex items-center gap-1.5">
                          <Beaker className="w-3.5 h-3.5 text-purple-600" />
                          <span>Laboratory Test Results</span>
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {event.labResult || 'PASSED'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-white p-2 rounded-lg border border-purple-100">
                          <span className="text-gray-500 block text-[10px]">Chemical Purity</span>
                          <span className="font-bold text-purple-900">{event.labParameters.purity}%</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-purple-100">
                          <span className="text-gray-500 block text-[10px]">Moisture Content</span>
                          <span className="font-bold text-purple-900">{event.labParameters.moistureContent}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stage Notes */}
                  {event.notes && (
                    <div className="p-3 rounded-xl bg-gray-50 text-gray-700 border border-gray-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Execution Notes</span>
                      <p className="italic text-gray-800">{event.notes}</p>
                    </div>
                  )}

                  {/* Event Picture / Media attachment */}
                  {event.imageUrl && (
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Stage Image Evidence
                      </span>
                      <img 
                        src={event.imageUrl} 
                        alt={`${s.label} evidence`} 
                        className="h-28 rounded-xl object-cover border border-gray-200 shadow-xs" 
                      />
                    </div>
                  )}

                  {/* Documents & Lab Certificates */}
                  {event.documents && event.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {event.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-medium">Certificate #{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blockchain Transaction Verification Link */}
                  {event.blockchainTxHash && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-emerald-600" />
                        <span>Cryptographic Ledger Anchor:</span>
                      </span>

                      {event.blockchainTxHash.startsWith('mock-') ? (
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-500 font-semibold">
                          Tx: {event.blockchainTxHash.substring(0, 14)}... <span className="italic text-[10px]">(Local Devnet)</span>
                        </span>
                      ) : (
                        <a
                          href={event.blockchainExplorerUrl || `https://sepolia.etherscan.io/tx/${event.blockchainTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono bg-emerald-50 px-2.5 py-0.5 rounded-lg text-emerald-700 hover:text-emerald-900 border border-emerald-200 transition-colors flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <span>Tx: {event.blockchainTxHash.substring(0, 8)}...{event.blockchainTxHash.substring(event.blockchainTxHash.length - 6)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
