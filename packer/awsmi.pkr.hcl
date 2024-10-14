variable "aws_profile" {
  type = string
}

variable "vpc_default" {
  type = string
}

variable "subnet_default" {
  type = string
}

packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "webapp" {
  ami_name      = "webapp-{{timestamp}}"
  instance_type = "t2.medium"
  region        = "us-east-1"
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }

  vpc_id                      = var.vpc_default
  subnet_id                   = var.subnet_default
  associate_public_ip_address = true

  ssh_username = "ubuntu"
  ami_users    = ["self"]

  profile = var.aws_profile
}

build {
  sources = ["source.amazon-ebs.webapp"]

  provisioner "shell" {
    script = "./scripts/update_os.sh"
  }

  provisioner "shell" {
    script = "./scripts/setup_node_db.sh"
  }

  provisioner "shell" {
    script = "./scripts/clone_source.sh"
  }

  provisioner "shell" {
    script = "./scripts/setup_db.sh"
  }
}