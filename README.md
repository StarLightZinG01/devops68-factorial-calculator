# Factorial Calculator API

Calculate factorial of a number.

## Endpoint

### GET `/calculate`

**Parameters:**
- `number` (required): Non-negative integer (0-170)

**Example Request:**
```
http://localhost:3005/calculate?number=5
```

**Example Response:**
```json
{
  "number": 5,
  "factorial": 120
}
```

-------------------------

## STEP BY STEP

## 1) โครงสร้างที่ใช้

Terraform ของโปรเจกต์นี้ทำหน้าที่สร้างและตั้งค่าทรัพยากรดังนี้

- AWS Provider
- EC2 Instance สำหรับรันแอป
- Security Group เปิดพอร์ต 22 และ 3005
- `user_data` สำหรับติดตั้ง Node.js และ deploy แอปอัตโนมัติ
- Output สำหรับแสดง URL ที่ใช้ทดสอบระบบ
- Key Pair สำหรับ SSH เข้าเครื่องในโปรเจคนี้ไม่ต้องเตรียม เพราะว่า สามารถกำหนดชื่อ key_name ในไฟล์ variable.tf ตอนที่เรา apply Terraform ก็จะสร้าง Key Pair ให้เอง

---

## 2) สิ่งที่ต้องเตรียมก่อนเริ่ม

ก่อนใช้งาน ต้องมีสิ่งต่อไปนี้บนเครื่องตนเอง

- AWS Account
- AWS Access Key และ Secret Key
- AMI สำหรับ EC2
- ติดตั้ง **Terraform**
- ติดตั้ง **AWS CLI**
- ติดตั้ง **Git**

### 2.1 การสร้าง Access Key และ Secret Key
  - Access Key และ Secret Key
  - เข้า IAM
  - เลือก Users (ถ้ายังไม่มีให้กด Create User)
  - ไปที่ Security credentials
  - สร้าง Access key
  - ให้เลือก Use case : Command Line Interface (CLI)
  - จะได้ Access Key ID และ Secret Access Key สำหรับนำไปใช้กับ aws configure

### 2.2 การเตรียม AMI สำหรับ EC2
  - AMI ที่ใช้คือ Ubuntu
  - เลือก region ที่จะ Deploy ในตัวอย่างใช้ ap-southeast-7
  - เข้า EC2
  - ไปที่ Instances
  - กด Launch an instance
  - เลือก Application and OS Images เป็น Ubuntu
  - ทางขวาจะมีหัวข้อ Software Image (AMI)
  - ให้คัดลอก ami-xxxx จากตรงนั้นมาเก็บไว้

---

## 3) การตั้งค่า AWS Credentials

ตั้งค่า AWS credentials บนเครื่องด้วยคำสั่ง

```bash
aws configure
```

จากนั้นกรอกข้อมูล

- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

ตัวอย่าง region ที่ใช้ในโปรเจกต์นี้คือ

```bash
ap-southeast-7
```

---

## 4) ไฟล์ Terraform ที่ใช้

โปรเจกต์นี้มีไฟล์สำคัญดังนี้

- `main.tf` : กำหนด provider, key pair, security group, EC2 instance และ user_data
- `variables.tf` : กำหนดตัวแปร เช่น region, key name, instance type และ app port
- `outputs.tf` : แสดง URL สำหรับเข้าใช้งานแอปหลัง deploy สำเร็จ

---

## 5) ขั้นตอนการ Provision Infrastructure ด้วย Terraform

### 5.1 Clone หรือเตรียมโฟลเดอร์ Terraform

นำไฟล์ `main.tf`, `variables.tf`, `outputs.tf` มาไว้ในโฟลเดอร์เดียวกัน

### 5.2 ตั้งค่า AMI
  - เข้าไฟล์ main.tf
  - หา # 4. สร้าง EC2 โดยใช้ Variables
  - นำ ami-xxxx ที่ได้จากข้อ 2.2 มาใส่แทนที่ ami อันเดิม

### 5.3 เปิด Terminal ในโฟลเดอร์โปรเจกต์ Terraform

ตัวอย่าง

```bash
cd path/to/terraform
```

### 5.4 Initialize Terraform

คำสั่งนี้จะดาวน์โหลด provider และเตรียม environment ให้พร้อม

```bash
terraform init
```

### 5.5 ตรวจสอบแผนการสร้างทรัพยากร

```bash
terraform plan
```

ถ้าทุกอย่างถูกต้อง Terraform จะแสดงรายการ resource ที่จะถูกสร้าง เช่น

- `tls_private_key`
- `aws_key_pair`
- `local_file`
- `aws_security_group`
- `aws_instance`

### 5.6 สร้าง Infrastructure จริง

```bash
terraform apply
```

เมื่อคำสั่งทำงานเสร็จ Terraform จะสร้าง EC2, Security Group, Key Pair และรัน `user_data` ให้อัตโนมัติ

---

## 6) สิ่งที่เกิดขึ้นอัตโนมัติหลัง Provision สำเร็จ

เมื่อ EC2 ถูกสร้างขึ้น `user_data` ใน `main.tf` จะทำงานตามลำดับดังนี้

1. update package ของระบบ
2. ติดตั้ง `curl`
3. ติดตั้ง Node.js 20.x
4. ติดตั้ง Git
5. clone repository นี้จาก GitHub
6. ติดตั้ง Express
7. รันแอปด้วยคำสั่ง `node index.js`

ผลลัพธ์คือ EC2 จะพร้อมให้เรียกใช้งาน API ได้จริงผ่าน public IP ของเครื่อง

---

## 7) วิธีตรวจสอบว่า Deploy สำเร็จ

หลัง `terraform apply` เสร็จ ให้ดู output ที่ Terraform แสดงออกมา

ตัวอย่าง output:

```bash
app_public_url = "http://<public-ip>:3005/calculate?number=5"
```

จากนั้นนำ URL นี้ไปเปิดใน browser

ตัวอย่าง:

```bash
http://54.xx.xx.xx:3005/calculate?number=5
```

ถ้าระบบทำงานถูกต้อง จะได้ผลลัพธ์ประมาณนี้

```json
{
  "number": 5,
  "factorial": 120
}
```

ซึ่งสอดคล้องกับ endpoint ที่ระบุไว้ในแอป fileciteturn1file0

---

## 8) การทดสอบ API เพิ่มเติม

สามารถเปลี่ยนค่าพารามิเตอร์ `number` เพื่อทดสอบได้ เช่น

```bash
http://<public-ip>:3005/calculate?number=0
http://<public-ip>:3005/calculate?number=1
http://<public-ip>:3005/calculate?number=10
```

ตัวอย่างกรณีใส่ค่าไม่ถูกต้อง

```bash
http://<public-ip>:3005/calculate?number=-1
http://<public-ip>:3005/calculate?number=abc
http://<public-ip>:3005/calculate?number=200
```

ระบบจะตอบกลับเป็น error message ตามเงื่อนไขในโค้ด fileciteturn1file0

---

## 9) วิธี SSH เข้า EC2 เพื่อตรวจสอบการทำงาน

หลัง Terraform สร้างไฟล์ private key ให้แล้ว จะมีไฟล์ `.pem` อยู่ในโฟลเดอร์เดียวกับ Terraform

ตัวอย่างคำสั่ง SSH:

```bash
ssh -i my-quiz-key.pem ubuntu@<public-ip>
```

เมื่อเข้าเครื่องแล้ว สามารถตรวจสอบไฟล์ log ของ user_data ได้ด้วย

```bash
cat /var/log/user-data.log
```

หรือดู log ของแอปได้ที่

```bash
cd /home/ubuntu/devops68-factorial-calculator
cat app.log
```

---

## 10) คำสั่งที่ใช้กรณีต้องการลบ Infrastructure

เมื่อใช้งานเสร็จ สามารถลบทรัพยากรทั้งหมดได้ด้วยคำสั่ง

```bash
terraform destroy
```

จากนั้นพิมพ์

```bash
yes
```

คำสั่งนี้จะลบ EC2, Security Group, Key Pair และ resource อื่น ๆ ที่ Terraform สร้างไว้

---

## 11) สรุปผลการทำงาน

โปรเจกต์นี้สามารถ

- provision infrastructure บน AWS ได้ครบถ้วนด้วย Terraform
- deploy แอป Node.js/Express ขึ้น EC2 ได้อัตโนมัติ
- เปิดใช้งาน API จริงผ่าน public IP ของ EC2 ได้
- ทดสอบ endpoint `/calculate?number=5` แล้วได้ผลลัพธ์ถูกต้อง

ดังนั้นระบบนี้จึงแสดงให้เห็นทั้งกระบวนการ **Infrastructure as Code** และ **Application Deployment** ได้ครบตั้งแต่ต้นจนจบ

---

## 12) Endpoint ของโปรเจกต์

### GET `/calculate`

Query parameter:

- `number` : จำนวนเต็มไม่ติดลบ และต้องไม่เกิน 170

ตัวอย่าง

```bash
http://localhost:3005/calculate?number=5
```

Response ตัวอย่าง

```json
{
  "number": 5,
  "factorial": 120
}
```

รายละเอียด endpoint เดิมของโปรเจกต์สอดคล้องกับไฟล์ README และโค้ดแอปเดิม fileciteturn1file1 fileciteturn1file0

