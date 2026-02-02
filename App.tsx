import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthState, UserRole } from './types.ts';
import Login from './pages/Login.tsx';
import ManagerDashboard from './pages/ManagerDashboard.tsx';
import MemberDashboard from './pages/MemberDashboard.tsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.tsx';

// --- Auth Context ---
interface AuthContextType {
  authState: AuthState;
  login: (role: UserRole, data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// --- Main App ---
export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null,
  });

  useEffect(() => {
    const savedAuth = localStorage.getItem('gym_auth');
    if (savedAuth) {
      try {
        setAuthState(JSON.parse(savedAuth));
      } catch (e) {
        localStorage.removeItem('gym_auth');
      }
    }
  }, []);

  const login = (role: UserRole, data: any) => {
    const newAuth = { isAuthenticated: true, user: data, role };
    setAuthState(newAuth);
    localStorage.setItem('gym_auth', JSON.stringify(newAuth));
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null, role: null });
    localStorage.removeItem('gym_auth');
  };

  let CurrentView;
  if (!authState.isAuthenticated) {
    CurrentView = <Login onLogin={login} />;
  } else {
    switch (authState.role) {
      case UserRole.SUPER_ADMIN:
        CurrentView = <SuperAdminDashboard />;
        break;
      case UserRole.MANAGER:
        CurrentView = <ManagerDashboard />;
        break;
      case UserRole.MEMBER:
        CurrentView = <MemberDashboard />;
        break;
      default:
        CurrentView = <Login onLogin={login} />;
    }
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      <div className="min-h-screen bg-gym-dark text-gym-text selection:bg-gym-accent selection:text-white">
        {authState.isAuthenticated && (
           <nav className="border-b border-slate-800 bg-gym-dark/95 backdrop-blur-md sticky top-0 z-40">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between h-16 items-center">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-gym-accent flex items-center justify-center shadow-lg shadow-gym-accent/20">
                     <i className="fas fa-dumbbell text-white text-sm"></i>
                   </div>
                   <span className="font-bold text-xl tracking-tighter text-white">GymPro<span className="text-gym-accent">Central</span></span>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                     <div className="text-sm font-bold text-white leading-none">
                        {authState.role === UserRole.SUPER_ADMIN ? 'Master Admin' : (authState.user as any)?.name}
                     </div>
                     <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                        {authState.role?.replace('_', ' ')}
                     </div>
                   </div>
                   <button 
                    onClick={logout}
                    className="p-2.5 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all border border-slate-700/50"
                   >
                     <i className="fas fa-power-off"></i>
                   </button>
                 </div>
               </div>
             </div>
           </nav>
        )}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {CurrentView}
        </main>
      </div>
    </AuthContext.Provider>
  );
}