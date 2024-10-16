variable "aws_profile" {
  type        = string
  description = "AWS profile to use for the AWS provider"
  default     = "dev"
}

variable "vpc_default" {
  type        = string
  description = "Default VPC to use for the AWS provider"
  default     = ""
}

variable "subnet_default" {
  type        = string
  description = "Default subnet to use for the AWS provider"
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

variable "db_user" {
  type        = string
  description = "PostgreSQL database user"
  default     = "clouduser"
}

variable "db_password" {
  type        = string
  description = "PostgreSQL database password"
  default     = "cloud@12345"
  sensitive   = true
}

variable "db_name" {
  type        = string
  description = "PostgreSQL database name"
  default     = "clouddb"
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
  profile = var.aws_profile
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
      "./resources/scripts/setup_postgres.sh",
      "./resources/scripts/setup_db.sh",
      "./resources/scripts/create_user_group.sh",
      "./resources/scripts/handle_src_code.sh",
      "./resources/scripts/configure_service.sh",
    ]
    environment_vars = [
      "DATABASE_NAME=${var.db_name}",
      "DATABASE_USER=${var.db_user}",
      "DATABASE_PASSWORD=${var.db_password}"
    ]
  }


}