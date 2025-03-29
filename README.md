# 🌍 Viva Vista - Travel Deals & Booking Platform

Viva Vista is a travel deal and booking platform where users can browse deals, view prices based on airports, and pre-book without payment. Admins can manage deals, bookings, and reports.

---

## 🚀 Features
- **Deals & Holiday Packages** - Search, filter, and view deals.
- **Pricing by Country & Airport** - Users see prices based on location.
- **Hotel Listings** - Accommodation details with TripAdvisor ratings.
- **Booking System** - Users can pre-book holiday packages.
- **Admin Panel** - Manage deals, hotels, and bookings.
- **Reports & Analytics** - View key business metrics.

---

## 🏗️ Tech Stack
- **Frontend**: Angular  
- **Backend**: Node.js, Express  
- **Database**: MongoDB (Mongoose)  
- **Hosting**: AWS EC2 + S3  
- **Authentication**: JWT  
- **API Docs**: Swagger  

---

## ⚙️ Setup Instructions

### **1️⃣ Prerequisites**
- Node.js (v18+)
- MongoDB
- AWS Account (for S3 Storage)
- TripAdvisor API Key

### **2️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo/viva-vista.git
cd viva-vista
```

### **3️⃣ Install Dependencies**
```sh
npm install
```

### **4️⃣ Create .env File**
Create a .env file in the root directory and configure:

```env
PORT=5001
MONGO_URI=mongodb+srv://your-mongo-uri
JWT_SECRET=your-secret-key
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
S3_BUCKET_NAME=your-s3-bucket
TRIPADVISOR_API_KEY=your-tripadvisor-key
```

### **5️⃣ Run Seed Script (Optional)**
Populate the database with test data:
```sh
node seed.js
```

### **6️⃣ Start the Server**
```sh
npm start
```
Server runs on http://localhost:5001/

### **7️⃣ Access Swagger API Docs**
Swagger documentation is available at:

http://localhost:5001/api-docs


### **8️⃣ Admin Credentials**
- Email: admin@example.com
- Password: abc@xyz
