variable "aws_profile" {
  type        = string
  description = "AWS profile to use for the AWS provider"
  default     = "dev"
}

variable "vpc_to_use" {
  type        = string
  description = "VPC to use for the AWS provider"
  default     = ""
}

variable "subnet_to_use" {
  type        = string
  description = "subnet to use for the AWS provider"
  default     = ""
}

variable "artifact_path" {
  type        = string
  description = "Path to the application artifact (zip file)"
  default     = ""
}

variable "ami_name" {
  type        = string
  description = "Name of the AMI to create"
  default     = "webapp-ami-{{timestamp}}"
}

variable "instance_type" {
  type        = string
  description = "Instance type for building the AMI"
  default     = "t2.micro"
}

variable "region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "demo_account_id" {
  type        = string
  description = "Demo AWS account ID"
  default     = "396608768117"
}

variable "source_ami_id" {
  type        = string
  description = "Source AMI ID"
  default     = "ami-0866a3c8686eaeeba"
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
  ami_name      = var.ami_name
  instance_type = var.instance_type
  region        = var.region

  source_ami = var.source_ami_id

  vpc_id                      = var.vpc_to_use
  subnet_id                   = var.subnet_to_use
  associate_public_ip_address = true
  ssh_username                = "ubuntu"
  profile                     = var.aws_profile
  ami_users                   = [var.demo_account_id]
}

build {
  sources = ["source.amazon-ebs.webapp"]

  provisioner "file" {
    source      = var.artifact_path
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    scripts = [
      "./resources/scripts/update_os.sh",
      "./resources/scripts/setup_node.sh",
      "./resources/scripts/create_user_group.sh",
      "./resources/scripts/setup_cloudwatch.sh",
      "./resources/scripts/handle_src_code.sh",
      "./resources/scripts/configure_service.sh",
      "./resources/scripts/remove_unnecessary_packages.sh"
    ]
  }
}