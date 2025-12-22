import { Session } from 'next-auth';
import RequestApi, { AddAccessToken } from '../../request';


/**
 * Refresh the backend JWT (access_token) using the refresh endpoint.
 */
const RefreshAccessToken = async (session: Session): Promise<string> => {
  const response = await RequestApi<null, string>({
    path: '/user/refresh-access-token',
    method: 'GET',
    headers: AddAccessToken(session),
  });
  
  return response.data;
};

export default RefreshAccessToken;