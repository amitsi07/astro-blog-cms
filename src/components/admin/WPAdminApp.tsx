import React from 'react';
import { PromptProvider, usePrompts } from '../../context/PromptContext';
import { WordPressAdmin } from './WordPressAdmin';
import { AdminLogin } from './AdminLogin';

const WPAdminAppContent: React.FC = () => {
  const { isAuthenticated, login } = usePrompts();

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  return <WordPressAdmin />;
};

export const WPAdminApp: React.FC = () => {
  return (
    <PromptProvider>
      <WPAdminAppContent />
    </PromptProvider>
  );
};

export default WPAdminApp;
