// Firebase 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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

// 섹션 전환 기능
document.getElementById('announcement-btn').addEventListener('click', () => switchSection('announcement-section'));
document.getElementById('stats-btn').addEventListener('click', () => switchSection('user-stats-section'));

function switchSection(sectionId) {
  // 모든 섹션 숨기기
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // 선택된 섹션만 보이게 하기
  document.getElementById(sectionId).classList.add('active');
}

// 조회 버튼 클릭 시 데이터 불러오기
document.getElementById('filter-btn').addEventListener('click', async function() {
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

// 화면에 숙제 현황 표시
function displayUserStats(users, department, year, month) {
  const container = document.getElementById('stats-container');
  container.innerHTML = '';  // 기존 내용을 초기화

  let foundData = false;  // 데이터가 있는지 확인하기 위한 플래그

  for (const userId in users) {
    const user = users[userId];

    // 선택한 부서에 해당하는 사용자만 처리
    if (user.department === department) {
      const routines = user.routines || {};

      // 월별 데이터 필터링
      const tasksInMonth = Object.keys(routines).filter(date => {
        const [taskYear, taskMonth] = date.split('-');
        return taskYear === year && parseInt(taskMonth) === parseInt(month);
      });

      if (tasksInMonth.length > 0) {
        foundData = true;
        const taskDetails = tasksInMonth.map(date => {
          return `
            <li>
              <strong>${date}</strong>: ${routines[date].join(', ')}
            </li>`;
        }).join('');

        // 사용자별 숙제 현황 출력
        container.innerHTML += `
          <div class="user">
            <h3>${user.name} (${userId})</h3>
            <ul>${taskDetails}</ul>
          </div>`;
      }
    }
  }

  // 데이터가 없을 경우 메시지 출력
  if (!foundData) {
    container.innerHTML = "<p>해당 조건에 데이터가 없습니다.</p>";
  }
}
