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
const client_ec2_1 = require("@aws-sdk/client-ec2");
const aws_1 = require("./aws");
const ssh_1 = require("./ssh");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const region = core.getInput('region', {
                required: true
            });
            const client = new client_ec2_1.EC2Client({ region: region });
            const instanceID = core.getState('instanceID');
            if (instanceID !== '') {
                core.info('Terminating instance');
                yield (0, aws_1.TerminateInstance)(client, instanceID);
            }
            const requestID = core.getState('requestID');
            if (requestID !== '') {
                core.info('Cancelling spot instance request');
                yield (0, aws_1.CancelSpotInstanceRequest)(client, requestID);
            }
            yield (0, ssh_1.DeleteSshConfig)();
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
