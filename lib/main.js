"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const client_ec2_1 = require("@aws-sdk/client-ec2");
const aws_1 = require("./aws");
const ssh_1 = require("./ssh");
const core = __importStar(require("@actions/core"));
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
            const securityGroupId = core.getInput('security-group-id', { required: true });
            const sshKeyName = core.getInput('ssh-key-name', { required: true });
            const sshPrivateKey = core.getInput('ssh-private-key', { required: true });
            const validHours = parseInt(core.getInput('valid-hours', { required: true }));
            const region = core.getInput('region', {
                required: true
            });
            const availabilityZone = core.getInput('availability-zone', {
                required: false
            });
            const diskName = core.getInput('disk-name', {
                required: false
            });
            const diskSize = parseInt(core.getInput('disk-size', {
                required: false
            }));
            const validUntil = new Date();
            validUntil.setHours(validUntil.getHours() + validHours);
            const client = new client_ec2_1.EC2Client({ region });
            core.info('Requesting spot instance');
            const requestID = yield (0, aws_1.RequestSpotInstance)(client, name, ami, instanceType, securityGroupId, sshKeyName, validUntil, diskName, diskSize, availabilityZone);
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
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
