'use client';
import React from 'react';
import { Video, Monitor, Download, Info } from 'lucide-react';

const RecordingsPage = () => {
  return (
    <div className="min-h-screen bg-dark-2">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500/10 p-3 rounded-lg">
              <Video className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Recording Quick Guide</h1>
              <p className="text-sky-2">Learn how to record your meetings effectively</p>
            </div>
          </div>
        </div>

        {/* Local Recording Info */}
        <div className="bg-dark-1 rounded-xl p-6 border border-dark-3 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-1 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Recording Quick Guide</h3>
              <p className="text-sky-2 mb-4">
                Learn how to effectively record your meetings with our simple local recording system. 
                Follow these steps to capture important conversations and share them securely.
              </p>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-dark-1 rounded-xl p-6 border border-dark-3 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">How Local Recording Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-1 flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <h4 className="text-white font-medium mb-1">Start Recording</h4>
                <p className="text-sm text-sky-2">Click the record button during your meeting to begin capturing video and audio</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-semibold">2</div>
              <div>
                <h4 className="text-white font-medium mb-1">Stop Recording</h4>
                <p className="text-sm text-sky-2">Click the stop button to finish recording and see your options</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm font-semibold">3</div>
              <div>
                <h4 className="text-white font-medium mb-1">Choose Action</h4>
                <p className="text-sm text-sky-2">Download the recording to your device or discard it permanently</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-1 flex items-center justify-center text-sm font-semibold">4</div>
              <div>
                <h4 className="text-white font-medium mb-1">Local Storage</h4>
                <p className="text-sm text-sky-2">Files are saved directly to your Downloads folder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
          <h3 className="text-lg font-semibold text-white mb-4">Benefits of Local Recording</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Monitor className="w-5 h-5 text-blue-1 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Complete Privacy</h4>
                <p className="text-sm text-sky-2">Your recordings never leave your device unless you choose to share them</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Instant Access</h4>
                <p className="text-sm text-sky-2">Download recordings immediately after your meeting ends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-purple-500 mt-0.5"></div>
              <div>
                <h4 className="text-white font-medium mb-1">No Storage Limits</h4>
                <p className="text-sm text-sky-2">Only limited by your device's available storage space</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-orange-1 mt-0.5"></div>
              <div>
                <h4 className="text-white font-medium mb-1">Full Control</h4>
                <p className="text-sm text-sky-2">Decide to keep or discard recordings on a case-by-case basis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingsPage;
