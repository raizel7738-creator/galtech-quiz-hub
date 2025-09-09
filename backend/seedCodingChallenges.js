const mongoose = require('mongoose');
const CodingChallenge = require('./models/CodingChallenge');
const Category = require('./models/Category');
const User = require('./models/User');

// Sample coding challenges data
const codingChallenges = [
  {
    title: "FizzBuzz Challenge",
    description: "Write a program that prints numbers from 1 to 100, but for multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'.",
    problemStatement: `Write a function that implements the classic FizzBuzz problem:

**Requirements:**
- Print numbers from 1 to 100
- For multiples of 3, print "Fizz" instead of the number
- For multiples of 5, print "Buzz" instead of the number
- For multiples of both 3 and 5, print "FizzBuzz" instead of the number
- For all other numbers, print the number itself

**Example Output:**
1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz, 16, 17, Fizz, 19, Buzz, ...`,
    difficulty: "beginner",
    language: "javascript",
    timeLimit: 30,
    examples: [
      {
        input: "fizzBuzz(15)",
        expectedOutput: "1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz",
        explanation: "First 15 numbers with FizzBuzz rules applied"
      }
    ],
    constraints: [
      "Use a loop to iterate from 1 to 100",
      "Use modulo operator (%) to check for multiples",
      "Handle the case where a number is multiple of both 3 and 5 first"
    ],
    hints: [
      "Start with a simple for loop from 1 to 100",
      "Use if-else statements to check conditions",
      "Check for multiples of 15 (3*5) first, then 3, then 5"
    ],
    expectedApproach: "Use a for loop with conditional statements. Check for multiples of 15 first (FizzBuzz), then 3 (Fizz), then 5 (Buzz), otherwise print the number.",
    sampleSolution: `function fizzBuzz() {
  for (let i = 1; i <= 100; i++) {
    if (i % 15 === 0) {
      console.log('FizzBuzz');
    } else if (i % 3 === 0) {
      console.log('Fizz');
    } else if (i % 5 === 0) {
      console.log('Buzz');
    } else {
      console.log(i);
    }
  }
}`,
    points: 10,
    tags: ["loops", "conditionals", "modulo", "beginner"],
    status: "active"
  },
  {
    title: "Palindrome Checker",
    description: "Create a function that checks if a given string is a palindrome (reads the same forwards and backwards).",
    problemStatement: `Write a function that determines whether a given string is a palindrome.

**Requirements:**
- The function should return true if the string is a palindrome, false otherwise
- Ignore case sensitivity (e.g., "Racecar" should be considered a palindrome)
- Ignore spaces and punctuation (e.g., "A man a plan a canal Panama" should be considered a palindrome)
- Handle empty strings and single characters appropriately

**Examples:**
- "racecar" → true
- "hello" → false
- "A man a plan a canal Panama" → true
- "race a car" → false`,
    difficulty: "intermediate",
    language: "javascript",
    timeLimit: 45,
    examples: [
      {
        input: "isPalindrome('racecar')",
        expectedOutput: "true",
        explanation: "racecar reads the same forwards and backwards"
      },
      {
        input: "isPalindrome('hello')",
        expectedOutput: "false",
        explanation: "hello does not read the same backwards (olleh)"
      },
      {
        input: "isPalindrome('A man a plan a canal Panama')",
        expectedOutput: "true",
        explanation: "When ignoring spaces and case, this is a palindrome"
      }
    ],
    constraints: [
      "Function should handle case-insensitive comparison",
      "Remove all non-alphanumeric characters before checking",
      "Return boolean value (true/false)"
    ],
    hints: [
      "Convert string to lowercase for case-insensitive comparison",
      "Remove spaces and punctuation using regular expressions",
      "Compare the cleaned string with its reverse"
    ],
    expectedApproach: "Clean the string by removing non-alphanumeric characters and converting to lowercase, then compare with its reverse.",
    sampleSolution: `function isPalindrome(str) {
  // Remove non-alphanumeric characters and convert to lowercase
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Compare with its reverse
  return cleaned === cleaned.split('').reverse().join('');
}`,
    points: 15,
    tags: ["strings", "regex", "algorithms", "intermediate"],
    status: "active"
  },
  {
    title: "Two Sum Problem",
    description: "Given an array of integers and a target sum, find two numbers that add up to the target and return their indices.",
    problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

**Requirements:**
- You may assume that each input would have exactly one solution
- You may not use the same element twice
- You can return the answer in any order
- If no solution exists, return an empty array

**Examples:**
- Input: nums = [2,7,11,15], target = 9
- Output: [0,1] (because nums[0] + nums[1] = 2 + 7 = 9)

- Input: nums = [3,2,4], target = 6
- Output: [1,2] (because nums[1] + nums[2] = 2 + 4 = 6)`,
    difficulty: "intermediate",
    language: "javascript",
    timeLimit: 60,
    examples: [
      {
        input: "twoSum([2,7,11,15], 9)",
        expectedOutput: "[0,1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9"
      },
      {
        input: "twoSum([3,2,4], 6)",
        expectedOutput: "[1,2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6"
      },
      {
        input: "twoSum([3,3], 6)",
        expectedOutput: "[0,1]",
        explanation: "nums[0] + nums[1] = 3 + 3 = 6"
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ],
    hints: [
      "Use a hash map to store numbers and their indices",
      "For each number, check if target - number exists in the map",
      "This approach has O(n) time complexity"
    ],
    expectedApproach: "Use a hash map to store each number and its index. For each number, check if the complement (target - number) exists in the map.",
    sampleSolution: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`,
    points: 20,
    tags: ["arrays", "hash-map", "algorithms", "leetcode"],
    status: "active"
  },
  {
    title: "Binary Search Implementation",
    description: "Implement the binary search algorithm to find a target value in a sorted array.",
    problemStatement: `Write a function that implements binary search to find a target value in a sorted array.

**Requirements:**
- The input array is sorted in ascending order
- Return the index of the target if found, -1 if not found
- Use the binary search algorithm (divide and conquer)
- Time complexity should be O(log n)

**Examples:**
- Input: nums = [-1,0,3,5,9,12], target = 9
- Output: 4 (index of 9 in the array)

- Input: nums = [-1,0,3,5,9,12], target = 2
- Output: -1 (2 is not in the array)`,
    difficulty: "intermediate",
    language: "javascript",
    timeLimit: 45,
    examples: [
      {
        input: "binarySearch([-1,0,3,5,9,12], 9)",
        expectedOutput: "4",
        explanation: "9 is found at index 4"
      },
      {
        input: "binarySearch([-1,0,3,5,9,12], 2)",
        expectedOutput: "-1",
        explanation: "2 is not found in the array"
      }
    ],
    constraints: [
      "Array is sorted in ascending order",
      "All elements in the array are unique",
      "1 <= nums.length <= 10^4",
      "-10^4 <= nums[i] <= 10^4"
    ],
    hints: [
      "Use two pointers: left and right",
      "Calculate middle index: (left + right) / 2",
      "Compare target with middle element and adjust search range"
    ],
    expectedApproach: "Use two pointers to define the search range. Calculate the middle index and compare with target. Adjust the search range based on the comparison.",
    sampleSolution: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`,
    points: 18,
    tags: ["algorithms", "binary-search", "divide-conquer", "searching"],
    status: "active"
  },
  {
    title: "Reverse Linked List",
    description: "Implement a function to reverse a singly linked list.",
    problemStatement: `Given the head of a singly linked list, reverse the list and return the reversed list.

**Requirements:**
- Reverse the linked list in-place (O(1) extra space)
- Return the new head of the reversed list
- Handle edge cases: empty list, single node

**Example:**
- Input: 1 -> 2 -> 3 -> 4 -> 5 -> NULL
- Output: 5 -> 4 -> 3 -> 2 -> 1 -> NULL`,
    difficulty: "advanced",
    language: "javascript",
    timeLimit: 60,
    examples: [
      {
        input: "reverseList([1,2,3,4,5])",
        expectedOutput: "[5,4,3,2,1]",
        explanation: "The linked list is reversed"
      },
      {
        input: "reverseList([1,2])",
        expectedOutput: "[2,1]",
        explanation: "Two nodes are swapped"
      }
    ],
    constraints: [
      "The number of nodes in the list is in the range [0, 5000]",
      "-5000 <= Node.val <= 5000",
      "Use O(1) extra space"
    ],
    hints: [
      "Use three pointers: prev, current, and next",
      "Iterate through the list and reverse the links",
      "Update pointers as you traverse"
    ],
    expectedApproach: "Use iterative approach with three pointers to reverse the links between nodes while traversing the list.",
    sampleSolution: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current !== null) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}`,
    points: 25,
    tags: ["linked-list", "data-structures", "algorithms", "advanced"],
    status: "active"
  },
  {
    title: "Valid Parentheses",
    description: "Given a string containing just parentheses, brackets, and braces, determine if the input string is valid.",
    problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

**Requirements:**
- Open brackets must be closed by the same type of brackets
- Open brackets must be closed in the correct order
- Every close bracket has a corresponding open bracket of the same type

**Examples:**
- Input: "()" → Output: true
- Input: "()[]{}" → Output: true
- Input: "(]" → Output: false
- Input: "([)]" → Output: false`,
    difficulty: "intermediate",
    language: "javascript",
    timeLimit: 45,
    examples: [
      {
        input: 'isValid("()")',
        expectedOutput: "true",
        explanation: "Simple valid parentheses"
      },
      {
        input: 'isValid("()[]{}")',
        expectedOutput: "true",
        explanation: "Multiple types of valid brackets"
      },
      {
        input: 'isValid("([)]")',
        expectedOutput: "false",
        explanation: "Brackets are not closed in correct order"
      }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'"
    ],
    hints: [
      "Use a stack data structure",
      "Push opening brackets onto the stack",
      "Pop from stack when encountering closing brackets"
    ],
    expectedApproach: "Use a stack to keep track of opening brackets. When encountering a closing bracket, check if it matches the most recent opening bracket.",
    sampleSolution: `function isValid(s) {
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let char of s) {
    if (char in map) {
      if (stack.length === 0 || stack.pop() !== map[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`,
    points: 16,
    tags: ["stack", "data-structures", "algorithms", "validation"],
    status: "active"
  }
];

const seedCodingChallenges = async () => {
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

    // Clear existing coding challenges
    await CodingChallenge.deleteMany({});
    console.log('🗑️  Cleared existing coding challenges');

    // Create coding challenges
    const challengesToCreate = codingChallenges.map(challengeData => ({
      ...challengeData,
      category: programCategory._id,
      createdBy: adminUser._id
    }));

    const createdChallenges = await CodingChallenge.insertMany(challengesToCreate);
    console.log(`✅ Created ${createdChallenges.length} coding challenges`);

    // Display summary
    console.log('\n📊 Coding Challenges Summary:');
    console.log(`   Total challenges: ${createdChallenges.length}`);
    console.log(`   Beginner: ${createdChallenges.filter(c => c.difficulty === 'beginner').length}`);
    console.log(`   Intermediate: ${createdChallenges.filter(c => c.difficulty === 'intermediate').length}`);
    console.log(`   Advanced: ${createdChallenges.filter(c => c.difficulty === 'advanced').length}`);

    console.log('\n🎉 Coding challenges seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding coding challenges:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCodingChallenges();

