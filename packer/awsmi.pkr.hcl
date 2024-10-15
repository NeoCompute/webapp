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

variable "database_name" {
  type        = string
  description = "Database name"
  default     = ""
}

variable "database_user" {
  type        = string
  description = "Database user"
  default     = ""
}

variable "database_password" {
  type        = string
  description = "Database password"
  default     = ""
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
  ami_users    = ["self"]

  profile = var.aws_profile
}

build {
  sources = ["source.amazon-ebs.webapp"]

  provisioner "shell" {
    inline = [
      "sudo apt-get update -y",
      "sudo apt-get upgrade -y"
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo groupadd csye6225",
      "sudo useradd -g csye6225 -s /usr/sbin/nologin csye6225"
    ]
  }

  provisioner "file" {
    source      = var.artifact_path
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo mkdir -p /home/csye6225/webapp",

      "sudo unzip /tmp/webapp.zip -d /home/csye6225/webapp",

      "sudo chown -R csye6225:csye6225 /home/csye6225/webapp",

      "curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -",
      "sudo apt-get install -y nodejs",

      "cd /home/csye6225/webapp && sudo -u csye6225 npm install --only=production"
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo cp /home/csye6225/webapp/webapp_service.service /etc/systemd/system/",

      "sudo systemctl daemon-reload",

      "sudo systemctl enable webapp_service.service"
    ]
  }
}


// build {
//   sources = ["source.amazon-ebs.webapp"]

//   provisioner "shell" {
//     scripts = [
//       "./resources/scripts/update_os.sh",
//       "./resources/scripts/setup_node_db.sh",
//       "./resources/scripts/clone_source.sh",
//       "./resources/scripts/setup_db.sh"
//     ]
//   }
// }

