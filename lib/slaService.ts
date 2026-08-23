import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface SLAConfig {
  id: number;
  priority_name: string;
  response_time_hours: number;
  resolution_time_hours: number;
  response_time_minutes?: number;
  resolution_time_minutes?: number;
  created_at?: string;
  updated_at?: string;
}

// 1. Tambahkan Interface Payload Create
export interface SLACreatePayload {
  priority_name: string;
  response_time_hours: number;
  resolution_time_hours: number;
}

export interface SLAUpdatePayload {
  response_time_hours: number;
  resolution_time_hours: number;
}

export const getSLAList = async (token: string): Promise<SLAConfig[]> => {
  try {
    const response = await axios.get(`${API_BASE}/slas`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error in getSLAList:', error);
    throw error;
  }
};

// 2. Tambahkan Fungsi createSLA
export const createSLA = async (
  payload: SLACreatePayload,
  token: string
) => {
  try {
    const response = await axios.post(`${API_BASE}/slas`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in createSLA:', error);
    throw error;
  }
};

export const updateSLA = async (
  id: number,
  payload: SLAUpdatePayload,
  token: string
) => {
  try {
    const response = await axios.put(`${API_BASE}/slas/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error in updateSLA (ID: ${id}):`, error);
    throw error;
  }
};