// 기존 요소 가져오기
const homeSection = document.getElementById("home");
const tasksSection = document.getElementById("tasks");
const profileSection = document.getElementById("profile");
const loginBtn = document.getElementById("login-btn");
const rememberMeCheckbox = document.getElementById("remember-me");
const calendar = document.getElementById("calendar");
const taskChecklist = document.getElementById("task-checklist");
const saveBtn = document.getElementById("save-btn");

const homeBtn = document.getElementById("home-btn");
const tasksBtn = document.getElementById("tasks-btn");
const openProfileBtn = document.getElementById("open-profile-btn");
const logoutBtn = document.getElementById("logout-btn");
const userInfoDisplay = document.getElementById("user-info-display");
const loginPopup = document.getElementById("login-popup");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const calendarTitle = document.getElementById("calendar-title");

// 모든 섹션 숨기기 함수
function hideAllSections() {
  document.querySelectorAll("main .section").forEach(section => section.classList.remove("active"));
}

// 앱 처음 로딩 시 동작
document.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("userName");
  const savedBirth = localStorage.getItem("userBirth");
  const savedDepartment = localStorage.getItem("userDepartment");

  if (!savedName || !savedBirth || !savedDepartment) {
    loginPopup.classList.add("active");  // 저장된 정보 없으면 로그인 팝업 표시
    hideAllSections();  // 모든 섹션 숨기기
  } else {
    userInfoDisplay.textContent = `이름: ${savedName}, 부서: ${savedDepartment}`;
    homeSection.classList.add("active");  // 저장된 정보 있으면 홈 섹션 보이기
    generateCalendar(currentYear, currentMonth);  // 새로고침 시 달력도 함께 생성
  }
});

// 로그인 버튼 클릭 시
loginBtn.addEventListener("click", () => {
  const userName = document.getElementById("user-name").value;
  const userBirth = document.getElementById("user-birth").value;
  const userDepartment = document.getElementById("user-department").value;

  if (!userName || !userBirth) {
    alert("이름과 생년월일을 입력해주세요.");
    return;
  }

  // 로그인 정보 저장
  localStorage.setItem("userName", userName);
  localStorage.setItem("userBirth", userBirth);
  localStorage.setItem("userDepartment", userDepartment);

  // 사용자 정보 표시 및 팝업 닫기
  userInfoDisplay.textContent = `이름: ${userName}, 부서: ${userDepartment}`;
  loginPopup.classList.remove("active");

  hideAllSections();  // 모든 섹션 숨기기
  homeSection.classList.add("active");  // 홈 섹션 보이기
  generateCalendar(currentYear, currentMonth);  // 달력 생성
});

// 내 정보 버튼 클릭 시 내 정보 섹션 보이기
openProfileBtn.addEventListener("click", () => {
  hideAllSections();
  profileSection.classList.add("active");
});

// 로그아웃 버튼 클릭 시
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("userName");
  localStorage.removeItem("userBirth");
  localStorage.removeItem("userDepartment");

  userInfoDisplay.textContent = "로그인 정보가 없습니다.";
  hideAllSections();
  loginPopup.classList.add("active");
});

// 페이지 간 이동: 홈 버튼 클릭 시
homeBtn.addEventListener("click", () => {
  hideAllSections();
  homeSection.classList.add("active");
});

// 페이지 간 이동: 거룩한 루틴 체크 버튼 클릭 시
tasksBtn.addEventListener("click", () => {
  hideAllSections();
  tasksSection.classList.add("active");
});

// 달력 생성 함수
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let today = new Date().getDate();  // 오늘 날짜 저장

function generateCalendar(year, month) {
  calendar.innerHTML = "";  // 기존 달력 내용 지우기
  const firstDayOfMonth = new Date(year, month, 1).getDay();  // 첫 날의 요일
  const daysInMonth = new Date(year, month + 1, 0).getDate();  // 해당 월의 일 수

  // 달력 제목 설정
  calendarTitle.textContent = `${year}년 ${month + 1}월`;

  // 빈 칸 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-day", "empty");
    calendar.appendChild(emptyCell);
  }

  // 실제 날짜 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    const dayButton = document.createElement("button");
    dayButton.textContent = day;
    dayButton.classList.add("calendar-day");

    // 오늘 날짜를 기본 선택
    if (year === new Date().getFullYear() && month === new Date().getMonth() && day === today) {
      dayButton.classList.add("selected");
    }

    // 날짜 클릭 시 선택 상태 변경
    dayButton.addEventListener("click", () => {
      document.querySelectorAll(".calendar-day").forEach(btn => btn.classList.remove("selected"));
      dayButton.classList.add("selected");
      taskChecklist.dataset.selectedDay = day;  // 선택된 날짜 저장
    });

    calendar.appendChild(dayButton);
  }
}

// 이전 달로 이동
prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;  // 12월로 변경
    currentYear--;
  }
  generateCalendar(currentYear, currentMonth);
});

// 다음 달로 이동
nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;  // 1월로 변경
    currentYear++;
  }
  generateCalendar(currentYear, currentMonth);
});

// 페이지 로드 시 현재 월의 달력 생성
document.addEventListener("DOMContentLoaded", () => {
  generateCalendar(currentYear, currentMonth);
});

// 저장 버튼 클릭 시 동작 (기존 기능 유지)
saveBtn.addEventListener("click", () => {
  const selectedDay = taskChecklist.dataset.selectedDay;  // 선택된 날짜 가져오기
  if (!selectedDay) return;

  // 완료된 작업 수 계산
  const completedTasks = Array.from(taskChecklist.querySelectorAll(".task-card.completed")).length;

  // 해당 날짜 버튼 찾기
  const dayButton = Array.from(calendar.children).find(
    (btn) => btn.textContent === selectedDay
  );

  // 완료 상태에 따라 클래스 적용
  if (completedTasks === 4) {
    dayButton.classList.add("all-completed");
    dayButton.classList.remove("partially-completed", "not-completed");
  } else if (completedTasks > 0) {
    dayButton.classList.add("partially-completed");
    dayButton.classList.remove("all-completed", "not-completed");
  } else {
    dayButton.classList.add("not-completed");
    dayButton.classList.remove("all-completed", "partially-completed");
  }

  taskChecklist.style.display = "none";  // 체크리스트 숨기기
});

// 작업 카드 클릭 시 완료 상태 토글
document.querySelectorAll(".task-card").forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("completed");
  });
});
