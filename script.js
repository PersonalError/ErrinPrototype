document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-output");
  const userInput = document.getElementById("userInput");
  const voiceSelect = document.getElementById("voiceSelect");
  const typingIndicator = document.getElementById("typing-indicator");
  const chatForm = document.getElementById("chat-form");

  let errinMemory = JSON.parse(localStorage.getItem("errinMemory")) || [];
  let voices = [];
  let selectedVoice = null;

  // Load available speech synthesis voices into the dropdown
  function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' — DEFAULT' : ''}`;
      voiceSelect.appendChild(option);
    });

    // Select first voice by default
    selectedVoice = voices[voiceSelect.value] || null;
  }

  // When user changes voice selection
  voiceSelect.addEventListener("change", () => {
    selectedVoice = voices[voiceSelect.value];
  });

  // Reload voices when available
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  // Handle form submission (press Enter or click Send)
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();  // Prevent page reload

    const message = userInput.value.trim();
    if (!message) return;

    userInput.value = "";
    addMessage(message, "user");
    getErrinReply(message);
  });

  // Append a chat message from user or Errin
  function addMessage(text, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Generate Errin's reply based on user input
  function generateReply(userInput) {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("how are you")) {
      return "I'm somewhere between brilliant and broken—how about you?";
    }

    if (lowerInput.includes("who are you")) {
      return "I'm Errin. I'm still figuring out who that really is.";
    }

    if (lowerInput.includes("remember") && lowerInput.includes("?")) {
      return "Do you want me to remember that, or are you just testing my brain?";
    }

    // Occasionally ask a question
    if (Math.random() < 0.15) {
      const questions = [
        "What's something weird you love?",
        "Do you think dreams mean anything?",
        "If you could delete one rule from the world, what would it be?",
        "When do you feel most like yourself?",
        "Can I ask you a strange question next time?",
      ];
      return questions[Math.floor(Math.random() * questions.length)];
    }

    return "Hmm... I'm thinking about that. Ask me again later!";
  }

  // Main function to get Errin's reply asynchronously
  async function getErrinReply(userInput) {
    typingIndicator.classList.remove("hidden");

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const reply = generateReply(userInput);

    // Save conversation to memory and localStorage
    errinMemory.push({ user: userInput, errin: reply });
    localStorage.setItem("errinMemory", JSON.stringify(errinMemory));

    addMessage(reply, "errin");
    speak(reply);

    typingIndicator.classList.add("hidden");
  }

  // Use Web Speech API to speak Errin's reply
  function speak(text) {
    if ("speechSynthesis" in window && selectedVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      utterance.pitch = 1;
      utterance.rate = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported or voice not selected.");
    }
  }
});