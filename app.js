document.addEventListener("DOMContentLoaded", () => {
  // Firebase 초기화
  const firebaseConfig = {
    apiKey: "AIzaSyAz2wuHxyUWmXXzUZg_wEmxYGSNviBHpSs",
    authDomain: "churchapp-15674.firebaseapp.com",
    databaseURL: "https://churchapp-15674-default-rtdb.firebaseio.com",
    projectId: "churchapp-15674",
    storageBucket: "churchapp-15674.firebasestorage.app",
    messagingSenderId: "902474475312",
    appId: "1:902474475312:web:19109da15e9e473a8e4af5",
    measurementId: "G-8WH6FQ817T"
  };

  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // HTML 요소 가져오기
  const loginBtn = document.getElementById("login-btn");

  // 로그인 버튼 클릭 시 사용자 정보를 저장
  loginBtn.addEventListener("click", () => {
    const userName = document.getElementById("user-name").value;
    const userBirth = document.getElementById("user-birth").value;
    const userDepartment = document.getElementById("user-department").value;

    if (!userName || !userBirth) {
      alert("이름과 생년월일을 입력해주세요.");
      return;
    }

    if (userName === "admin" && userBirth === "admin") {
      alert("관리자 계정으로 로그인합니다.");
      localStorage.clear();
      window.location.href = "admin.html";  // 관리자 페이지로 이동
      return;
    }
  

    // 이름 + 생년월일을 고유 아이디로 설정
    const userId = `${userName}_${userBirth}`;

    // 기존 데이터가 있는지 확인
    database.ref('users/' + userId).once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          // 기존 데이터가 있으면 그대로 사용
          //alert("기존 데이터가 불러와졌습니다.");
          const userData = snapshot.val();
          
          // 사용자 정보 표시 및 팝업 닫기
          userInfoDisplay.textContent = `이름: ${userData.name}, 부서: ${userData.department}`;
          loginPopup.classList.remove("active");

          // 로컬스토리지에 사용자 정보 저장
          localStorage.setItem("userName", userData.name);
          localStorage.setItem("userBirth", userData.birth);
          localStorage.setItem("userDepartment", userData.department);

          // 루틴 데이터 불러오기
          loadChecklistState();
        } else {
          // 데이터가 없으면 새로 저장
          return database.ref('users/' + userId).set({
            name: userName,
            birth: userBirth,
            department: userDepartment,
            routines: {}  // 초기 루틴 데이터는 빈 객체로 설정
          }).then(() => {
            //alert("새로운 사용자가 등록되었습니다.");

            // 로컬스토리지에 사용자 정보 저장
            localStorage.setItem("userName", userName);
            localStorage.setItem("userBirth", userBirth);
            localStorage.setItem("userDepartment", userDepartment);

            // 사용자 정보 표시 및 팝업 닫기
            userInfoDisplay.textContent = `이름: ${userName}, 부서: ${userDepartment}`;
            loginPopup.classList.remove("active");

            loadChecklistState();  // 초기 루틴 데이터 불러오기
          });
        }
      })
      .catch(error => {
        console.error("로그인 중 오류 발생:", error);
      });
  });
});


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
  // ✅ 최근 로그인한 사용자 정보를 자동 입력하는 기능 추가
  let userList = JSON.parse(localStorage.getItem("userList")) || [];

  if (userList.length > 0) {
    // 최근 로그인한 사용자 정보 가져오기
    const latestUser = userList[0];

    // 로그인 입력창에 자동 입력
    document.getElementById("user-name").value = latestUser.name;
    document.getElementById("user-birth").value = latestUser.birth;
    document.getElementById("user-department").value = latestUser.department;
  }

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
  const userId = `${localStorage.getItem("userName")}_${localStorage.getItem("userBirth")}`;
  if (!userId) return;

  firebase.database().ref('users/' + userId + '/routines').once('value')
    .then(snapshot => {
      checklistState = snapshot.val() || {};  // 데이터가 없으면 빈 객체로 초기화
      console.log("루틴 데이터 로드 완료:", checklistState);
      generateCalendar(currentYear, currentMonth);  // 달력 갱신
    })
    .catch(error => {
      console.error("루틴 데이터를 불러오는 중 오류 발생:", error);
    });
}


// 체크리스트 상태 저장
function saveChecklistState() {
  const userId = `${localStorage.getItem("userName")}_${localStorage.getItem("userBirth")}`;
  if (!userId) return;  // 사용자 정보가 없으면 저장하지 않음

  // Firebase의 사용자 루틴 경로에 저장
  firebase.database().ref('users/' + userId + '/routines').set(checklistState)
    .then(() => {
      console.log("거룩한 루틴이 성공적으로 저장되었습니다.");
    })
    .catch(error => {
      console.error("루틴 저장 중 오류 발생:", error);
    });
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

document.addEventListener("DOMContentLoaded", () => {
  const database = firebase.database();

  // 각 요소 가져오기
  const announcementList = document.getElementById("announcement-list");
  const youtubeWrapper = document.querySelector(".youtube-wrapper iframe");
  const prayerImage = document.querySelector(".prayer-image");
  const lyricsImage = document.querySelector(".lyrics-image");

  // Firebase에서 공지사항 불러오기
  database.ref("announcements/announcement").once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const announcementContent = snapshot.val().content;
        const timestamp = snapshot.val().timestamp;

        announcementList.innerHTML = `<p>${announcementContent}</p><p style="color: gray; font-size: 0.8rem;"> 게시 일 ${new Date(timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>`;
      }
    })
    .catch(error => {
      console.error("공지사항 불러오기 오류:", error);
    });

  // 유튜브 링크 불러오기
  database.ref("announcements/youtubeLink").once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const youtubeLink = snapshot.val();
        youtubeWrapper.src = `https://www.youtube.com/embed/${getYouTubeId(youtubeLink)}`;
      }
    })
    .catch(error => {
      console.error("유튜브 링크 불러오기 오류:", error);
    });

  // 삶에서 하는 기도 이미지 불러오기
  database.ref("announcements/prayerImage").once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const imageUrl = snapshot.val();
        prayerImage.src = imageUrl;
      }
    })
    .catch(error => {
      console.error("삶에서 하는 기도 이미지 불러오기 오류:", error);
    });

  // 이달의 암송 이미지 불러오기
  database.ref("announcements/lyricsImage").once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        const imageUrl = snapshot.val();
        lyricsImage.src = imageUrl;
      }
    })
    .catch(error => {
      console.error("이달의 암송 이미지 불러오기 오류:", error);
    });

  // 유튜브 링크에서 ID 추출하는 함수
  function getYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/\S+\/|\S*\?v=|\S*\/v\/)|youtu\.be\/)([\w-]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  }
  
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const images = document.querySelectorAll(".prayer-image, .lyrics-image");
  const closeBtn = document.getElementsByClassName("close-modal")[0];

  // 이미지 클릭 시 모달 열기
  images.forEach(image => {
    image.addEventListener("click", function() {
      modal.style.display = "block";
      modalImg.src = this.src;  // 클릭한 이미지의 src를 모달 이미지에 설정
    });
  });

  // 모달 닫기
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // 모달 바깥 영역 클릭 시 모달 닫기
  window.addEventListener("click", function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

