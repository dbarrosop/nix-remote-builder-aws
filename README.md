# nix-remote-builder-aws

This action instantiates a spot instance on AWS and configures the workflow to be able to ssh into it. Combined with [nix](https://nixos.org) it allows you to run your workflow locally as you would normally do while delegating the actual build of your software to the [remote builder](https://nixos.org/manual/nix/unstable/advanced-topics/distributed-builds.html).

This is particularly interesting interesting when building for ARM as you can bring down your compilation time significantly.

Building software for Linux/ARM with github actions/qemu:

![github actions qemu](docs/github-actions.png)

Same build with a remote builder instantiated with this action:

![github actions remote builder](docs/remote-builder.png)

## Inputs

Excerpt from `actions.yml`:

```
  name:
    required: true
    description: 'unique name to tag the spot instance request'
  ami:
    required: true
    description: 'AMI to use to instantiate the builder'
  instance-type:
    required: false
    description: 'EC2 instance type'
    default: 't4g.small'
  security-group:
    required: false
    description: 'Security group to associate with the instance. It has to allow ssh from access from github workers'
    default: 'nix-remote-builder-access-from-github'
  ssh-key-name:
    required: false
    description: 'Name of the ssh keys to use for the instance'
    default: 'nix-remote-builder'
  ssh-private-key:
    required: true
    description: 'Ssh key to use to connect to the instance'
  region:
    required: true
    description: 'which region to use for the request'
  availability-zone:
    required: false
    description: 'which availability-zone to use for the request'
  valid-hours:
    required: false
    default: '1'
    description: 'the spot instance will be cancelled after this many hours if for some reason the cleanup job fails or the build takes too long'
```

## Outputs

* `requestID` - Spot instance request ID
* `instanceID` - ID of the EC2 instance provisioned to fullfil the request
* `publicDnsName` - FQDN of the EC2 instance

## Example usage

``` yaml
  ### Grant access to AWS
  - name: Configure aws
    uses: aws-actions/configure-aws-credentials@v1
    with:
      role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/github-actions-${{ github.event.repository.name }}
      aws-region: eu-central-1

  ### Provision the remote builder and configure ssh
  - name: "Setup nix-remote-builder"
    uses: dbarrosop/nix-remote-builder-aws@v0.1.0
    id: nix-remote-builder
    with:
      name: ${{ github.event.repository.name }}-${{ inputs.GIT_SHA }}
      ami: ami-032d45eb6ec5e67eb
      region: "eu-central-1"
      availability-zone: "eu-central-1c"
      ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
    if: ${{ ( matrix.platform == 'aarch64' ) }}

  ### Install nix and enable the remote builder
  - uses: nixbuild/nix-quick-install-action@v16
    with:
      nix_version: 2.9.1
      nix_conf: |
        experimental-features = nix-command flakes
        sandbox = false
        access-tokens = github.com=${{ secrets.GITHUB_TOKEN }}
        builders = ssh://${{ steps.nix-remote-builder.outputs.publicDnsName }} aarch64-linux;
        builders-use-substitutes = true
```

## Requirements

You will need to preprovision a few things in AWS before you are able to use this:

1. A role your github action can assume that has permissions to:
   - Create/Describe/Cancel Spot Instance Requests
   - Create tags
   - Terminate EC2 instances
2. SSH keys for your EC2 instances
3. An AMI with nix already provisioned
4. A security group that can be assigned to the EC2 instance and allows ssh access from gtihub

## Job Cleanup

This action will, on workflow termination (regardless of success/failure), cancel the spot request instance and terminate the EC2 instance.
