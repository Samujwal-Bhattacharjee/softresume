/**
 * Synthetic resume fixtures for tests, first-run presets, and demos.
 * Contains NO real personal data. All names, companies, contacts, and
 * details are entirely fictional and for testing/demo purposes only.
 */
import { type ResumeDocument } from "@/lib/schemas/resume";

/** Fresher / Graduate fixture — computer science student with projects */
export const FRESHER_FIXTURE: ResumeDocument = {
  schemaVersion: 1,
  basics: {
    name: "Priya Mehta",
    email: "priya.mehta@example.com",
    phone: "+91 98765 43210",
    location: "Pune, India",
    headline: "CS Final Year Student · Full-Stack Developer",
    links: [
      { label: "GitHub", url: "https://github.com/example-priya" },
      { label: "LinkedIn", url: "https://linkedin.com/in/example-priya" },
      { label: "Portfolio", url: "https://priya-dev.example.com" },
    ],
  },
  summary:
    "Final-year Computer Science student with hands-on experience building web and mobile applications. Passionate about open source, clean code, and accessible interfaces.",
  experience: [],
  education: [
    {
      id: "edu-001",
      institution: "Pune Institute of Technology (Fictional)",
      degree: "B.E.",
      field: "Computer Engineering",
      startDate: "2021-08",
      endDate: "2025-05",
      grade: "CGPA 8.7 / 10",
      location: "Pune, India",
      coursework: [
        "Data Structures & Algorithms",
        "Database Systems",
        "Operating Systems",
        "Computer Networks",
        "Software Engineering",
      ],
    },
  ],
  projects: [
    {
      id: "proj-001",
      name: "StudyBuddy — Collaborative Notes App",
      description:
        "A real-time note-taking platform that allows students to collaboratively edit and annotate course material.",
      bullets: [
        "Built with React, Node.js, and Socket.IO; supports simultaneous editing by up to 20 users.",
        "Implemented conflict-resolution using operational transformation (OT) for text synchronization.",
        "Deployed on Render; ~150 active users among classmates within two weeks of launch.",
      ],
      technologies: ["React", "Node.js", "Express", "Socket.IO", "MongoDB"],
      url: "https://studybuddy.example.com",
      repoUrl: "https://github.com/example-priya/studybuddy",
    },
    {
      id: "proj-002",
      name: "Bus Route Optimizer",
      description:
        "A data analysis project comparing city bus route efficiency using open GTFS transit data.",
      bullets: [
        "Parsed GTFS feed for Fictional City Transit; built a Python pipeline to compute route coverage scores.",
        "Visualized route overlaps using Folium; identified three duplicate routes in the dataset.",
        "Wrote a short report shared with the university data-science club.",
      ],
      technologies: ["Python", "Pandas", "Folium", "GTFS"],
      repoUrl: "https://github.com/example-priya/bus-optimizer",
    },
  ],
  skills: [
    {
      id: "skill-001",
      category: "Languages",
      items: ["JavaScript", "TypeScript", "Python", "Java", "SQL"],
    },
    {
      id: "skill-002",
      category: "Frameworks & Libraries",
      items: ["React", "Node.js", "Express", "Next.js"],
    },
    {
      id: "skill-003",
      category: "Tools & Platforms",
      items: ["Git", "GitHub", "Docker", "Linux", "VS Code"],
    },
  ],
  internships: [
    {
      id: "intern-001",
      employer: "DataFlow Technologies (Fictional)",
      role: "Software Engineering Intern",
      location: "Bangalore, India (Remote)",
      startDate: "2024-05",
      endDate: "2024-07",
      current: false,
      bullets: [
        "Contributed to the front-end of an internal analytics dashboard using React and Recharts.",
        "Wrote unit tests using Jest; increased coverage of the chart components module from 42% to 78%.",
        "Participated in two-week sprints and daily standups with a team of six engineers.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-001",
      name: "AWS Cloud Practitioner Essentials (Fictional Cert)",
      issuer: "Amazon Web Services",
      date: "2024-03",
    },
  ],
  awards: [
    {
      id: "award-001",
      title: "2nd Place — HackFest 2024 (Fictional)",
      issuer: "PIT CSE Department",
      date: "2024-02",
      description:
        "Built a food-waste reduction app using React Native and Firebase in 24 hours.",
    },
  ],
  volunteering: [
    {
      id: "vol-001",
      organization: "PIT Open Source Club (Fictional)",
      role: "Club Secretary",
      startDate: "2023-06",
      current: true,
      bullets: [
        "Organized four workshops on Git and open-source contribution for 80+ students.",
        "Maintained club GitHub organization and reviewed 30+ student pull requests.",
      ],
    },
  ],
  publications: [],
  customSections: [],
  settings: {
    templateId: "fresher-graduate",
    fontPreset: "clean",
    pageSize: "A4",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: [
      "basics",
      "summary",
      "education",
      "skills",
      "projects",
      "internships",
      "awards",
      "volunteering",
      "certifications",
    ],
    hiddenSections: [],
  },
};

/** Experienced Professional fixture — software engineering manager */
export const EXPERIENCED_FIXTURE: ResumeDocument = {
  schemaVersion: 1,
  basics: {
    name: "Rohan Kapoor",
    email: "r.kapoor@example.com",
    phone: "+44 7700 900000",
    location: "London, UK",
    headline: "Senior Software Engineer · Full-Stack & Cloud",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/example-rohan" },
      { label: "GitHub", url: "https://github.com/example-rohan" },
    ],
  },
  summary:
    "Senior Software Engineer with 8 years of experience building scalable distributed systems and leading cross-functional delivery teams. Strong background in cloud-native architecture, API design, and developer tooling.",
  experience: [
    {
      id: "exp-001",
      employer: "Nexora Systems (Fictional)",
      role: "Senior Software Engineer",
      location: "London, UK",
      startDate: "2021-03",
      current: true,
      bullets: [
        "Led design and delivery of a multi-tenant data ingestion pipeline processing 4 TB/day using Kafka and Flink.",
        "Reduced average API latency by 38% through query optimisation and caching layer improvements measured on production traffic.",
        "Mentored three junior engineers; introduced pair-programming rotations that reduced onboarding time from 6 weeks to 3 weeks.",
        "Designed OpenAPI contracts for 12 microservices; wrote ADRs that reduced cross-team integration rework.",
      ],
    },
    {
      id: "exp-002",
      employer: "Cloudrift Ltd (Fictional)",
      role: "Software Engineer",
      location: "Manchester, UK",
      startDate: "2018-07",
      endDate: "2021-02",
      bullets: [
        "Built a self-service deployment platform using Kubernetes and Helm; adopted by 8 product teams within 6 months.",
        "Wrote infrastructure-as-code (Terraform) for AWS environments; eliminated manual provisioning across staging and production.",
        "Contributed to migration from monolith to microservices; owned the auth and notification domains.",
      ],
    },
    {
      id: "exp-003",
      employer: "StartWave Digital (Fictional)",
      role: "Junior Software Engineer",
      location: "Birmingham, UK",
      startDate: "2016-09",
      endDate: "2018-06",
      bullets: [
        "Developed customer-facing features in a React/Django application; owned the search and filtering module.",
        "Wrote integration tests using pytest; caught two data-consistency bugs before production release.",
      ],
    },
  ],
  education: [
    {
      id: "edu-001",
      institution: "University of Fictional Technology",
      degree: "B.Sc.",
      field: "Computer Science",
      startDate: "2012-09",
      endDate: "2016-06",
      grade: "First Class Honours",
      location: "Sheffield, UK",
    },
  ],
  projects: [
    {
      id: "proj-001",
      name: "open-schema — JSON Schema diff tool (open source)",
      bullets: [
        "Maintained an open-source CLI tool for diffing JSON Schema versions; 900+ GitHub stars.",
        "Added a breaking-change detector and CI GitHub Action used by 40+ repositories.",
      ],
      technologies: ["TypeScript", "Node.js", "JSON Schema"],
      repoUrl: "https://github.com/example-rohan/open-schema",
    },
  ],
  skills: [
    {
      id: "skill-001",
      category: "Languages",
      items: ["TypeScript", "Python", "Go", "SQL", "Bash"],
    },
    {
      id: "skill-002",
      category: "Infrastructure & Cloud",
      items: ["AWS", "Kubernetes", "Docker", "Terraform", "Kafka", "Flink"],
    },
    {
      id: "skill-003",
      category: "Practices",
      items: [
        "Distributed systems",
        "API design",
        "CI/CD",
        "Observability",
        "Technical writing",
      ],
    },
  ],
  internships: [],
  certifications: [
    {
      id: "cert-001",
      name: "AWS Solutions Architect — Associate (Fictional)",
      issuer: "Amazon Web Services",
      date: "2022-05",
    },
  ],
  awards: [],
  volunteering: [
    {
      id: "vol-001",
      organization: "Code Futures UK (Fictional)",
      role: "Volunteer Mentor",
      startDate: "2020-01",
      current: true,
      bullets: [
        "Mentored six early-career developers from under-represented backgrounds through six-month programmes.",
      ],
    },
  ],
  publications: [],
  customSections: [],
  settings: {
    templateId: "classic-ats",
    fontPreset: "clean",
    pageSize: "A4",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: [
      "basics",
      "summary",
      "experience",
      "skills",
      "projects",
      "education",
      "certifications",
      "volunteering",
    ],
    hiddenSections: [],
  },
};
