import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed max-h-screen inset-0 flex items-center justify-center bg-black bg-opacity-90 z-50 overflow-auto md:w-auto w-full">
      {children}
    </div>
  );
};

export default Modal;
