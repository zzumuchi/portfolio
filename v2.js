document.addEventListener('DOMContentLoaded', () => {
    
    const gridContainer = document.getElementById('grid-container');
    const resetButton = document.getElementById('reset-button');
    
    const ROWS = 4; 
    const COLS = 3; 
    const NUM_IMAGES = ROWS * COLS; // 12

    const BASE_PATH = './1_cover/';
    const DRAG_DELAY_MS = 100;

    // 1. 이미지 URL 목록 생성
    const FRONT_IMAGE_URLS = [];
    const BACK_IMAGE_URLS = [];
    for (let i = 1; i <= NUM_IMAGES; i++) {
        FRONT_IMAGE_URLS.push(`${BASE_PATH}1-${i}.png`); 
        BACK_IMAGE_URLS.push(`${BASE_PATH}2-${i}.png`);
    }

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


    // --- 1. 초기 위치 계산 함수 ---
    const calculateInitialPositions = () => {
        initialPositions.length = 0; 
        
        const gridRect = gridContainer.getBoundingClientRect();
        
        let cardWidth = gridRect.width / COLS;
        let cardHeight = gridRect.height / ROWS;

        if (cardWidth === 0 || cardHeight === 0 || isNaN(cardWidth) || isNaN(cardHeight)) {
             console.error("오류: 카드 크기가 0으로 계산되었습니다. CSS 설정을 확인하세요.");
        }

        for (let i = 0; i < NUM_IMAGES; i++) {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            
            const initialX = col * cardWidth;
            const initialY = row * cardHeight;
            
            initialPositions.push({ x: initialX, y: initialY });
        }
    };
    
    // --- 2. 카드 생성 및 초기 위치 설정 함수 ---
    const createAndPlaceCards = () => {
        if (cardsCreated) return;

        calculateInitialPositions();
        
        for (let i = 0; i < NUM_IMAGES; i++) {
            const { x: initialX, y: initialY } = initialPositions[i];

            const cardContainer = document.createElement('div');
            cardContainer.classList.add('card-container');
            cardContainer.dataset.index = i;
            
            cardContainer.style.zIndex = 10 + i; 
            cardContainer.style.setProperty('--card-x', `${initialX}px`);
            cardContainer.style.setProperty('--card-y', `${initialY}px`);
            cardContainer.dataset.isDragged = 'false';
            
            // 데이터셋에 초기 위치 저장
            cardContainer.dataset.currentX = initialX;
            cardContainer.dataset.currentY = initialY;
            
            // 물리 속성 데이터 속성 제거됨

            const cardInner = document.createElement('div');
            cardInner.classList.add('card-inner');

            const front = document.createElement('div');
            front.classList.add('card-face', 'card-front');
            front.style.backgroundImage = `url('${FRONT_IMAGE_URLS[i]}')`; 
            
            const back = document.createElement('div');
            back.classList.add('card-face', 'card-back');
            back.style.backgroundImage = `url('${BACK_IMAGE_URLS[i]}')`; 

            cardInner.appendChild(front);
            cardInner.appendChild(back);
            cardContainer.appendChild(cardInner);
            gridContainer.appendChild(cardContainer);
        }
        cardsCreated = true;
        // ❗ 물리 엔진 루프 시작 코드 제거됨
    };
    
    // --- 3. 리사이즈 시 위치 업데이트 함수 (생략) ---
    const updateCardPositionsOnResize = () => {
        calculateInitialPositions(); 
        document.querySelectorAll('.card-container').forEach((card, i) => {
            const { x: newInitialX, y: newInitialY } = initialPositions[i];
            if (card.dataset.isDragged === 'false') {
                 card.style.setProperty('--card-x', `${newInitialX}px`);
                 card.style.setProperty('--card-y', `${newInitialY}px`);
            }
        });
    };
    
    // ----------------------------------------------------
    // 초기 실행 및 리사이즈 이벤트 연결
    // ----------------------------------------------------
    
    createAndPlaceCards();
    window.addEventListener('resize', updateCardPositionsOnResize); 


    // --- 4. 인터랙션 로직 ---

    gridContainer.addEventListener('click', (e) => {
        if (totalDragDistance < dragDistanceThreshold) {
            const card = e.target.closest('.card-container');
            if (card) {
                card.classList.toggle('is-flipped');
            }
        }
        totalDragDistance = 0;
    });

    // 마우스 누르는 시점 (드래그 시작/대기)
    gridContainer.addEventListener('mousedown', (e) => {
        const card = e.target.closest('.card-container');
        if (!card) return;

        isMouseDown = true;
        currentDragCard = card;
        startX = e.clientX;
        startY = e.clientY;
        totalDragDistance = 0;
        
        if (dragTimeout) {
            clearTimeout(dragTimeout);
        }

        dragTimeout = setTimeout(() => {
            if (isMouseDown) {
                let currentX, currentY;
                
                // 데이터셋에서 위치를 가져옴 (물리 루프가 없으므로 CSS나 dataset에서 직접 가져옴)
                currentX = parseFloat(card.dataset.currentX);
                currentY = parseFloat(card.dataset.currentY);

                if (!isNaN(currentX) && !isNaN(currentY)) {
                    currentDragCard.dataset.currentX = currentX;
                    currentDragCard.dataset.currentY = currentY;
                } else {
                    console.error("드래그 오류: 위치 좌표가 유효하지 않아 드래그가 시작되지 않습니다.");
                    isMouseDown = false; 
                    currentDragCard = null;
                }
            }
        }, DRAG_DELAY_MS);
    });

    // 마우스 이동 (드래그 실행 및 미세 회전)
    document.addEventListener('mousemove', (e) => {
        const dxMove = e.clientX - lastMouseX;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // 1. 드래그 중인 경우
        if (isMouseDown && currentDragCard) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            totalDragDistance = Math.sqrt(dx * dx + dy * dy);

            if (totalDragDistance > dragDistanceThreshold) {
                const initialXStr = currentDragCard.dataset.currentX;
                const isPositionSaved = initialXStr !== undefined && initialXStr !== 'NaN' && initialXStr !== 'null';

                if (isPositionSaved) {
                    if (dragTimeout) {
                        clearTimeout(dragTimeout); 
                        dragTimeout = null;
                    }
                    
                    isDragging = true; 
                    currentDragCard.classList.add('is-dragging');

                    const initialX = parseFloat(initialXStr);
                    const initialY = parseFloat(currentDragCard.dataset.currentY);
                    
                    const newX = initialX + dx;
                    const newY = initialY + dy;
                    
                    currentDragCard.style.setProperty('--card-x', `${newX}px`);
                    currentDragCard.style.setProperty('--card-y', `${newY}px`);

                    // ❗ 드래그 방향에 따른 Z축 회전 계수를 유지
                    const angleZ = Math.min(Math.max(dxMove * 0.1, -15), 15); 
                    currentDragCard.style.setProperty('--drag-rot-z', `${angleZ}deg`);
                }
            }
        } 
    });

    // 마우스 떼는 시점 (드래그 종료)
    document.addEventListener('mouseup', () => {
        isMouseDown = false;
        
        if (dragTimeout) {
            clearTimeout(dragTimeout); 
            dragTimeout = null;
        }

        if (isDragging && currentDragCard) {
            isDragging = false;
            currentDragCard.classList.remove('is-dragging');
            currentDragCard.style.setProperty('--drag-rot-z', `0deg`); // 회전 제거
            
            maxZIndex++;
            currentDragCard.style.zIndex = maxZIndex;
            currentDragCard.dataset.isDragged = 'true';
            
            // 최종 위치를 다음 드래그 시작점으로 저장
            const finalX = currentDragCard.style.getPropertyValue('--card-x');
            const finalY = currentDragCard.style.getPropertyValue('--card-y');
            
            currentDragCard.dataset.currentX = parseFloat(finalX); 
            currentDragCard.dataset.currentY = parseFloat(finalY); 
            
            currentDragCard = null;
        } else {
            totalDragDistance = 0;
            currentDragCard = null;
        }
    });

    // 이미지 원위치 버튼 기능
    resetButton.addEventListener('click', () => {
        maxZIndex = 10 + NUM_IMAGES;

        calculateInitialPositions();

        document.querySelectorAll('.card-container').forEach((card, index) => {
            const { x, y } = initialPositions[index];
            
            card.style.setProperty('--card-x', `${x}px`);
            card.style.setProperty('--card-y', `${y}px`);
            
            card.style.zIndex = 10 + index; 
            
            // 데이터셋 및 회전 초기화
            card.dataset.currentX = x;
            card.dataset.currentY = y;
            card.dataset.isDragged = 'false';
            card.style.setProperty('--drag-rot-z', `0deg`); 
            card.classList.remove('is-moved'); 
            card.style.setProperty('--mouse-rot-z', `0deg`); 
        });
    });
});
