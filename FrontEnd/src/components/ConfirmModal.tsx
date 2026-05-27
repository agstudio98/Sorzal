import React from 'react';
import { Trash2, AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: <Trash2 size={32} />,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      buttonBg: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
    },
    info: {
      icon: <AlertCircle size={32} />,
      iconBg: 'bg-primary-light/10',
      iconColor: 'text-primary-light',
      buttonBg: 'bg-primary-light hover:bg-primary-dark shadow-primary-light/20',
    },
    warning: {
      icon: <AlertCircle size={32} />,
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      buttonBg: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20',
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
       <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel}></div>
       <div className="relative z-[1010] w-full max-w-md glass-card p-8 border-2 border-primary-light/30 shadow-2xl animate-in zoom-in-95 duration-300">
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors opacity-50 hover:opacity-100"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
             <div className={`w-16 h-16 ${currentStyle.iconBg} rounded-full flex items-center justify-center ${currentStyle.iconColor}`}>
                {currentStyle.icon}
             </div>
             <div>
                <h3 className="title text-2xl text-primary-dark dark:text-white uppercase tracking-widest mb-2">{title}</h3>
                <p className="body text-sm opacity-60 italic">{message}</p>
             </div>
             <div className="flex gap-4 w-full pt-4">
                <button 
                  onClick={onCancel}
                  className="flex-1 py-3 bg-white/5 border border-primary-light/20 rounded-xl title text-xs hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onCancel();
                  }}
                  className={`flex-1 py-3 text-white rounded-xl title text-xs transition-all shadow-lg uppercase tracking-widest ${currentStyle.buttonBg}`}
                >
                  Confirmar
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ConfirmModal;
