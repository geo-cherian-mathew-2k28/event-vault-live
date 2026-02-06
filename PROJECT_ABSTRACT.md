# MICRO PROJECT REPORT

## Subject: Database Management System (DBMS)

---

# Title of Micro Project

## **"Event Vault: A Secure Event Media Management System with Role-Based Access Control Using PostgreSQL"**

---

## Project Abstract

### Subtitle
**A Real-Time Event Media Collection and Sharing Platform with Row-Level Security Implementation**

---

### Abstract

**Event Vault** (also known as **Memora**) is a web-based event media management system designed to provide a secure and user-friendly platform for capturing, organizing, and sharing event media content in real-time. The system addresses the growing need for efficient event photo and video collection while ensuring data security through modern database management techniques.

The application leverages **PostgreSQL** as its backend relational database through **Supabase**, implementing a comprehensive database schema that includes tables for user profiles, events, event memberships, media files, folders, access logs, and social features like media likes. The database design follows normalization principles and implements **Row-Level Security (RLS)** policies to ensure data integrity and access control at the database level.

### Key Database Features

1. **Relational Schema Design**: The system employs a well-structured relational database with the following core entities:
   - `profiles` - User information linked to authentication
   - `events` - Event metadata with public/private visibility settings
   - `event_members` - Many-to-many relationship for user-event access control
   - `media_files` - Media content storage with folder organization
   - `folders` - Hierarchical folder structure for content organization
   - `access_logs` - Audit trail for tracking user activities
   - `media_likes` - Social interaction tracking

2. **Row-Level Security (RLS)**: Implementation of fine-grained access control policies ensuring:
   - Users can only view/modify their own profile data
   - Event visibility based on public/private settings and membership
   - Media access restricted to authorized event participants
   - Role-based permissions (owner, admin, moderator, member)

3. **Referential Integrity**: Foreign key constraints maintain data consistency across tables with appropriate CASCADE and SET NULL behaviors for deletions.

4. **Database Triggers**: Automated user profile creation on signup through PostgreSQL trigger functions.

5. **Real-time Synchronization**: Utilization of Supabase's real-time features for live updates on media uploads and modifications.

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 19, React Router, Tailwind CSS, Framer Motion |
| **Backend/Database** | PostgreSQL via Supabase |
| **Authentication** | Supabase Auth (JWT-based) |
| **File Storage** | Supabase Storage (S3-compatible) |
| **Real-time** | Supabase Realtime (WebSocket) |

### Core Functionalities

1. **User Authentication & Authorization**
   - Secure user registration and login
   - Password reset functionality
   - Session management with JWT tokens

2. **Event Management**
   - Create, edit, and delete events
   - Public and private event visibility
   - Unique event codes for sharing
   - Passkey protection for private events

3. **Media Management**
   - Upload images, videos, and documents
   - Folder-based organization
   - Bulk operations (select, download, delete)
   - QR code generation for event access

4. **Access Control**
   - Role-based membership (owner, admin, moderator, member/viewer)
   - Guest access with passkey verification
   - Session-based access tracking

5. **Social Features**
   - Like/unlike media content
   - Like count tracking
   - Guest and authenticated user interactions

### Database Queries & Operations

The system implements various SQL operations including:
- **SELECT** queries with JOINs for retrieving related data
- **INSERT** operations for adding new records
- **UPDATE** statements for modifying existing data
- **DELETE** commands with cascade effects
- **Aggregate functions** for analytics (view counts, like counts)
- **Subqueries** for complex access control checks

### Security Measures

- PostgreSQL Row-Level Security for data isolation
- Passkey protection for private events
- Session-based access validation
- Audit logging for access tracking
- Secure file storage with URL-based access control

### Conclusion

Event Vault demonstrates the practical application of database management system concepts including relational schema design, normalization, referential integrity, access control, and real-time data synchronization. The project showcases how modern web applications can leverage cloud-based PostgreSQL services to build secure, scalable, and feature-rich media management platforms.

---

### Project Details

| Field | Value |
|-------|-------|
| **Subject** | Database Management System |
| **Project Type** | Web Application |
| **Database** | PostgreSQL (via Supabase) |
| **Frontend Framework** | React.js |
| **Deployment** | Vercel |

---

### ER Diagram Summary

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   profiles  │────<│  event_members  │>────│   events    │
│  (Users)    │     │   (Junction)    │     │             │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                                           │
       │                                           │
       ▼                                           ▼
┌─────────────┐                            ┌─────────────┐
│ media_likes │                            │ media_files │
└─────────────┘                            └─────────────┘
       │                                           │
       │                                           │
       └───────────────────┬───────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   folders   │
                    └─────────────┘
                           │
                           │
                           ▼
                    ┌─────────────┐
                    │ access_logs │
                    └─────────────┘
```

### Key SQL Concepts Demonstrated

1. **DDL (Data Definition Language)**: CREATE TABLE, ALTER TABLE, CREATE POLICY
2. **DML (Data Manipulation Language)**: SELECT, INSERT, UPDATE, DELETE
3. **DCL (Data Control Language)**: Row-Level Security policies
4. **Triggers & Functions**: Automated user profile creation
5. **Constraints**: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL
6. **Normalization**: Tables designed to minimize redundancy
7. **Indexing**: Implicit indexing on primary and foreign keys

---

*Developed by Geo Cherian Mathew*
