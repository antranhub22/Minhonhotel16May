export interface Staff {
  id: string;
  name: string;
  position: string;
  department: string;
  status: 'active' | 'on_leave' | 'inactive';
  email: string;
  phone: string;
  joinDate: string;
}

export const mockStaffData: Staff[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Front Desk Manager',
    department: 'Front Office',
    status: 'active',
    email: 'john.doe@minhonhotel.com',
    phone: '+84 123 456 789',
    joinDate: '2023-01-01'
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Housekeeping Supervisor',
    department: 'Housekeeping',
    status: 'active',
    email: 'jane.smith@minhonhotel.com',
    phone: '+84 123 456 790',
    joinDate: '2023-02-01'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    position: 'Chef',
    department: 'Food & Beverage',
    status: 'on_leave',
    email: 'mike.johnson@minhonhotel.com',
    phone: '+84 123 456 791',
    joinDate: '2023-03-01'
  }
]; 