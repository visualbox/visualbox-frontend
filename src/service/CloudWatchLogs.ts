import CloudWatchLogs from 'aws-sdk/clients/cloudwatchlogs';
import Auth from '@aws-amplify/auth'

interface ICWLOpts {
  groupName: string
  streamName: string
}

/**
 * CloudWatchLogs class for automating the
 * process of polling a log group/stream.
 */
class CWL {
  private pollInterval: number = 2500

  public async startLoop (
    opts: ICWLOpts,
    cb: (events: CloudWatchLogs.OutputLogEvent[]) => void
  ): Promise<void> {
    try {
      // Init client
      const credentials = await Auth.currentCredentials()
      const client = new CloudWatchLogs({
        region: process.env.VUE_APP_REGION || undefined,
        credentials: Auth.essentialCredentials(credentials)
      })

      const req: CloudWatchLogs.Types.GetLogEventsRequest = {
        logGroupName: opts.groupName,
        logStreamName: opts.streamName,
        limit: 10000
      }

      let n = 0
      while (n < 10) {
        const result = await client.getLogEvents(req).promise()

        if (result.events)
          cb(result.events)

        req.nextToken = result.nextForwardToken

        await this.sleep(this.pollInterval)
        n++
      }
    } catch (e) {
      throw e
    }
  }

  private sleep (ms: number): Promise<null> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new CWL()
