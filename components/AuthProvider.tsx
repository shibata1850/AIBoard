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
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{user: User | null, error: string | null}>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}>({
  ...initialState,
  signIn: async () => {},
  signUp: async () => ({ user: null, error: null }),
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    async function loadUser() {
      try {
        await clearCurrentUser();
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
            throw profileError;
          }
          
          const userData = profileData || {
            username: session.user.email?.split('@')[0] || '',
            full_name: '',
            role: 'user',
            user_type: 'employee',
          };
          
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: userData.full_name || userData.username || '',
            role: userData.role || 'user',
            user_type: userData.user_type || 'employee',
            createdAt: new Date(session.user.created_at || Date.now()).getTime(),
          };
          
          await setCurrentUser(user);
          setState({ user, isLoading: false, error: null });
        } else {
          setState({ user: null, isLoading: false, error: null });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        await clearCurrentUser();
        setState({ 
          user: null, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    loadUser();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await clearCurrentUser();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('メールアドレスの確認が必要です。メールをご確認ください。');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('メールアドレスまたはパスワードが正しくありません。');
        }
        throw error;
      }

      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username: email.split('@')[0],
                full_name: '',
                role: 'user',
                user_type: 'employee',
                updated_at: new Date().toISOString(),
              },
            ]);

          if (insertError) throw insertError;
          
          const { data: newProfileData, error: newProfileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (newProfileError) throw newProfileError;
          
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: newProfileData.full_name || newProfileData.username || '',
            role: newProfileData.role || 'user',
            user_type: newProfileData.user_type || 'employee',
            createdAt: new Date(data.user.created_at).getTime(),
          };
  
          await setCurrentUser(user);
          setState({ user, isLoading: false, error: null });
        } else if (profileError) {
          throw profileError;
        } else {
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
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setState({ 
        user: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async function signOut() {
    try {
      console.log('SignOut: Step 1 - Starting logout process');
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('SignOut: Step 2 - Clearing current user from AsyncStorage');
      await clearCurrentUser();
      console.log('SignOut: Step 2 completed - User data cleared from AsyncStorage');
      
      console.log('SignOut: Step 3 - Setting state to logged out');
      setState({ user: null, isLoading: false, error: null });
      console.log('SignOut: Step 3 completed - State reset');
      
      console.log('SignOut: Step 4 - Calling supabase.auth.signOut()');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('SignOut: Supabase signOut error:', error);
        throw new Error(`ログアウト処理中にエラーが発生しました: ${error.message}`);
      }
      
      console.log('SignOut: Step 4 completed - Supabase signOut successful');
      
      if (typeof window !== 'undefined') {
        console.log('SignOut: Step 5 - Redirecting to login page');
        try {
          window.location.href = '/login';
          console.log('SignOut: Redirect initiated');
        } catch (redirectError) {
          console.error('SignOut: Redirect error:', redirectError);
          window.location.replace('/login');
        }
      } else {
        console.log('SignOut: Window is undefined, cannot redirect');
      }
      
      console.log('SignOut: All steps completed successfully');
      return;
    } catch (error) {
      console.error('SignOut: Error during logout process:', error);
      
      setState({ 
        user: null, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'ログアウト中に予期せぬエラーが発生しました'
      });
      
      if (typeof window !== 'undefined') {
        console.log('SignOut: Attempting to redirect after error');
        window.location.href = '/login';
      }
    }
  }

  async function signUp(email: string, password: string, userData: Partial<User>) {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await clearCurrentUser();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name || '',
            user_type: userData.user_type || 'employee',
            role: userData.role || 'user',
          },
        },
      });

      if (error) throw error;

      if (data.user && !data.session) {
        console.log('Email confirmation required for:', email);
        
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username: email.split('@')[0],
                full_name: userData.name || '',
                role: userData.role || 'user',
                user_type: userData.user_type || 'employee',
                updated_at: new Date().toISOString(),
              },
            ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        } catch (profileError) {
          console.error('Error in profile creation:', profileError);
        }
        
        const errorMessage = 'メールアドレスの確認が必要です。メールをご確認ください。';
        setState({ 
          user: null, 
          isLoading: false, 
          error: errorMessage
        });
        return { user: null, error: errorMessage };
      }
      
      if (data.user && data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: email.split('@')[0],
              full_name: userData.name || '',
              role: userData.role || 'user',
              user_type: userData.user_type || 'employee',
              updated_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: userData.name || '',
          role: userData.role || 'user',
          user_type: userData.user_type || 'employee',
          createdAt: new Date(data.user.created_at || Date.now()).getTime(),
        };

        await setCurrentUser(user);
        setState({ user, isLoading: false, error: null });
        return { user, error: null };
      }
      
      return { user: null, error: 'アカウント登録中に予期せぬエラーが発生しました。' };
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('duplicate key')) {
        errorMessage = 'このメールアドレスは既に登録されています。';
      }
      
      setState({ 
        user: null, 
        isLoading: false, 
        error: errorMessage
      });
      return { user: null, error: errorMessage };
    }
  }

  async function signInWithGoogle() {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await clearCurrentUser();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        if (error.message && error.message.includes('provider is not enabled')) {
          throw new Error('Google認証が有効になっていません。Supabaseダッシュボードで設定してください。');
        }
        throw error;
      }
      
      console.log('Google OAuth redirect initiated:', data);
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (error instanceof Error) {
        console.error('Detailed error:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      
      setState({ 
        user: null, 
        isLoading: false, 
        error: errorMessage
      });
    }
  }

  async function signInWithApple() {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await clearCurrentUser();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            scope: 'name email',
          },
        },
      });

      if (error) {
        if (error.message && error.message.includes('provider is not enabled')) {
          throw new Error('Apple認証が有効になっていません。Supabaseダッシュボードで設定してください。');
        }
        throw error;
      }
      
      console.log('Apple OAuth redirect initiated:', data);
    } catch (error) {
      console.error('Apple sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (error instanceof Error) {
        console.error('Detailed error:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      
      setState({ 
        user: null, 
        isLoading: false, 
        error: errorMessage
      });
    }
  }

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      signIn, 
      signUp,
      signInWithGoogle,
      signInWithApple,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
