import { useState, useCallback } from 'react';

interface UseChatWindowState {
  newMessage: string;
  isSearchVisible: boolean;
  searchQuery: string;
  isMenuOpen: boolean;
  isSending: boolean;
}

interface UseChatWindowActions {
  setNewMessage: (message: string) => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  toggleMenu: () => void;
  setIsSending: (sending: boolean) => void;
  resetState: () => void;
}

const initialState: UseChatWindowState = {
  newMessage: '',
  isSearchVisible: false,
  searchQuery: '',
  isMenuOpen: false,
  isSending: false
};

export const useChatWindow = (): [UseChatWindowState, UseChatWindowActions] => {
  const [state, setState] = useState<UseChatWindowState>(initialState);

  const actions: UseChatWindowActions = {
    setNewMessage: useCallback((message: string) => {
      setState(prev => ({ ...prev, newMessage: message }));
    }, []),

    toggleSearch: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        isSearchVisible: !prev.isSearchVisible,
        searchQuery: prev.isSearchVisible ? '' : prev.searchQuery
      }));
    }, []),

    setSearchQuery: useCallback((query: string) => {
      setState(prev => ({ ...prev, searchQuery: query }));
    }, []),

    toggleMenu: useCallback(() => {
      setState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }));
    }, []),

    setIsSending: useCallback((sending: boolean) => {
      setState(prev => ({ ...prev, isSending: sending }));
    }, []),

    resetState: useCallback(() => {
      setState(initialState);
    }, [])
  };

  return [state, actions];
};

export default useChatWindow;
