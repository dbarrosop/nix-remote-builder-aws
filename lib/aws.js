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
exports.CancelSpotInstanceRequest = exports.TerminateInstance = exports.GetPublicDnsName = exports.WaitForspotInstance = exports.RequestSpotInstance = void 0;
const client_ec2_1 = require("@aws-sdk/client-ec2");
const max_retry = 60;
const wait_time = 5000;
function wait(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    });
}
function RequestSpotInstance(client, name, ami, instanceType, securityGroup, sshKeyName, validUntil, availabilityZone) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const command = new client_ec2_1.RequestSpotInstancesCommand({
            AvailabilityZoneGroup: availabilityZone,
            ValidUntil: validUntil,
            InstanceCount: 1,
            LaunchSpecification: {
                SecurityGroups: [securityGroup],
                BlockDeviceMappings: [
                    {
                        DeviceName: '/dev/sda1',
                        Ebs: {
                            DeleteOnTermination: true,
                            VolumeSize: 30,
                            VolumeType: 'gp3',
                            Encrypted: false
                        }
                    }
                ],
                ImageId: ami,
                InstanceType: instanceType,
                KeyName: sshKeyName,
                Placement: {
                    AvailabilityZone: availabilityZone,
                    Tenancy: 'default'
                },
                Monitoring: {
                    Enabled: false
                }
            },
            TagSpecifications: [
                {
                    ResourceType: 'spot-instances-request',
                    Tags: [
                        {
                            Key: 'Name',
                            Value: name
                        }
                    ]
                }
            ]
        });
        const response = yield client.send(command);
        return (_b = (_a = response.SpotInstanceRequests) === null || _a === void 0 ? void 0 : _a[0].SpotInstanceRequestId) !== null && _b !== void 0 ? _b : '';
    });
}
exports.RequestSpotInstance = RequestSpotInstance;
function WaitForspotInstance(client, requestID) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const command = new client_ec2_1.DescribeSpotInstanceRequestsCommand({
            SpotInstanceRequestIds: [requestID]
        });
        for (let retry = 0; retry < max_retry; retry++) {
            const response = yield client.send(command);
            if (((_a = response.SpotInstanceRequests) === null || _a === void 0 ? void 0 : _a[0].InstanceId) != null &&
                ((_b = response.SpotInstanceRequests) === null || _b === void 0 ? void 0 : _b[0].InstanceId) !== '') {
                return (_c = response.SpotInstanceRequests) === null || _c === void 0 ? void 0 : _c[0].InstanceId;
            }
            yield wait(wait_time);
        }
        return '';
    });
}
exports.WaitForspotInstance = WaitForspotInstance;
function GetPublicDnsName(client, instanceID) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        const command = new client_ec2_1.DescribeInstancesCommand({
            InstanceIds: [instanceID]
        });
        for (let retry = 0; retry < max_retry; retry++) {
            const response = yield client.send(command);
            if (((_b = (_a = response.Reservations) === null || _a === void 0 ? void 0 : _a[0].Instances) === null || _b === void 0 ? void 0 : _b[0].PublicDnsName) != null &&
                ((_d = (_c = response.Reservations) === null || _c === void 0 ? void 0 : _c[0].Instances) === null || _d === void 0 ? void 0 : _d[0].PublicDnsName) !== '') {
                return (_g = (_f = (_e = response.Reservations) === null || _e === void 0 ? void 0 : _e[0].Instances) === null || _f === void 0 ? void 0 : _f[0].PublicDnsName) !== null && _g !== void 0 ? _g : '';
            }
            yield wait(wait_time);
        }
        return '';
    });
}
exports.GetPublicDnsName = GetPublicDnsName;
function TerminateInstance(client, instanceID) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = new client_ec2_1.TerminateInstancesCommand({
            InstanceIds: [instanceID]
        });
        yield client.send(command);
    });
}
exports.TerminateInstance = TerminateInstance;
function CancelSpotInstanceRequest(client, requestID) {
    return __awaiter(this, void 0, void 0, function* () {
        const command = new client_ec2_1.CancelSpotInstanceRequestsCommand({
            SpotInstanceRequestIds: [requestID]
        });
        yield client.send(command);
    });
}
exports.CancelSpotInstanceRequest = CancelSpotInstanceRequest;
