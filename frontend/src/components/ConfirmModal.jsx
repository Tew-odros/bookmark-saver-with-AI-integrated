import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger", closeOnBackdrop = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 overflow-y-auto pt-20 md:pt-32">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-bg/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md glass-card p-8 shadow-2xl animate-in zoom-in-95 duration-300 border-brand-border/50 my-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-brand-muted hover:text-brand-accent transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-brand-accent/10 text-brand-accent'
          }`}>
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-2xl font-black tracking-tight mb-2 text-brand-text">{title}</h3>
          <p className="text-brand-muted leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              className="btn-secondary flex-1 py-4 text-sm font-bold uppercase tracking-widest"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest rounded-xl text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                type === 'danger' 
                  ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' 
                  : 'bg-brand-accent shadow-brand-accent/20 hover:bg-brand-accent/90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
