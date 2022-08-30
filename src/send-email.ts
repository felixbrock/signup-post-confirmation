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
  firstName: string
): Promise<Result<string>> => {
  try {
    const client = new SESClient({ region: appConfig.cloud.region });

    const input: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [to],
        BccAddresses: appConfig.cloud.ses.bcc,
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
            <p>
            ${firstName}, we&rsquo;re super excited to have you with us! Start observing
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
            to receive anomalies by installing the
            <a href="https://www.docs.citodata.com/docs/connections/slack"
                >Cito Slack App</a
            >
            <br />
            Creating transparency on the health of your data assets helps to respond to
            incidents more efficiently <br />
            <br />
            We&rsquo;re always here for you! Send us an email or message us in the shared
            Slack channel we&rsquo;ll invite you to shortly.

            Your Cito team
            </p>
          `,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Welcome to Cito',
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
