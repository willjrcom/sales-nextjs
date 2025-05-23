import { Session } from 'next-auth';
import RequestApi, { AddIdToken } from '../../request';

interface RefreshAccessTokenResponse {
  success: boolean;
  data: string;
}

/**
 * Refresh the backend JWT (id_token) using the refresh endpoint.
 */
const RefreshAccessToken = async (session: Session): Promise<string> => {
  const response = await RequestApi<null, RefreshAccessTokenResponse>({
    path: '/user/refresh-access-token',
    method: 'GET',
    headers: await AddIdToken(session),
  });
  if (!response.data.success) {
    throw new Error('Failed to refresh access token');
  }
  return response.data.data;
};

export default RefreshAccessToken;