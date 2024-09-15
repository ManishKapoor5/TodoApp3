// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://manishkapoor:Connect500@cluster0.z5axw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Todo Schema
const todoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Todo = mongoose.model("Todo", todoSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(
      token,
      "b9923943ef2efd8ea6b177416e6b31a665b698c21959035ddd2473fc0d7bf977"
    );
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

//User registration
app.post(
  "/api/register",
  [
    body("username").isLength({ min: 3 }),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = new User({ username, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  }
);

// User login
app.post("/api/login", async (req, res) => {
  console.log("Login request received:", req.body);
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(400).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("Invalid password for user:", username);
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { _id: user._id },
      "b9923943ef2efd8ea6b177416e6b31a665b698c21959035ddd2473fc0d7bf977"
    );
    console.log("Login successful for user:", username);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error during login" });
  }
});

// CRUD operations
app.get("/api/todos", verifyToken, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching todos" });
  }
});

app.post(
  "/api/todos",
  [verifyToken, body("name").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const todo = new Todo({ ...req.body, user: req.user._id });
      await todo.save();
      res.status(201).json(todo);
    } catch (error) {
      res.status(500).json({ error: "Error creating todo" });
    }
  }
);

app.put(
  "/api/todos/:id",
  [verifyToken, body("name").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const todo = await Todo.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        req.body,
        { new: true }
      );
      if (!todo) return res.status(404).json({ error: "Todo not found" });
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: "Error updating todo" });
    }
  }
);

app.delete("/api/todos/:id", verifyToken, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting todo" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
