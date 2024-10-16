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
  ami_users    = ["self"]

  profile = var.aws_profile
}

build {
  sources = ["source.amazon-ebs.webapp"]

  provisioner "shell" {
    inline = [
      "set -ex",
      "sudo apt-get update -y",
      "sudo apt-get upgrade -y"
    ]
  }

  provisioner "file" {
    source      = var.artifact_path
    destination = "/tmp/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "set -ex",
      "curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -",
      "sudo apt-get install -y nodejs",
      "echo 'node Installed'",
      "node -v",
      "npm -v"
    ]
  }
  provisioner "shell" {
    inline = [
      "set -ex",
      "cd /tmp", // This needs to be reverted back
      "sudo apt-get install -y postgresql postgresql-contrib",
      "echo 'postgres Installed'",
      "sudo systemctl enable postgresql",
      "sudo systemctl start postgresql",
      "sudo systemctl status postgresql",

      "sudo -u postgres psql -c \"CREATE USER ${var.db_user} WITH PASSWORD '${var.db_password}';\"",
      "sudo -u postgres psql -c \"ALTER USER ${var.db_user} CREATEDB;\"",
      "sudo -u postgres psql -c \"CREATE DATABASE ${var.db_name} OWNER ${var.db_user};\"",
      "sudo -u postgres psql -d ${var.db_name} -c \"GRANT ALL PRIVILEGES ON DATABASE ${var.db_name} TO ${var.db_user};\""
    ]
  }


  provisioner "shell" {
    inline = [
      "set -ex",
      "sudo groupadd csye6225",
      "echo 'group created'",
      "sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225",
      "echo 'user and group created'",
    ]
  }

  //   provisioner "shell" {
  //     inline = [
  //       "set -ex",
  //       "sudo groupadd -f csye6225",
  //       "echo 'group created'",
  //       "sudo useradd -s /usr/sbin/nologin -g csye6225 -d /opt/csye6225 -m csye6225",
  //       "echo 'user and group created'",
  //     ]
  //   }

  provisioner "shell" {
    inline = [
      "set -ex",
      "sudo apt-get install -y unzip",
      "sudo mkdir -p /home/csye6225/webapp",
      "echo 'Directory Created'",
      "sudo unzip /tmp/webapp.zip -d /home/csye6225/",
      "echo 'Unzipped successfully'",
      "sudo chown -R csye6225:csye6225 /home/csye6225/",
      "echo 'Ownership changed'",
      "sudo chmod -R 775 /home/csye6225/",
      "cd /home/csye6225/webapp",
      "sudo npm install",
      "echo 'npm installed'",
    ]
  }

  provisioner "shell" {
    inline = [
      "set -ex",
      "sudo cp /home/csye6225/webapp/webapp_service.service /etc/systemd/system/",
      "sudo chown csye6225:csye6225 /etc/systemd/system/webapp_service.service",
      "sudo chmod 750 /etc/systemd/system/webapp_service.service",
      "sudo chown -R csye6225:csye6225 /home/csye6225/",
      "sudo chmod -R 750 /home/csye6225/webapp",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp_service.service",
      "sudo systemctl start webapp_service.service",
      "sudo systemctl status webapp_service.service",
      "sudo systemctl daemon-reload"
    ]
  }
}



