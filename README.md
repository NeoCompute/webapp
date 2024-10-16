# Webapp

Web application for CSYE 6225 (Network Structures & Cloud Computing) 

### Technologies used:
- Programming Language: ```JavaScript```
- Relational Database: ```PostgreSQL```
- Backend Framework: ```Node.js```, ```Express.js```
- ORM Framework: ```Sequelize```

### To run the packer build command

Create ```variables.pkrvars.hcl``` file with the following fields:

```bash
aws_profile    = ""
vpc_default    = ""
subnet_default = ""
artifact_path  = ""
ami_name       = ""
instance_type  = ""
region         = ""

db_user     = ""
db_password = "" 
db_name     = ""

source_ami_id   = ""
demo_account_id = ""
```

### How to Build and run the application locally

1. Generate npm packages
```bash
npm install
```
2. Add ```.env``` file 
```bash
PORT=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=
DB_POOL_MAX=
DB_POOL_MIN=
DB_POOL_ACQUIRE=
DB_POOL_IDLE=
BCRYPT_SALT_ROUNDS=
```
3. To Run the Application
```bash
npm run start
```
4. To Debug the Application
```bash
npm run dev
```
5. To Run tests for the Application
```bash 
npm run test
```

### Commands Used

#### Linux
1. Change Directory
```bash 
cd 
```
2. Create new directory
```bash
mkdir
```
3. Remove or delete a directory
```bash
rmdir
```
4. list contents of the directory
```bash
ls
```

#### Git
1. To Clone repository
```bash
git clone
```
2. To check git branch
```bash
git branch
```
3. To create and change to new branch 
```bash 
git checkout -b <branch name>
```
4. To stage changes
```bash
git add
```
5. To commit changes
```bash
git commit -m ""
```
6. To push changes to remote 
```bash
git push -u origin
```
7. To merge
```bash 
git merge
```
8. To fetch or pull
```bash
git pull origin main
```

#### Postgres
1. Create Database
```bash
CREATE DATABASE cloudDB;
```
2. Create User/Role
```bash
CREATE USER cloudUser WITH PASSWORD 'password';
```
3. Grant Privileges
```bash
GRANT ALL PRIVILEGES ON DATABASE cloudDB TO cloudUser;
```

### References

1. [Creating users and managing psql](https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e)
2. [Sequelize](https://sequelize.org/docs/v6/getting-started/)
3. [Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
4. [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
