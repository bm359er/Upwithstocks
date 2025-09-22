// Data from uploaded CSVs. This will be the source for your lessons.
const unitData = {
    // Unit 1: Financial Statement Analysis (from your uploaded Unit 2 files)
    'Financial Statement Analysis': [
        'financial-statement-calculation.csv',
        'financial-statement-calculations.csv',
        'balance-sheet.csv',
        'income-statement.csv',
        'cash-flow.csv',
        'cash-flow-real-examples.csv',
        'financial-statements-review.csv',
        'current-and-quick-ratio.csv',
        'liquidity-ratios.csv',
        'debt-ratios.csv',
        'debt-ratio-examples.csv',
        'practicing-the-ratios.csv',
        'ratio-review.csv',
        'market-capitalization.csv',
        'eps-p-e-roe-roa.csv',
        'roe-and-roa.csv',
        'p-e-ratio.csv',
        'ebitda.csv',
        'ebitda-vs-p-e.csv',
        'review.csv'
    ],
    // Unit 2: Investment Principles (from your uploaded Unit 3 files)
    'Investment Principles': [
        'securities-quiz.csv',
        'asset-classes.csv',
        'securities-and-asset-class-revi.csv',
        'time-horizon.csv',
        'risk-tolerance.csv',
        'risk-and-time-review.csv',
        'diversification.csv',
        'market-caps.csv',
        'beta.csv',
        'risk-review.csv',
        'value-investing.csv',
        'value-investing-pragmatic.csv',
        'value-review.csv',
        'compounding-returns.csv',
        'dollar-cost-averaging.csv',
    ]
};

// Application State
let gameState = {
    cash: 10000,
    currentUnit: '',
    currentLesson: '',
    currentQuestionIndex: -1,
    lessonData: [],
    questionsCorrectInARow: 0
};

// DOM Elements
const unitSelectionScreen = document.getElementById('unit-selection');
const lessonSelectionScreen = document.getElementById('lesson-selection');
const lessonContentScreen = document.getElementById('lesson-content');
const unitList = document.getElementById('unit-list');
const lessonUnitTitle = document.getElementById('lesson-unit-title');
const lessonList = document.getElementById('lesson-list');
const lessonTitle = document.getElementById('lesson-title');
const contentDisplay = document.getElementById('content-display');
const answersContainer = document.getElementById('answers-container');
const questionFeedback = document.getElementById('question-feedback');
const submitButton = document.getElementById('submit-button');
const nextButton = document.getElementById('next-button');
const cashBalanceElement = document.getElementById('cash-balance');

// Helper function to update cash balance display
function updateCashBalance() {
    cashBalanceElement.textContent = `$${gameState.cash.toLocaleString()}`;
}

// Function to render the unit selection screen
function renderUnitSelection() {
    unitSelectionScreen.style.display = 'block';
    lessonSelectionScreen.style.display = 'none';
    lessonContentScreen.style.display = 'none';
    unitList.innerHTML = '';
    
    Object.keys(unitData).forEach(unitName => {
        const li = document.createElement('li');
        li.className = 'unit-card';
        li.innerHTML = `<h3>${unitName}</h3>`;
        li.addEventListener('click', () => {
            gameState.currentUnit = unitName;
            renderLessonSelection();
        });
        unitList.appendChild(li);
    });
}

// Function to render the lesson selection screen
function renderLessonSelection() {
    unitSelectionScreen.style.display = 'none';
    lessonSelectionScreen.style.display = 'block';
    lessonContentScreen.style.display = 'none';
    lessonList.innerHTML = '';
    
    lessonUnitTitle.textContent = gameState.currentUnit;

    const lessons = unitData[gameState.currentUnit];
    lessons.forEach(lessonFileName => {
        const lessonName = lessonFileName.replace('.csv', '').replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
        const li = document.createElement('li');
        li.className = 'lesson-card';
        li.innerHTML = `<h3>${lessonName}</h3>`;
        li.addEventListener('click', () => {
            loadLesson(lessonFileName);
        });
        lessonList.appendChild(li);
    });
}

// Function to fetch and load lesson data
async function loadLesson(fileName) {
    const filePath = `Unit 2 -_ Bucket.xlsx - ${fileName}`; // Assuming a specific file structure for now
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load file: ${response.statusText}`);
        }
        const csvText = await response.text();
        Papa.parse(csvText, {
            header: true,
            complete: (results) => {
                gameState.lessonData = results.data.filter(row => row.question);
                gameState.currentQuestionIndex = -1;
                renderNextQuestion();
            }
        });
    } catch (error) {
        console.error('Error loading lesson:', error);
        alert('Failed to load lesson. Please try again.');
        renderUnitSelection(); // Return to start if there's an error
    }
}

// Function to render the next question/note screen
function renderNextQuestion() {
    gameState.currentQuestionIndex++;
    if (gameState.currentQuestionIndex >= gameState.lessonData.length) {
        // Lesson completed!
        completeLesson();
        return;
    }

    const currentItem = gameState.lessonData[gameState.currentQuestionIndex];
    lessonContentScreen.style.display = 'block';
    lessonSelectionScreen.style.display = 'none';
    answersContainer.innerHTML = '';
    questionFeedback.style.display = 'none';
    submitButton.style.display = 'block';
    nextButton.style.display = 'none';

    if (currentItem.notes) {
        // Display a notes slide before the question
        contentDisplay.innerHTML = `
            <div class="notes-content">
                <h3>Notes</h3>
                <p>${currentItem.notes}</p>
            </div>
            <p>Ready for the question?</p>
        `;
        answersContainer.innerHTML = '';
        submitButton.style.display = 'none';
        nextButton.style.display = 'block';
    } else if (currentItem.type === 'video') {
        // Handle video links
        const videoLink = currentItem.question;
        const videoId = new URL(videoLink).searchParams.get('id');
        contentDisplay.innerHTML = `
            <h3>Watch This Video</h3>
            <div class="video-container">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `;
        answersContainer.innerHTML = '';
        submitButton.style.display = 'none';
        nextButton.style.display = 'block';
    } else {
        // Display a question
        contentDisplay.innerHTML = `<p id="question-prompt">${currentItem.question}</p>`;
        
        const type = currentItem.type;
        const answer = currentItem.answer;
        const wrongAnswers = currentItem.wrong.split('|');
        let options = [...wrongAnswers];
        
        // Add the correct answer
        if (type !== 'mm') {
            options.push(answer);
            // Shuffle the options
            options.sort(() => Math.random() - 0.5);
        } else {
            options = [];
        }

        // Render based on question type
        if (type === 'mc' || type === 'tf') {
            options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'answer-button';
                button.textContent = option;
                button.addEventListener('click', () => {
                    document.querySelectorAll('.answer-button').forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                });
                answersContainer.appendChild(button);
            });
        } else if (type === 'mm') {
            // Match-and-Mix challenge
            const terms = answer.split('|').map(pair => pair.split(':'));
            // Implementation for MM challenges would go here, requiring a more complex UI
            // For now, let's simplify to a text prompt to check understanding
            contentDisplay.innerHTML = `
                <p id="question-prompt">${currentItem.question}</p>
                <p>Match the following terms: ${terms.map(t => `${t[0]}`).join(', ')}</p>
                <input type="text" id="mm-answer-input" placeholder="Type your answer here">
            `;
            answersContainer.innerHTML = '';
        }

        // Show submit button
        submitButton.style.display = 'block';
        nextButton.style.display = 'none';
    }
}

// Function to handle answer submission
function checkAnswer() {
    const currentItem = gameState.lessonData[gameState.currentQuestionIndex];
    let isCorrect = false;

    if (currentItem.type === 'mc' || currentItem.type === 'tf') {
        const selectedButton = document.querySelector('.answer-button.selected');
        if (selectedButton) {
            if (selectedButton.textContent === currentItem.answer) {
                isCorrect = true;
            }
        }
    } else if (currentItem.type === 'mm') {
        const input = document.getElementById('mm-answer-input');
        if (input && input.value.trim() === currentItem.answer.trim()) {
            isCorrect = true;
        }
    }
    
    // Provide feedback and update state
    questionFeedback.style.display = 'block';
    if (isCorrect) {
        gameState.questionsCorrectInARow++;
        let feedbackText = "Well done!";
        if (gameState.questionsCorrectInARow >= 10) {
            feedbackText = "You're on a roll! Your stocks are rising!";
        } else if (gameState.questionsCorrectInARow >= 5) {
            feedbackText = "Great job!";
        }
        questionFeedback.className = 'correct';
        questionFeedback.textContent = feedbackText;
    } else {
        gameState.questionsCorrectInARow = 0;
        gameState.cash -= 5000;
        updateCashBalance();
        questionFeedback.className = 'wrong';
        questionFeedback.textContent = "Hmmmm...";
    }

    // After feedback, switch to "Next" button
    submitButton.style.display = 'none';
    nextButton.style.display = 'block';
}

// Function to handle lesson completion
function completeLesson() {
    gameState.cash += 5000;
    updateCashBalance();
    contentDisplay.innerHTML = `
        <h3>Lesson Completed!</h3>
        <p>You've successfully completed this lesson and earned $5,000.</p>
        <p>Your new cash balance is **$${gameState.cash.toLocaleString()}**.</p>
        <button onclick="renderUnitSelection()">Return to Units</button>
    `;
    answersContainer.innerHTML = '';
    submitButton.style.display = 'none';
    nextButton.style.display = 'none';
}

// Add event listeners
submitButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', renderNextQuestion);

// Initial rendering of the home screen
window.onload = () => {
    updateCashBalance();
    renderUnitSelection();
};