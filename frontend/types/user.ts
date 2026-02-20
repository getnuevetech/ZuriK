export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'customer' | 'designer' | 'fabric_seller' | 'qa' | 'admin';
  isActive: boolean;
}

export interface Designer extends User {
  role: 'designer';
}

export interface FabricSeller extends User {
  role: 'fabric_seller';
}
