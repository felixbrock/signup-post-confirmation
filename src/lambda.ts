import sendEmail from './send-email';

// eslint-disable-next-line import/prefer-default-export
export const handler = async (
  event: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  callback: any
): Promise<void> => {
  try {
    const { firstName } = event.request.userAttributes;
    if (!firstName) throw new Error('First name not available');

    const { email } = event.request.userAttributes;
    if (!email) throw new Error('User email not available');

    const sendEmailResult = await sendEmail(email, firstName);

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
