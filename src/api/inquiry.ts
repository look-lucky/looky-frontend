import { customFetch } from './mutator';

// 1. 문의 내역 목록 조회 (GET)
export const getInquiries = async () => {
  return await customFetch('/api/inquiries', { method: 'GET' });
};

// 2. 문의 등록 (POST)
export const createInquiry = async (data) => {
  return await customFetch('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};