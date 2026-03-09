const { Pool } = require('pg');

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

async function seedSubjects() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('Seeding subjects...');
    
    for (const subject of SUBJECTS) {
      const { rowCount } = await pool.query(
        'INSERT INTO public.subjects (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [subject.id, subject.title]
      );
      
      if (rowCount > 0) {
        console.log(`Added subject: ${subject.title}`);
      } else {
        console.log(`Subject already exists: ${subject.title}`);
      }
    }
    
    console.log('Subject seeding completed');
  } catch (error) {
    console.error('Error seeding subjects:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedSubjects();
}

module.exports = { seedSubjects };