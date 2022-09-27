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

    if (!createAccountResult.success) {
      // callback(`--> ${createAccountResult.error}`, event);
      const sendOperatorEmailResult = await sendEmail(
        'felix@citodata.com',
        '[ACT] Signup Process failed',
        `<p>Signup Process Error: Create account failed for (username: ${userName}, error: ${createAccountResult.error})</p>`,
        false
      );
      if (!sendOperatorEmailResult.success)
        throw new Error(sendOperatorEmailResult.error);
      callback(null, event);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { given_name } = event.request.userAttributes;
    if (!given_name) throw new Error('First name not available');

    const { email } = event.request.userAttributes;
    if (!email) throw new Error('User email not available');

    const message = `
    <p>
    ${given_name}, we&rsquo;re super excited to have you with us! Start observing
    Snowflake in under 20 minutes with these 3 easy steps:<br /><br />Connect to
    <a href="https://www.docs.citodata.com/docs/connections/snowflake"
        >Snowflake</a
    ><br />We&rsquo;ll start observing your data warehouse so we can let you know
    about any anomalies we detect<br /><br />Install the
    <a href="https://www.docs.citodata.com/docs/connections/github"
        >Cito GitHub App</a
    >
    and automatically connect to your
    <a href="https://www.docs.citodata.com/docs/connections/bi-tools">BI Tool</a
    ><br />Help us keep our column-level lineage updated so we can support you in
    understanding the root cause and impact of anomalies<br /><br />Choose where
    to receive anomaly alerts by installing the
    <a href="https://www.docs.citodata.com/docs/connections/slack"
        >Cito Slack App</a
    >
    <br />
    Know about silent data issues before your business stakeholders discover them in the BI layer <br />
    <br />
    We&rsquo;re always here for you! Send us an email or message us in the shared
    Slack channel we&rsquo;ll invite you to shortly.<br />
    <br />

    Your Cito Team
    </p>
  `;

    const sendEmailResult = await sendEmail(
      email,
      'Welcome to Cito',
      message,
      true
    );

    if (!sendEmailResult.success) {
      // callback(`--> ${sendEmailResult.error}`, event);
      const sendOperatorEmailResult = await sendEmail(
        'felix@citodata.com',
        '[ACT] Signup Process failed',
        `<p>Signup Process Error: Send confirmation email failed for (username: ${userName}, email: ${email}, given_name: ${given_name}, error: ${createAccountResult.error})</p>`,
        false
      );
      if (!sendOperatorEmailResult.success)
        throw new Error(sendOperatorEmailResult.error);
      callback(null, event);
      return;
    }

    console.log(`Sent message (${sendEmailResult.value}) to ${email}`);

    callback(null, event);
  } catch (error: any) {
    if (typeof error === 'string') console.error(error);
    else if (error instanceof Error) console.error(error.message);
    console.error('Unknown error occurred');
    callback(null, event);
  }
};
