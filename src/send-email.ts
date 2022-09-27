import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
} from '@aws-sdk/client-ses';
import { appConfig } from './config';
import Result from './result';

export default async (
  to: string,
  subject: string,
  message: string,
  includeBcc: boolean
): Promise<Result<string>> => {
  try {
    const client = new SESClient({ region: appConfig.cloud.region });

    const input: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [to],
        BccAddresses: includeBcc ? appConfig.cloud.ses.bcc: undefined,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: message,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: appConfig.cloud.ses.source,
    };

    const command = new SendEmailCommand(input);
    const response: SendEmailCommandOutput = await client.send(command);

    if (!response.MessageId)
      throw new Error(
        'Sending message not completed. MessageId not available.'
      );
    return Result.ok(response.MessageId);
  } catch (error: any) {
    if (typeof error === 'string') console.error(error);
    else if (error instanceof Error) console.error(error.message);
    return Result.fail(
      error
    );
  }
};
