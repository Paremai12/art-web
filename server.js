const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const filePath = path.join(__dirname, "doc", "users.json");

// 📌 read
function getUsers() {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath));
}

// 📌 save
function saveUsers(users) {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// REGISTER
app.post("/register", (req, res) => {
    const newUser = req.body;

    let users = getUsers();

    if (users.find(u => u.ig === newUser.ig)) {
        return res.json({ success: false });
    }

    newUser.bestScore = 0;
    newUser.isAdmin = false;

    users.push(newUser);
    saveUsers(users);

    res.json({ success: true });
});

// LOGIN
app.post("/login", (req, res) => {
    const { ig, password } = req.body;

    let users = getUsers();
    const user = users.find(u => u.ig === ig && u.password === password);

    if (user) {
        res.json({ success: true, user });
    } else {
        res.json({ success: false });
    }
});

// UPDATE SCORE
app.post("/updateScore", (req, res) => {
    const { ig, score } = req.body;

    let users = getUsers();
    const user = users.find(u => u.ig === ig);

    if (user) {
        if (score > (user.bestScore || 0)) {
            user.bestScore = score;
        }

        saveUsers(users);
        res.json({ success: true, bestScore: user.bestScore });
    } else {
        res.json({ success: false });
    }
});

// ADMIN GET USERS
app.get("/users", (req, res) => {
    const users = getUsers();
    res.json(users);
});

// หน้าเว็บ
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

// 🔥 สำคัญสำหรับ Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});