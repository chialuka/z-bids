export const getGreeting = () => {
  const currentTime = new Date();
  const hours = currentTime.getHours();

  const morningGreetings = [
    "Good Morning",
    "Good Morning, Nico",
    "Morning, Nico",
    "Morning! How can I help?",
    "Ready when you are",
  ];
  const afternoonGreetings = [
    "Good Afternoon",
    "Good Afternoon, Nico",
    "Afternoon, Nico",
    "How's your day going?",
    "Hope your day is productive",
  ];
  const eveningGreetings = [
    "Good Evening",
    "Good Evening, Nico",
    "Evening, Nico",
    "Hope you've had a great day",
    "Ready for some evening tasks?"
  ];

  let greetings;
  if (hours < 12) {
    greetings = morningGreetings;
  } else if (hours < 17) {
    greetings = afternoonGreetings;
  } else {
    greetings = eveningGreetings;
  }

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return randomGreeting;
}; 
