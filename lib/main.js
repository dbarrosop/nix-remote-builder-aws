"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require('@actions/core');
const github = require('@actions/github');
const client_ec2_1 = require("@aws-sdk/client-ec2");
const aws_1 = require("./aws");
const ssh_1 = require("./ssh");
function treatOutput(name, value) {
    core.info(`Setting output ${name} to ${value}`);
    core.setOutput(name, value);
    core.saveState(name, value);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const name = core.getInput('name', { required: true });
            const ami = core.getInput('ami', { required: true });
            const instanceType = core.getInput('instance-type', { required: true });
            const securityGroup = core.getInput('security-group', { required: true });
            const sshKeyName = core.getInput('ssh-key-name', { required: true });
            const sshPrivateKey = core.getInput('ssh-private-key', { required: true });
            const validHours = parseInt(core.getInput('valid-hours', { required: true }));
            const region = core.getInput('region', {
                required: true
            });
            const availabilityZone = core.getInput('availability-zone', {
                required: false
            });
            const repository = github.context.event.name;
            const validUntil = new Date();
            validUntil.setHours(validUntil.getHours() + validHours);
            const client = new client_ec2_1.EC2Client({ region: region });
            core.info('Requesting spot instance');
            const requestID = yield (0, aws_1.RequestSpotInstance)(client, name, repository, ami, instanceType, securityGroup, sshKeyName, validUntil, availabilityZone);
            treatOutput('requestID', requestID);
            core.info('Waiting for ec2 instance');
            const instanceID = yield (0, aws_1.WaitForspotInstance)(client, requestID);
            treatOutput('instanceID', instanceID);
            core.info('Getting public DNS name');
            const publicDnsName = yield (0, aws_1.GetPublicDnsName)(client, instanceID);
            treatOutput('publicDnsName', publicDnsName);
            core.info('Writing ssh config');
            yield (0, ssh_1.WriteSSHConfig)(publicDnsName);
            core.info('Writing ssh key');
            yield (0, ssh_1.WriteSSHKey)(publicDnsName, sshPrivateKey);
        }
        catch (error) {
            core.s;
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
