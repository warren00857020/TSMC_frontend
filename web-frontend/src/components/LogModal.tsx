// LogModal.tsx
import React from 'react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: string;
  fileName: string;
}

const modalStyle: React.CSSProperties = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%', 
  backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center' 
};

const modalContentStyle: React.CSSProperties = { 
  backgroundColor: 'white', 
  padding: '20px', 
  borderRadius: '8px', 
  width: '350px', 
  textAlign: 'center' 
};

const confirmButtonStyle: React.CSSProperties = { 
  padding: '8px 15px', 
  backgroundColor: '#28a745', 
  color: 'white', 
  border: 'none', 
  borderRadius: '5px', 
  cursor: 'pointer' 
};

const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, log, fileName }) => {
  if (!isOpen) return null;
  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h3>{fileName} 的測試報告</h3>
        <pre style={{ textAlign: 'left', maxHeight: '300px', overflowY: 'auto' }}>{log}</pre>
        <button onClick={onClose} style={confirmButtonStyle}>關閉</button>
      </div>
    </div>
  );
};

export default LogModal;
