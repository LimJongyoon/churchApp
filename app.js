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
  const today = new Date().getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dayButton = document.createElement("button");
    dayButton.textContent = day;
    if (day === today) {
      dayButton.classList.add("today");
    }
    dayButton.addEventListener("click", () => {
      taskChecklist.style.display = "flex";
    });
    calendar.appendChild(dayButton);
  }
}

saveBtn.addEventListener("click", () => {
  alert("숙제가 저장되었습니다!");
  taskChecklist.style.display = "none";
  const selectedDay = document.querySelector(".calendar button.today");
  if (selectedDay) {
    selectedDay.classList.add("completed");
  }
});
