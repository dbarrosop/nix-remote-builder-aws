import {EC2Client} from '@aws-sdk/client-ec2'

import {RequestSpotInstance, WaitForspotInstance, GetPublicDnsName} from './aws'

import {WriteSSHKey, WriteSSHConfig} from './ssh'

import * as core from '@actions/core'

function treatOutput(name: string, value: string): void {
  core.info(`Setting output ${name} to ${value}`)
  core.setOutput(name, value)
  core.saveState(name, value)
}

async function run(): Promise<void> {
  try {
    const name = core.getInput('name', {required: true})
    const ami = core.getInput('ami', {required: true})
    const instanceType = core.getInput('instance-type', {required: true})
    const securityGroup = core.getInput('security-group', {required: true})
    const sshKeyName = core.getInput('ssh-key-name', {required: true})
    const sshPrivateKey = core.getInput('ssh-private-key', {required: true})
    const validHours = parseInt(core.getInput('valid-hours', {required: true}))
    const region = core.getInput('region', {
      required: true
    })
    const availabilityZone = core.getInput('availability-zone', {
      required: false
    })

    const validUntil = new Date()
    validUntil.setHours(validUntil.getHours() + validHours)

    const client = new EC2Client({region})

    core.info('Requesting spot instance')
    const requestID = await RequestSpotInstance(
      client,
      name,
      ami,
      instanceType,
      securityGroup,
      sshKeyName,
      validUntil,
      availabilityZone
    )
    treatOutput('requestID', requestID)

    core.info('Waiting for ec2 instance')
    const instanceID = await WaitForspotInstance(client, requestID)
    treatOutput('instanceID', instanceID)

    core.info('Getting public DNS name')
    const publicDnsName = await GetPublicDnsName(client, instanceID)
    treatOutput('publicDnsName', publicDnsName)

    core.info('Writing ssh config')
    await WriteSSHConfig(publicDnsName)

    core.info('Writing ssh key')
    await WriteSSHKey(publicDnsName, sshPrivateKey)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
