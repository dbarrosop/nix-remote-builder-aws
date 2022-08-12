import {homedir} from 'os'
import {writeFileSync, mkdirSync, rmdirSync, chmodSync} from 'fs'

const home = homedir()

export async function WriteSSHKey(fqdn: string, key: string) {
  writeFileSync(`${home}/.ssh/${fqdn}.pem`, key + `\n`)
  chmodSync(`${home}/.ssh/${fqdn}.pem`, 0o400)
}

export async function WriteSSHConfig(fqdn: string) {
  const config = `Host ${fqdn}
  Port 22
  User ubuntu
  HostName ${fqdn}
  IdentityFile ~/.ssh/${fqdn}.pem
  StrictHostKeyChecking no
`
  mkdirSync(`${home}/.ssh`, {recursive: true})
  writeFileSync(`${home}/.ssh/config`, config)
}

export async function DeleteSshConfig() {
  rmdirSync(`${home}/.ssh`, {recursive: true})
}
