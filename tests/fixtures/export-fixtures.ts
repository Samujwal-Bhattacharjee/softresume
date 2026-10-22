/**
 * Synthetic Resume Fixtures for Export Testing
 *
 * Exclusively contains synthetic/fictional data for automated PDF and DOCX
 * structural, extraction, and visual regression validation.
 */
import type { ResumeDocument } from "@/lib/schemas/resume";
import { FRESHER_FIXTURE, EXPERIENCED_FIXTURE } from "@/lib/fixtures/resume-fixtures";

/**
 * 1. Sparse / Short Resume
 * Tests clean omission of optional sections, compact 1-page layout, no empty headings.
 */
export const SPARSE_SHORT_FIXTURE: ResumeDocument = {
  schemaVersion: 1,
  basics: {
    name: "Amina Al-Mansoor",
    email: "amina.almansoor@example.com",
    phone: "+971 50 123 4567",
    location: "Dubai, UAE",
    headline: "Junior Analyst & Data Specialist",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/example-amina" },
    ],
  },
  summary: "",
  experience: [],
  internships: [],
  education: [
    {
      id: "edu-sparse-1",
      institution: "Gulf University of Science (Fictional)",
      degree: "B.Sc.",
      field: "Information Systems",
      startDate: "2020-09",
      endDate: "2024-06",
      grade: "3.85 / 4.00",
      location: "Dubai, UAE",
    },
  ],
  projects: [
    {
      id: "proj-sparse-1",
      name: "Retail Analytics Pipeline",
      description: "Automated daily inventory ingestion and forecasting for simulated retail datasets.",
      bullets: [
        "Built Python ETL jobs reading from PostgreSQL and exporting to Parquet files.",
        "Created SQL aggregation views for weekly executive revenue reports.",
      ],
      technologies: ["Python", "PostgreSQL", "Pandas"],
      repoUrl: "https://github.com/example-amina/retail-pipeline",
    },
  ],
  skills: [
    {
      id: "skill-sparse-1",
      category: "Technical Skills",
      items: ["Python", "SQL", "Tableau", "Git"],
    },
  ],
  certifications: [],
  awards: [],
  volunteering: [],
  publications: [],
  customSections: [],
  settings: {
    templateId: "classic-ats",
    fontPreset: "clean",
    pageSize: "A4",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: ["basics", "education", "projects", "skills"],
    hiddenSections: ["summary", "experience", "internships", "certifications", "awards", "volunteering"],
  },
};

/**
 * 2. Fresher / Student Resume
 * Education-first layout with internships, coursework, and campus leadership.
 */
export const FRESHER_STUDENT_FIXTURE: ResumeDocument = {
  ...FRESHER_FIXTURE,
  settings: {
    ...FRESHER_FIXTURE.settings,
    templateId: "fresher-graduate",
    pageSize: "A4",
  },
};

/**
 * 3. Technical / Project-Heavy Resume
 * Deep architecture projects, long URLs, dense technology tags, code repositories.
 */
export const TECHNICAL_HEAVY_FIXTURE: ResumeDocument = {
  schemaVersion: 1,
  basics: {
    name: "Marcus Vance",
    email: "marcus.vance.dev@example.com",
    phone: "+1 (555) 019-2834",
    location: "Austin, TX",
    headline: "Senior Distributed Systems & Platform Engineer",
    links: [
      { label: "GitHub", url: "https://github.com/example-marcus-systems-infrastructure" },
      { label: "Blog", url: "https://marcusvance-infrastructure-engineering.example.org" },
      { label: "Keybase", url: "https://keybase.io/example_marcus_vance_engineering" },
    ],
  },
  summary:
    "Systems engineer specializing in high-throughput distributed consensus, low-latency RPC protocols, and Linux kernel observability. Experienced in maintaining zero-downtime Kubernetes infrastructure spanning multi-region cloud providers.",
  experience: [
    {
      id: "exp-tech-1",
      employer: "Aegis Cloud Infrastructure (Fictional)",
      role: "Lead Platform Engineer",
      location: "Austin, TX",
      startDate: "2021-04",
      current: true,
      bullets: [
        "Architected an eBPF-based telemetry agent processing 500k packets/sec with sub-millisecond CPU overhead.",
        "Maintained custom Envoy service mesh control plane handling cross-region mutual TLS (mTLS) for 140+ internal services.",
        "Authored disaster recovery automation that restored multi-region database replicas in under 4 minutes during quarterly chaos drills.",
      ],
    },
    {
      id: "exp-tech-2",
      employer: "VectorDB Core Technologies (Fictional)",
      role: "Distributed Systems Engineer",
      location: "Seattle, WA",
      startDate: "2018-06",
      endDate: "2021-03",
      bullets: [
        "Implemented Raft consensus log compaction and snapshotting in Rust, reducing disk storage footprint by 44%.",
        "Tuned memory allocators (jemalloc) and Linux virtual memory parameters, eliminating tail latency spikes on 64-core bare-metal nodes.",
      ],
    },
  ],
  education: [
    {
      id: "edu-tech-1",
      institution: "Texas Polytechnic Institute (Fictional)",
      degree: "B.S.",
      field: "Computer Engineering",
      startDate: "2014-08",
      endDate: "2018-05",
      location: "Austin, TX",
    },
  ],
  projects: [
    {
      id: "proj-tech-1",
      name: "mesh-probe — Lightweight eBPF Network Latency Observer",
      description: "Low-overhead network telemetry tool for diagnosing TCP retransmission anomalies inside Docker and Kubernetes pods.",
      bullets: [
        "Captured sock:inet_sock_set_state kernel events via eBPF tracepoints without modifying userspace binaries.",
        "Integrated Prometheus metric export endpoint scraping up to 100,000 socket events per second.",
      ],
      technologies: ["Rust", "eBPF", "C", "Prometheus", "Linux Kernel", "Docker", "Kubernetes"],
      repoUrl: "https://github.com/example-marcus-systems-infrastructure/mesh-probe-ebpf-observer",
      url: "https://mesh-probe-docs.example.org/architecture/deep-dive",
    },
    {
      id: "proj-tech-2",
      name: "raft-stream — Asynchronous Raft Engine for Storage Engines",
      bullets: [
        "Zero-allocation append-entries serialization protocol built atop Tokio asynchronous runtime.",
        "Verified correctness using automated linearizability checkers and Jepsen-style fault injection tests.",
      ],
      technologies: ["Rust", "Tokio", "gRPC", "Protobuf", "Jepsen Testing"],
      repoUrl: "https://github.com/example-marcus-systems-infrastructure/raft-stream-storage",
    },
  ],
  skills: [
    {
      id: "skill-tech-1",
      category: "Systems & Languages",
      items: ["Rust", "Go", "C++", "C", "Python", "Bash", "Assembly x86_64"],
    },
    {
      id: "skill-tech-2",
      category: "Infrastructure & Orchestration",
      items: ["Kubernetes", "Docker", "Terraform", "Envoy", "eBPF", "Linux", "gRPC", "Kafka"],
    },
    {
      id: "skill-tech-3",
      category: "Observability & Reliability",
      items: ["Prometheus", "Grafana", "OpenTelemetry", "Distributed Tracing", "Chaos Engineering"],
    },
  ],
  certifications: [
    {
      id: "cert-tech-1",
      name: "Certified Kubernetes Administrator (CKA)",
      issuer: "Cloud Native Computing Foundation (CNCF)",
      date: "2022-09",
    },
  ],
  internships: [],
  awards: [],
  volunteering: [],
  publications: [],
  customSections: [],
  settings: {
    templateId: "technical",
    fontPreset: "clean",
    pageSize: "A4",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: ["basics", "summary", "skills", "projects", "experience", "education", "certifications"],
    hiddenSections: [],
  },
};

/**
 * 4. Multi-Page Experienced Resume
 * 10+ years background spanning multiple employers, large bullet sets, and guaranteed
 * 2-page pagination with clean page break controls.
 */
export const MULTIPAGE_EXPERIENCED_FIXTURE: ResumeDocument = {
  ...EXPERIENCED_FIXTURE,
  basics: {
    ...EXPERIENCED_FIXTURE.basics,
    name: "Dr. Evelyn Montgomery",
    headline: "Vice President of Engineering & Cloud Infrastructure",
    email: "evelyn.montgomery@example.com",
    phone: "+1 (555) 749-8102",
    location: "New York, NY",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/example-evelyn-montgomery" },
      { label: "Personal Site", url: "https://evelynmontgomery.example.com" },
    ],
  },
  summary:
    "Engineering executive with 15+ years of experience steering cloud transformations, enterprise security posture, and globally distributed engineering organizations of 120+ software and infrastructure engineers. Proven track record scaling architectures to $500M+ annual transaction volume.",
  experience: [
    {
      id: "exp-multi-1",
      employer: "Apex Financial Cloud (Fictional)",
      role: "VP of Engineering",
      location: "New York, NY",
      startDate: "2021-01",
      current: true,
      bullets: [
        "Lead an engineering organization of 120+ engineers across 12 distributed squads supporting 99.999% SLA clearinghouse infrastructure.",
        "Reduced annual cloud expenditure by $3.2M (28%) through reserved instance strategy, spot auto-scaling, and container packing optimizations.",
        "Spearheaded SOC2 Type II and ISO 27001 certifications across all platform microservices with zero critical audit findings.",
        "Introduced unified engineering leveling matrices and mentorship cohorts, increasing annual retention rate from 81% to 94%.",
      ],
    },
    {
      id: "exp-multi-2",
      employer: "Meridian Global Banking (Fictional)",
      role: "Director of Infrastructure Engineering",
      location: "New York, NY",
      startDate: "2017-03",
      endDate: "2020-12",
      bullets: [
        "Directed migration of 45 on-premises core banking applications to hybrid AWS/Google Cloud architecture across 18 months.",
        "Built automated compliance pipeline executing 3,000+ daily policy-as-code validations across Terraform repositories.",
        "Managed a $24M operational budget encompassing infrastructure vendors, cloud capacity, and engineering tooling.",
      ],
    },
    {
      id: "exp-multi-3",
      employer: "Strata Data Systems (Fictional)",
      role: "Staff Infrastructure Architect",
      location: "Boston, MA",
      startDate: "2013-05",
      endDate: "2017-02",
      bullets: [
        "Architected multi-tenant Kafka streaming clusters ingesting 15 billion events per day for credit scoring algorithms.",
        "Authored organizational RFCs establishing internal standards for gRPC API versioning and backward compatibility.",
        "Mentored 14 senior engineers across distributed systems fundamentals and technical leadership.",
      ],
    },
    {
      id: "exp-multi-4",
      employer: "Beacon Labs Technology (Fictional)",
      role: "Senior Software Engineer",
      location: "Boston, MA",
      startDate: "2009-08",
      endDate: "2013-04",
      bullets: [
        "Designed and maintained core relational schema and transaction queuing engine in PostgreSQL and C++.",
        "Refactored legacy SOAP payment gateway integrations into RESTful microservices, cutting failure rates by 65%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-multi-1",
      institution: "Massachusetts Institute of Technology (Fictional)",
      degree: "Ph.D.",
      field: "Computer Science — Distributed Systems",
      startDate: "2005-09",
      endDate: "2009-06",
      location: "Cambridge, MA",
    },
    {
      id: "edu-multi-2",
      institution: "Columbia University (Fictional)",
      degree: "B.S.",
      field: "Computer Engineering",
      startDate: "2001-09",
      endDate: "2005-05",
      location: "New York, NY",
      grade: "Summa Cum Laude",
    },
  ],
  projects: [
    {
      id: "proj-multi-1",
      name: "Enterprise Multi-Region Failover Architecture",
      bullets: [
        "Published whitepaper on active-active distributed transactional failover across trans-Atlantic cloud datacenters.",
        "Designed deterministic routing and split-brain resolution protocols adopted across 4 major financial products.",
      ],
      technologies: ["AWS", "Google Cloud", "Spanner", "CockroachDB", "Terraform"],
      url: "https://evelynmontgomery.example.com/publications/failover-whitepaper",
    },
  ],
  skills: [
    {
      id: "skill-multi-1",
      category: "Leadership & Strategy",
      items: ["Engineering Leadership", "Executive Strategy", "Talent Development", "Budgeting ($20M+)", "Regulatory Compliance"],
    },
    {
      id: "skill-multi-2",
      category: "Architecture & Cloud",
      items: ["AWS", "GCP", "Kubernetes", "Kafka", "Distributed Databases", "Zero-Trust Security", "Terraform"],
    },
  ],
  certifications: [
    {
      id: "cert-multi-1",
      name: "AWS Certified Solutions Architect — Professional",
      issuer: "Amazon Web Services",
      date: "2023-04",
    },
    {
      id: "cert-multi-2",
      name: "Certified Information Systems Security Professional (CISSP)",
      issuer: "ISC2",
      date: "2021-11",
    },
  ],
  settings: {
    templateId: "experienced",
    fontPreset: "clean",
    pageSize: "US_LETTER",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: [
      "basics",
      "summary",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
    ],
    hiddenSections: [],
  },
};

/**
 * 5. Modern Editorial with Unicode & International Characters
 * Tests non-ASCII candidate names, accented characters, special typographic punctuation
 * (em dashes, en dashes, curly quotes), international phone numbers, and non-ASCII cities.
 */
export const MODERN_EDITORIAL_UNICODE_FIXTURE: ResumeDocument = {
  schemaVersion: 1,
  basics: {
    name: "Renée Müller-Château",
    email: "renee.mueller.chateau@example.ch",
    phone: "+41 22 555 01 99",
    location: "Genève, Switzerland",
    headline: "Architecte Logiciel Principal — Systèmes Distribués & Cloud",
    links: [
      { label: "Portfolio", url: "https://renee-muller.example.ch" },
      { label: "LinkedIn", url: "https://linkedin.com/in/example-renee-mueller" },
    ],
  },
  summary:
    "Ingénieure principale avec 10 ans d’expérience dans la conception d’architectures résilientes, la conformité RGPD/FINMA et l’observabilité industrielle. Passionnée par l’ingénierie logicielle durable et les micro-services haute performance.",
  experience: [
    {
      id: "exp-uni-1",
      employer: "Banque Numérique Helvétique (Fictional)",
      role: "Architecte Logiciel Principal",
      location: "Zürich & Genève, Suisse",
      startDate: "2020-03",
      current: true,
      bullets: [
        "Conception de la plateforme transactionnelle traitant 15’000 opérations/sec avec latence P99 < 5ms.",
        "Intégration d’algorithmes cryptographiques conformes aux exigences FINMA & RGPD.",
        "Direction d’une équipe bilingue (français/allemand) de 15 ingénieurs logiciels seniors.",
      ],
    },
    {
      id: "exp-uni-2",
      employer: "Systèmes Électroniques Rhénans (Fictional)",
      role: "Ingénieure DevOps & Systèmes",
      location: "Bâle, Suisse",
      startDate: "2016-09",
      endDate: "2020-02",
      bullets: [
        "Déploiement de grappes Kubernetes souveraines avec chiffrement bout-en-bout des données bancaires.",
        "Réduction de l’empreinte carbone des serveurs de 30% grâce à l’optimisation des allocations de mémoire.",
      ],
    },
  ],
  education: [
    {
      id: "edu-uni-1",
      institution: "École Polytechnique Fédérale de Lausanne (EPFL)",
      degree: "Master ès Sciences",
      field: "Informatique & Systèmes de Communication",
      startDate: "2011-09",
      endDate: "2016-07",
      grade: "Mention Très Bien",
      location: "Lausanne, Suisse",
    },
  ],
  projects: [
    {
      id: "proj-uni-1",
      name: "protocole-résilience — Système de Consensus Léger",
      description: "Moteur de synchronisation d’états avec tolérance aux pannes byzantines partielles.",
      bullets: [
        "Implémentation conforme aux standards de sécurité bancaire européens.",
        "Tests de charge validés sur 50 nœuds répartis entre Zürich, Frankfurt et Paris.",
      ],
      technologies: ["Rust", "Tokio", "gRPC", "Protobuf", "Docker"],
      repoUrl: "https://github.com/example-renee/protocole-resilience",
    },
  ],
  skills: [
    {
      id: "skill-uni-1",
      category: "Langages & Systèmes",
      items: ["Rust", "Go", "TypeScript", "Python", "C++", "SQL"],
    },
    {
      id: "skill-uni-2",
      category: "Infrastructure & Sécurité",
      items: ["Kubernetes", "Docker", "Terraform", "Vault", "FINMA Compliance", "RGPD"],
    },
  ],
  certifications: [
    {
      id: "cert-uni-1",
      name: "Expert Sécurité Cloud Certifié (CCSP)",
      issuer: "ISC2 Suisse",
      date: "2022-06",
    },
  ],
  internships: [],
  awards: [],
  volunteering: [],
  publications: [],
  customSections: [],
  settings: {
    templateId: "modern-editorial",
    fontPreset: "editorial",
    pageSize: "A4",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: ["basics", "summary", "experience", "education", "projects", "skills", "certifications"],
    hiddenSections: [],
  },
};

/**
 * 6. Long URL & Long Content Overflow Fixture (RS-173)
 * Tests extreme URL lengths (>120 chars) and lengthy single bullets (>350 chars)
 * to verify correct line wrapping without horizontal overflow, text clipping or margin breach.
 */
export const LONG_URL_OVERFLOW_FIXTURE: ResumeDocument = {
  schemaVersion: 1,
  basics: {
    name: "Alexander Jonathan von Hohenzollern-Smythe",
    email: "alexander.von-hohenzollern-smythe.engineering@subdomain.enterprise-systems.example.org",
    phone: "+1 (555) 019-9834 ext 4821",
    location: "San Francisco Bay Area, CA",
    headline: "Senior Principal Distributed Systems Infrastructure & Reliability Research Architect",
    links: [
      {
        label: "Architecture Whitepaper Deep Dive Specification",
        url: "https://engineering.research-consortium.cloud-infrastructure.example.org/deep-dive/observability/telemetry-architecture-specification-v2-final.html?session=production-rfc-4921&tracking=verified-peer-review",
      },
      {
        label: "Monorepo Infrastructure Codebase",
        url: "https://github.com/enterprise-infrastructure-consortium-open-source/hyper-scale-telemetry-ebpf-kubernetes-service-mesh-core-daemon/tree/release/v4.12.0-rc3/cmd/ebpf-collector",
      },
    ],
  },
  summary:
    "Distinguished infrastructure architect with deep expertise diagnosing complex asynchronous race conditions, multi-datacenter network partitions, and cascading failure modes in distributed consensus rings processing petabyte-scale streaming workloads under rigorous 99.999% availability service level agreements.",
  experience: [
    {
      id: "exp-overflow-1",
      employer: "HyperScale Planetary Infrastructure Technologies Inc. (Fictional)",
      role: "Principal Reliability Engineer & Fellow",
      location: "San Francisco, CA",
      startDate: "2019-02",
      current: true,
      bullets: [
        "Architected and deployed a planetary-scale distributed consensus coordination mechanism utilizing Raft and Paxos hybrid state machines that seamlessly handled 4.2 million transactions per second across seven geographically dispersed availability zones during unexpected trans-oceanic fiber optic cable severances without sustaining any detectable data loss or linearizability anomalies.",
        "Refactored memory allocators and zero-copy ring buffers within the core Linux eBPF kernel packet inspection pipeline, resulting in an immediate 42% reduction in p99.9 tail latency and reclaiming over 1.4 gigawatts of aggregate compute power across thirty-two tier-four datacenter facilities.",
      ],
    },
  ],
  education: [
    {
      id: "edu-overflow-1",
      institution: "International Institute of Advanced Computer Systems & Mathematical Sciences (Fictional)",
      degree: "Master of Science in Distributed Computing & Cryptographic Protocols",
      field: "Distributed Systems & Applied Mathematics",
      startDate: "2013-09",
      endDate: "2015-06",
      location: "Palo Alto, CA",
    },
  ],
  projects: [
    {
      id: "proj-overflow-1",
      name: "hyper-mesh-planetary-transport-layer",
      description: "Asynchronous multi-protocol event mesh for high-frequency low-latency distributed database cluster synchronization.",
      bullets: [
        "Engineered zero-allocation serialization protocol operating over raw DPDK sockets with hardware offload support.",
      ],
      technologies: ["Rust", "eBPF", "DPDK", "C++20", "Tokio", "Kernel Bypass"],
      repoUrl: "https://github.com/enterprise-infrastructure-consortium-open-source/hyper-mesh-planetary-transport-layer",
      url: "https://hyper-mesh-docs.enterprise-systems.example.org/benchmarks/comparative-analysis/v3.0.0/report.pdf",
    },
  ],
  skills: [
    {
      id: "skill-overflow-1",
      category: "Systems & Architecture",
      items: ["Distributed Consensus", "Linux Kernel Internals", "eBPF Tracing", "DPDK", "Low-Latency Networking"],
    },
  ],
  internships: [],
  certifications: [],
  awards: [],
  volunteering: [],
  publications: [],
  customSections: [],
  settings: {
    templateId: "technical",
    fontPreset: "clean",
    pageSize: "A4",
    lineSpacing: 1.15,
    marginSize: "normal",
    sectionOrder: ["basics", "summary", "experience", "education", "projects", "skills"],
    hiddenSections: [],
  },
};

