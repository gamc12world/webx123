import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UserWithPassword extends User {
  password: string;
}

// Mock users data
const users: UserWithPassword[] = [
  {
    id: uuidv4(),
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    name: 'Admin User',
    isAdmin: true,
  },
  {
    id: uuidv4(),
    email: 'user@example.com',
    password: 'user123', // In a real app, this would be hashed
    name: 'Regular User',
    isAdmin: false,
  },
];

export const findUserByEmail = (email: string): UserWithPassword | undefined => {
  return users.find(user => user.email === email);
};

export const validateCredentials = (email: string, password: string): User | undefined => {
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return undefined;
};

export const createUser = (email: string, name: string, password: string): User => {
  const newUser: UserWithPassword = {
    id: uuidv4(),
    email,
    password,
    name,
    isAdmin: false,
  };
  users.push(newUser);
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export { users }