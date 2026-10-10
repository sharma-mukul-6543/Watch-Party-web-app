# Watch Party 🎬

A simple web application that lets me watch movies or videos together with my friends, even when we are in different places.

The main idea behind this project is to synchronize video playback between users so that everyone can watch the same video at approximately the same time. Instead of uploading a movie to a server, each user selects the video file from their own computer, and the application synchronizes playback actions between them.

I built this project to learn and practice full-stack web development, real-time communication, and frontend-backend integration.

## 🚀 Features

- **Synchronized Playback:** Play, pause, and seek actions are shared between users.
- **Local Video Files:** Each user selects a video file from their own device.
- **Real-Time Communication:** Uses Socket.IO to communicate playback events between connected users.
- **Room-Based Watching:** Designed to let users watch together in a shared room.
- **React Frontend:** A component-based interface built with React and Vite.
- **Node.js Backend:** Handles server-side communication using Express and Socket.IO.

## 🛠️ Technologies Used

- React
- Vite
- JavaScript
- Tailwind CSS
- Node.js
- Express.js
- Socket.IO
- Git and GitHub

## ⚙️ How It Works

The application follows a simple approach:

1. The backend server establishes real-time communication between connected users.
2. Users join the same watch-party room.
3. Each user selects the same video file from their own computer.
4. When one user plays, pauses, or changes the playback position, the corresponding event is sent to the server.
5. The server forwards the event to the other users in the room.
6. Their local video players respond to the received event.

Since the video files are played locally, the application does not need to upload the movie itself to the server.

**Note:** Users need to select matching video files themselves. Playback synchronization can vary depending on network conditions and differences between video files or browsers.

## 📁 Project Structure

```structure

watch-party/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── ...
├── README.md
└── ...
```

The exact folder structure may change as I continue developing the application.

## 💻 Running the Project Locally

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/watch-party.git
```

Move into the project directory:

```bash
cd watch-party
```

### 2. Install dependencies

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Start the frontend using:

```bash
npm run dev
```

Keep this terminal running.

### 3. Start the backend

Open another terminal in VS Code, navigate to the backend directory, and install its dependencies.

For example, if the backend is in a folder named `backend`:

```bash
cd backend
npm install
```

Start the backend using the script configured in its `package.json`. For example:

```bash
npm start
```

If the backend uses a different start script, use the one defined in its `package.json`.

**Important:** The frontend must connect to the correct backend address and port. Configure any required environment variables according to your project setup.

## 🔒 Privacy and Limitations

- Video files are selected and played locally on each user's device.
- The application is designed for synchronized playback, not for uploading or hosting movie files.
- Both users should select the same video file for the best results.
- A running backend server is required for real-time synchronization.
- The current implementation may not provide perfectly frame-accurate synchronization.
- This project is still under development, so some features and behavior may change.

## 🎯 My Goal

My goal is to build a working watch-party application where friends can watch their own local video files together with synchronized playback.

I also want to improve my understanding of real-time applications, WebSocket communication, backend architecture, and full-stack development through this project.

## 🔮 Future Improvements

Some improvements I would like to work on are:

- Better playback synchronization.
- Improved room creation and joining.
- A cleaner and more responsive user interface.
- Better connection and error handling.
- Easier setup and deployment.
- More reliable handling of users joining or leaving a room.

## 👨‍💻 About This Project

This is a personal learning project that I am developing to gain practical experience with React, Node.js, Express, and Socket.IO.

I am focusing on making the core functionality work correctly before spending too much time on UI polish.

Feedback and suggestions are always welcome!

---

**Built with curiosity and a lot of debugging.** 🚀
