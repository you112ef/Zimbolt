// app/components/chat/SendButton.tsx

'use client';

import React from 'react';
import { AnimatePresence, cubicBezier, motion } from 'framer-motion';
import { ArrowRight, StopCircle } from 'phosphor-react'; // Importing icon components

interface SendButtonProps {
  show: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onImagesSelected?: (images: File[]) => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

const SendButton: React.FC<SendButtonProps> = ({ show, isStreaming, disabled, onClick }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className="absolute flex justify-center items-center top-[18px] right-[22px] p-1 bg-accent-500 hover:brightness-94 text-white rounded-md w-[34px] h-[34px] transition-theme disabled:opacity-50 disabled:cursor-not-allowed"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();

            if (!disabled) {
              onClick?.(event);
            }
          }}
        >
          <div className="text-lg">
            {!isStreaming ? <ArrowRight size={20} weight="bold" /> : <StopCircle size={20} weight="bold" />}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default SendButton;
