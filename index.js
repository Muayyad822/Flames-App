document.addEventListener('DOMContentLoaded', () => {
    // Get DOM Elements
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const visualizationDiv = document.getElementById('visualization');
    const visName1Span = document.getElementById('visName1');
    const visName2Span = document.getElementById('visName2');
    const remainingCountSpan = document.getElementById('remainingCount');
    const resultDiv = document.getElementById('result');
    const resultTextHeading = document.getElementById('resultText');
    const resultAdvicePara = document.getElementById('resultAdvice');
    const errorMsgPara = document.getElementById('errorMsg');
    const appContainer = document.getElementById('app-container');

    // --- Event Listeners ---
    calculateBtn.addEventListener('click', handleCalculation);
    resetBtn.addEventListener('click', handleReset);
    // Allow pressing Enter in input fields to trigger calculation
    name1Input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleCalculation(); });
    name2Input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleCalculation(); });

    // --- Functions ---

    function handleCalculation() {
        clearError();
        hideResults(); // Hide previous results immediately

        let name1 = name1Input.value.trim().toLowerCase();
        let name2 = name2Input.value.trim().toLowerCase();

        // Basic Validation
        if (!name1 || !name2) {
            showError("Please enter both names!");
            return;
        }
        if (!/^[a-z\s]+$/.test(name1) || !/^[a-z\s]+$/.test(name2)) {
             showError("Please use only letters and spaces in names.");
             return;
        }

        // --- Core FLAMES Logic ---

        // 1. Prepare names (remove spaces)
        const name1Clean = name1.replace(/\s+/g, '');
        const name2Clean = name2.replace(/\s+/g, '');

        let name1Arr = name1Clean.split('');
        let name2Arr = name2Clean.split('');
        const originalName1Arr = name1.split(''); // Keep spaces for display
        const originalName2Arr = name2.split(''); // Keep spaces for display

        const commonLetters = new Set(); // To track letters to strike through

        // 2. Cancel common letters (modify copies for counting)
        let tempName1Arr = [...name1Arr];
        let tempName2Arr = [...name2Arr];

        for (let i = 0; i < tempName1Arr.length; i++) {
            const letter1 = tempName1Arr[i];
            const indexInName2 = tempName2Arr.indexOf(letter1);

            if (indexInName2 !== -1) {
                commonLetters.add(letter1); // Record the common letter
                tempName1Arr.splice(i, 1); // Remove from temp name 1
                tempName2Arr.splice(indexInName2, 1); // Remove from temp name 2
                i--; // Adjust index because array length changed
            }
        }

        // 3. Count remaining letters
        const remainingCount = tempName1Arr.length + tempName2Arr.length;

        // --- Visualization ---
        displayCancellation(originalName1Arr, originalName2Arr, commonLetters, remainingCount);
        showVisualization();

        // 4. Handle Zero Count Edge Case
        if (remainingCount === 0) {
            showResult('N', 'No Compatibility Score', "Hmm, identical names or all letters cancelled out! Maybe try nicknames or full names?");
            showResetButton();
            return;
        }


        // 5. FLAMES Calculation
        let flames = ['F', 'L', 'A', 'M', 'E', 'S'];
        let currentIndex = 0;

        while (flames.length > 1) {
            // Calculate the index to remove: (current index + count - 1) % current length
            const removeIndex = (currentIndex + remainingCount - 1) % flames.length;
            flames.splice(removeIndex, 1); // Remove the letter

            // Set the starting point for the next count
            currentIndex = removeIndex % flames.length;
            // Handle edge case if the last element was removed
             if (currentIndex >= flames.length) {
                currentIndex = 0;
            }
        }

        const resultLetter = flames[0];

        // 6. Get Result Text and Advice
        const { text, advice } = getResultDetails(resultLetter);

        // --- Display Results ---
        showResult(resultLetter, text, advice);
        showResetButton();
    }

    function getResultDetails(letter) {
        switch (letter) {
            case 'F': return { text: "F - Friends", advice: "A solid foundation! You share a friendly bond. Great relationships often start here, cherish the connection!" };
            case 'L': return { text: "L - Love", advice: "Sparks are flying! Looks like genuine love is in the air. Nurture this special connection with care and affection." };
            case 'A': return { text: "A - Affectionate", advice: "Sweet vibes! There's a definite fondness and warmth between you. Keep building on that affection." };
            case 'M': return { text: "M - Marriage", advice: "Wedding bells? This suggests a strong, potentially lifelong connection. Looks like you might be heading down the aisle!" };
            case 'E': return { text: "E - Enemies", advice: "Uh oh! Looks like there might be some friction. Remember, this is just a game! Maybe focus on communication?" };
            case 'S': return { text: "S - Siblings", advice: "A sibling-like bond! You might annoy each other sometimes, but there's an underlying connection. More platonic than romantic." };
            default: return { text: "Error", advice: "Something went wrong in the calculation." };
        }
    }

    function displayCancellation(name1Arr, name2Arr, commonLettersSet, count) {
        // Function to create span with cancellation style if needed
        const createVisualSpan = (char) => {
             // Ignore spaces for cancellation check, but keep them for display
             const lowerChar = char.toLowerCase();
            if (char === ' ') {
                return `<span>&nbsp;</span>`; // Keep space visually
            } else if (commonLettersSet.has(lowerChar)) {
                return `<span class="cancelled">${char}</span>`;
            } else {
                return `<span>${char}</span>`;
            }
        };

        visName1Span.innerHTML = name1Arr.map(createVisualSpan).join('');
        visName2Span.innerHTML = name2Arr.map(createVisualSpan).join('');
        remainingCountSpan.textContent = count;
    }

    function showVisualization() {
        visualizationDiv.classList.remove('hidden');
        // Trigger reflow to allow transition
        void visualizationDiv.offsetWidth;
        visualizationDiv.classList.remove('opacity-0');
    }

    function showResult(letter, text, advice) {
        resultTextHeading.textContent = text;
        resultAdvicePara.textContent = advice;
        resultDiv.classList.remove('hidden');
        // Trigger reflow
        void resultDiv.offsetWidth;
        resultDiv.classList.remove('opacity-0');
         // Optional: Add a little pulse animation
        resultDiv.classList.add('animate-pulse');
        setTimeout(() => resultDiv.classList.remove('animate-pulse'), 2000); // Remove pulse after a bit
    }

    function showResetButton() {
        resetBtn.classList.remove('hidden');
         // Trigger reflow
        void resetBtn.offsetWidth;
        resetBtn.classList.remove('opacity-0');
    }


    function hideResults() {
        visualizationDiv.classList.add('opacity-0');
        resultDiv.classList.add('opacity-0');
        resetBtn.classList.add('opacity-0');

        // Use setTimeout to hide after transition ends
        setTimeout(() => {
             if (visualizationDiv.classList.contains('opacity-0')) { // Check if still meant to be hidden
                visualizationDiv.classList.add('hidden');
            }
            if (resultDiv.classList.contains('opacity-0')) {
                resultDiv.classList.add('hidden');
            }
             if (resetBtn.classList.contains('opacity-0')) {
                resetBtn.classList.add('hidden');
            }
        }, 1000); // Match transition duration
    }

    function showError(message) {
        errorMsgPara.textContent = message;
        appContainer.classList.add('animate-shake'); // Add a shake animation (define in CSS or use Tailwind's)
        setTimeout(() => {
            appContainer.classList.remove('animate-shake');
        }, 500);
    }

    function clearError() {
        errorMsgPara.textContent = '';
    }

     function handleReset() {
        name1Input.value = '';
        name2Input.value = '';
        clearError();
        hideResults();
        // Optionally reset focus to the first input
        name1Input.focus();
    }

    // Optional: Add a simple shake animation if not using a Tailwind plugin for it
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes shake {
          10%, 90% { transform: translateX(-1px) scale(1.0); }
          20%, 80% { transform: translateX(2px) scale(1.0); }
          30%, 50%, 70% { transform: translateX(-4px) scale(1.0); }
          40%, 60% { transform: translateX(4px) scale(1.0); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    `;
    document.head.appendChild(styleSheet);

}); // End DOMContentLoaded