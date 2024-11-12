const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Chethan@1330",
  database: "hr",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected.");
});
app.post("/signup", async (req, res) => {
  const { username, password, email, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO Users (username, password, email, phone) VALUES (?, ?, ?, ?)";
    db.query(query, [username, hashedPassword, email, phone], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({ success: true, message: "User registered" });
    });
  } catch (error) {
    res.status(500).json({ error: "Hashing error" });
  }
});

// Login route
// server.js - Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM Users WHERE username = ?";

  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(user);
    if (isPasswordValid) {
      // Include only user_id in the response
      res.json({
        success: true,
        message: "Login successful",
        user: { id: user.user_id }, // Send only the user ID
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
  });
});

// Main route placeholder

// Fetch closest hotels and their images
app.post("/closest-hotels", (req, res) => {
  const { latitude, longitude, numRooms, capacity, checkInDate, checkOutDate } =
    req.body;
  console.log(capacity);
  console.log(numRooms);
  const sql = `
  SELECT 
      h.hotel_id, 
      h.name, 
      h.address, 
      h.city, 
      h.state, 
      h.country, 
      h.latitude, 
      h.longitude, 
      h.rating_avg,
      MIN(r.price_per_night) AS low_price,  -- Lowest room price for the hotel
      MAX(r.price_per_night) AS high_price, -- Highest room price for the hotel
      (6371 * acos(cos(radians(?)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(?)) + 
      sin(radians(?)) * sin(radians(h.latitude)))) AS distance
  FROM 
      Hotels h
  JOIN 
      Rooms r ON h.hotel_id = r.hotel_id
  WHERE 
      r.status = 'available'
  GROUP BY 
      h.hotel_id, h.name, h.address, h.city, h.state, h.country, h.latitude, h.longitude, h.rating_avg
  HAVING 
      SUM(r.capacity) >= ${capacity}  
      AND COUNT(r.room_id) >= ${numRooms}  
  ORDER BY 
      distance
  LIMIT 20;
  `;

  db.query(sql, [latitude, longitude, latitude], (error, results) => {
    if (error) {
      console.error("Database query error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Database query error" });
    }

    const hotels = results.map((hotel) => ({
      hotel_id: hotel.hotel_id,
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      state: hotel.state,
      country: hotel.country,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      rating_avg: hotel.rating_avg,
      distance: hotel.distance,
      low_price: hotel.low_price, // Lowest room price for the hotel
      high_price: hotel.high_price, // Highest room price for the hotel
    }));

    res.json({ success: true, hotels });
  });
});

app.get("/available-rooms/:hotelId", (req, res) => {
  console.log("Fetching available rooms...\n");
  const { hotelId } = req.params;
  console.log(`Hotel ID: ${hotelId}`);

  const query = `
      SELECT room_id, room_no, room_type, price_per_night, capacity, COUNT(*) as available_count 
      FROM rooms 
      WHERE hotel_id = ? AND status = 'available'
      GROUP BY room_id, room_no, room_type, price_per_night, capacity
  `;

  db.query(query, [hotelId], (err, results) => {
    if (err) {
      console.error("Error fetching available rooms:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching rooms" });
    }
    console.log("Available rooms:", results);
    res.json({ success: true, rooms: results });
  });
});

const insertPaymentAndBooking = (db, paymentData, callback) => {
  // Begin transaction
  db.query("START TRANSACTION", (err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return callback({ success: false, message: "Transaction start failed." });
    }

    // Step 1: Insert into payments table
    const paymentQuery = "INSERT INTO payments (way, status) VALUES (?, ?)";
    db.query(
      paymentQuery,
      [paymentData.payment_method, paymentData.payment_status],
      (err, paymentResult) => {
        if (err) {
          console.error("Error inserting payment:", err);
          return db.query("ROLLBACK", () => {
            callback({ success: false, message: "Payment insert failed." });
          });
        }
        const paymentId = paymentResult.insertId;
        console.log("Payment ID:", paymentId);
        console.log(paymentData.user_id);

        // Step 2: Insert into bookings table
        const bookingQuery = `
          INSERT INTO bookings (check_in_date, check_out_date, total_price, payment_id, user_id) 
          VALUES (?, ?, ?, ?, ?)`;
        db.query(
          bookingQuery,
          [
            paymentData.check_in_date,
            paymentData.check_out_date,
            paymentData.total_price,
            paymentId,
            paymentData.user_id,
          ],
          (err, bookingResult) => {
            if (err) {
              console.error("Error inserting booking:", err);
              return db.query("ROLLBACK", () => {
                callback({ success: false, message: "Booking insert failed." });
              });
            }
            const bookingId = bookingResult.insertId;

            // Step 3: Update rooms table for each selected room
            const roomUpdates = paymentData.room_ids.map((roomId) => {
              const roomUpdateQuery =
                "UPDATE rooms SET booking_id = ?, check_in_date = ?, check_out_date = ? WHERE room_id = ?";
              return new Promise((resolve, reject) => {
                db.query(
                  roomUpdateQuery,
                  [
                    bookingId,
                    paymentData.check_in_date,
                    paymentData.check_out_date,
                    roomId,
                  ],
                  (err) => {
                    if (err) {
                      console.error("Error updating room:", err);
                      reject(err);
                    } else {
                      resolve();
                    }
                  }
                );
              });
            });

            // Execute all room updates
            Promise.all(roomUpdates)
              .then(() => {
                // Commit transaction if all updates succeed
                db.query("COMMIT", (err) => {
                  if (err) {
                    console.error("Transaction commit error:", err);
                    return callback({
                      success: false,
                      message: "Transaction commit failed.",
                    });
                  }
                  callback({ success: true });
                });
              })
              .catch(() => {
                db.query("ROLLBACK", () => {
                  callback({ success: false, message: "Room updates failed." });
                });
              });
          }
        );
      }
    );
  });
};

// Complete payment route
app.post("/api/complete-payment", (req, res) => {
  const paymentData = req.body;
  console.log("Payment data received:", paymentData);

  insertPaymentAndBooking(db, paymentData, (result) => {
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  });
});
app.get("/api/mybookings", (req, res) => {
  const userId = req.query.user_id; // Retrieve user_id from query parameter
  console.log(userId);
  const sqlQuery = `SELECT * FROM bookings WHERE user_id = ?`;

  db.query(sqlQuery, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
