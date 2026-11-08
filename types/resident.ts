export type Resident = {
  id: string;
  fullName: string;
  email: string;
  unit: string;
  passwordHash: string | null;
  inviteToken: string | null;
  invitedAt: string | null;
  createdAt: string;
  isAdmin: boolean;
  lotAreaSqm: number | null;
  monthlyDuesMode: 'Fixed' | 'PerArea';
  monthlyDuesRate: number;
  duesRateOverride: boolean;
};
