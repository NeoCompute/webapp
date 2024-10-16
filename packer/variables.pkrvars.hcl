// aws_profile    = "dev"
// vpc_default    = "vpc-0aea1df9ab27c4821"
// subnet_default = "subnet-02952ffdeb50265fe"

// artifact_path = "webapp.zip"
// ami_name      = "webapp-v{{timestamp}}"
// instance_type = "t2.micro"
// region        = "us-east-1"

aws_profile    = "dev"
vpc_default    = "vpc-0aea1df9ab27c4821"
subnet_default = "subnet-02952ffdeb50265fe"
artifact_path  = "webapp.zip"
ami_name       = "webapp-v{{timestamp}}"
instance_type  = "t2.micro"
region         = "us-east-1"

db_user     = "clouduser"
db_password = "cloud@12345" # Consider handling this securely
db_name     = "clouddb"

demo_account_id = "396608768117"