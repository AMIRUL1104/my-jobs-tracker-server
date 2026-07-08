/**
 * Project Name: JobTrackr - Personal Job Application Tracker Backend
 * Architecture: Monolithic (Single index.js File using native MongoDB Driver)
 * Tech Stack: Node.js, Express.js, MongoDB Native Driver, dotenv, cors
 */

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// ==========================================
// 1. MIDDLEWARES
// ==========================================
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// ==========================================
// 2. MONGODB CLIENT CONNECTION (Native Driver)
// ==========================================

const mongoURI = process.env.MONGO_URI;
const client = new MongoClient(mongoURI);
let db, usersCollection, jobsCollection;

// এই ফাংশনটি প্রতিটা রিকোয়েস্টে কল হবে এবং কানেকশন রি-ইউজ করবে
async function ensureDB() {
  if (!db || !usersCollection || !jobsCollection) {
    await client.connect();
    db = client.db("jobTrackerDB");
    usersCollection = db.collection("users");
    jobsCollection = db.collection("jobs");
    console.log("🎯 MongoDB Connected On-Demand");
  }
}

// ==========================================
// DB CONNECTION MIDDLEWARE (রিকোয়েস্ট আসার সাথে সাথে কানেকশন নিশ্চিত করবে)
// ==========================================
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database connection failed in serverless execution",
      error: err.message,
    });
  }
});

// Enums manually validated during requests
const ALLOWED_STATUS = [
  "Wishlist",
  "Applied",
  "Under Review",
  "Interview Scheduled",
  "Technical Interview",
  "HR Interview",
  "Offer Received",
  "Accepted",
  "Rejected",
  "Ghosted",
];

const ALLOWED_JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Remote",
];

// ==========================================
// 3. API ROUTES
// ==========================================

/**
 * @route   GET /
 * @desc    Root Endpoint to verify backend status
 */
app.get("/", (req, res) => {
  res.status(200).send("Job Tracker Backend Running Successfully");
});

// ------------------------------------------
// AUTHENTICATION APIs (Simplified / No Auth Middleware)
// ------------------------------------------

/**
 * @route   POST /login
 * @desc    Verify credentials against the single manually created Admin user
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await usersCollection.findOne({ email });
    if (!user || user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /logout
 * @desc    Clear session mock client-side
 */
app.post("/logout", (req, res) => {
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
});

/**
 * @route   GET /me
 * @desc    Fetch the single admin profile directly
 */
app.get("/me", async (req, res) => {
  try {
    const adminUser = await usersCollection.findOne({ role: "admin" });
    if (!adminUser) {
      return res
        .status(404)
        .json({ success: false, message: "Admin user not found in database" });
    }
    return res.status(200).json({ success: true, data: adminUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ------------------------------------------
// JOB MANAGEMENT APIs
// ------------------------------------------

/**
 * @route   GET /jobs
 * @desc    Get all jobs with Advanced Filters, Search, and Sorting
 */
app.get("/jobs", async (req, res) => {
  try {
    const { search, status, jobType, sort } = req.query;
    let query = {};

    // Multi-field search implementation (Company Name OR Job Title)
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (status) query.status = status;
    if (jobType) query.jobType = jobType;

    // Sorting configuration
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const jobs = await jobsCollection.find(query).sort(sortOption).toArray();
    return res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /jobs/:id
 * @desc    Retrieve a single job application profile by ID
 */
app.get("/jobs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Job ID format" });
    }

    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job application not found" });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /jobs
 * @desc    Create a new job tracking log entry
 */
app.post("/jobs", async (req, res) => {
  try {
    const {
      companyName,
      companyLogo,
      jobTitle,
      jobType,
      jobLocation,
      salary,
      jobURL,
      companyWebsite,
      appliedDate,
      status,
      notes,
    } = req.body;

    // Manual validation checks for required keys
    if (!companyName || !jobTitle || !appliedDate || !status || !jobType) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Enum Validations
    if (!ALLOWED_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value provided" });
    }
    if (!ALLOWED_JOB_TYPES.includes(jobType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid jobType value provided" });
    }

    // Fetch the existing admin user to associate with createdBy
    const adminUser = await usersCollection.findOne({ role: "admin" });
    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: "Admin user must exist before creating jobs",
      });
    }

    const newJob = {
      companyName,
      companyLogo: companyLogo || "",
      jobTitle,
      jobType,
      jobLocation: jobLocation || "",
      salary: salary || "",
      jobURL: jobURL || "",
      companyWebsite: companyWebsite || "",
      appliedDate: new Date(appliedDate),
      status,
      notes: notes || "",
      createdBy: new ObjectId(adminUser._id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await jobsCollection.insertOne(newJob);
    const createdJob = await jobsCollection.findOne({ _id: result.insertedId });

    return res.status(201).json({
      success: true,
      message: "Job tracking entry created successfully",
      data: createdJob,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PATCH /jobs/:id
 * @desc    Modify and patch data values inside specific job tracking logs
 */
app.patch("/jobs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Job ID format" });
    }

    const updateData = { ...req.body };

    // Block modification of core system fields if sent in payload
    delete updateData._id;
    delete updateData.createdAt;

    // Dynamic schema updates configuration
    updateData.updatedAt = new Date();
    if (updateData.appliedDate) {
      updateData.appliedDate = new Date(updateData.appliedDate);
    }

    // Validate enums dynamically if provided inside patching request payload
    if (updateData.status && !ALLOWED_STATUS.includes(updateData.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value provided" });
    }
    if (updateData.jobType && !ALLOWED_JOB_TYPES.includes(updateData.jobType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid jobType value provided" });
    }

    const result = await jobsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" },
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Job application parameters not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /jobs/:id
 * @desc    Erase a job application from the tracker
 */
app.delete("/jobs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Job ID format" });
    }

    const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Target job document not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Job application tracker deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ------------------------------------------
// DASHBOARD METRICS API
// ------------------------------------------

/**
 * @route   GET /dashboard/stats
 * @desc    Full dashboard analytics status counter pipeline
 */
app.get("/dashboard/stats", async (req, res) => {
  try {
    const jobs = await jobsCollection.find({}).toArray();

    // ১. stats অবজেক্ট তৈরি (আপনার দেওয়া হুবহু ফরম্যাটে)
    const stats = {
      total: jobs.length,
      wishlist: jobs.filter((j) => j.status === "Wishlist").length,
      applied: jobs.filter((j) => j.status === "Applied").length,
      underReview: jobs.filter((j) => j.status === "Under Review").length,
      interview: jobs.filter((j) =>
        ["Interview Scheduled", "Technical Interview", "HR Interview"].includes(
          j.status,
        ),
      ).length,
      offerReceived: jobs.filter((j) => j.status === "Offer Received").length,
      accepted: jobs.filter((j) => j.status === "Accepted").length,
      rejected: jobs.filter((j) => j.status === "Rejected").length,
      ghosted: jobs.filter((j) => j.status === "Ghosted").length,
    };

    // ২. chartData অ্যারে তৈরি (আপনার দেওয়া কাস্টম নাম ও কাউন্ট অনুযায়ী)
    const chartData = [
      { status: "Wishlist", count: stats.wishlist },
      { status: "Applied", count: stats.applied },
      { status: "Review", count: stats.underReview },
      { status: "Interview", count: stats.interview },
      { status: "Offer", count: stats.offerReceived },
      { status: "Rejected", count: stats.rejected },
    ];

    // ৩. আপনার কাঙ্ক্ষিত ফরম্যাটে রেসপন্স পাঠানো
    return res.status(200).json({
      success: true,
      stats,
      chartData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. BOOTSTRAP EXPRESS SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server listening seamlessly on port ${PORT}`);
});
