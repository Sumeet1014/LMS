const express = require('express');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const SUBJECTS = [
  { id: "dsa", title: "DSA (Data Structures & Algorithms)" },
  { id: "data-structures", title: "Data Structures" },
  { id: "algorithms", title: "Algorithms" },
  { id: "c", title: "C (Coding Basics)" },
  { id: "java", title: "Java (OOP & Language Fundamentals)" },
  { id: "operating-systems", title: "Operating Systems" },
  { id: "oops", title: "OOPs (Object Oriented Programming)" },
  { id: "coding-basics", title: "Coding Basics & Problem Solving" },
  { id: "competitive-coding", title: "Competitive Coding" },
  { id: "dbms", title: "Databases (SQL/NoSQL/DBMS)" },
  { id: "networks", title: "Computer Networks" },
  { id: "compiler-design", title: "Compiler Design" },
  { id: "system-design", title: "System Design (intro)" },
  { id: "operating-systems-advanced", title: "Operating Systems (advanced)" },
  { id: "project-development", title: "Project Development & Git" }
];

router.post('/seed-subjects', async (req, res) => {
  try {
    console.log('Seeding subjects...');
    let seeded = 0;
    let existing = 0;
    
    for (const subject of SUBJECTS) {
      const { rowCount } = await pool.query(
        'INSERT INTO public.subjects (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [subject.id, subject.title]
      );
      
      if (rowCount > 0) {
        seeded++;
      } else {
        existing++;
      }
    }
    
    res.json({ 
      success: true, 
      message: `Seeding completed. ${seeded} subjects added, ${existing} already existed.`,
      seeded,
      existing
    });
  } catch (error) {
    console.error('Error seeding subjects:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to seed subjects',
      detail: error.message 
    });
  }
});

module.exports = router;