const core = require('@actions/core')

import {EC2Client} from '@aws-sdk/client-ec2'

import {TerminateInstance, CancelSpotInstanceRequest} from './aws'

import {DeleteSshConfig} from './ssh'

async function run(): Promise<void> {
  try {
    const region = core.getInput('region', {
      required: true
    })

    const client = new EC2Client({region: region})

    const instanceID = core.getState('instanceID')
    if (instanceID !== '') {
      core.info('Terminating instance')
      await TerminateInstance(client, instanceID)
    }

    const requestID = core.getState('requestID')
    if (requestID !== '') {
      core.info('Cancelling spot instance request')
      await CancelSpotInstanceRequest(client, requestID)
    }

    await DeleteSshConfig()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
