import React from 'react';
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { AuthState, User } from '../types/auth';
import { getCurrentUser, setCurrentUser, clearCurrentUser } from '../utils/auth';

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({
  ...initialState,
  signIn: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    async function loadUser() {
      try {
        await clearCurrentUser(); // Add this line to clear any existing user data
        const user = await getCurrentUser();
        setState(prev => ({ ...prev, user, isLoading: false }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error', 
          isLoading: false 
        }));
      }
    }

    loadUser();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: profileData.full_name || profileData.username || '',
          role: profileData.role || 'user',
          user_type: profileData.user_type || 'employee',
          createdAt: new Date(data.user.created_at).getTime(),
        };

        await setCurrentUser(user);
        setState({ user, isLoading: false, error: null });
      }
    } catch (error) {
      setState({ 
        user: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async function signOut() {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      await clearCurrentUser();
      setState({ user: null, isLoading: false, error: null });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
