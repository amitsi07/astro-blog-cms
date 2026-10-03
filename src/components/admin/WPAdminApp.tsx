import React from 'react';
import { PromptProvider } from '../../context/PromptContext';
import { WordPressAdmin } from './WordPressAdmin';

export const WPAdminApp: React.FC = () => {
  return (
    <PromptProvider>
      <WordPressAdmin />
    </PromptProvider>
  );
};

export default WPAdminApp;
