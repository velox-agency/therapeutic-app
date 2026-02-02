/**
 * M-CHAT-R Questions
 * 20 questions for autism screening in toddlers (16-30 months)
 */

export interface MChatQuestion {
  number: number;
  question: string;
  examples?: string[];
  // True means "Yes" is the at-risk answer, false means "No" is at-risk
  yesIsAtRisk: boolean;
}

// Critical items that indicate higher risk
export const CRITICAL_ITEM_NUMBERS = [2, 5, 12, 14, 17, 18, 20];

export const MCHAT_QUESTIONS: MChatQuestion[] = [
  {
    number: 1,
    question: "If you point at something across the room, does your child look at it?",
    examples: ["If you point at a toy or an animal, does your child look at the toy or animal?"],
    yesIsAtRisk: false,
  },
  {
    number: 2,
    question: "Have you ever wondered if your child might be deaf?",
    yesIsAtRisk: true,
  },
  {
    number: 3,
    question: "Does your child play pretend or make-believe?",
    examples: ["Pretend to drink from an empty cup", "Pretend to talk on a phone", "Pretend to feed a doll or stuffed animal"],
    yesIsAtRisk: false,
  },
  {
    number: 4,
    question: "Does your child like climbing on things?",
    examples: ["Furniture", "Playground equipment", "Stairs"],
    yesIsAtRisk: false,
  },
  {
    number: 5,
    question: "Does your child make unusual finger movements near his or her eyes?",
    examples: ["Wiggling fingers close to eyes"],
    yesIsAtRisk: true,
  },
  {
    number: 6,
    question: "Does your child point with one finger to ask for something or to get help?",
    examples: ["Pointing to a snack or toy out of reach"],
    yesIsAtRisk: false,
  },
  {
    number: 7,
    question: "Does your child point with one finger to show you something interesting?",
    examples: ["Pointing at an airplane in the sky or a big truck in the road"],
    yesIsAtRisk: false,
  },
  {
    number: 8,
    question: "Is your child interested in other children?",
    examples: ["Does your child watch other children?", "Smile at them?", "Go to them?"],
    yesIsAtRisk: false,
  },
  {
    number: 9,
    question: "Does your child show you things by bringing them to you or holding them up for you to see?",
    examples: ["Not to get help, but just to share"],
    yesIsAtRisk: false,
  },
  {
    number: 10,
    question: "Does your child respond when you call his or her name?",
    examples: ["Does he or she look up, talk or babble, or stop what he or she is doing?"],
    yesIsAtRisk: false,
  },
  {
    number: 11,
    question: "When you smile at your child, does he or she smile back at you?",
    yesIsAtRisk: false,
  },
  {
    number: 12,
    question: "Does your child get upset by everyday noises?",
    examples: ["Vacuum cleaner", "Blender", "Loud music"],
    yesIsAtRisk: true,
  },
  {
    number: 13,
    question: "Does your child walk?",
    yesIsAtRisk: false,
  },
  {
    number: 14,
    question: "Does your child look you in the eye when you are talking to him or her, playing with him or her, or dressing him or her?",
    yesIsAtRisk: false,
  },
  {
    number: 15,
    question: "Does your child try to copy what you do?",
    examples: ["Wave bye-bye", "Clap", "Make a funny noise when you make one"],
    yesIsAtRisk: false,
  },
  {
    number: 16,
    question: "If you turn your head to look at something, does your child look around to see what you are looking at?",
    yesIsAtRisk: false,
  },
  {
    number: 17,
    question: "Does your child try to get you to watch him or her?",
    examples: ["Does your child look at you for praise, or say 'look' or 'watch me'?"],
    yesIsAtRisk: false,
  },
  {
    number: 18,
    question: "Does your child understand when you tell him or her to do something?",
    examples: ["If you don't point, can your child understand 'put the book on the chair' or 'bring me the blanket'?"],
    yesIsAtRisk: false,
  },
  {
    number: 19,
    question: "If something new happens, does your child look at your face to see how you feel about it?",
    examples: ["If he or she hears a strange or funny noise", "Sees a new toy"],
    yesIsAtRisk: false,
  },
  {
    number: 20,
    question: "Does your child like movement activities?",
    examples: ["Being swung", "Being bounced on your knee"],
    yesIsAtRisk: false,
  },
];

/**
 * Get a question by its number
 */
export const getQuestionByNumber = (number: number): MChatQuestion | undefined => {
  return MCHAT_QUESTIONS.find(q => q.number === number);
};

/**
 * Get critical items (items 2, 5, 12, 14, 17, 18, 20)
 */
export const getCriticalQuestions = (): MChatQuestion[] => {
  return MCHAT_QUESTIONS.filter(q => CRITICAL_ITEM_NUMBERS.includes(q.number));
};
