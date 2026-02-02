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
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-12 px-4">
      {/* Static Header */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-gym-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gym-accent/10">
            <i className="fas fa-dumbbell text-3xl text-white"></i>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">GymPro <span className="text-gym-accent">Central</span></h1>
        <p className="text-slate-500 mt-1.5 text-sm font-medium">Professional Management Portal</p>
      </div>

      <Card className="w-full max-w-md bg-gym-card/80 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Main Toggle: Highlighted Manager & Member */}
          <div className="bg-slate-900/60 p-1.5 rounded-xl flex border border-slate-800">
            <button
              type="button"
              onClick={() => { setRole(UserRole.MANAGER); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${role === UserRole.MANAGER ? 'bg-gym-accent text-white shadow-lg shadow-gym-accent/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-user-tie"></i> Manager
            </button>
            <button
              type="button"
              onClick={() => { setRole(UserRole.MEMBER); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${role === UserRole.MEMBER ? 'bg-gym-accent text-white shadow-lg shadow-gym-accent/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-user"></i> Member
            </button>
          </div>

          <div className="space-y-4">
            {/* Conditional Labeling */}
            {role === UserRole.SUPER_ADMIN && (
               <div className="bg-blue-500/10 border border-blue-500/20 py-2 rounded-lg text-center mb-4">
                  <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Platform Administration Mode</span>
               </div>
            )}

            {role !== UserRole.SUPER_ADMIN && (
              <Input 
                label="Gym ID" 
                placeholder="e.g. GYM001" 
                value={gymId} 
                required
                autoComplete="off"
                onChange={e => setGymId(e.target.value)}
              />
            )}

            {(role === UserRole.MEMBER || role === UserRole.SUPER_ADMIN) && (
              <Input 
                label={role === UserRole.MEMBER ? "Mobile or Member ID" : "Admin Username"} 
                placeholder={role === UserRole.MEMBER ? "Enter your mobile" : "super"}
                value={username} 
                required
                onChange={e => setUsername(e.target.value)}
              />
            )}

            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              value={password} 
              required
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-fade-in">
              <i className="fas fa-circle-info"></i>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-3.5 text-sm font-bold uppercase tracking-widest" size="lg">
            Login Securely
          </Button>
          
          {/* Subtle Super Admin Entry */}
          <div className="text-center pt-4 border-t border-slate-800/50 mt-4">
            {role !== UserRole.SUPER_ADMIN ? (
              <button 
                type="button"
                onClick={() => { setRole(UserRole.SUPER_ADMIN); setError(''); }}
                className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors"
              >
                System Administrator? Login Here
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => { setRole(UserRole.MANAGER); setError(''); }}
                className="text-[10px] text-slate-600 hover:text-slate-400 font-bold uppercase tracking-widest transition-colors"
              >
                Back to Gym Portal
              </button>
            )}
          </div>
        </form>
      </Card>
      
      <div className="mt-8 flex gap-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        <span>Manager: GYM001 / admin</span>
        <span>Admin: super / admin</span>
      </div>
    </div>
  );
};

export default Login;