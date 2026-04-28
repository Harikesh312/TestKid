// Reading passages and follow-up questions for each grade

export const grade1Reading = {
  passage: "The cat sat on the mat. It was a big red mat.",
  followUpQuestions: [
    {
      id: 1,
      prompt: "Where did the cat sit?",
      options: ["Bed", "Mat", "Chair"],
      answer: "Mat",
    },
    {
      id: 2,
      prompt: "What color was the mat?",
      options: ["Blue", "Green", "Red"],
      answer: "Red",
    },
  ],
};

export const grade2Reading = {
  passage:
    "Ravi went to the park with his dog. They played with a ball near the big tree. After some time, it started to rain. Ravi and his dog ran back home quickly.",
  followUpQuestions: [
    {
      id: 1,
      prompt: "Where did Ravi go?",
      options: ["School", "Park", "Market"],
      answer: "Park",
    },
    {
      id: 2,
      prompt: "What happened after some time?",
      options: ["Rain", "Snow", "Wind"],
      answer: "Rain",
    },
  ],
};
