const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
bcrypt.hash('Bandi@1111', 10).then(console.log);


const app = express();
app.use(bodyParser.json());
app.use(cors());

// --- CONFIGURATION ---
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Bandi@1111',
  database: 'forgetpass'
});
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: "shravankanna159@gmail.com", pass: "cfsjcrwbeoefbgmu" }
});
// LOGIN ENDPOINT (returns "Login successful!" if correct)
app.post('/api/login', async (req, res) => {
  const { employee_id, password } = req.body;
  // Find user by employee_id
  const [[user]] = await db.query("SELECT * FROM users WHERE employee_id = ?", [employee_id]);
  if (!user) return res.status(401).json({ error: "Invalid employee ID or password" });
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: "Invalid employee ID or password" });
  // SUCCESS
  res.json({ message: "Login successful!" });
});

// --- ROUTES ---
// 1. Request Reset (generate and send OTP)
app.post('/api/request-reset', async (req, res) => {
  const { email } = req.body;
  const [[user]] = await db.query("SELECT id FROM users WHERE email=?", [email]);
  if (!user) return res.status(404).json({error: "User not found"});
  const otp = ('' + Math.floor(100000 + Math.random() * 900000)).substr(0,6);
  const expires = new Date(Date.now() + 10*60*1000); // 10 min from now
  await db.query("INSERT INTO password_reset_otps (user_id, otp_code, expires_at, validated) VALUES (?, ?, ?, 0)", [user.id, otp, expires]);
  await transporter.sendMail({
    from: '"Password Reset" <shravankanna159@gmail.com>',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP for password reset is: ${otp}`
  });
  res.json({ message: "OTP sent if email exists." }); // Don't reveal if email is not found!
});

// 2. Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const [[user]] = await db.query("SELECT id FROM users WHERE email=?", [email]);
  if (!user) return res.status(400).json({ error: "Invalid request" });
  const now = new Date();
  const [[rec]] = await db.query(
    "SELECT id FROM password_reset_otps WHERE user_id=? AND otp_code=? AND expires_at>? AND validated=0 ORDER BY expires_at DESC LIMIT 1",
    [user.id, otp, now]
  );
  if (!rec) return res.status(400).json({ error: "Invalid or expired OTP." });
  // Mark OTP as validated
  await db.query("UPDATE password_reset_otps SET validated=1 WHERE id=?", [rec.id]);
  res.json({ message: "Valid OTP" });
});

// 3. Reset Password
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const [[user]] = await db.query("SELECT id FROM users WHERE email=?", [email]);
  if (!user) return res.status(400).json({ error: "Invalid request" });
  // Confirm a validated OTP exists in last 15 min
  const [[rec]] = await db.query(
    "SELECT id FROM password_reset_otps WHERE user_id=? AND validated=1 AND expires_at>=? ORDER BY expires_at DESC LIMIT 1",
    [user.id, new Date(Date.now() - 15*60*1000)]
  );
  if (!rec) return res.status(400).json({ error: "No validated OTP session" });
  // Hash new password & update
  const hash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE users SET password_hash=? WHERE id=?", [hash, user.id]);
  // Optionally delete/reset OTP entry here
  await db.query("DELETE FROM password_reset_otps WHERE id=?", [rec.id]);
  res.json({ message: "Password updated." });
});
// Register New Member
app.post('/api/register-member', async (req, res) => {
  const { name, mobile, scheme, register_date } = req.body;
  // Insert the new member, let id auto-increment
  const [result] = await db.query(
    "INSERT INTO members (name, mobile, scheme, register_date) VALUES (?, ?, ?, ?)",
    [name, mobile, scheme, register_date]
  );
  // Generate member ID, e.g. MEM-2025-001-A
  const member_id = `MEM-${new Date().getFullYear()}-${String(result.insertId).padStart(3,'0')}-A`;
  // Update member_id for this entry
  await db.query("UPDATE members SET member_id=? WHERE id=?", [member_id, result.insertId]);
  res.json({ success: true, member_id, name, mobile, scheme, register_date });
});


// --- START SERVER ---
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
