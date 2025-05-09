export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  role: 'admin' | 'member';
  created_at: string;
  expires_at: string;
}
