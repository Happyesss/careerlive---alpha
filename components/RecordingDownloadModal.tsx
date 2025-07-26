'use client';
import React from 'react';
import { Download, X, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface RecordingDownloadModalProps {
  isOpen: boolean;
  onDownload: () => void;
  onDiscard: () => void;
}

const RecordingDownloadModal: React.FC<RecordingDownloadModalProps> = ({
  isOpen,
  onDownload,
  onDiscard,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onDiscard}>
      <DialogContent className="bg-dark-1 border-dark-3 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-1" />
            Recording Completed
          </DialogTitle>
          <DialogDescription className="text-sky-2">
            Your meeting has been recorded. What would you like to do with the recording?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={onDownload}
            className="flex items-center justify-center gap-2 bg-blue-1 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Recording
          </button>
          
          <button
            onClick={onDiscard}
            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-3 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Discard Recording
          </button>
        </div>
        
        <p className="text-xs text-sky-2 mt-3">
          Note: If you discard the recording, it will be permanently deleted and cannot be recovered.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingDownloadModal;
