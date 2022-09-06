import axios, { AxiosRequestConfig } from 'axios';
import { appConfig } from './config';
import createAccount from './create-account';
import sendEmail from './send-email';


const getJwt = async (): Promise<string> => {
  try {
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${appConfig.cloud.authSchedulerEnvConfig.clientId}:${appConfig.cloud.authSchedulerEnvConfig.clientSecret}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: appConfig.cloud.authSchedulerEnvConfig.clientId,
      }),
    };

    const response = await axios.post(
      appConfig.cloud.authSchedulerEnvConfig.tokenUrl,
      undefined,
      config
    );
    const jsonResponse = response.data;
    if (response.status !== 200) throw new Error(jsonResponse.message);
    if (!jsonResponse.access_token)
      throw new Error('Did not receive an access token');
    return jsonResponse.access_token;
  } catch (error: unknown) {
    if (typeof error === 'string') return Promise.reject(error);
    if (error instanceof Error) return Promise.reject(error.message);
    return Promise.reject(new Error('Unknown error occured'));
  }
};

// eslint-disable-next-line import/prefer-default-export
export const handler = async (
  event: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: any
): Promise<void> => {
  try {

    const { userName } = event;
    const jwt = await getJwt();

    const createAccountResult = await createAccount(userName, jwt);

    if(!createAccountResult.success) {
      callback(`--> ${createAccountResult.error}`, event);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { given_name } = event.request.userAttributes;
    if (!given_name) throw new Error('First name not available');

    const { email } = event.request.userAttributes;
    if (!email) throw new Error('User email not available');

    const sendEmailResult = await sendEmail(email, given_name);

    if (!sendEmailResult.success) {
      callback(`--> ${sendEmailResult.error}`, event);
      return;
    }

    console.log(`Send message (${sendEmailResult.value}) to ${email}`);

    callback(null, event);
  } catch (error: any) {
    if (typeof error === 'string') console.error(error);
    else if (error instanceof Error) console.error(error.message);
    console.error('Unknown error occurred');
  }
};
