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
exports.DeleteSshConfig = exports.WriteSSHConfig = exports.WriteSSHKey = void 0;
const os_1 = require("os");
const fs_1 = require("fs");
const home = (0, os_1.homedir)();
function WriteSSHKey(fqdn, key) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, fs_1.writeFileSync)(`${home}/.ssh/${fqdn}.pem`, `${key}\n`);
        (0, fs_1.chmodSync)(`${home}/.ssh/${fqdn}.pem`, 0o400);
    });
}
exports.WriteSSHKey = WriteSSHKey;
function WriteSSHConfig(fqdn) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = `Host ${fqdn}
  Port 22
  User ubuntu
  HostName ${fqdn}
  IdentityFile ~/.ssh/${fqdn}.pem
  StrictHostKeyChecking no
`;
        (0, fs_1.mkdirSync)(`${home}/.ssh`, { recursive: true });
        (0, fs_1.writeFileSync)(`${home}/.ssh/config`, config);
    });
}
exports.WriteSSHConfig = WriteSSHConfig;
function DeleteSshConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, fs_1.rmSync)(`${home}/.ssh`, { recursive: true });
    });
}
exports.DeleteSshConfig = DeleteSshConfig;
