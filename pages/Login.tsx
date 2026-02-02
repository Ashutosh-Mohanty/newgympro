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
  const [username, setUsername] = useState(''); // Only used for Members/SuperAdmin
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === UserRole.SUPER_ADMIN) {
        if (username === 'super' && password === 'admin') {
            onLogin(UserRole.SUPER_ADMIN, { name: 'Platform Admin' });
        } else {
            setError('Invalid Super Admin credentials');
        }
        return;
    }

    const gyms = getGyms();
    const targetGym = gyms.find(g => g.id === gymId);

    if (!targetGym) {
        setError('Gym ID not found');
        return;
    }

    // Check platform status
    if (targetGym.status === 'PAUSED') {
        setError('This gym account is currently paused. Please contact support.');
        return;
    }

    // Check platform subscription expiry
    const isExpired = new Date(targetGym.subscriptionExpiry) < new Date();
    if (isExpired && role !== UserRole.SUPER_ADMIN) {
        setError('Platform subscription expired. Please contact Super Admin.');
        return;
    }

    if (role === UserRole.MANAGER) {
      if (password === targetGym.password) {
        onLogin(UserRole.MANAGER, { ...targetGym, role: UserRole.MANAGER });
      } else {
        setError('Invalid Manager password');
      }
    } else if (role === UserRole.MEMBER) {
      const members = getMembers(gymId);
      const member = members.find(m => m.id === username || m.phone === username);
      if (member && password === member.password) {
        onLogin(UserRole.MEMBER, member);
      } else {
        setError('Invalid Member credentials');
      }
    }
  };

  const roleOptions = [
    { label: 'Platform Admin', value: UserRole.SUPER_ADMIN, icon: 'fa-shield-halved' },
    { label: 'Gym Manager', value: UserRole.MANAGER, icon: 'fa-user-tie' },
    { label: 'Gym Member', value: UserRole.MEMBER, icon: 'fa-user' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-8">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-gym-accent rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-gym-accent/20">
            <i className="fas fa-dumbbell text-4xl text-white"></i>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">GymPro <span className="text-gym-accent">Central</span></h1>
        <p className="text-slate-400 mt-2 font-medium">Enterprise Management Solution</p>
      </div>

      <Card className="w-full max-w-md backdrop-blur-md bg-gym-card/95 border-slate-700/80 shadow-2xl">
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="bg-slate-900/50 p-1.5 rounded-xl flex gap-1 border border-slate-800">
            {roleOptions.map((opt) => (
               <button
                 key={opt.value}
                 type="button"
                 onClick={() => {
                   setRole(opt.value);
                   setError('');
                 }}
                 className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-1 rounded-lg transition-all ${role === opt.value ? 'bg-gym-accent text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <i className={`fas ${opt.icon} text-sm`}></i>
                 <span className="text-[10px] font-bold uppercase tracking-tight leading-none">{opt.label.split(' ')[1]}</span>
               </button>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            {role === UserRole.SUPER_ADMIN && (
               <div className="text-center py-2.5 mb-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em]">Master Portal Login</p>
               </div>
            )}

            {role !== UserRole.SUPER_ADMIN && (
              <Input 
                label="Gym Identifier (ID)" 
                placeholder="e.g. GYM001" 
                value={gymId} 
                required
                onChange={e => setGymId(e.target.value)}
              />
            )}

            {(role === UserRole.MEMBER || role === UserRole.SUPER_ADMIN) && (
              <Input 
                label={role === UserRole.MEMBER ? "Mobile Number or Member ID" : "Administrator Username"} 
                placeholder={role === UserRole.MEMBER ? "9876543210" : "super"}
                value={username} 
                required
                onChange={e => setUsername(e.target.value)}
              />
            )}

            <Input 
              label="Secure Password" 
              type="password" 
              placeholder="••••••••"
              value={password} 
              required
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-fade-in">
              <i className="fas fa-circle-exclamation mt-0.5"></i>
              <span className="font-medium leading-tight">{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full py-4 text-base font-bold shadow-lg shadow-gym-accent/10" size="lg">
            Login as {roleOptions.find(o => o.value === role)?.label.split(' ')[1]}
          </Button>
          
          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Access Help</span>
                <span className="text-[10px] text-slate-400 font-medium">Demo Credentials Provided</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50 text-[10px] text-slate-500">
                  <span className="text-slate-400 font-bold block mb-0.5">Gym Manager:</span>
                  ID: <span className="text-slate-300">GYM001</span> | Pass: <span className="text-slate-300">admin</span>
                </div>
                <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50 text-[10px] text-slate-500">
                  <span className="text-slate-400 font-bold block mb-0.5">Platform Admin:</span>
                  User: <span className="text-slate-300">super</span> | Pass: <span className="text-slate-300">admin</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Card>
      
      <p className="mt-8 text-slate-600 text-xs font-medium">
        &copy; {new Date().getFullYear()} GymPro Management Solutions. All rights reserved.
      </p>
    </div>
  );
};

export default Login;