# JobTrackr Backend

JobTrackr হলো একটি পার্সোনাল জব অ্যাপ্লিকেশন ট্র্যাকার ব্যাকএন্ড API। এই প্রজেক্টের মাধ্যমে Node.js, Express.js এবং MongoDB ব্যবহার করে Job Application ডাটা ট্র্যাক, আপডেট এবং ম্যানেজ করা যায়।

## Features

- User login and logout endpoints
- Admin profile retrieval
- Create, read, update, and delete job applications
- Search, filter, and sort jobs
- Dashboard statistics for application status
- Backend validation for job status and job type

## Tech Stack

- Node.js
- Express.js
- MongoDB (native driver)
- dotenv
- cors

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/jobTrackerDB
CLIENT_URL=http://localhost:3000
```

4. Start the server:

```bash
node index.js
```

## API Endpoints

| Method | Endpoint         | Description                                |
| ------ | ---------------- | ------------------------------------------ |
| GET    | /                | Check server status                        |
| POST   | /login           | Login user                                 |
| POST   | /logout          | Logout user                                |
| GET    | /me              | Get admin profile                          |
| GET    | /jobs            | Get all jobs with search, filter, and sort |
| GET    | /jobs/:id        | Get a single job by ID                     |
| POST   | /jobs            | Create a new job application               |
| PATCH  | /jobs/:id        | Update a job application                   |
| DELETE | /jobs/:id        | Delete a job application                   |
| GET    | /dashboard/stats | Get dashboard statistics                   |

## Project Structure

```text
jobs-tracker-server/
├── index.js
├── package.json
├── readme.md
└── .env
```

## Notes

- The server expects an admin user in the `users` collection before creating job records.
- Allowed status values and job types are validated in the backend.
