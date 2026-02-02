import React, { useState } from 'react';
import { UserRole } from '../types';
import { Input, Button, Card } from '../components/UI';
import { getMembers, getGyms } from '../services/storage';

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
        setError('Gym ID not found in our records');
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
        setError('Incorrect Member ID or Password');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] py-10 px-4">
      {/* Brand Section - No Animations */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-gym-accent rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-gym-accent/20">
            <i className="fas fa-dumbbell text-4xl text-white"></i>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter leading-none">GymPro <span className="text-gym-accent">Central</span></h1>
        <p className="text-slate-400 mt-3 text-sm font-semibold uppercase tracking-widest">Master Portal Access</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-slate-900 border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Main Toggle: Highlighted Manager & Member */}
          <div className="bg-slate-950 p-1.5 rounded-xl flex border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => { setRole(UserRole.MANAGER); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${role === UserRole.MANAGER ? 'bg-gym-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <i className="fas fa-user-tie"></i> Manager
            </button>
            <button
              type="button"
              onClick={() => { setRole(UserRole.MEMBER); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${role === UserRole.MEMBER ? 'bg-gym-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <i className="fas fa-user"></i> Member
            </button>
          </div>

          <div className="space-y-5">
            {/* Context Header for Admin Mode */}
            {role === UserRole.SUPER_ADMIN && (
               <div className="bg-blue-600/20 border border-blue-500/30 py-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em]">System Admin Restricted Portal</span>
               </div>
            )}

            {role !== UserRole.SUPER_ADMIN && (
              <Input 
                label="Gym Identifier" 
                placeholder="e.g. GYM001" 
                value={gymId} 
                required
                autoComplete="off"
                onChange={e => setGymId(e.target.value)}
              />
            )}

            {(role === UserRole.MEMBER || role === UserRole.SUPER_ADMIN) && (
              <Input 
                label={role === UserRole.MEMBER ? "Registered Mobile Number" : "System Username"} 
                placeholder={role === UserRole.MEMBER ? "9876543210" : "super"}
                value={username} 
                required
                onChange={e => setUsername(e.target.value)}
              />
            )}

            <Input 
              label="Access Password" 
              type="password" 
              placeholder="••••••••"
              value={password} 
              required
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-3 animate-fade-in font-bold">
              <i className="fas fa-circle-exclamation text-base"></i>
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-sm font-black uppercase tracking-[0.2em]" size="lg">
            Authorize & Sign In
          </Button>
          
          {/* Subtle Super Admin Entry at bottom of Card */}
          <div className="text-center pt-5 border-t border-slate-800/80">
            {role !== UserRole.SUPER_ADMIN ? (
              <button 
                type="button"
                onClick={() => { setRole(UserRole.SUPER_ADMIN); setError(''); }}
                className="text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-[0.2em] transition-colors"
              >
                System Administrator? Click Here
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => { setRole(UserRole.MANAGER); setError(''); }}
                className="text-[9px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-[0.2em] transition-colors"
              >
                Return to Public Portal
              </button>
            )}
          </div>
        </form>
      </Card>
      
      {/* Help Footer */}
      <div className="mt-10 flex flex-col items-center gap-4 text-[9px] text-slate-600 font-black uppercase tracking-widest text-center">
        <div className="flex gap-8">
            <span>MANAGER: GYM001 / ADMIN</span>
            <span>SYSTEM: SUPER / ADMIN</span>
        </div>
        <p className="text-slate-700">&copy; 2024 GYMPRO CENTRAL MANAGEMENT</p>
      </div>
    </div>
  );
};

export default Login;