# 🗄️ Database Setup Instructions

## Option 1: Install MySQL (Recommended)

### Windows
1. **Download MySQL Installer**: https://dev.mysql.com/downloads/installer/
2. Run "mysql-installer-web-community.msi"
3. Choose "Developer Default" installation
4. Set root password (remember it for .env file)
5. Complete installation

### Verify Installation
Open Command Prompt and run:
```cmd
mysql --version
```

## Option 2: Use XAMPP (Easier)

1. **Download XAMPP**: https://www.apachefriends.org/download.html
2. Install XAMPP
3. Start XAMPP Control Panel
4. Start MySQL and Apache services
5. Default password: (empty/blank)

## Database Creation

Once MySQL is installed, run these commands:

### Method A: MySQL Command Line
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE peer_pivot_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Show databases
SHOW DATABASES;

# Exit
exit
```

### Method B: MySQL Workbench
1. Open MySQL Workbench
2. Connect to localhost (root)
3. Execute this query:
```sql
CREATE DATABASE peer_pivot_learn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Method C: phpMyAdmin (with XAMPP)
1. Open http://localhost/phpmyadmin
2. Click "New" database
3. Name: `peer_pivot_learn`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

## Import Schema

After creating the database, import the schema:

### Method A: Command Line
```bash
mysql -u root -p peer_pivot_learn < backend/database/schema.sql
```

### Method B: MySQL Workbench
1. Open MySQL Workbench
2. Connect to peer_pivot_learn database
3. File → Run SQL Script
4. Select: `backend/database/schema.sql`
5. Execute

### Method C: phpMyAdmin
1. Open http://localhost/phpmyadmin
2. Select `peer_pivot_learn` database
3. Click "Import"
4. Choose file: `backend/database/schema.sql`
5. Click "Go"

## Update Backend Configuration

Edit `backend/.env` and set:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=peer_pivot_learn
```

## Verify Setup

Test the database connection by restarting the backend:
```bash
cd backend
node server.js
```

If no database errors appear, setup is successful!

## Troubleshooting

### "Access denied for user 'root'@'localhost'"
- Update DB_PASSWORD in .env with correct MySQL password
- If using XAMPP, password might be empty

### "Can't connect to MySQL server"
- Ensure MySQL service is running
- Check if port 3306 is available

### "Database doesn't exist"
- Run the database creation commands first
- Verify database name: `peer_pivot_learn`

## Quick Test

After setup, test with:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

Success response means database is working! 🎉
