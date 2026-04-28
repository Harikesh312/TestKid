// Writing prompts and follow-up questions for each grade

export const grade1Writing = {
  prompt: "Copy these 2 lines exactly:",
  hint: "A little bird flew into the garden. It sang a sweet song.",
  lineCount: 2,
  followUpQuestions: [
    {
      id: 1,
      prompt: "What flew into the garden?",
      options: ["Bee", "Bird", "Butterfly"],
      answer: "Bird",
    },
    {
      id: 2,
      prompt: "What did the bird do?",
      options: ["Rest", "Eat", "Sing"],
      answer: "Sing",
    },
  ],
};

export const grade2Writing = {
  prompt: "Copy these 4 lines exactly:",
  hint: "A bright yellow school bus stopped at the corner. Three children quickly climbed aboard, excited for the field trip. They were going to the natural history museum. They wanted to see the dinosaur fossils.",
  lineCount: 4,
  followUpQuestions: [
    {
      id: 1,
      prompt: "Where was the school bus going?",
      options: ["Zoo", "Museum", "Park"],
      answer: "Museum",
    },
    {
      id: 2,
      prompt: "What did the children want to see?",
      options: ["Fossils", "Animals", "Paintings"],
      answer: "Fossils",
    },
  ],
};
