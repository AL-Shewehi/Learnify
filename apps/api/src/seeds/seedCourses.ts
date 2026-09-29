import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/Course.js";
import User from "../models/User.js";

dotenv.config();

const SEED_COURSES = [
  // Programming
  {
    title: "Modern JavaScript: From Fundamentals to Async Patterns",
    description: "A complete tour of JavaScript in 2026 — closures, prototypes, async/await, and the event loop explained without the usual hand-waving.",
    subject: "Programming",
    level: "intermediate" as const,
    price: 79,
    coverImage: "https://images.unsplash.com/photo-1627398242454-45a1401c20d6?w=800&q=80",
  },
  {
    title: "TypeScript for Skeptical Developers",
    description: "Type-level programming, generics that actually compile, and the parts of TypeScript nobody explains properly.",
    subject: "Programming",
    level: "advanced" as const,
    price: 89,
    coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
  },
  {
    title: "Node.js Beyond the Tutorial",
    description: "Streams, worker threads, native addons, and the things production apps actually need.",
    subject: "Programming",
    level: "advanced" as const,
    price: 99,
    coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
  },
  {
    title: "React Server Components in Practice",
    description: "Build a real app with the new mental model. No more 'client component everywhere'.",
    subject: "Programming",
    level: "intermediate" as const,
    price: 69,
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  },

  // Design
  {
    title: "Editorial Typography for the Web",
    description: "How magazines and newspapers solved type online — and how you can too.",
    subject: "Design",
    level: "intermediate" as const,
    price: 59,
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  },
  {
    title: "Design Systems That Actually Ship",
    description: "Tokens, variants, and the politics of getting a component library adopted.",
    subject: "Design",
    level: "advanced" as const,
    price: 89,
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=800&q=80",
  },
  {
    title: "Figma for Developers",
    description: "Stop asking designers for the hex code. Learn to read and build from any Figma file.",
    subject: "Design",
    level: "beginner" as const,
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=800&q=80",
  },

  // Business
  {
    title: "Pricing for Indie Makers",
    description: "Why your SaaS is underpriced, and the frameworks that actually move the needle.",
    subject: "Business",
    level: "intermediate" as const,
    price: 49,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  },
  {
    title: "Writing for Technical Founders",
    description: "Landing pages, changelogs, and the emails that actually convert.",
    subject: "Business",
    level: "beginner" as const,
    price: 39,
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
  },

  // Data
  {
    title: "SQL Without the Religion",
    description: "Joins, window functions, and the queries real analysts write every day.",
    subject: "Data",
    level: "intermediate" as const,
    price: 59,
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    title: "Python for Data Pipelines",
    description: "ETL, orchestration, and the boring-but-necessary parts of data engineering.",
    subject: "Data",
    level: "advanced" as const,
    price: 79,
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  },

  // Writing
  {
    title: "Technical Writing That People Finish",
    description: "Documentation, tutorials, and blog posts readers actually reach the end of.",
    subject: "Writing",
    level: "beginner" as const,
    price: 29,
    coverImage: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80",
  },

  // Free courses for discovery
  {
    title: "Your First Week with Git",
    description: "Branches, commits, and the 10 commands you'll use 90% of the time.",
    subject: "Programming",
    level: "beginner" as const,
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80",
  },
];

async function seed() {
  const DB_URL = process.env.MONGODB_URL;
  if (!DB_URL) throw new Error("MONGODB_URL not set");

  await mongoose.connect(DB_URL);
  console.log("✅ Connected to MongoDB");

  // Get or create instructor
  let instructor = await User.findOne({ role: "instructor" });
  if (!instructor) {
    instructor = await User.create({
      name: "Sarah Chen",
      email: "sarah@learnify.dev",
      password: "password123",
      role: "instructor",
    });
    console.log("✅ Created seed instructor");
  }

  // Clear old seed courses
  await Course.deleteMany({ title: { $in: SEED_COURSES.map((c) => c.title) } });

  // Insert new ones
  const docs = SEED_COURSES.map((c) => ({
    ...c,
    instructor: instructor._id,
    status: "published",
    language: "english",
    duration: Math.floor(Math.random() * 20) + 3,
    totalStudents: Math.floor(Math.random() * 2000) + 50,
    rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    whatYouWillLearn: [
      "The fundamentals, explained plainly",
      "Real-world patterns you'll actually use",
      "How to think about the problem space",
    ],
    prerequisites: ["A computer and curiosity"],
  }));

  await Course.insertMany(docs);
  console.log(`✅ Seeded ${docs.length} courses`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});