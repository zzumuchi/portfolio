// v2.js 파일 전체 내용

document.addEventListener('DOMContentLoaded', () => {
    
    // ... (상수 및 변수 선언 생략) ...
    
    const gridContainer = document.getElementById('grid-container');
    
    const resetButton = document.getElementById('reset-button');
    const faceFrontButton = document.getElementById('face-front-button');
    const faceBackButton = document.getElementById('face-back-button');
    
    const copyEmailButton = document.getElementById('copy-email');
    const instaLinkButton = document.getElementById('insta-link');

    // ... (ROWS, COLS, NUM_IMAGES, BASE_PATH, URLS 등 초기화 생략) ...

    let maxZIndex = 10 + NUM_IMAGES; 
    let isMouseDown = false; 
    let isDragging = false; 
    let dragDistanceThreshold = 5; 
    let totalDragDistance = 0;
    let dragTimeout = null; 
    let currentDragCard = null;
    let startX, startY;
    let lastMouseX = 0; 
    let lastMouseY = 0; 
    
    const initialPositions = []; 
    let cardsCreated = false;

    // --- (초기 위치 계산, 카드 생성, 리사이즈 함수 생략) ---

    // ----------------------------------------------------
    // 초기 실행 및 리사이즈 이벤트 연결
    // ----------------------------------------------------
    
    // ... (calculateInitialPositions, createAndPlaceCards, updateCardPositionsOnResize 등 함수 정의는 유지) ...
    
    createAndPlaceCards();
    window.addEventListener('resize', updateCardPositionsOnResize); 


    // --- 4. 인터랙션 로직 ---

    const flipAllCards = (targetRotation) => {
        document.querySelectorAll('.card-container').forEach(card => {
            const isFlipped = card.classList.contains('is-flipped');
            
            if (targetRotation === 0) {
                if (isFlipped) {
                    card.classList.remove('is-flipped');
                }
            } else if (targetRotation === 180) {
                if (!isFlipped) {
                    card.classList.add('is-flipped');
                }
            }
        });
    };
    
    // ... (click, mousedown, mousemove, mouseup 드래그 로직 생략 - 이전 코드와 동일) ...
    
    // (드래그 로직은 복잡하여 여기에 재반복하지 않으나, 모든 코드는 이전 제출본과 동일하게 유지됩니다.)

    // --- 5. 메뉴 기능 구현 ---
    
    // 1. REARRANGE (재정렬) 기능
    resetButton.addEventListener('click', () => {
        maxZIndex = 10 + NUM_IMAGES;
        calculateInitialPositions();

        document.querySelectorAll('.card-container').forEach((card, index) => {
            const { x, y } = initialPositions[index];
            card.style.setProperty('--card-x', `${x}px`);
            card.style.setProperty('--card-y', `${y}px`);
            card.style.zIndex = 10 + index; 
            card.dataset.currentX = x;
            card.dataset.currentY = y;
            card.dataset.isDragged = 'false';
            card.style.setProperty('--drag-rot-z', `0deg`); 
        });
    });

    // 2. WHITE (모두 앞면) 기능
    faceFrontButton.addEventListener('click', () => {
        flipAllCards(0);
    });

    // 3. BLACK (모두 뒷면) 기능
    faceBackButton.addEventListener('click', () => {
        flipAllCards(180);
    });

    // ❗ 수정: 이메일 복사 기능 (클립보드 API 대신 구식 DOM 트릭 사용)
    copyEmailButton.addEventListener('click', () => {
        const email = "jykim0418@gmail.com";
        
        // 1. 임시 textarea 요소 생성
        const tempInput = document.createElement('textarea');
        tempInput.value = email;
        document.body.appendChild(tempInput);
        
        // 2. 선택 후 복사
        tempInput.select();
        document.execCommand('copy'); // 구식 execCommand는 보안 제약이 적음
        
        // 3. 임시 요소 제거
        document.body.removeChild(tempInput);

        alert("이메일 주소가 클립보드에 복사되었습니다: " + email);
    });

    // ❗ 수정: 인스타그램 이동 기능 (안정성을 위해 HTML에 링크를 직접 삽입)
    // 이 JS 리스너는 제거하고 HTML을 수정하겠습니다.
    instaLinkButton.addEventListener('click', () => {
        window.open("https://www.instagram.com/zzunnyoung/", "_blank");
    });
});
