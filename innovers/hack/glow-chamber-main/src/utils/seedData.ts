// Utility function to seed test data for demonstration
export const seedTestData = () => {
  // Check if data already exists
  const existingRooms = localStorage.getItem('rooms');
  const existingUsers = localStorage.getItem('users');
  
  if (existingRooms && existingUsers) {
    console.log('Test data already exists');
    return;
  }

  // Create test users
  const testUsers = [
    {
      id: 'admin-1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-1',
      email: 'user1@test.com',
      name: 'John Doe',
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-2',
      email: 'user2@test.com',
      name: 'Jane Smith',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ];

  // Create test rooms with activity logs
  const testRooms = [
    {
      id: 'room-1',
      name: 'Computer Science 101',
      description: 'Introduction to Computer Science course materials',
      passkey: 'CS101A',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      adminId: 'admin-1',
      members: ['user-1', 'user-2'],
      views: 15,
      pdfs: [
        {
          id: 'pdf-1',
          name: 'Introduction to Programming.pdf',
          size: '2.5MB',
          uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          views: 8,
          content: `# Introduction to Programming

## Chapter 1: Getting Started

Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages, such as JavaScript, Python, and C++.

### Key Concepts:
- Variables and Data Types
- Control Structures
- Functions and Methods
- Object-Oriented Programming

### Example Code:
\`\`\`javascript
function greetUser(name) {
    return "Hello, " + name + "!";
}

console.log(greetUser("World"));
\`\`\`

This document covers the fundamental concepts of programming and provides practical examples to help students understand the basics.`,
          lastEditedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          lastEditedBy: 'John Doe',
          lastEditDescription: 'Added example code section and improved formatting'
        },
        {
          id: 'pdf-2',
          name: 'Data Structures Guide.pdf',
          size: '3.1MB',
          uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          views: 7,
          content: `# Data Structures Guide

## Overview
Data structures are ways of organizing and storing data so that they can be accessed and worked with efficiently.

## Common Data Structures:

### Arrays
- Fixed-size sequential collection of elements
- Fast access by index
- Example: [1, 2, 3, 4, 5]

### Linked Lists
- Dynamic data structure with nodes
- Each node contains data and reference to next node
- Efficient insertion and deletion

### Stacks
- Last In, First Out (LIFO) principle
- Operations: push, pop, peek
- Used in function calls, undo operations

### Queues
- First In, First Out (FIFO) principle
- Operations: enqueue, dequeue
- Used in scheduling, breadth-first search

This guide provides comprehensive coverage of fundamental data structures used in computer science.`
        }
      ],
      activityLog: [
        {
          id: 'activity-1',
          type: 'join',
          userId: 'user-1',
          userEmail: 'user1@test.com',
          userName: 'John Doe',
          description: 'Joined the classroom "Computer Science 101"',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-2',
          type: 'join',
          userId: 'user-2',
          userEmail: 'user2@test.com',
          userName: 'Jane Smith',
          description: 'Joined the classroom "Computer Science 101"',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-3',
          type: 'upload',
          userId: 'admin-1',
          userEmail: 'admin@test.com',
          userName: 'Admin User',
          pdfId: 'pdf-1',
          pdfName: 'Introduction to Programming.pdf',
          description: 'Uploaded PDF "Introduction to Programming.pdf" (2.5MB)',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-4',
          type: 'upload',
          userId: 'admin-1',
          userEmail: 'admin@test.com',
          userName: 'Admin User',
          pdfId: 'pdf-2',
          pdfName: 'Data Structures Guide.pdf',
          description: 'Uploaded PDF "Data Structures Guide.pdf" (3.1MB)',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-5',
          type: 'view',
          userId: 'user-1',
          userEmail: 'user1@test.com',
          userName: 'John Doe',
          pdfId: 'pdf-1',
          pdfName: 'Introduction to Programming.pdf',
          description: 'Viewed PDF "Introduction to Programming.pdf"',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-6',
          type: 'edit',
          userId: 'user-1',
          userEmail: 'user1@test.com',
          userName: 'John Doe',
          pdfId: 'pdf-1',
          pdfName: 'Introduction to Programming.pdf',
          description: 'Added example code section and improved formatting',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'activity-7',
          type: 'view',
          userId: 'user-2',
          userEmail: 'user2@test.com',
          userName: 'Jane Smith',
          pdfId: 'pdf-2',
          pdfName: 'Data Structures Guide.pdf',
          description: 'Viewed PDF "Data Structures Guide.pdf"',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ];

  // Save test data to localStorage
  localStorage.setItem('users', JSON.stringify(testUsers));
  localStorage.setItem('rooms', JSON.stringify(testRooms));
  
  console.log('Test data seeded successfully!');
  console.log('Test credentials:');
  console.log('Admin: admin@test.com');
  console.log('User 1: user1@test.com');
  console.log('User 2: user2@test.com');
  console.log('Room passkey: CS101A');
};

// Clear all test data
export const clearTestData = () => {
  localStorage.removeItem('users');
  localStorage.removeItem('rooms');
  localStorage.removeItem('currentUser');
  console.log('Test data cleared!');
};
