import { Member, Trainer, PaymentRecord, GymSettings, Gym, UserRole, TransactionCategory } from '../types.ts';

const MEMBERS_KEY = 'gym_members';
const SETTINGS_KEY = 'gym_settings';
const TRAINERS_KEY = 'gym_trainers';
const GYMS_KEY = 'gym_master_list';
const TRANSACTIONS_KEY = 'gym_transactions';

export const calculateExpiry = (startDate: string, days: number): string => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const INITIAL_GYMS: Gym[] = [
  {
    id: 'GYM001',
    name: 'Iron Paradise',
    address: '123 Muscle Street, BKC',
    city: 'Mumbai',
    idProof: 'REG-12345-IN',
    password: 'admin',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    subscriptionPlanDays: 365,
    subscriptionExpiry: calculateExpiry(new Date().toISOString(), 365),
    termsAndConditions: '1. Membership is non-refundable. 2. Proper gym attire is required. 3. Re-rack weights after use.',
    pricing: { 
      oneMonth: 1500, 
      twoMonths: 2800, 
      threeMonths: 4000, 
      sixMonths: 7000, 
      twelveMonths: 12000 
    },
    subscriptionDue: 0,
    lastPaymentDate: new Date().toISOString()
  }
];

export const getGyms = (): Gym[] => {
  const data = localStorage.getItem(GYMS_KEY);
  return data ? JSON.parse(data) : INITIAL_GYMS;
};

export const saveGyms = (gyms: Gym[]) => {
  localStorage.setItem(GYMS_KEY, JSON.stringify(gyms));
};

export const addGym = (gym: Gym) => {
  const gyms = getGyms();
  gyms.push(gym);
  saveGyms(gyms);
};

export const updateGym = (updatedGym: Gym) => {
  const gyms = getGyms();
  const index = gyms.findIndex(g => g.id === updatedGym.id);
  if (index !== -1) {
    gyms[index] = updatedGym;
    saveGyms(gyms);
  }
};

export const getMembers = (gymId?: string): Member[] => {
  const data = localStorage.getItem(MEMBERS_KEY);
  if (!data) return [];
  const members: Member[] = JSON.parse(data);
  if (gymId) return members.filter(m => String(m.gymId) === String(gymId));
  return members;
};

export const getTrainers = (gymId?: string): Trainer[] => {
  const data = localStorage.getItem(TRAINERS_KEY);
  const trainers: Trainer[] = data ? JSON.parse(data) : [];
  if (gymId) return trainers.filter(t => t.gymId === gymId);
  return trainers;
};

export const saveMembers = (members: Member[]) => {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
};

export const addMember = (member: Member) => {
  const allMembers = getMembers();
  allMembers.push(member);
  saveMembers(allMembers);
  
  recordTransaction(member.gymId, {
    id: `TX-${Date.now()}`,
    date: member.joinDate,
    amount: member.amountPaid,
    method: 'OFFLINE',
    recordedBy: 'Manager',
    category: TransactionCategory.MEMBERSHIP,
    details: `Initial joining for ${member.name}`
  });
};

export const updateMember = (updatedMember: Member) => {
  const members = getMembers();
  const index = members.findIndex(m => m.id === updatedMember.id);
  if (index !== -1) {
    members[index] = updatedMember;
    saveMembers(members);
  }
};

export const getTransactions = (gymId: string): PaymentRecord[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  const all: (PaymentRecord & { gymId: string })[] = data ? JSON.parse(data) : [];
  return all.filter(t => String(t.gymId) === String(gymId));
};

export const recordTransaction = (gymId: string, transaction: PaymentRecord) => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  const all: (PaymentRecord & { gymId: string })[] = data ? JSON.parse(data) : [];
  all.push({ ...transaction, gymId });
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(all));
};

export const getSettings = (): GymSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { autoNotifyWhatsApp: false, gymName: 'GymPro' };
};

export const getMemberStatus = (expiryDate: string): 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON' => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 5) return 'EXPIRING_SOON';
  return 'ACTIVE';
};