# WordPress Setup for LTI Integration

## Overview

This document explains how to configure WordPress to work with the LTI tool as a content management system and database layer.

## WordPress Configuration

### 1. Install Required CPTs

Add the code from `functions-wordpress-lti-complete.php` to your WordPress theme's `functions.php` file or create a custom plugin.

This will register the following Custom Post Types:
- `student` - Student records
- `course` - Course information  
- `unit` - Learning units with cards
- `progress` - Student progress tracking
- `grade` - Grade records from LMS

### 2. Authentication Setup

Choose one of the following authentication methods:

#### Option A: Application Passwords (Recommended)

1. In WordPress admin, go to **Users** → **Your Profile**
2. Scroll down to **Application Passwords**
3. Enter a name like "LTI Tool Integration"
4. Click **Add New Application Password**
5. Copy the generated password

Update your `.env` file:
```bash
WORDPRESS_API_USER=your-username
WORDPRESS_API_PASSWORD=your-application-password
```

#### Option B: Basic Auth (Manual)

Create a base64 encoded string of `username:password`:
```bash
echo -n "username:password" | base64
```

Update your `.env` file:
```bash
WP_BASIC_AUTH=Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

#### Option C: JWT Authentication

If you have JWT authentication configured in WordPress:
```bash
WP_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. WordPress REST API Permissions

Ensure the API user has the following capabilities:
- `edit_posts`
- `edit_others_posts` 
- `edit_published_posts`
- `publish_posts`
- `read_private_posts`

### 4. Test WordPress Connection

Test the connection from your Node.js server:

```bash
# Test basic connectivity
curl -u "username:password" https://icnpaim.cl/wp-json/wp/v2/student

# Test with Application Password
curl -H "Authorization: Basic <base64-string>" https://icnpaim.cl/wp-json/wp/v2/student
```

## Data Flow

### LTI Launch → WordPress Sync

When a user launches from Blackboard:

1. **Student Creation/Update**:
   - Uses LTI `sub` claim as unique identifier
   - Stores email, full name from LTI claims
   - Creates slug: `student-{hash(sub)}`

2. **Course Creation/Update**:
   - Uses LTI `context.id` as unique identifier  
   - Stores context title, label from LTI claims
   - Creates slug: `course-{hash(context.id)}`
   - Auto-creates sample units for new courses

3. **Linking**:
   - Maintains bidirectional N:M relationship
   - Student meta: `course_ids` (JSON array)
   - Course meta: `student_ids` (JSON array)

### Content Management

#### Units and Cards

Units are managed in WordPress admin with a custom metabox for cards configuration:

```json
[
  {
    "id": "card-1",
    "title": "Video: Introduction", 
    "url": "https://youtube.com/watch?v=...",
    "tipoActividad": "video",
    "color": "#e53e3e",
    "peso": 1,
    "estado": "pendiente"
  }
]
```

#### Progress Tracking

Progress is automatically calculated and stored:
- `completed_card_ids`: JSON array of completed card IDs
- `percent`: Calculated as (completed cards / total cards) * 100

#### Grades Sync

Grades are fetched from Blackboard via LTI AGS and stored in WordPress:
- `lineitem_id`: LTI line item identifier
- `score_given` / `score_maximum`: Grade values
- `activity_title`: Assignment name
- `provenance`: "lms" (from LMS) or "app" (from tool)

## API Endpoints

The Node.js server exposes these endpoints for the React frontend:

- `GET /api/me` - Current user information
- `GET /api/courses` - User's courses
- `GET /api/courses/:id/units` - Units and cards for a course
- `GET /api/courses/:id/grades` - Grades for a course
- `GET /api/progress` - Progress data
- `POST /api/progress` - Update progress
- `POST /api/grades/refresh` - Sync grades from LMS

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check WordPress credentials in `.env`
2. **CPTs not found**: Ensure the PHP code is active in `functions.php`
3. **Meta fields missing**: Verify `show_in_rest => true` for all meta fields
4. **CORS errors**: Check WordPress CORS headers if calling from browser

### Debug Endpoints

The WordPress integration includes debug endpoints:

```bash
# Test WordPress connectivity
curl http://localhost:3000/api/me

# Check specific student data  
curl https://icnpaim.cl/wp-json/lti/v1/debug/student/{sub}

# Check course data
curl https://icnpaim.cl/wp-json/lti/v1/debug/course/{context_id}
```

### Logs

Check the Node.js console for detailed logging of all WordPress API calls and responses.

## Security Notes

- Never expose WordPress credentials to the browser
- All WordPress communication goes through Node.js server-side proxy
- LTI session validation required for all API endpoints
- WordPress Application Passwords are scoped to specific applications