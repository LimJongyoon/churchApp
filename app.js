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

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let todayDate = `${currentYear}-${currentMonth + 1}-${new Date().getDate().toString().padStart(2, '0')}`;
let checklistState = {}; // 날짜별 체크리스트 상태 저장

// 모든 섹션 숨기기 함수
function hideAllSections() {
  document.querySelectorAll("main .section").forEach(section => section.classList.remove("active"));
}

// 페이지 로드 시 체크리스트 및 사용자 정보 불러오기
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
  }

  generateCalendar(currentYear, currentMonth);  // 새로고침 시 달력도 함께 생성
  loadChecklistState();  // 저장된 체크리스트 상태 불러오기

  // "거룩한 루틴 체크" 섹션으로 들어갈 때 오늘 날짜 기본 선택
  taskChecklist.dataset.selectedDay = todayDate;
  updateChecklist(todayDate);
});

// 체크리스트 상태 로컬스토리지에서 불러오기
function loadChecklistState() {
  const savedChecklistState = localStorage.getItem("checklistState");
  if (savedChecklistState) {
    checklistState = JSON.parse(savedChecklistState);
  }
}

// 체크리스트 상태 저장
function saveChecklistState() {
  localStorage.setItem("checklistState", JSON.stringify(checklistState));
}

// 달력 생성 함수
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

    // 오늘 날짜 강조
    const currentDay = `${year}-${month + 1}-${day.toString().padStart(2, '0')}`;
    if (currentDay === todayDate) {
      dayButton.classList.add("selected");
    }

    // 날짜 클릭 이벤트
    dayButton.addEventListener("click", () => {
      taskChecklist.dataset.selectedDay = currentDay;
      document.querySelectorAll(".calendar-day").forEach(btn => btn.classList.remove("selected"));
      dayButton.classList.add("selected");
      updateChecklist(currentDay);
    });

    // 점 표시하는 div 추가
    const dotContainer = document.createElement("div");
    dotContainer.classList.add("dot-container");

    // 체크리스트 개수에 따라 점 추가
    if (checklistState[currentDay]) {
      const completedTasks = checklistState[currentDay].length;
      for (let i = 0; i < completedTasks; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        dotContainer.appendChild(dot);
      }
    }

    dayButton.appendChild(dotContainer);
    calendar.appendChild(dayButton);
  }
}

// 체크리스트 업데이트
function updateChecklist(selectedDay) {
  document.querySelectorAll(".task-card").forEach(card => {
    card.classList.remove("completed");
    if (checklistState[selectedDay] && checklistState[selectedDay].includes(card.id)) {
      card.classList.add("completed");
    }
  });

  taskChecklist.style.display = "block";  // 체크리스트 계속 표시
}

// 저장 버튼 클릭 이벤트
saveBtn.addEventListener("click", () => {
  const selectedDay = taskChecklist.dataset.selectedDay;
  if (!selectedDay) return;

  const completedTasks = Array.from(document.querySelectorAll(".task-card.completed")).map(card => card.id);
  checklistState[selectedDay] = completedTasks;
  saveChecklistState();  // 로컬스토리지에 저장
  alert("거룩한 루틴을 수행 했어요!");

  // 다시 달력을 재생성하여 점 표시 업데이트
  generateCalendar(currentYear, currentMonth);

// 모든 날짜의 선택 해제
document.querySelectorAll(".calendar-day").forEach(btn => btn.classList.remove("selected"));

// 저장된 날짜만 선택 상태 유지
const currentDayButton = Array.from(document.querySelectorAll(".calendar-day")).find(
  btn => btn.textContent === parseInt(selectedDay.split('-')[2]).toString()
);

if (currentDayButton) {
  currentDayButton.classList.add("selected");
}

// 선택된 날짜의 체크리스트 업데이트
updateChecklist(selectedDay);
});

// 작업 카드 클릭 시 완료 상태 토글
document.querySelectorAll(".task-card").forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("completed");
  });
});

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

// 🚀 로그인 버튼 클릭 이벤트 추가
loginBtn.addEventListener("click", () => {
  const userName = document.getElementById("user-name").value;
  const userBirth = document.getElementById("user-birth").value;
  const userDepartment = document.getElementById("user-department").value;

  if (!userName || !userBirth) {
    alert("이름과 생년월일을 입력해주세요.");
    return;
  }

  // 로그인 정보 저장 (localStorage)
  localStorage.setItem("userName", userName);
  localStorage.setItem("userBirth", userBirth);
  localStorage.setItem("userDepartment", userDepartment);

  // 사용자 정보 표시 및 팝업 닫기
  userInfoDisplay.textContent = `이름: ${userName}, 부서: ${userDepartment}`;
  loginPopup.classList.remove("active");

  hideAllSections();  // 모든 섹션 숨기기
  homeSection.classList.add("active");  // 홈 섹션 보이기

  loadChecklistState();  // 로그인 후 체크리스트 상태 불러오기
  generateCalendar(currentYear, currentMonth);  // 달력 갱신 및 점 상태 반영
});

// 🚀 로그아웃 버튼 클릭 이벤트 추가
logoutBtn.addEventListener("click", () => {
  localStorage.clear();  // 모든 로컬스토리지 데이터 초기화
  userInfoDisplay.textContent = "로그인 정보가 없습니다.";
  hideAllSections();
  loginPopup.classList.add("active");
});

let lastTouchEnd = 0;

// 더블탭으로 인한 확대 방지
document.addEventListener('touchend', (event) => {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();  // 더블탭으로 인한 기본 동작 차단
  }
  lastTouchEnd = now;
}, false);

// 기본 동작을 선택적으로 차단하는 함수
document.addEventListener('touchstart', function(e) {
  // 특정 요소에서만 기본 동작을 허용 (예: 버튼, 입력 필드)
  if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();  // 스크롤 등 기본 동작 차단
  }
}, { passive: false });


// 🚀 푸터 버튼 클릭 이벤트 추가
homeBtn.addEventListener("click", () => {
  hideAllSections();
  homeSection.classList.add("active");
});

tasksBtn.addEventListener("click", () => {
  hideAllSections();
  tasksSection.classList.add("active");
  const selectedDay = taskChecklist.dataset.selectedDay || todayDate;
  updateChecklist(selectedDay);
});

openProfileBtn.addEventListener("click", () => {
  hideAllSections();
  profileSection.classList.add("active");
});
