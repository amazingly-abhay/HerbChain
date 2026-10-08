import { motion } from 'framer-motion';
import { Check, Clock, MapPin, Link as LinkIcon, FileText, ExternalLink } from 'lucide-react';
import { BatchEvent, SupplyChainStage } from '@/lib/types';
import { SUPPLY_CHAIN_STAGES } from '@/lib/constants';
import { formatDateTime, getStageColor } from '@/lib/utils';

interface BatchTimelineProps {
  events: BatchEvent[];
  currentStage: SupplyChainStage;
}

export default function BatchTimeline({ events, currentStage }: BatchTimelineProps) {
  const currentStageIndex = SUPPLY_CHAIN_STAGES.findIndex(s => s.stage === currentStage);

  return (
    <div className="relative pl-6 border-l-2 border-gray-200 ml-4 space-y-8 pb-4">
      {SUPPLY_CHAIN_STAGES.map((s, index) => {
        const stage = s.stage;
        const event = events.find(e => e.stage === stage);
        const isCompleted = index < currentStageIndex || (index === currentStageIndex && !!event);
        const isCurrent = index === currentStageIndex && !event;
        const color = getStageColor(stage);
        
        return (
          <motion.div 
            key={stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div 
              className={`absolute -left-[35px] w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white
                ${isCompleted ? 'border-green-500 bg-green-5 text-green-600' : 
                  isCurrent ? 'border-amber-400 ring-4 ring-amber-100' : 'border-gray-300'}
              `}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5" /> : 
               isCurrent ? <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> : null}
            </div>

            <div className={`p-4 rounded-xl border ${isCompleted || isCurrent ? 'bg-white shadow-sm border-gray-200' : 'bg-gray-50 border-transparent opacity-70'}`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 capitalize text-lg flex items-center gap-2">
                  {s.label}
                  {(isCompleted || isCurrent) && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  )}
                </h4>
                {event && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(event.timestamp)}
                  </span>
                )}
              </div>

              {event ? (
                <div className="space-y-3 mt-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.actorName}</p>
                      <p className="text-xs text-gray-500 capitalize">{event.actorRole}</p>
                    </div>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600 gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-md w-fit">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{event.location.address || `${event.location.latitude.toFixed(4)}, ${event.location.longitude.toFixed(4)}`}</span>
                    </div>
                  )}

                  {event.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {event.notes}
                    </p>
                  )}

                  {event.documents && event.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.documents.map((_, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                          <FileText className="w-3 h-3" />
                          Document {i + 1}
                        </div>
                      ))}
                    </div>
                  )}

                  {event.blockchainTxHash && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      <LinkIcon className="w-3 h-3" />
                      {event.blockchainTxHash.startsWith('mock-') ? (
                        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">
                          Tx: {event.blockchainTxHash.substring(0, 14)}... <span className="text-[10px] italic">(mock)</span>
                        </span>
                      ) : (
                        <a
                          href={event.blockchainExplorerUrl || `https://sepolia.etherscan.io/tx/${event.blockchainTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono bg-green-50 px-1.5 py-0.5 rounded text-green-700 hover:text-green-900 hover:bg-green-100 transition-colors flex items-center gap-1"
                        >
                          Tx: {event.blockchainTxHash.substring(0, 10)}...{event.blockchainTxHash.substring(event.blockchainTxHash.length - 8)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  {isCurrent ? 'Awaiting update for this stage.' : 'Upcoming stage.'}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
