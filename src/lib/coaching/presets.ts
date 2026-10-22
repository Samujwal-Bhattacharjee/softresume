/**
 * RS-093 — Role-Specific Coaching Presets Registry
 *
 * Provides a typed, versioned, data-driven preset registry defining:
 * - Recommended section ordering
 * - Evidence expectations for high-impact bullets
 * - Common tools & skills for job alignment
 * - Grounded AI coaching guidance for bullet and summary refinement
 * - Synthetic example bullet patterns
 * - Tailored fresher vs experienced applicant guidance
 *
 * Crucial architecture rule: Presets change guidance, prompts, and
 * recommended layout, NEVER mutating or adding unverified candidate claims
 * to the canonical ResumeDocument schema.
 */

export const ROLE_PRESET_IDS = [
  "software-engineer",
  "ai-ml-engineer",
  "cloud-devops",
  "data-scientist",
  "product-manager",
  "ui-ux-designer",
  "finance-consulting",
  "sales-cs",
  "research-academic",
  "creative-film",
  "general",
] as const;

export type RolePresetId = (typeof ROLE_PRESET_IDS)[number];

export interface RoleCoachingPreset {
  id: RolePresetId;
  name: string;
  shortDescription: string;
  suits: string;
  recommendedSectionOrder: string[];
  relevantSections: string[];
  evidenceExpectations: string[];
  commonToolsAndSkills: string[];
  aiPromptGuidance: {
    bulletFocus: string;
    summaryFocus: string;
    followUpProbes: string[];
  };
  exampleSyntheticBullet: {
    role: string;
    bullet: string;
    whyItWorks: string;
  };
  completenessGuidance: {
    mandatoryChecks: string[];
    optionalRecommendations: string[];
  };
  fresherVsExperienced: {
    fresherTips: string[];
    experiencedTips: string[];
  };
}

export const ROLE_PRESETS: Record<RolePresetId, RoleCoachingPreset> = {
  "software-engineer": {
    id: "software-engineer",
    name: "Software Engineer",
    shortDescription: "Full-stack, backend, frontend, and systems software engineers.",
    suits: "Developers designing, writing, testing, and shipping application or systems code.",
    recommendedSectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications"],
    relevantSections: ["skills", "experience", "projects", "education"],
    evidenceExpectations: [
      "System scale (RPS, throughput, concurrency, data volume)",
      "Latency or response time reductions",
      "Architecture decisions (microservices, event-driven, modular)",
      "Test coverage, CI/CD reliability, and production deployment cadence",
    ],
    commonToolsAndSkills: [
      "TypeScript", "Python", "Go", "Java", "C++", "React", "Node.js",
      "PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "GraphQL", "REST APIs",
    ],
    aiPromptGuidance: {
      bulletFocus: "Highlight architectural decisions, languages/frameworks used, and concrete throughput, latency, or reliability improvements.",
      summaryFocus: "Summarize technical domain specialization (e.g. backend distributed systems, modern web apps) and core architectural competencies.",
      followUpProbes: [
        "What was the scale or throughput of the system (requests/sec, active users, data size)?",
        "Which specific language, database, or framework did you architect this with?",
        "Did this reduce error rates, improve response latency, or accelerate build times?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Backend Engineer",
      bullet: "Refactored legacy order processing service in Go and PostgreSQL, reducing p99 API latency from 420ms to 85ms across 1.2M daily transactions.",
      whyItWorks: "Starts with strong action verb ('Refactored'), names the stack ('Go', 'PostgreSQL'), and states verified scale and performance delta.",
    },
    completenessGuidance: {
      mandatoryChecks: ["At least 1 technical skill group", "Detailed technical stack in bullets", "GitHub or repository link"],
      optionalRecommendations: ["Open-source contributions or technical blog", "System design or architecture bullet"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Prioritize projects, coursework, and hackathons above lack of enterprise employment.",
        "Demonstrate working software with live deployment URLs and GitHub repositories.",
      ],
      experiencedTips: [
        "Lead with system scope, reliability SLAs, and engineering leadership.",
        "Highlight cross-functional impact and mentoring junior engineers.",
      ],
    },
  },

  "ai-ml-engineer": {
    id: "ai-ml-engineer",
    name: "AI / ML Engineer",
    shortDescription: "Machine learning, NLP, computer vision, and LLM application engineers.",
    suits: "Engineers and researchers training, fine-tuning, deploying, and evaluating ML models.",
    recommendedSectionOrder: ["summary", "skills", "experience", "projects", "publications", "education"],
    relevantSections: ["skills", "experience", "projects", "publications", "education"],
    evidenceExpectations: [
      "Model evaluation metrics (F1, precision/recall, perplexity, BLEU, AUC-ROC)",
      "Inference optimization (quantization, TensorRT, vLLM, latency, cost per token)",
      "Dataset curation, data cleaning, and pipeline throughput",
      "Evaluation benchmarks and human-in-the-loop validation frameworks",
    ],
    commonToolsAndSkills: [
      "PyTorch", "TensorFlow", "HuggingFace", "Python", "CUDA", "vLLM",
      "LangChain", "LlamaIndex", "MLflow", "Weights & Biases", "Vector DBs (Pinecone, Qdrant)", "ONNX",
    ],
    aiPromptGuidance: {
      bulletFocus: "Emphasize model architecture, training/fine-tuning techniques, evaluation metrics, and inference latency or cost optimizations.",
      summaryFocus: "Highlight ML specializations (e.g. LLM fine-tuning, computer vision, recommendation systems) and production deployment experience.",
      followUpProbes: [
        "What evaluation metric improved (e.g. F1-score, accuracy, inference latency)?",
        "What framework or hardware did you use for training or serving (PyTorch, vLLM, Triton)?",
        "How large was the training dataset or parameter count?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Machine Learning Engineer",
      bullet: "Fine-tuned Llama-3-8B on 50,000 domain-specific medical summaries using LoRA and PyTorch, increasing clinical term extraction F1-score from 0.74 to 0.89.",
      whyItWorks: "Explicitly identifies model, dataset size, training technique, and quantified improvement on a standard ML evaluation metric.",
    },
    completenessGuidance: {
      mandatoryChecks: ["ML frameworks in skills", "Model evaluation metrics in bullets", "Hardware/serving tooling specified"],
      optionalRecommendations: ["ArXiv or peer-reviewed publications", "Kaggle or benchmark rankings"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Showcase reproducible Kaggle notebooks, paper implementations, or HuggingFace model cards.",
        "Explain data preprocessing and ablation studies clearly.",
      ],
      experiencedTips: [
        "Highlight production serving scale, cost-per-inference reduction, and monitoring for model drift.",
        "Demonstrate end-to-end ML lifecycle governance.",
      ],
    },
  },

  "cloud-devops": {
    id: "cloud-devops",
    name: "Cloud / DevOps / Platform Engineer",
    shortDescription: "Infrastructure, SRE, platform, and cloud automation specialists.",
    suits: "Engineers responsible for cloud infrastructure, CI/CD pipelines, security, and uptime.",
    recommendedSectionOrder: ["summary", "skills", "experience", "certifications", "projects", "education"],
    relevantSections: ["skills", "experience", "certifications", "projects", "education"],
    evidenceExpectations: [
      "Availability and uptime SLAs (e.g. 99.99% availability)",
      "Deployment frequency and pipeline lead-time reduction",
      "Infrastructure-as-Code automation and cloud cost optimization",
      "Mean time to recovery (MTTR) and incident resolution improvements",
    ],
    commonToolsAndSkills: [
      "AWS", "GCP", "Azure", "Terraform", "Kubernetes", "Helm",
      "Docker", "GitHub Actions", "ArgoCD", "Prometheus", "Grafana", "Ansible", "Linux",
    ],
    aiPromptGuidance: {
      bulletFocus: "Focus on automated infrastructure provisioning, pipeline speed, multi-region high availability, and cloud spend optimization.",
      summaryFocus: "Outline cloud platform expertise, SRE principles, security compliance, and IaC mastery.",
      followUpProbes: [
        "What was the infrastructure scale (number of clusters, nodes, services)?",
        "Did this reduce deployment time, rollbacks, or cloud costs?",
        "What monitoring or alerting tools were integrated?",
      ],
    },
    exampleSyntheticBullet: {
      role: "DevOps Engineer",
      bullet: "Migrated 40+ microservices to Amazon EKS using Terraform and Helm, cutting deployment cycle times from 45 minutes to 7 minutes with zero production downtime.",
      whyItWorks: "Details cloud technologies ('Amazon EKS', 'Terraform', 'Helm'), service count, and measurable deployment time reduction.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Cloud provider and IaC tools listed", "Uptime or deployment metrics", "Security or cloud certifications"],
      optionalRecommendations: ["Disaster recovery runbooks", "Cost optimization figures"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Highlight personal cloud lab setups, Terraform configurations on GitHub, and AWS/GCP foundational certifications.",
      ],
      experiencedTips: [
        "Emphasize multi-cloud architectures, SOC2/HIPAA compliance automations, and enterprise SRE leadership.",
      ],
    },
  },

  "data-scientist": {
    id: "data-scientist",
    name: "Data Analyst / Data Scientist",
    shortDescription: "Data analytics, statistical modeling, BI, and data science professionals.",
    suits: "Practitioners extracting actionable business intelligence from complex data pipelines.",
    recommendedSectionOrder: ["summary", "skills", "experience", "projects", "education", "certifications"],
    relevantSections: ["skills", "experience", "projects", "education"],
    evidenceExpectations: [
      "Decision impact (revenue influenced, churn reduced, operational efficiency)",
      "Data volume and pipeline reliability (warehouse size, ETL latency)",
      "Statistical rigor (A/B testing sample size, p-values, regression modeling)",
      "Executive reporting and cross-functional stakeholder buy-in",
    ],
    commonToolsAndSkills: [
      "SQL", "Python", "R", "Snowflake", "BigQuery", "dbt",
      "Tableau", "Power BI", "Pandas", "Statistical Analysis", "A/B Testing", "Looker",
    ],
    aiPromptGuidance: {
      bulletFocus: "Highlight business decisions influenced, dataset scale, statistical methodologies, and data visualization tools.",
      summaryFocus: "Summarize data modeling expertise, analytics platforms, and demonstrated ability to translate data into strategic decisions.",
      followUpProbes: [
        "What business decision or metric was influenced by your analysis?",
        "What was the scale of the dataset or data warehouse queried?",
        "Did you conduct A/B testing or build self-service dashboards?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Data Scientist",
      bullet: "Constructed customer churn prediction model in Python and Snowflake across 450,000 subscriber accounts, identifying 12% high-risk cohort and reducing churn by 2.4%.",
      whyItWorks: "Clearly connects the data pipeline, model scope, and ultimate bottom-line retention metric.",
    },
    completenessGuidance: {
      mandatoryChecks: ["SQL and analytics platforms listed", "Business metric impact stated", "Statistical or modeling tools"],
      optionalRecommendations: ["Dashboard links or portfolio notebooks", "A/B testing methodology examples"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Showcase clean data analysis case studies with documented EDA, visualizations, and business takeaways.",
      ],
      experiencedTips: [
        "Focus on building data culture, warehouse modernization, and measurable strategic impact on executive decisions.",
      ],
    },
  },

  "product-manager": {
    id: "product-manager",
    name: "Product Manager",
    shortDescription: "Technical, growth, core, and enterprise product managers.",
    suits: "Leaders driving product strategy, roadmaps, cross-functional delivery, and user metrics.",
    recommendedSectionOrder: ["summary", "experience", "skills", "education", "projects"],
    relevantSections: ["experience", "skills", "education", "projects"],
    evidenceExpectations: [
      "User acquisition, retention, activation, or monetization impact",
      "Roadmap execution, cross-functional engineering/design leadership",
      "Customer discovery interviews and data-driven prioritization",
      "Go-to-market (GTM) launches and feature adoption rates",
    ],
    commonToolsAndSkills: [
      "Product Strategy", "User Research", "Agile / Scrum", "A/B Testing",
      "Jira", "Mixpanel", "Amplitude", "Figma", "Roadmapping", "SQL", "PRDs",
    ],
    aiPromptGuidance: {
      bulletFocus: "Emphasize product outcomes (DAU/MAU growth, conversion, retention), customer discovery insights, and cross-functional leadership.",
      summaryFocus: "Outline product lifecycle management, user empathy, strategic vision, and collaboration across engineering, design, and sales.",
      followUpProbes: [
        "What product KPI moved as a result of this launch (conversion, retention, ARR)?",
        "How large was the engineering/design team you partnered with?",
        "What user problem did customer discovery uncover?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Product Manager",
      bullet: "Defined product roadmap and led 8-engineer team to launch self-service onboarding flow, increasing 14-day user activation from 31% to 48% within 90 days.",
      whyItWorks: "Demonstrates cross-functional leadership ('led 8-engineer team'), strategic ownership, and clear activation rate outcome.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Quantified user or business outcome", "Product discovery/strategy terminology", "Cross-functional scope"],
      optionalRecommendations: ["Target market/vertical context", "Go-to-market highlights"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Highlight associate PM internships, hackathon leadership, user research projects, and analytical problem-solving.",
      ],
      experiencedTips: [
        "Lead with P&L responsibility, team scaling, multi-year product strategy, and executive alignment.",
      ],
    },
  },

  "ui-ux-designer": {
    id: "ui-ux-designer",
    name: "UI / UX Designer",
    shortDescription: "Product designers, interaction designers, and user experience researchers.",
    suits: "Designers creating design systems, user flows, wireframes, prototypes, and user interfaces.",
    recommendedSectionOrder: ["summary", "skills", "projects", "experience", "education"],
    relevantSections: ["skills", "projects", "experience", "education"],
    evidenceExpectations: [
      "Task completion rates, usability testing findings, error reduction",
      "Design system component adoption and design-to-code velocity",
      "User research synthesis (interviews, usability tests, personas)",
      "Portfolio case study link with problem-solution-impact narratives",
    ],
    commonToolsAndSkills: [
      "Figma", "Design Systems", "Prototyping", "User Research", "Wireframing",
      "Interaction Design", "Usability Testing", "HTML/CSS", "Information Architecture",
    ],
    aiPromptGuidance: {
      bulletFocus: "Focus on user research insights, usability improvements, design system velocity, and measurable user task efficiency.",
      summaryFocus: "Highlight design philosophy, user-centric methodologies, cross-functional collaboration, and portfolio link.",
      followUpProbes: [
        "What usability challenge did user research reveal?",
        "Did this design improve conversion, task completion time, or user satisfaction?",
        "Is there a link to the live portfolio case study?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Product Designer",
      bullet: "Redesigned mobile checkout flow in Figma based on 18 usability testing sessions, reducing cart abandonment by 16% and decreasing checkout time by 35 seconds.",
      whyItWorks: "Mentions concrete user research sample ('18 usability testing sessions'), design tool, and clear behavioral user impact.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Online portfolio URL in contact links", "Design tools and methodologies", "Usability or user research evidence"],
      optionalRecommendations: ["Design system metrics", "Accessibility compliance (WCAG) references"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "A compelling online portfolio is essential; showcase end-to-end case studies detailing research through high-fidelity prototypes.",
      ],
      experiencedTips: [
        "Demonstrate design leadership, scalable design system governance across multiple product suites, and business alignment.",
      ],
    },
  },

  "finance-consulting": {
    id: "finance-consulting",
    name: "Finance / Consulting",
    shortDescription: "Financial analysts, management consultants, and strategy professionals.",
    suits: "Professionals conducting financial modeling, valuation, corporate strategy, and client advisory.",
    recommendedSectionOrder: ["summary", "experience", "education", "skills", "certifications"],
    relevantSections: ["experience", "education", "skills", "certifications"],
    evidenceExpectations: [
      "Deal size, portfolio value, or budget managed ($M/$B)",
      "Cost reductions, margin expansions, or revenue growth generated",
      "Executive presentation and client stakeholder management",
      "Financial modeling, DCF, LBO, or strategic audit methodologies",
    ],
    commonToolsAndSkills: [
      "Financial Modeling", "Valuation (DCF, LBO)", "Excel / VBA", "Financial Analysis",
      "Bloomberg Terminal", "Corporate Strategy", "Capital IQ", "Due Diligence", "PowerPoint",
    ],
    aiPromptGuidance: {
      bulletFocus: "Highlight deal size, financial modeling rigor, cost optimizations, and senior executive recommendations.",
      summaryFocus: "Summarize corporate finance specialization, valuation expertise, industry focus, and advisory achievements.",
      followUpProbes: [
        "What was the financial scale (budget, portfolio size, transaction value)?",
        "What was the measurable outcome (cost savings, EBITDA expansion, ROI)?",
        "Who were the key client or executive stakeholders presented to?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Financial Analyst",
      bullet: "Built dynamic DCF and three-statement financial models for $85M acquisition, identifying $3.2M in annual operational synergies presented directly to board of directors.",
      whyItWorks: "Includes verified deal size, specific modeling methodology, financial synergy outcome, and executive audience.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Financial modeling skills", "Transaction or budget scale metrics", "Prestigious education/GPA context"],
      optionalRecommendations: ["CFA or financial licenses", "Industry vertical specialization"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Highlight finance coursework, case competitions, financial modeling certifications, and student investment funds.",
      ],
      experiencedTips: [
        "Emphasize total transaction volume, P&L management, strategic M&A execution, and board-level advisory.",
      ],
    },
  },

  "sales-cs": {
    id: "sales-cs",
    name: "Sales / Customer Success",
    shortDescription: "Account executives, B2B sales reps, and customer success managers.",
    suits: "Revenue-generating professionals managing quotas, customer retention, expansions, and renewals.",
    recommendedSectionOrder: ["summary", "experience", "skills", "education", "awards"],
    relevantSections: ["experience", "skills", "education", "awards"],
    evidenceExpectations: [
      "Quota attainment percentage (e.g. 135% of quota)",
      "Annual recurring revenue (ARR) or total contract value (TCV) closed",
      "Net revenue retention (NRR) and gross churn reduction",
      "Outbound pipeline generation and territory expansion",
    ],
    commonToolsAndSkills: [
      "Salesforce", "HubSpot", "B2B Sales", "Quota Attainment", "Pipeline Generation",
      "Contract Negotiation", "Customer Retention", "Gong", "Outreach", "Account Management",
    ],
    aiPromptGuidance: {
      bulletFocus: "Lead with quota attainment percentages, closed deal values, pipeline expansion, and customer retention metrics.",
      summaryFocus: "Outline sales methodology (MEDDIC, Challenger), territory focus, customer segment (Enterprise, SMB), and revenue track record.",
      followUpProbes: [
        "What percentage of quota did you achieve (e.g. 120% of annual quota)?",
        "What was the average contract value (ACV) or total revenue generated?",
        "What was your renewal or net retention rate (NRR)?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Enterprise Account Executive",
      bullet: "Delivered 138% of $1.8M annual quota by closing 14 net-new enterprise SaaS contracts, generating $2.48M in ARR across healthcare and financial services accounts.",
      whyItWorks: "Immediately states quota attainment percentage, baseline quota, deal count, and total closed ARR.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Quota or revenue metrics in bullets", "CRM and sales acceleration tools", "Deal size or client segment"],
      optionalRecommendations: ["President's Club or sales awards", "Sales methodology training"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Highlight outbound outreach volume, SDR internships, communication skills, competitive athletics, and drive to achieve goals.",
      ],
      experiencedTips: [
        "Detail multi-year quota track record, complex enterprise contract negotiations, and territory leadership.",
      ],
    },
  },

  "research-academic": {
    id: "research-academic",
    name: "Research / Academic",
    shortDescription: "PhD candidates, postdoctoral researchers, professors, and lab scientists.",
    suits: "Researchers authoring peer-reviewed literature, leading lab studies, and securing grants.",
    recommendedSectionOrder: ["summary", "education", "publications", "experience", "projects", "awards", "skills"],
    relevantSections: ["education", "publications", "experience", "projects", "awards", "skills"],
    evidenceExpectations: [
      "Peer-reviewed journal and conference publications (citations, venues)",
      "Grant funding secured, fellowship awards, and scholarships",
      "Experimental methodologies, lab instruments, and statistical packages",
      "Teaching assistantships, mentorship, and conference presentations",
    ],
    commonToolsAndSkills: [
      "Literature Review", "Statistical Analysis", "LaTeX", "Python", "R",
      "Experimental Design", "Data Collection", "Grant Writing", "Peer Review", "SPSS",
    ],
    aiPromptGuidance: {
      bulletFocus: "Focus on research question hypothesis, experimental methodology, published papers, and grant awards.",
      summaryFocus: "Summarize academic discipline, research focus, major discoveries, and publication/grant record.",
      followUpProbes: [
        "What was the publication venue or conference presentation?",
        "Did you secure grant funding or fellowships (include award names/amounts)?",
        "What analytical or laboratory technique was fundamental to the study?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Graduate Research Assistant",
      bullet: "Designed double-blind randomized control trial with 320 participants, analyzing neural imaging data in Python to publish findings as first author in Nature Neuroscience.",
      whyItWorks: "Specifies experimental methodology, sample size, analytical tool, and prestigious publication venue.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Publications or thesis section", "Degrees and advisors listed", "Academic awards or honors"],
      optionalRecommendations: ["Grant funding amounts", "Conference oral presentations"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Highlight undergraduate thesis research, lab assistant experience, poster presentations, and faculty recommendations.",
      ],
      experiencedTips: [
        "Highlight peer-reviewed citation impact (h-index), competitive grant acquisition, lab management, and PhD advisory.",
      ],
    },
  },

  "creative-film": {
    id: "creative-film",
    name: "Creative / Film",
    shortDescription: "Videographers, editors, art directors, copywriters, and content creators.",
    suits: "Storytellers producing video, audio, multimedia, brand campaigns, and creative productions.",
    recommendedSectionOrder: ["summary", "projects", "skills", "experience", "education", "awards"],
    relevantSections: ["projects", "skills", "experience", "education", "awards"],
    evidenceExpectations: [
      "Audience reach (views, impressions, stream count, festival selections)",
      "Production tools (editing suites, cameras, motion graphics, audio)",
      "Campaign outcomes, client brands, and commercial deliverables",
      "Creative portfolio or showreel link",
    ],
    commonToolsAndSkills: [
      "Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro",
      "Cinematography", "Audio Mixing", "Motion Graphics", "Photoshop", "Storyboarding", "Color Grading",
    ],
    aiPromptGuidance: {
      bulletFocus: "Highlight production techniques, creative software suites, campaign reach, client caliber, and festival awards.",
      summaryFocus: "Summarize storytelling voice, technical production competencies, brand collaboration history, and link to showreel.",
      followUpProbes: [
        "What was the audience reach (views, ticket sales, festival screenings)?",
        "What specific editing or production tools were used?",
        "Is there a link to the creative portfolio or showreel?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Video Producer & Editor",
      bullet: "Directed and edited 6-part documentary series in Premiere Pro and DaVinci Resolve, garnering 1.8M YouTube views and Official Selection at Tribeca Film Festival.",
      whyItWorks: "Highlights creative software, deliverables, verified view count, and prestigious festival recognition.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Showreel or portfolio link", "Creative software proficiencies", "Client or distribution credits"],
      optionalRecommendations: ["Film festival screenings", "Commercial brand campaigns"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Provide a high-quality link to a concise 60-second showreel; detail student films, spec ads, and indie festival submissions.",
      ],
      experiencedTips: [
        "Detail commercial brand roster, production budget management, creative team direction, and major industry accolades.",
      ],
    },
  },

  "general": {
    id: "general",
    name: "General / Career Switcher",
    shortDescription: "Adaptable baseline guidance suitable for career switchers or diverse backgrounds.",
    suits: "Candidates pivoting between industries or whose role spans multiple functional areas.",
    recommendedSectionOrder: ["summary", "experience", "skills", "education", "projects", "certifications"],
    relevantSections: ["experience", "skills", "education"],
    evidenceExpectations: [
      "Transferable skills (problem-solving, stakeholder communication, organization)",
      "Demonstrated results (efficiency gains, project completions, cost savings)",
      "Continuous learning (bootcamps, certifications, new technical tools)",
      "Clear narrative explaining transferable value to the target role",
    ],
    commonToolsAndSkills: [
      "Project Management", "Communication", "Data Analysis", "Process Improvement",
      "Cross-Functional Collaboration", "Problem Solving", "Documentation",
    ],
    aiPromptGuidance: {
      bulletFocus: "Focus on concrete outcomes, transferable problem-solving, process improvements, and adaptability.",
      summaryFocus: "Craft a bridging narrative connecting previous domain accomplishments with target role capabilities.",
      followUpProbes: [
        "What was the measurable outcome or benefit of this project?",
        "What transferable tool or methodology did you apply?",
        "What target industry or role are you aiming toward?",
      ],
    },
    exampleSyntheticBullet: {
      role: "Operations Coordinator",
      bullet: "Standardized cross-departmental documentation in Notion and Excel, reducing weekly reporting turnaround from 3 days to 4 hours across 6 teams.",
      whyItWorks: "Clear before-and-after time savings metric, mentions tools, and shows transferable operational rigor.",
    },
    completenessGuidance: {
      mandatoryChecks: ["Clear contact basics", "Structured experience with bulleted achievements", "Verified education/skills"],
      optionalRecommendations: ["Certifications or training for target career", "Portfolio or personal projects"],
    },
    fresherVsExperienced: {
      fresherTips: [
        "Focus on enthusiasm, foundational academics, volunteer work, and rapid learning capacity.",
      ],
      experiencedTips: [
        "Highlight deep professional track record, leadership maturity, and how established skills translate to new challenges.",
      ],
    },
  },
};

/** Get all registered presets */
export function getAllRolePresets(): RoleCoachingPreset[] {
  return ROLE_PRESET_IDS.map((id) => ROLE_PRESETS[id]);
}

/** Get a role preset by ID with safe fallback to general */
export function getRolePreset(id?: string | null): RoleCoachingPreset {
  if (!id) return ROLE_PRESETS.general;
  if (id in ROLE_PRESETS) {
    return ROLE_PRESETS[id as RolePresetId];
  }
  return ROLE_PRESETS.general;
}

/** Check if a string is a valid RolePresetId */
export function isRolePresetId(id: string): id is RolePresetId {
  return ROLE_PRESET_IDS.includes(id as RolePresetId);
}
