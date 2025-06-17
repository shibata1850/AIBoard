import { supabase } from './supabase';
import { CompanyInfo, CompanyInfoInsert, CompanyInfoUpdate } from '../types/companyInfo';

export async function getCompanyInfo(): Promise<CompanyInfo[]> {
  const { data, error } = await supabase
    .from('company_info')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }

  return data || [];
}

export async function getCompanyInfoByCategory(category: string): Promise<CompanyInfo[]> {
  const { data, error } = await supabase
    .from('company_info')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching company info by category:', error);
    throw error;
  }

  return data || [];
}

export async function searchCompanyInfo(query: string): Promise<CompanyInfo[]> {
  const { data, error } = await supabase
    .from('company_info')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching company info:', error);
    throw error;
  }

  return data || [];
}

export async function createCompanyInfo(companyInfo: CompanyInfoInsert): Promise<CompanyInfo> {
  const { data, error } = await supabase
    .from('company_info')
    .insert(companyInfo)
    .select()
    .single();

  if (error) {
    console.error('Error creating company info:', error);
    throw error;
  }

  return data;
}

export async function updateCompanyInfo(id: string, updates: CompanyInfoUpdate): Promise<CompanyInfo> {
  const { data, error } = await supabase
    .from('company_info')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating company info:', error);
    throw error;
  }

  return data;
}

export async function deleteCompanyInfo(id: string): Promise<void> {
  const { error } = await supabase
    .from('company_info')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting company info:', error);
    throw error;
  }
}
