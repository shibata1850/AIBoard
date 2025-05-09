import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types/auth';

const USER_STORAGE_KEY = 'user_data';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function setCurrentUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export async function clearCurrentUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    admin: 2,
    user: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
