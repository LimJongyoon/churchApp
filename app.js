//app.js
const loginSection = document.getElementById("login");
const homeSection = document.getElementById("home");
const tasksSection = document.getElementById("tasks");
const loginBtn = document.getElementById("login-btn");
const rememberMeCheckbox = document.getElementById("remember-me");
const announcementList = document.getElementById("announcement-list");
const youtubeLink = document.getElementById("youtube-link");
const calendar = document.getElementById("calendar");
const taskChecklist = document.getElementById("task-checklist");
const saveBtn = document.getElementById("save-btn");

const homeBtn = document.getElementById("home-btn");
const tasksBtn = document.getElementById("tasks-btn");

const TASKS_STORAGE_KEY = "tasksData";

homeBtn.addEventListener("click", () => {
  homeSection.classList.add("active");
  tasksSection.classList.remove("active");
});

tasksBtn.addEventListener("click", () => {
  homeSection.classList.remove("active");
  tasksSection.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  const userName = document.getElementById("user-name").value;
  const userBirth = document.getElementById("user-birth").value;

  if (!userName || !userBirth) {
    alert("이름과 생년월일을 입력해주세요.");
    return;
  }

  if (rememberMeCheckbox.checked) {
    localStorage.setItem("userName", userName);
    localStorage.setItem("userBirth", userBirth);
  }

  if (userName === "admin" && userBirth === "admin") {
    window.location.href = "admin.html";
  } else {
    alert(`${userName}님, 환영합니다!`);
    loginSection.classList.remove("active");
    homeSection.classList.add("active");
    generateCalendar();
  }
});

function generateCalendar() {
  calendar.innerHTML = ""; // Clear existing calendar
  const daysInMonth = 30; // Example month with 30 days

  for (let day = 1; day <= daysInMonth; day++) {
    const dayButton = document.createElement("button");
    dayButton.textContent = day;
    dayButton.classList.add("calendar-day");
    dayButton.addEventListener("click", () => {
      taskChecklist.style.display = "flex";
      taskChecklist.dataset.selectedDay = day; // Store the selected day
    });
    calendar.appendChild(dayButton);
  }
}

saveBtn.addEventListener("click", () => {
  const selectedDay = taskChecklist.dataset.selectedDay; // Get selected day
  if (!selectedDay) return;

  // Count completed tasks
  const completedTasks = Array.from(taskChecklist.querySelectorAll(".task-card.completed")).length;

  // Find the corresponding day button
  const dayButton = Array.from(calendar.children).find(
    (btn) => btn.textContent === selectedDay
  );

  // Apply class based on completed tasks
  if (completedTasks === 3) {
    dayButton.classList.add("all-completed");
    dayButton.classList.remove("partially-completed", "not-completed");
  } else if (completedTasks > 0) {
    dayButton.classList.add("partially-completed");
    dayButton.classList.remove("all-completed", "not-completed");
  } else {
    dayButton.classList.add("not-completed");
    dayButton.classList.remove("all-completed", "partially-completed");
  }

  taskChecklist.style.display = "none"; // Hide the checklist
});

// Task card toggle functionality
document.querySelectorAll(".task-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("completed");
  });
});

