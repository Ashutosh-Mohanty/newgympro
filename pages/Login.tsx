import React, { useState } from 'react';
import { UserRole } from '../types.ts';
import { Input, Button, Card } from '../components/UI.tsx';
import { getMembers, getGyms } from '../services/storage.ts';

interface LoginProps {
  onLogin: (role: UserRole, data: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.MANAGER);
  const [gymId, setGymId] = useState('GYM001');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === UserRole.SUPER_ADMIN) {
        if (username === 'super' && password === 'admin') {
            onLogin(UserRole.SUPER_ADMIN, { name: 'Platform Admin' });
        } else {
            setError('Invalid Master Admin credentials');
        }
        return;
    }

    const gyms = getGyms();
    const targetGym = gyms.find(g => g.id === gymId);

    if (!targetGym) {
        setError('Gym ID not found in our database');
        return;
    }

    if (targetGym.status === 'PAUSED') {
        setError('This gym account is currently suspended.');
        return;
    }

    const isExpired = new Date(targetGym.subscriptionExpiry) < new Date();
    if (isExpired && role !== UserRole.SUPER_ADMIN) {
        setError('Gym subscription has expired. Please contact support.');
        return;
    }

    if (role === UserRole.MANAGER) {
      if (password === targetGym.password) {
        onLogin(UserRole.MANAGER, { ...targetGym, role: UserRole.MANAGER });
      } else {
        setError('Incorrect Manager password');
      }
    } else if (role === UserRole.MEMBER) {
      const members = getMembers(gymId);
      const member = members.find(m => m.id === username || m.phone === username);
      if (member && password === member.password) {
        onLogin(UserRole.MEMBER, member);
      } else {
        setError('Invalid Member ID or Password');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-12 px-4 relative">
      {/* Background decoration to ensure visibility */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gym-accent/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      {/* Brand Header - Completely Static */}
      <div className="mb-12 text-center">
        <div className="w-24 h-24 bg-gym-accent rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gym-accent/20 border-4 border-slate-900 ring-1 ring-gym-accent/30">
            <i className="fas fa-dumbbell text-4xl text-white"></i>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">GymPro <span className="text-gym-accent">Central</span></h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">Integrated Management Solution</p>
      </div>

      {/* Main Login Panel */}
      <Card className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] p-8">
        <form onSubmit={handleLogin} className="space-y-8">
          
          {/* High-Impact Toggle (Main Highlight) */}
          <div className="bg-slate-950/80 p-1.5 rounded-2xl flex border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => { setRole(UserRole.MANAGER); setError(''); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${role === UserRole.MANAGER ? 'bg-gym-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-user-tie text-base"></i>
              Gym Manager
            </button>
            <button
              type="button"
              onClick={() => { setRole(UserRole.MEMBER); setError(''); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${role === UserRole.MEMBER ? 'bg-gym-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-user text-base"></i>
              Member Login
            </button>
          </div>

          <div className="space-y-6">
            {/* Restricted Area Alert */}
            {role === UserRole.SUPER_ADMIN && (
               <div className="bg-blue-600/10 border border-blue-500/30 p-3 rounded-xl text-center flex items-center justify-center gap-3">
                  <i className="fas fa-shield-halved text-blue-400"></i>
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Master System Override</span>
               </div>
            )}

            <div className="space-y-4">
              {role !== UserRole.SUPER_ADMIN && (
                <Input 
                  label="Gym Identity Code" 
                  placeholder="e.g. GYM001" 
                  value={gymId} 
                  required
                  autoComplete="off"
                  onChange={e => setGymId(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-12 text-sm"
                />
              )}

              {(role === UserRole.MEMBER || role === UserRole.SUPER_ADMIN) && (
                <Input 
                  label={role === UserRole.MEMBER ? "Mobile or ID" : "Admin Username"} 
                  placeholder={role === UserRole.MEMBER ? "9876543210" : "Master UID"}
                  value={username} 
                  required
                  onChange={e => setUsername(e.target.value)}
                  className="bg-slate-950 border-slate-800 h-12 text-sm"
                />
              )}

              <Input 
                label="Security Password" 
                type="password" 
                placeholder="••••••••"
                value={password} 
                required
                onChange={e => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 h-12 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-bold flex items-center gap-3 animate-fade-in">
              <i className="fas fa-triangle-exclamation text-base"></i>
              <span className="leading-tight">{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-5 text-sm font-black uppercase tracking-[0.3em] shadow-xl shadow-gym-accent/20" size="lg">
            Authenticate Access
          </Button>
          
          {/* Discrete Platform Admin Entry */}
          <div className="text-center pt-6 border-t border-slate-800/80">
            {role !== UserRole.SUPER_ADMIN ? (
              <button 
                type="button"
                onClick={() => { setRole(UserRole.SUPER_ADMIN); setError(''); }}
                className="text-[9px] text-slate-600 hover:text-gym-accent font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <i className="fas fa-lock text-[8px]"></i> Platform System Administrator
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => { setRole(UserRole.MANAGER); setError(''); }}
                className="text-[9px] text-slate-600 hover:text-white font-black uppercase tracking-widest transition-all"
              >
                ← Return to Portal
              </button>
            )}
          </div>
        </form>
      </Card>
      
      {/* Help Footer */}
      <div className="mt-12 flex flex-col items-center gap-4 text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] text-center">
        <div className="flex gap-8 px-6 py-2 bg-slate-900/50 rounded-full border border-slate-800">
            <span>GYM: <span className="text-slate-400">GYM001 / admin</span></span>
            <span>MASTER: <span className="text-slate-400">super / admin</span></span>
        </div>
        <p className="text-slate-700">GymPro Central v4.2.0 • Enterprise Edition</p>
      </div>
    </div>
  );
};

export default Login;