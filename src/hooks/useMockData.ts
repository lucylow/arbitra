// hooks/useMockData.ts
import { useState, useEffect } from 'react';
import { MockApiService } from '../services/mockApiService';
import type {
  MockUser,
  MockDispute,
  MockArbitrator
} from '../types/mockData';

const mockApi = new MockApiService();

export const useMockData = () => {
  const [users, setUsers] = useState<MockUser[]>([]);
  const [disputes, setDisputes] = useState<MockDispute[]>([]);
  const [arbitrators, setArbitrators] = useState<MockArbitrator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const [usersData, disputesData, arbitratorsData] = await Promise.all([
          mockApi.getUsers(),
          mockApi.getDisputes(),
          mockApi.getArbitrators()
        ]);

        setUsers(usersData);
        setDisputes(disputesData);
        setArbitrators(arbitratorsData);
      } catch (error) {
        console.error('Error initializing mock data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    users,
    disputes,
    arbitrators,
    loading,
    mockApi
  };
};

