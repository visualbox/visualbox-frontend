import CloudWatchLogs from 'aws-sdk/clients/cloudwatchlogs'
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
  /**
   * Start an intelligent poll-loop to fetch
   * CloudWatch log events for a specific build.
   * @param opts   CloudWatch request options.
   * @param cb     Callback function.
   * @param cbDone Callback functioncalled when done.
   */
  public async startLoop (
    opts: ICWLOpts,
    cb: (events: CloudWatchLogs.OutputLogEvent[]) => void,
    cbDone: (event: CloudWatchLogs.OutputLogEvent) => void
  ): Promise<void> {

    // Init CloudWatchLogs client
    const credentials = await Auth.currentCredentials()
    const client = new CloudWatchLogs({
      region: process.env.VUE_APP_REGION || undefined,
      credentials: Auth.essentialCredentials(credentials)
    })

    // Configure poll-loop request
    const req: CloudWatchLogs.Types.GetLogEventsRequest = {
      logGroupName: opts.groupName,
      logStreamName: opts.streamName,
      startTime: +new Date(),
      limit: 10000
    }

    const MAX_NOT_FOUND_RETRIES = 3
    const MAX_NO_NEW_EVENTS_RETRIES = 10
    const POLL_INTERVAL = 4000

    let abortCounter = 0

    // Send initial message
    cb([{
      timestamp: +new Date(),
      message: 'Build started...'
    }])
    await this.sleep(POLL_INTERVAL * 2)

    while (abortCounter < MAX_NO_NEW_EVENTS_RETRIES) {

      try {
        const result = await client.getLogEvents(req).promise()

        // Call succeeded and we got events
        if (result.events && result.events.length > 0) {
          abortCounter = 0

          // Callback events
          // cb(this.filterEvents(result.events))
          cb(result.events)

          // Get most recent timestamp
          const timestamps = result.events
            .reduce((a: number[], c) => {
              if (c.timestamp)
                a.push(c.timestamp)
              return a
            }, [])

          req.startTime = Math.max(...timestamps)

          /**
           * Jump one ahead to avoid getting last
           * event now as the first one in next.
           */
          req.startTime++

        // Call succeeded but no (new) events
        } else {
          console.log('No new events, retry', abortCounter)
          abortCounter++
        }
      } catch (e) {
        if (e.code === 'ResourceNotFoundException') {

          /**
           * If we got here, OK, try again.
           * Most likely the log stream hasn't
           * been created.
           */
          abortCounter++
          console.log('Not found, retry', abortCounter)
          if (abortCounter > MAX_NOT_FOUND_RETRIES) {
            cbDone({
              timestamp: +new Date(),
              message: 'Build failed to start...'
            })
            throw e
          }

        } else {
          throw e
        }
      }

      await this.sleep(POLL_INTERVAL)
    }

    cbDone({
      timestamp: +new Date(),
      message: 'Build done!'
    })
  }

  /**
   * Filter retrieved CloudWatch log events
   * for the user.
   * @param events Array of CloudWatch log events.
   */
  private filterEvents (events: CloudWatchLogs.OutputLogEvent[]) {
    return events.filter(event => {
      return event.message && event.message.substr(0, 11) !== '[Container]'
    })
  }

  private sleep (ms: number): Promise<null> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new CWL()
