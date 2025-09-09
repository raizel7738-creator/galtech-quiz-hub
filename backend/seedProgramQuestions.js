const mongoose = require('mongoose');
const Question = require('./models/Question');
const Category = require('./models/Category');
const User = require('./models/User');

// Sample program-based questions data
const programQuestions = [
  {
    question: "What will be the output of the following JavaScript code?",
    type: "program",
    difficulty: "medium",
    points: 3,
    programQuestion: {
      codeSnippet: `function mystery(x) {
  if (x <= 1) return 1;
  return x * mystery(x - 1);
}

console.log(mystery(4));`,
      language: "javascript",
      expectedOutput: "24",
      testCases: [
        {
          input: "mystery(4)",
          expectedOutput: "24",
          description: "Factorial of 4"
        },
        {
          input: "mystery(0)",
          expectedOutput: "1",
          description: "Base case"
        }
      ],
      analysisType: "output",
      hints: [
        "This is a recursive function",
        "Think about what mathematical operation this represents",
        "Consider the base case when x <= 1"
      ]
    },
    options: [
      { text: "24", isCorrect: true },
      { text: "12", isCorrect: false },
      { text: "16", isCorrect: false },
      { text: "Error", isCorrect: false }
    ],
    correctAnswer: "24",
    explanation: "This is a recursive factorial function. mystery(4) = 4 * mystery(3) = 4 * 3 * mystery(2) = 4 * 3 * 2 * mystery(1) = 4 * 3 * 2 * 1 = 24",
    tags: ["javascript", "recursion", "factorial", "functions"],
    status: "active"
  },
  {
    question: "What will be the output of this Python code?",
    type: "program",
    difficulty: "hard",
    points: 4,
    programQuestion: {
      codeSnippet: `def process_list(lst):
    result = []
    for i in range(len(lst)):
        if i % 2 == 0:
            result.append(lst[i] * 2)
        else:
            result.append(lst[i] + 1)
    return result

numbers = [1, 2, 3, 4, 5]
print(process_list(numbers))`,
      language: "python",
      expectedOutput: "[2, 3, 6, 5, 10]",
      testCases: [
        {
          input: "[1, 2, 3, 4, 5]",
          expectedOutput: "[2, 3, 6, 5, 10]",
          description: "Even indices doubled, odd indices incremented"
        },
        {
          input: "[10, 20]",
          expectedOutput: "[20, 21]",
          description: "Two elements"
        }
      ],
      analysisType: "output",
      hints: [
        "Look at the index conditions",
        "Even indices (0, 2, 4) are multiplied by 2",
        "Odd indices (1, 3) are incremented by 1"
      ]
    },
    options: [
      { text: "[2, 3, 6, 5, 10]", isCorrect: true },
      { text: "[1, 3, 3, 5, 5]", isCorrect: false },
      { text: "[2, 2, 6, 4, 10]", isCorrect: false },
      { text: "[3, 3, 7, 5, 11]", isCorrect: false }
    ],
    correctAnswer: "[2, 3, 6, 5, 10]",
    explanation: "For even indices (0, 2, 4): 1*2=2, 3*2=6, 5*2=10. For odd indices (1, 3): 2+1=3, 4+1=5",
    tags: ["python", "loops", "list-processing", "indexing"],
    status: "active"
  },
  {
    question: "What will be the output of this Java code?",
    type: "program",
    difficulty: "medium",
    points: 3,
    programQuestion: {
      codeSnippet: `public class Test {
    public static void main(String[] args) {
        int x = 5;
        int y = 10;
        
        if (x > y) {
            System.out.println("x is greater");
        } else if (x < y) {
            System.out.println("y is greater");
        } else {
            System.out.println("x and y are equal");
        }
        
        System.out.println("x = " + x + ", y = " + y);
    }
}`,
      language: "java",
      expectedOutput: "y is greater\nx = 5, y = 10",
      testCases: [
        {
          input: "x=5, y=10",
          expectedOutput: "y is greater\nx = 5, y = 10",
          description: "y is greater than x"
        }
      ],
      analysisType: "output",
      hints: [
        "Compare the values of x and y",
        "Follow the if-else logic",
        "Both print statements will execute"
      ]
    },
    options: [
      { text: "y is greater\nx = 5, y = 10", isCorrect: true },
      { text: "x is greater\nx = 5, y = 10", isCorrect: false },
      { text: "x and y are equal\nx = 5, y = 10", isCorrect: false },
      { text: "y is greater", isCorrect: false }
    ],
    correctAnswer: "y is greater\nx = 5, y = 10",
    explanation: "Since x=5 and y=10, the condition x < y is true, so 'y is greater' is printed. Then the second print statement executes.",
    tags: ["java", "conditionals", "comparison", "output"],
    status: "active"
  },
  {
    question: "What will be the output of this C++ code?",
    type: "program",
    difficulty: "hard",
    points: 4,
    programQuestion: {
      codeSnippet: `#include <iostream>
using namespace std;

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int *ptr = arr;
    
    cout << *ptr << " ";
    cout << *(ptr + 2) << " ";
    cout << ptr[4] << " ";
    
    ptr++;
    cout << *ptr << endl;
    
    return 0;
}`,
      language: "cpp",
      expectedOutput: "1 3 5 2",
      testCases: [
        {
          input: "arr = {1, 2, 3, 4, 5}",
          expectedOutput: "1 3 5 2",
          description: "Pointer arithmetic with array"
        }
      ],
      analysisType: "output",
      hints: [
        "ptr initially points to arr[0]",
        "*(ptr + 2) means arr[2]",
        "ptr[4] is the same as arr[4]",
        "ptr++ moves the pointer to the next element"
      ]
    },
    options: [
      { text: "1 3 5 2", isCorrect: true },
      { text: "1 2 3 4", isCorrect: false },
      { text: "2 4 5 3", isCorrect: false },
      { text: "1 3 4 2", isCorrect: false }
    ],
    correctAnswer: "1 3 5 2",
    explanation: "*ptr = arr[0] = 1, *(ptr+2) = arr[2] = 3, ptr[4] = arr[4] = 5, then ptr++ makes ptr point to arr[1] = 2",
    tags: ["cpp", "pointers", "arrays", "pointer-arithmetic"],
    status: "active"
  },
  {
    question: "What will be the output of this JavaScript code?",
    type: "program",
    difficulty: "medium",
    points: 3,
    programQuestion: {
      codeSnippet: `const numbers = [1, 2, 3, 4, 5];
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2)
  .reduce((sum, n) => sum + n, 0);

console.log(result);`,
      language: "javascript",
      expectedOutput: "12",
      testCases: [
        {
          input: "[1, 2, 3, 4, 5]",
          expectedOutput: "12",
          description: "Filter even numbers, double them, sum them"
        }
      ],
      analysisType: "output",
      hints: [
        "First filter even numbers: [2, 4]",
        "Then map to double them: [4, 8]",
        "Finally reduce to sum: 4 + 8 = 12"
      ]
    },
    options: [
      { text: "12", isCorrect: true },
      { text: "6", isCorrect: false },
      { text: "15", isCorrect: false },
      { text: "30", isCorrect: false }
    ],
    correctAnswer: "12",
    explanation: "Filter even numbers [2, 4] → map to double [4, 8] → reduce to sum 4 + 8 = 12",
    tags: ["javascript", "array-methods", "filter", "map", "reduce"],
    status: "active"
  },
  {
    question: "What will be the output of this Python code?",
    type: "program",
    difficulty: "hard",
    points: 4,
    programQuestion: {
      codeSnippet: `class Counter:
    def __init__(self):
        self.count = 0
    
    def increment(self):
        self.count += 1
        return self.count
    
    def reset(self):
        self.count = 0

c1 = Counter()
c2 = Counter()

print(c1.increment())
print(c1.increment())
print(c2.increment())
print(c1.increment())`,
      language: "python",
      expectedOutput: "1\n2\n1\n3",
      testCases: [
        {
          input: "Two Counter instances",
          expectedOutput: "1\n2\n1\n3",
          description: "Each instance maintains its own count"
        }
      ],
      analysisType: "output",
      hints: [
        "Each Counter instance has its own count variable",
        "c1 and c2 are separate objects",
        "Track the count for each instance separately"
      ]
    },
    options: [
      { text: "1\n2\n1\n3", isCorrect: true },
      { text: "1\n2\n3\n4", isCorrect: false },
      { text: "1\n1\n1\n1", isCorrect: false },
      { text: "0\n1\n0\n2", isCorrect: false }
    ],
    correctAnswer: "1\n2\n1\n3",
    explanation: "c1.increment() → 1, c1.increment() → 2, c2.increment() → 1 (separate instance), c1.increment() → 3",
    tags: ["python", "classes", "objects", "instance-variables"],
    status: "active"
  }
];

const seedProgramQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/galtech-quiz-hub');
    console.log('✅ Connected to MongoDB');

    // Get the Program-Based Questions category
    const programCategory = await Category.findOne({ name: 'Program-Based Questions' });
    const adminUser = await User.findOne({ role: 'admin' });

    if (!programCategory) {
      console.log('❌ Program-Based Questions category not found. Please run the category seed script first.');
      return;
    }

    if (!adminUser) {
      console.log('❌ No admin user found. Please run the user seed script first.');
      return;
    }

    // Clear existing program-based questions
    await Question.deleteMany({ 
      type: 'program',
      category: programCategory._id 
    });
    console.log('🗑️  Cleared existing program-based questions');

    // Create program-based questions
    const questionsToCreate = programQuestions.map(questionData => ({
      ...questionData,
      category: programCategory._id,
      createdBy: adminUser._id
    }));

    const createdQuestions = await Question.insertMany(questionsToCreate);
    console.log(`✅ Created ${createdQuestions.length} program-based questions`);

    // Update category question count
    const questionCount = await Question.countDocuments({ 
      category: programCategory._id, 
      status: 'active' 
    });
    await Category.findByIdAndUpdate(programCategory._id, { questionCount });

    console.log('✅ Updated Program-Based Questions category count');

    // Display summary
    console.log('\n📊 Program-Based Questions Summary:');
    console.log(`   Total questions: ${createdQuestions.length}`);
    console.log(`   Easy: ${createdQuestions.filter(q => q.difficulty === 'easy').length}`);
    console.log(`   Medium: ${createdQuestions.filter(q => q.difficulty === 'medium').length}`);
    console.log(`   Hard: ${createdQuestions.filter(q => q.difficulty === 'hard').length}`);

    console.log('\n🎉 Program-based questions seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding program-based questions:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProgramQuestions();

