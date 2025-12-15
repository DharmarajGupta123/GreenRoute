import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  icon: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content, icon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-800">
        <div className="relative p-8 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-50 p-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          <div className="mb-6 flex justify-center transform scale-125">
            {icon}
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
          
          <div className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-left text-sm md:text-base">
            {content}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 dark:shadow-green-900/40 transition-all transform active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};