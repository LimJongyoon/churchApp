// Firebase 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";


// 페이지 로드 시 현재 연도와 월을 기본값으로 설정
window.onload = function () {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;  // 월은 0부터 시작하므로 +1

  // 연도와 월 선택 요소 초기화
  document.getElementById('year-select').value = currentYear;
  document.getElementById('month-select').value = currentMonth;

  document.getElementById('filter-btn').click();
}

// Firebase 설정 및 초기화
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);


// 전역 배열로 사용자 데이터를 저장할 변수
let userDataList = [];

// 섹션 전환 기능
document.getElementById('announcement-btn').addEventListener('click', () => switchSection('announcement-section'));
document.getElementById('stats-btn').addEventListener('click', () => switchSection('user-stats-section'));

function switchSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// 조회 버튼 클릭 시 데이터 불러오기
document.getElementById('filter-btn').addEventListener('click', async function () {
  const department = document.getElementById('user-department').value;
  const year = document.getElementById('year-select').value;
  const month = document.getElementById('month-select').value;

  if (!department || !year || !month) {
    alert('모든 필드를 선택해 주세요.');
    return;
  }

  try {
    const snapshot = await get(child(ref(db), `users`));
    if (snapshot.exists()) {
      const users = snapshot.val();
      displayUserStats(users, department, year, month);
    } else {
      document.getElementById('stats-container').innerHTML = "<p>해당 조건에 데이터가 없습니다.</p>";
    }
  } catch (error) {
    console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
  }
});

// 정렬 기준 변경 시 실행되는 함수
document.getElementById('sort-options').addEventListener('change', function () {
  const selectedOption = this.value;
  sortAndDisplayUsers(selectedOption);
});

// 사용자 데이터를 정렬 후 렌더링하는 함수
function sortAndDisplayUsers(criteria) {
  if (criteria === "percent") {
    userDataList.sort((a, b) => b.totalPercent - a.totalPercent);  // % 높은 순 정렬
  } else if (criteria === "name") {
    userDataList.sort((a, b) => a.userId.localeCompare(b.userId));  // 가나다순 정렬
  }

  const container = document.getElementById('stats-container');
  container.innerHTML = '';  // 기존 데이터를 초기화 후 재렌더링
  userDataList.forEach(user => container.innerHTML += user.html);
}

// 화면에 숙제 현황 표시
function displayUserStats(users, department, year, month) {
  const container = document.getElementById('stats-container');
  container.innerHTML = '';  // 기존 내용을 초기화
  userDataList = [];  // 새 조회 시 데이터 초기화

  const taskNames = {
    "task-qt": "큐티",
    "task-song": "암송",
    "task-prayer": "삶에서 하는 기도",
    "task-bible": "성경통독"
  };

  const daysInMonth = new Date(year, month, 0).getDate();  // 월의 총 날짜 계산

  for (const userId in users) {
    const user = users[userId];

    if (user.department === department) {
      const routines = user.routines || {};

      const tasksInMonth = Object.keys(routines).filter(date => {
        const [taskYear, taskMonth] = date.split('-');
        return taskYear === year && parseInt(taskMonth) === parseInt(month);
      });

      if (tasksInMonth.length > 0) {
        const taskCounts = {
          "큐티": 0,
          "암송": 0,
          "삶에서 하는 기도": 0,
          "성경통독": 0
        };

        tasksInMonth.forEach(date => {
          const tasks = routines[date] || [];
          tasks.forEach(task => {
            const taskName = taskNames[task];
            if (taskName) taskCounts[taskName]++;
          });
        });

        const MAX_TOTAL_TASKS = daysInMonth * 4;
        const totalCompletedTasks = taskCounts["큐티"] + taskCounts["암송"] + taskCounts["삶에서 하는 기도"] + taskCounts["성경통독"];
        const totalPercent = Math.round((totalCompletedTasks / MAX_TOTAL_TASKS) * 100);

        const userHtml = `
          <div class="user">
            <div class="task-info">
              <h3>${userId}</h3>
              <div class="task"><span>큐티 :</span> <span class="count">${taskCounts["큐티"]}회 / ${daysInMonth}일</span></div>
              <div class="task"><span>암송 :</span> <span class="count">${taskCounts["암송"]}회 / ${daysInMonth}일</span></div>
              <div class="task"><span>기도 :</span> <span class="count">${taskCounts["삶에서 하는 기도"]}회 / ${daysInMonth}일</span></div>
              <div class="task"><span>성경 :</span> <span class="count">${taskCounts["성경통독"]}회 / ${daysInMonth}일</span></div>
            </div>
            ${getProgressCircle(totalPercent)}
          </div>`;

        // 전역 배열에 사용자 데이터를 저장
        userDataList.push({
          userId,
          totalPercent,
          html: userHtml
        });
      }
    }
  }

  sortAndDisplayUsers(document.getElementById('sort-options').value);  // 초기 정렬 기준으로 렌더링
}

// 동적 원형 프로그레스 바 생성 함수
function getProgressCircle(percent) {
  let circleClass = "low";
  if (percent >= 75) circleClass = "high";
  else if (percent >= 50) circleClass = "medium";

  return `<div class="progress-circle ${circleClass}">
            ${percent}% 
          </div>`;
}

document.getElementById('post-announcement').addEventListener('click', async function (e) {
  e.preventDefault();
  
  const announcementContent = document.getElementById('announcement-content').value;

  if (!announcementContent) {
    alert("공지 내용을 입력해 주세요.");
    return;
  }

  try {
    const dbRef = ref(db, 'announcements/announcement');
    await set(dbRef, {
      content: announcementContent,
      timestamp: new Date().toISOString()
    });
    alert('공지사항이 성공적으로 등록되었습니다.');
  } catch (error) {
    console.error('공지사항 등록 중 오류:', error);
    alert('공지사항 등록에 실패했습니다.');
  }
});


document.getElementById('post-youtube').addEventListener('click', async (e) => {
  e.preventDefault();
  const youtubeLink = document.getElementById('youtube-link').value;

  if (youtubeLink.trim() === "") {
    alert("유튜브 링크를 입력해 주세요.");
    return;
  }

  try {
    await set(ref(db, 'announcements/youtubeLink'), youtubeLink);
    alert("유튜브 링크가 등록되었습니다.");
  } catch (error) {
    console.error("유튜브 링크 등록 중 오류:", error);
  }
});

// 이미지 선택 시 즉시 미리보기를 보여주는 함수
function showPreview(inputId, previewId) {
  const fileInput = document.getElementById(inputId);
  const previewElement = document.getElementById(previewId);

  if (!fileInput.files || fileInput.files.length === 0) {
    previewElement.innerHTML = "";  // 파일이 선택되지 않으면 초기화
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    previewElement.innerHTML = `<img src="${e.target.result}" alt="선택한 이미지 미리보기" style="max-width: 20%; border-radius: 8px;" />`;
  };
  reader.readAsDataURL(file);
}

// 이벤트 리스너 추가: 파일 선택 시 미리보기 표시
document.getElementById("prayer-image").addEventListener("change", function () {
  showPreview("prayer-image", "prayer-preview");
});

document.getElementById("lyrics-image").addEventListener("change", function () {
  showPreview("lyrics-image", "lyrics-preview");
});

// 이미지 업로드 함수
async function uploadImage(inputId, progressId, previewId, storageFolder, dbPath) {
  const file = document.getElementById(inputId).files[0];
  const progressElement = document.getElementById(progressId);
  const previewElement = document.getElementById(previewId);

  if (!file) {
    alert("이미지를 선택해 주세요.");
    return;
  }

  try {
    const fileName = `${storageFolder}.jpg`;  // 예: "prayer-image.jpg" 또는 "lyrics-image.jpg"
    const storagePath = `${storageFolder}/${file.name}`;
    const storageReference = storageRef(storage, storagePath);

    // 업로드 태스크 생성
    const uploadTask = uploadBytesResumable(storageReference, file);

    // 업로드 진행 상태 보여주기
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressElement.textContent = `업로드 진행률: ${Math.round(progress)}%`;
      },
      (error) => {
        console.error("업로드 중 오류 발생:", error);
        alert("이미지 업로드에 실패했습니다.");
      },
      async () => {
        // 업로드 완료 후 URL 가져오기
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("업로드 완료. URL:", downloadURL);

        // Firebase Database에 URL 저장
        const dbRef = ref(db, dbPath);
        await set(dbRef, downloadURL);

        // 화면에 이미지 미리보기 표시
        previewElement.innerHTML = `<img src="${downloadURL}" alt="업로드된 이미지" />`;

        setTimeout(() => {
          progressElement.textContent = "";
        }, 1000); // 1초 후 사라지도록 설정

        alert("이미지가 성공적으로 업로드되었습니다.");
      }
      
    );
  } catch (error) {
    console.error("이미지 업로드 중 오류 발생:", error);
    alert("이미지 업로드에 실패했습니다.");
  }
}

// 이벤트 리스너 추가
document.getElementById("post-prayer").addEventListener("click", function (e) {
  e.preventDefault();
  uploadImage("prayer-image", "prayer-progress", "prayer-preview", "prayer_images", "announcements/prayerImage");
});

document.getElementById("post-lyrics").addEventListener("click", function (e) {
  e.preventDefault();
  uploadImage("lyrics-image", "lyrics-progress", "lyrics-preview", "lyrics_images", "announcements/lyricsImage");
});
