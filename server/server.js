const express = require("express");
const ExcelJS = require("exceljs");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const Slider = require("./models/Slider");
const Contact = require("./models/Contact"); // Adjust path if needed
const Review = require("./models/Review");
// const Review = require("./models/Review");
const router = express.Router();

require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client"))); // Serve frontend
app.use("/uploads", express.static(path.join(__dirname, "../client/uploads")));

// MongoDB Connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Mongo Error:", err));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/admin_login.html"));
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- Multer setup for resume uploads ---
const upload1 = multer({
  dest: path.join(__dirname, "uploads/"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|doc|docx)$/i;
    if (!allowed.test(file.originalname)) {
      return cb(new Error("Only PDF, DOC, DOCX allowed"));
    }
    cb(null, true);
  },
});

// *** MONGOOSE MODEL ***
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  yearsExp: Number,
  currentRole: String,
  salaryRange: String,
  location: String,
  careerGoals: String,
  resumePath: String,
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// // Schema
// const contactSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   message: String
// });

// const Message = mongoose.model('Contact', contactSchema);

// API to get counts
app.get("/api/counts", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const sliderCount = await Slider.countDocuments();
    const reviewCount = await Review.countDocuments();
    const messageCount = await Contact.countDocuments();

    res.json({
      users: userCount,
      sliders: sliderCount,
      reviews: reviewCount,
      messages: messageCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch counts" });
  }
});

// *** ROUTES ***
app.get("/api/dashboard-counts", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSliders = await Slider.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: "pending" }); // or adjust
    const totalMessages = await Contact.countDocuments();

    res.json({
      totalUsers,
      totalSliders,
      pendingReviews,
      totalMessages,
    });
  } catch (err) {
    console.error("Error getting counts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve the form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Handle form POST
app.post("/api/register", upload1.single("resume"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      yearsExp,
      currentRole,
      salaryRange,
      location,
      careerGoals,
    } = req.body;

    // Build new user doc
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      yearsExp,
      currentRole,
      salaryRange,
      location,
      careerGoals,
      resumePath: req.file.path,
    });

    await user.save();
    res
      .status(201)
      .send(
        "✅ Profile created! We’ll review your submission and be in touch."
      );
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).send("❌ Email already registered.");
    }
    res.status(500).send("❌ Something went wrong on our side.");
  }
});
// GET /api/users → list all users
// server.js
app.get("/api/get-users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Delete user
app.delete("/api/delete-user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//slider data
app.get("/api/get-sliders", async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });
    res.json(sliders);
  } catch (err) {
    console.error("Error fetching sliders:", err);
    res.status(500).json({ error: "Failed to fetch sliders" });
  }
});

// DELETE route
app.delete("/api/delete-slider/:id", async (req, res) => {
  try {
    const sliderId = req.params.id;
    const deleted = await Slider.findByIdAndDelete(sliderId);
    if (!deleted) {
      return res.status(404).json({ message: "Slider not found" });
    }
    res.json({ message: "Slider deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Server error while deleting slider" });
  }
});

app.put("/api/slider/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const updateData = { title, description };
    if (req.file) updateData.imageUrl = "/uploads/" + req.file.filename;

    await Slider.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: "Slider updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update slider" });
  }
});

app.get("/api/slider/:id", async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    res.json(slider);
  } catch (err) {
    res.status(500).json({ message: "Slider not found" });
  }
});

app.post("/api/add-slider", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const newSlider = new Slider({
      title,
      description,
      imageUrl,
    });

    await newSlider.save();
    res.status(201).json({ message: "Slider added successfully" });
  } catch (err) {
    console.error("Add Slider Error:", err);
    res.status(500).json({ message: "Failed to add slider" });
  }
});

//export data

app.get("/api/export-users", async (req, res) => {
  const ExcelJS = require("exceljs");
  try {
    const users = await User.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = [
      { header: "First Name", key: "firstName", width: 15 },
      { header: "Last Name", key: "lastName", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Experience", key: "yearsExp", width: 10 },
      { header: "Role", key: "currentRole", width: 15 },
      { header: "Salary", key: "salaryRange", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "Goals", key: "careerGoals", width: 25 },
      { header: "Signup Date", key: "createdAt", width: 20 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        ...user.toObject(),
        createdAt: new Date(user.createdAt).toLocaleString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("User Export Error:", err);
    res.status(500).send("Failed to export users");
  }
});
app.get("/api/export-sliders", async (req, res) => {
  const ExcelJS = require("exceljs");
  try {
    const sliders = await Slider.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sliders");

    worksheet.columns = [
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Image URL", key: "imageUrl", width: 30 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    sliders.forEach((slider) => {
      worksheet.addRow({
        ...slider.toObject(),
        createdAt: new Date(slider.createdAt).toLocaleString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=sliders.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Slider Export Error:", err);
    res.status(500).send("Failed to export sliders");
  }
});
app.get("/api/export-reviews", async (req, res) => {
  const ExcelJS = require("exceljs");
  try {
    const reviews = await Review.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reviews");

    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Rating", key: "rating", width: 10 },
      { header: "Message", key: "message", width: 40 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    reviews.forEach((review) => {
      worksheet.addRow({
        ...review.toObject(),
        createdAt: new Date(review.createdAt).toLocaleString(),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=reviews.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Review Export Error:", err);
    res.status(500).send("Failed to export reviews");
  }
});
app.get("/api/export-contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Contacts");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Message", key: "message", width: 40 },
      { header: "Submitted At", key: "createdAt", width: 20 },
    ];

    contacts.forEach((contact) => {
      worksheet.addRow(contact);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=contacts.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Export Contacts Error:", err);
    res.status(500).send("Server error while exporting contacts");
  }
});

// --- Reviews API ---

app.post("/api/submit-review", async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;
    const newReview = new Review({ name, email, rating, message });
    await newReview.save();

    res.status(200).json({ message: "✅ Review submitted successfully!" });
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: "❌ Failed to submit review." });
  }
});
// server.js
app.get("/api/get-reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// Approve
app.put("/api/approve-review/:id", async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { status: "approved" });
    res.json({ message: "Review approved" });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
});

app.delete("/api/decline-review/:id", async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review declined and removed" });
  } catch (err) {
    res.status(500).json({ error: "Decline failed" });
  }
});

app.get("/api/approved-reviews", async (req, res) => {
  try {
    const approved = await Review.find({ status: "approved" }).sort({
      createdAt: -1,
    });
    res.json(approved);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});
// server.js

// contect form handler

// Route to handle contact form
app.post("/submit-contact", async (req, res) => {
  try {
    // Console log to debug
    console.log("Request body:", req.body);

    const { name, email, phone, message } = req.body;

    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    res.status(200).send("Contact saved successfully");
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).send("Server error");
  }
});
app.use(cors());

app.get("/api/get-contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).send("Server error");
  }
});

// Optional: Delete contact by ID
app.delete("/api/delete-contact/:id", async (req, res) => {
  try {
    const result = await Contact.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send("Contact not found");
    res.send("Contact deleted");
  } catch (err) {
    console.error("Delete contact error:", err);
    res.status(500).send("Server error");
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
