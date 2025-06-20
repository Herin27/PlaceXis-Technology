
# 🎓 Placement Helping Website
```markdown

A full-featured web application designed to help students get placed by providing a platform for resume submission, review management, admin tools, and user engagement.

## 🔗 Live Demo
> https://placexis-technology.onrender.com/index.html

---

## 📌 Features

### 👨‍🎓 Student Side:
- Submit resume with detailed career information
- Upload resume files (PDF/DOC/DOCX)
- Contact form to ask questions
- Submit reviews and feedback

### 🛠️ Admin Panel:
- Admin login (static credentials)
- Dashboard showing total users, sliders, reviews, and messages
- Manage users (view, search, delete, download resumes)
- Manage sliders (add/edit/delete slider content)
- Review management (approve/decline)
- Contact message list
- Export data in Excel format

### 📢 Public Site:
- Dynamic success stories & testimonials (slider format)
- Responsive and animated UI

---

## 🧰 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Others**: Multer (file upload), XLSX (Excel export), Dotenv, CORS

---

## 📁 Project Structure

```

project-root/
│
├── client/                  # All frontend files
│   ├── index.html
│   ├── admin\_login.html
│   ├── admin\_dashboard.html
│   ├── style.css
│   └── js/
│       └── main.js
│
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Review\.js
│   ├── Contact.js
│   └── Slider.js
│
├── uploads/                 # Uploaded files and resumes
│
├── .env                     # Environment variables (Mongo URI)
├── server.js                # Main Express server
├── package.json
└── README.md

````

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/placement-helper.git
cd placement-helper
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/placement
PORT=3000
```

### 4. Run the server

```bash
node server.js
```

Visit the app at: [http://localhost:3000](http://localhost:3000)

---

## 📤 API Endpoints

| Endpoint                  | Method | Description                   |
| ------------------------- | ------ | ----------------------------- |
| `/api/register`           | POST   | Register user with resume     |
| `/api/get-users`          | GET    | Fetch all registered users    |
| `/api/delete-user/:id`    | DELETE | Delete user by ID             |
| `/api/get-sliders`        | GET    | Get all slider items          |
| `/api/add-slider`         | POST   | Add a new slider              |
| `/api/export-users`       | GET    | Export all users in Excel     |
| `/api/get-contacts`       | GET    | Get all contact form messages |
| `/submit-review`          | POST   | Submit review                 |
| `/api/approved-reviews`   | GET    | Get approved reviews only     |
| `/api/approve-review/:id` | PUT    | Approve a review by ID        |
| `/api/delete-review/:id`  | DELETE | Delete/decline a review       |

---

## 🧑‍💻 Admin Credentials

> For demo purposes, admin login is hardcoded:

```text
Username: admin
Password: admin123
```

---

## 📦 Deployment

You can deploy this app on:

* [Render](https://render.com/)
* [Railway](https://railway.app/)
* [Vercel + MongoDB Atlas](https://vercel.com/) (for frontend only)
* [Heroku](https://heroku.com/) (Node.js supported)

---

## 🙋‍♂️ Contributing

Contributions are welcome! If you'd like to improve or extend this project:

1. Fork it
2. Create a new branch
3. Commit changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

Made with 💙 by Herin
Feel free to reach out via (mailto:herin7151@gmail.com)

```

---

Let me know if you'd like it auto-filled with your GitHub repo link or specific name/logo!
```
