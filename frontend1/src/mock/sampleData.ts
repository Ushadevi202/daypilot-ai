import { 
  Task, 
  Routine, 
  JobApplication, 
  EmailAlert, 
  AppNotification, 
  UserProfile, 
  DailyInsight 
} from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Alex Turner',
  firstName: 'Alex',
  lastName: 'Turner',
  phone: '+1 (555) 234-5678',
  bio: 'Senior Software Engineer specializing in scalable distributed microservices, Spring Boot, and reactive full-stack web applications.',
  location: 'New York, NY',
  email: 'alex.turner@example.com',
  avatarUrl: '', // Default empty so custom letter badge renders cleanly as requested
  targetRole: 'Senior Java & Full-Stack Engineer',
  timezone: 'America/New_York (EST)',
  weeklyGoalHours: 35,
  workDays: [1, 2, 3, 4, 5],
};

export const INITIAL_RESUMES = [
  {
    id: 'res-1',
    name: 'Alex_Turner_Senior_Java_FullStack_2026.pdf',
    sizeBytes: 248190, // ~242 KB
    uploadedAt: '2026-10-24 14:32',
    fileType: 'application/pdf',
    isActive: true,
    notes: 'Tailored for Distributed Systems & High-Scale Backend roles.',
  },
  {
    id: 'res-2',
    name: 'Alex_Turner_Software_Architect_Resume.pdf',
    sizeBytes: 312500, // ~305 KB
    uploadedAt: '2026-10-12 09:15',
    fileType: 'application/pdf',
    isActive: false,
    notes: 'System design, team leadership and cloud architecture focus.',
  },
];

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rt-1',
    title: 'Java DSA & Algorithms Practice',
    description: 'Solve 2 Medium LeetCode problems focussing on Dynamic Programming and Graphs.',
    category: 'learning',
    startTime: '07:30',
    endTime: '09:00',
    durationMinutes: 90,
    frequency: 'weekdays',
    daysOfWeek: [1, 2, 3, 4, 5],
    isActive: true,
    color: '#6366f1', // Indigo
    streakCount: 14,
    totalCompletions: 48,
  },
  {
    id: 'rt-2',
    title: 'SQL & DBMS Deep Dive',
    description: 'Indexing, query optimization, EXPLAIN ANALYZE, and ACID transaction isolation levels.',
    category: 'learning',
    startTime: '10:30',
    endTime: '11:45',
    durationMinutes: 75,
    frequency: 'weekdays',
    daysOfWeek: [1, 3, 5],
    isActive: true,
    color: '#0ea5e9', // Sky blue
    streakCount: 8,
    totalCompletions: 22,
  },
  {
    id: 'rt-3',
    title: 'Professional English & Tech Communication',
    description: 'Behavioral STAR storytelling rehearsal, mock architectural walkthroughs, and audio recording.',
    category: 'interview_prep',
    startTime: '13:30',
    endTime: '14:15',
    durationMinutes: 45,
    frequency: 'weekdays',
    daysOfWeek: [1, 2, 3, 4, 5],
    isActive: true,
    color: '#10b981', // Emerald
    streakCount: 19,
    totalCompletions: 54,
  },
  {
    id: 'rt-4',
    title: 'Spring Boot & Microservices Project Development',
    description: 'Build event-driven Kafka consumer, JWT authentication filter, and Redis caching tier.',
    category: 'development',
    startTime: '15:00',
    endTime: '17:00',
    durationMinutes: 120,
    frequency: 'daily',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    color: '#8b5cf6', // Violet
    streakCount: 21,
    totalCompletions: 62,
  },
  {
    id: 'rt-5',
    title: 'Daily Job Search & Targeted Outreach',
    description: 'Scan LinkedIn & Wellfound, tailor 3 resumes, and send 2 personalized cold emails to hiring managers.',
    category: 'job_search',
    startTime: '17:30',
    endTime: '18:30',
    durationMinutes: 60,
    frequency: 'weekdays',
    daysOfWeek: [1, 2, 3, 4, 5],
    isActive: true,
    color: '#f59e0b', // Amber
    streakCount: 11,
    totalCompletions: 39,
  },
  {
    id: 'rt-6',
    title: 'Cardio & Strength Training',
    description: '30-minute run followed by mobility and core workout.',
    category: 'personal',
    startTime: '18:45',
    endTime: '19:45',
    durationMinutes: 60,
    frequency: 'daily',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    color: '#ec4899', // Pink
    streakCount: 26,
    totalCompletions: 80,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-101',
    title: 'Prepare System Design Architecture for Example Tech Interview',
    description: 'Design a distributed rate limiter and URL shortener. Review Redis token bucket algorithm.',
    category: 'interview_prep',
    priority: 'high',
    dueDate: '2026-10-31',
    scheduledTime: '09:30',
    durationMinutes: 90,
    status: 'in_progress',
    notes: 'Reference Alex Xu Volume 1, Chapter 4. Emphasize multi-region replication.',
    relatedApplicationId: 'app-01',
    createdAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'tsk-102',
    title: 'Complete Atlassian 90-min Coding Assessment',
    description: 'HackerRank test on Concurrency & Thread Pool Executor in Java 21.',
    category: 'interview_prep',
    priority: 'high',
    dueDate: '2026-10-31',
    scheduledTime: '13:00',
    durationMinutes: 90,
    status: 'pending',
    notes: 'Access link from test invite email. Use quiet room with dual monitor.',
    relatedApplicationId: 'app-03',
    createdAt: '2026-10-29T10:15:00Z',
  },
  {
    id: 'tsk-103',
    title: 'Debug MySQL Deadlock in Spring Boot Order Service',
    description: 'Add repeatable read transaction testing in testcontainers and optimize select-for-update query.',
    category: 'development',
    priority: 'medium',
    dueDate: '2026-10-31',
    scheduledTime: '15:15',
    durationMinutes: 60,
    status: 'pending',
    notes: 'Occurs during simultaneous checkout operations.',
    createdAt: '2026-10-30T08:00:00Z',
  },
  {
    id: 'tsk-104',
    title: 'Follow up with Stripe Recruiter regarding onsite panel schedule',
    description: 'Email Sarah Jenkins to confirm team interview availability for next Thursday.',
    category: 'job_search',
    priority: 'medium',
    dueDate: '2026-10-31',
    scheduledTime: '16:30',
    durationMinutes: 20,
    status: 'pending',
    relatedApplicationId: 'app-02',
    createdAt: '2026-10-30T11:20:00Z',
  },
  {
    id: 'tsk-105',
    title: 'Review Java Memory Model & Garbage Collection Tuning',
    description: 'G1GC vs ZGC flags, generational hypothesis, heap dump analysis using Eclipse Memory Analyzer.',
    category: 'learning',
    priority: 'low',
    dueDate: '2026-10-31',
    scheduledTime: '17:00',
    durationMinutes: 45,
    status: 'pending',
    createdAt: '2026-10-29T16:00:00Z',
  },
  {
    id: 'tsk-106',
    title: 'Solve LeetCode #210 Course Schedule II (Topological Sort)',
    description: 'Daily routine problem. Implemented with Kahn’s BFS algorithm.',
    category: 'learning',
    priority: 'high',
    dueDate: '2026-10-31',
    scheduledTime: '07:45',
    durationMinutes: 45,
    status: 'completed',
    completedAt: '2026-10-31T08:35:00Z',
    isRoutineInstance: true,
    routineId: 'rt-1',
    createdAt: '2026-10-31T07:30:00Z',
  },
  {
    id: 'tsk-107',
    title: 'Submit Tailored Resume for Shopify Staff Backend Role',
    description: 'Customized bullets targeting Ruby to Java migration and Kafka pipelines.',
    category: 'job_search',
    priority: 'medium',
    dueDate: '2026-10-30',
    durationMinutes: 40,
    status: 'completed',
    completedAt: '2026-10-30T18:10:00Z',
    createdAt: '2026-10-30T14:00:00Z',
  },
  {
    id: 'tsk-108',
    title: 'Update Portfolio GitHub Readme with Architecture Diagrams',
    description: 'Render Mermaid.js diagrams for microservices communication.',
    category: 'development',
    priority: 'low',
    dueDate: '2026-10-29',
    durationMinutes: 45,
    status: 'postponed',
    postponedTo: '2026-11-02',
    notes: 'Postponed to prioritize interview preparation.',
    createdAt: '2026-10-28T12:00:00Z',
  },
  {
    id: 'tsk-109',
    title: 'Review Datadog Offer Letter & Benefits Packet',
    description: 'Compare equity vesting schedule and base salary against current market benchmarks.',
    category: 'job_search',
    priority: 'high',
    dueDate: '2026-10-30',
    scheduledTime: '11:00',
    durationMinutes: 50,
    status: 'completed',
    completedAt: '2026-10-30T12:00:00Z',
    relatedApplicationId: 'app-06',
    createdAt: '2026-10-29T19:00:00Z',
  },
  {
    id: 'tsk-110',
    title: 'Mock Behavioral Interview Practice with Peer',
    description: 'STAR questions on handling tight deadlines and conflict resolution.',
    category: 'interview_prep',
    priority: 'medium',
    dueDate: '2026-10-29',
    durationMinutes: 60,
    status: 'completed',
    completedAt: '2026-10-29T15:30:00Z',
    createdAt: '2026-10-28T10:00:00Z',
  }
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-01',
    companyName: 'Example Technologies',
    jobTitle: 'Senior Java Backend Engineer',
    jobPostingUrl: 'https://careers.exampletech.io/jobs/senior-java-engineer-882',
    location: 'San Francisco, CA',
    locationType: 'hybrid',
    applicationDate: '2026-10-22',
    source: 'LinkedIn Referral',
    employmentType: 'full_time',
    resumeVersion: 'v4.2-Java-Cloud-Architecture',
    salaryRange: '$175,000 - $205,000 + Equity',
    recruiterName: 'Elena Rostova',
    recruiterEmail: 'elena.r@exampletech.io',
    recruiterPhone: '+1 (415) 555-0192',
    notes: 'High-growth fintech unicorn. Team is rewriting Python legacy services into Spring Boot 3 & Virtual Threads.',
    currentStatus: 'interview',
    nextAction: 'Round 1 Technical Architecture Interview on Oct 31 at 11:00 AM',
    followUpDate: '2026-10-31',
    interviewsCount: 1,
    assessmentsCount: 1,
    updatedAt: '2026-10-30T10:00:00Z',
    timeline: [
      {
        id: 'ev-1',
        date: '2026-10-22',
        title: 'Application Submitted',
        description: 'Submitted application via employee referral link with resume v4.2.',
        type: 'applied',
      },
      {
        id: 'ev-2',
        date: '2026-10-24',
        title: 'Recruiter Screening Call',
        description: '30-minute intro call with Elena. Discussed salary band and notice period.',
        type: 'interview',
        roundNumber: 0,
      },
      {
        id: 'ev-3',
        date: '2026-10-26',
        title: 'Take-home System Design Assessment Completed',
        description: 'Submitted design doc for high-throughput distributed transaction processor.',
        type: 'assessment',
      },
      {
        id: 'ev-4',
        date: '2026-10-30',
        title: 'Technical Round 1 Scheduled',
        description: 'Upcoming 60-min interview with Principal Architect Marcus Vance.',
        type: 'interview',
        roundNumber: 1,
      }
    ],
  },
  {
    id: 'app-02',
    companyName: 'Stripe',
    jobTitle: 'Software Engineer, Payment Infrastructure',
    jobPostingUrl: 'https://stripe.com/jobs/infra-swe-2026',
    location: 'New York, NY',
    locationType: 'hybrid',
    applicationDate: '2026-10-14',
    source: 'Company Careers Page',
    employmentType: 'full_time',
    resumeVersion: 'v4.1-Distributed-Systems',
    salaryRange: '$190,000 - $225,000 + RSUs',
    recruiterName: 'Sarah Jenkins',
    recruiterEmail: 'sjenkins@stripe.com',
    notes: 'Focus on 99.999% availability, idempotent APIs, and transaction settlement engines.',
    currentStatus: 'interview',
    nextAction: 'Onsite Loop (4 rounds) scheduled for Nov 04',
    followUpDate: '2026-11-01',
    interviewsCount: 2,
    assessmentsCount: 0,
    updatedAt: '2026-10-29T14:30:00Z',
    timeline: [
      {
        id: 'ev-201',
        date: '2026-10-14',
        title: 'Application Submitted',
        description: 'Direct submission via Stripe careers portal.',
        type: 'applied',
      },
      {
        id: 'ev-202',
        date: '2026-10-18',
        title: 'Initial Screening Call',
        description: 'Recruiter screening with Sarah. Very positive feedback on distributed systems experience.',
        type: 'interview',
        roundNumber: 0,
      },
      {
        id: 'ev-203',
        date: '2026-10-25',
        title: 'Technical Screen Passed',
        description: 'Live coding on rate limiting data structures. Feedback was strong hire.',
        type: 'interview',
        roundNumber: 1,
      }
    ],
  },
  {
    id: 'app-03',
    companyName: 'Atlassian',
    jobTitle: 'Backend Platform Engineer (Jira Core)',
    jobPostingUrl: 'https://atlassian.com/careers/backend-platform',
    location: 'Remote, US',
    locationType: 'remote',
    applicationDate: '2026-10-27',
    source: 'LinkedIn Easy Apply',
    employmentType: 'full_time',
    resumeVersion: 'v4.2-Java-Cloud-Architecture',
    salaryRange: '$165,000 - $190,000',
    recruiterName: 'David Chen',
    recruiterEmail: 'dchen@atlassian.com',
    notes: 'Migrating Jira enterprise tenants to multitenant AWS microservices architecture.',
    currentStatus: 'assessment',
    nextAction: 'Complete HackerRank assessment by Oct 31, 11:59 PM',
    followUpDate: '2026-10-31',
    interviewsCount: 0,
    assessmentsCount: 1,
    updatedAt: '2026-10-29T11:00:00Z',
    timeline: [
      {
        id: 'ev-301',
        date: '2026-10-27',
        title: 'Application Submitted',
        type: 'applied',
      },
      {
        id: 'ev-302',
        date: '2026-10-28',
        title: 'Application Acknowledged',
        type: 'acknowledgment',
      },
      {
        id: 'ev-303',
        date: '2026-10-29',
        title: 'Online Assessment Received',
        description: 'HackerRank 90-minute timed algorithm and concurrency challenge.',
        type: 'assessment',
      }
    ],
  },
  {
    id: 'app-04',
    companyName: 'Microsoft',
    jobTitle: 'Software Engineer II — Azure Core Data',
    jobPostingUrl: 'https://careers.microsoft.com/us/en/job/1892831',
    location: 'Redmond, WA',
    locationType: 'hybrid',
    applicationDate: '2026-10-26',
    source: 'Employee Referral',
    employmentType: 'full_time',
    resumeVersion: 'v4.0-Cloud',
    salaryRange: '$170,000 - $195,000',
    notes: 'Distributed storage layer for Azure Cosmos DB.',
    currentStatus: 'applied',
    nextAction: 'Awaiting recruiter review',
    followUpDate: '2026-11-03',
    interviewsCount: 0,
    assessmentsCount: 0,
    updatedAt: '2026-10-26T16:00:00Z',
    timeline: [
      {
        id: 'ev-401',
        date: '2026-10-26',
        title: 'Application Submitted',
        type: 'applied',
      }
    ],
  },
  {
    id: 'app-05',
    companyName: 'Amazon Web Services',
    jobTitle: 'Software Development Engineer II (DynamoDB)',
    jobPostingUrl: 'https://amazon.jobs/en/jobs/2499182',
    location: 'Seattle, WA',
    locationType: 'onsite',
    applicationDate: '2026-10-10',
    source: 'Recruiter InMail',
    employmentType: 'full_time',
    resumeVersion: 'v4.1-Distributed-Systems',
    salaryRange: '$180,000 - $215,000',
    recruiterName: 'Priya Sharma',
    recruiterEmail: 'priyash@amazon.com',
    notes: 'Passed OA1 and OA2. Recruiter reviewing schedules for virtual loop.',
    currentStatus: 'assessment',
    nextAction: 'Check in with Priya if no update by Nov 2',
    followUpDate: '2026-11-02',
    interviewsCount: 0,
    assessmentsCount: 2,
    updatedAt: '2026-10-28T09:15:00Z',
    timeline: [
      {
        id: 'ev-501',
        date: '2026-10-10',
        title: 'Application Submitted',
        type: 'applied',
      },
      {
        id: 'ev-502',
        date: '2026-10-15',
        title: 'Online Assessment 1 (Debugging & Logic) Passed',
        type: 'assessment',
      },
      {
        id: 'ev-503',
        date: '2026-10-24',
        title: 'Online Assessment 2 (Work Style Simulation) Completed',
        type: 'assessment',
      }
    ],
  },
  {
    id: 'app-06',
    companyName: 'Datadog',
    jobTitle: 'Senior Backend Engineer, APM Tracing',
    jobPostingUrl: 'https://datadoghq.com/careers/apm-backend-sr',
    location: 'New York, NY',
    locationType: 'hybrid',
    applicationDate: '2026-09-28',
    source: 'Referral',
    employmentType: 'full_time',
    resumeVersion: 'v4.2-Java-Cloud-Architecture',
    salaryRange: '$195,000 Base + 40,000 RSUs/yr',
    recruiterName: 'Marc Miller',
    recruiterEmail: 'mmiller@datadoghq.com',
    notes: 'Received official offer! Super impressed by team culture and technical depth.',
    currentStatus: 'selected',
    nextAction: 'Offer decision deadline: November 06',
    followUpDate: '2026-11-05',
    interviewsCount: 4,
    assessmentsCount: 1,
    updatedAt: '2026-10-29T18:00:00Z',
    timeline: [
      {
        id: 'ev-601',
        date: '2026-09-28',
        title: 'Application Submitted',
        type: 'applied',
      },
      {
        id: 'ev-602',
        date: '2026-10-05',
        title: 'Initial Recruiter Chat',
        type: 'interview',
        roundNumber: 0,
      },
      {
        id: 'ev-603',
        date: '2026-10-12',
        title: 'Technical Screen (Live Coding)',
        type: 'interview',
        roundNumber: 1,
      },
      {
        id: 'ev-604',
        date: '2026-10-20',
        title: 'Virtual Onsite Loop (4 rounds)',
        type: 'interview',
        roundNumber: 2,
      },
      {
        id: 'ev-605',
        date: '2026-10-28',
        title: 'Official Offer Extended!',
        description: 'Base $195k, 160k equity over 4 years, $25k sign-on bonus.',
        type: 'offer',
      }
    ],
  },
  {
    id: 'app-07',
    companyName: 'Meta',
    jobTitle: 'Software Engineer, Infra Core Systems',
    jobPostingUrl: 'https://metacareers.com/jobs/8291039',
    location: 'Menlo Park, CA',
    locationType: 'onsite',
    applicationDate: '2026-09-15',
    source: 'Careers Site',
    employmentType: 'full_time',
    resumeVersion: 'v3.9',
    salaryRange: '$185,000 - $210,000',
    notes: 'Position closed due to organizational headcount reallocation.',
    currentStatus: 'rejected',
    nextAction: 'Re-apply permitted after 6 months (April 2027)',
    interviewsCount: 1,
    assessmentsCount: 1,
    updatedAt: '2026-10-18T10:00:00Z',
    timeline: [
      {
        id: 'ev-701',
        date: '2026-09-15',
        title: 'Application Submitted',
        type: 'applied',
      },
      {
        id: 'ev-702',
        date: '2026-09-25',
        title: 'Technical Screening',
        type: 'interview',
        roundNumber: 1,
      },
      {
        id: 'ev-703',
        date: '2026-10-18',
        title: 'Rejection Email Received',
        description: 'Headcount froze for the team; encouraged to stay in touch.',
        type: 'rejection',
      }
    ],
  },
  {
    id: 'app-08',
    companyName: 'Netflix',
    jobTitle: 'Senior Platform Engineer, Content Delivery',
    jobPostingUrl: 'https://jobs.netflix.com/jobs/381923',
    location: 'Los Gatos, CA',
    locationType: 'remote',
    applicationDate: '2026-10-20',
    source: 'LinkedIn',
    employmentType: 'full_time',
    resumeVersion: 'v4.2-Java-Cloud-Architecture',
    salaryRange: '$220,000 - $260,000 All-Cash',
    notes: 'High standards for autonomous ownership and freedom/responsibility.',
    currentStatus: 'interested',
    nextAction: 'Submit formal application after updating resume project highlights',
    followUpDate: '2026-11-01',
    interviewsCount: 0,
    assessmentsCount: 0,
    updatedAt: '2026-10-20T12:00:00Z',
    timeline: [
      {
        id: 'ev-801',
        date: '2026-10-20',
        title: 'Role Bookmarked',
        description: 'Found interesting opening on content routing infrastructure.',
        type: 'note',
      }
    ],
  }
];

export const INITIAL_EMAIL_ALERTS: EmailAlert[] = [
  {
    id: 'em-101',
    senderName: 'Elena Rostova (Example Technologies)',
    senderEmail: 'recruiting@exampletech.io',
    subject: 'Interview Invitation: Round 1 Technical Architecture — Example Technologies',
    receivedDate: '2026-10-30 08:42',
    snippet: 'Hi Alex, we were thoroughly impressed with your system design assessment! We would love to invite you for a 60-minute technical session with Marcus Vance...',
    body: `Hi Alex,

We were thoroughly impressed with your system design assessment! The team was particularly fond of how you addressed distributed rate-limiting and failover replicas.

We would love to invite you for a 60-minute technical architecture session with Marcus Vance (Principal Architect).

Date: Friday, October 31, 2026
Time: 11:00 AM – 12:00 PM EST
Format: Google Meet (Video Call)

Please confirm if this time works for you, or let us know alternative slots. Looking forward to speaking!

Warm regards,
Elena Rostova
Talent Acquisition Partner, Example Technologies`,
    companyDetected: 'Example Technologies',
    roleDetected: 'Senior Java Backend Engineer',
    category: 'interview_invite',
    aiConfidence: 98,
    matchedApplicationId: 'app-01',
    suggestedAction: {
      targetStatus: 'interview',
      eventTitle: 'Technical Architecture Round with Marcus Vance',
      eventDate: '2026-10-31',
      eventTime: '11:00',
      createPrepTask: true,
      prepTaskTitle: 'Finalize Distributed Rate Limiter review for Example Tech interview',
      syncCalendar: true,
      description: 'Update application status to Interview, record interview event on timeline, and generate prep task.',
    },
    reviewStatus: 'pending',
  },
  {
    id: 'em-102',
    senderName: 'Atlassian Recruiting',
    senderEmail: 'evaluations@atlassian.com',
    subject: 'Your Atlassian Coding Assessment is Ready (Jira Core Team)',
    receivedDate: '2026-10-29 11:15',
    snippet: 'Hi Alex, thank you for your interest in the Backend Platform Engineer position. Please complete your 90-minute HackerRank assessment within 48 hours...',
    body: `Hello Alex,

Thank you for applying to the Backend Platform Engineer (Jira Core) role at Atlassian!

As the next step in our process, please complete the online technical evaluation hosted on HackerRank.
- Duration: 90 Minutes
- Focus: Concurrency, data structures, and clean Java coding
- Deadline: Saturday, October 31, 2026, 11:59 PM EST

Best of luck!
The Atlassian Talent Team`,
    companyDetected: 'Atlassian',
    roleDetected: 'Backend Platform Engineer (Jira Core)',
    category: 'assessment_invite',
    aiConfidence: 96,
    matchedApplicationId: 'app-03',
    suggestedAction: {
      targetStatus: 'assessment',
      eventTitle: 'Atlassian HackerRank Assessment Deadline',
      eventDate: '2026-10-31',
      eventTime: '23:59',
      createPrepTask: true,
      prepTaskTitle: 'Complete Atlassian 90-min Coding Assessment',
      syncCalendar: true,
      description: 'Ensure assessment deadline is logged and preparation task is prioritized in My Day.',
    },
    reviewStatus: 'pending',
  },
  {
    id: 'em-103',
    senderName: 'Datadog People Operations',
    senderEmail: 'offers@datadoghq.com',
    subject: 'Congratulations! Formal Offer Letter — Datadog Senior Backend Engineer',
    receivedDate: '2026-10-28 17:30',
    snippet: 'Dear Alex, on behalf of Datadog, we are thrilled to offer you the position of Senior Backend Engineer on the APM Tracing team...',
    body: `Dear Alex,

On behalf of Datadog, we are thrilled to present our offer for the Senior Backend Engineer, APM Tracing position!

Key Highlights:
- Annual Base Salary: $195,000 USD
- Equity Grant: $160,000 USD over 4 years
- Sign-on Bonus: $25,000 USD
- Start Date: December 01, 2026

Please review the attached formal document via DocuSign. We request your decision by Thursday, November 06, 2026.

Congratulations again!
Datadog People Team`,
    companyDetected: 'Datadog',
    roleDetected: 'Senior Backend Engineer, APM Tracing',
    category: 'selection_offer',
    aiConfidence: 99,
    matchedApplicationId: 'app-06',
    suggestedAction: {
      targetStatus: 'selected',
      eventTitle: 'Datadog Offer Extended',
      eventDate: '2026-10-28',
      description: 'Mark Datadog application as Selected / Offer and set decision deadline to Nov 06.',
    },
    reviewStatus: 'approved',
  },
  {
    id: 'em-104',
    senderName: 'Microsoft Global Talent Acquisition',
    senderEmail: 'careers@microsoft.com',
    subject: 'Thank you for your application to Microsoft (Req #1892831)',
    receivedDate: '2026-10-26 16:05',
    snippet: 'Hi Alex, we have received your application for Software Engineer II — Azure Core Data. Our recruitment team is currently reviewing your profile...',
    body: `Hello Alex,

Thank you for your interest in joining Microsoft! We have successfully received your application for:
Position: Software Engineer II — Azure Core Data
Job ID: 1892831

Our talent acquisition specialists review candidates on a rolling basis. You can monitor your application status anytime at your Microsoft Action Center.

Kind regards,
Microsoft Global Talent Acquisition`,
    companyDetected: 'Microsoft',
    roleDetected: 'Software Engineer II — Azure Core Data',
    category: 'acknowledgment',
    aiConfidence: 94,
    matchedApplicationId: 'app-04',
    suggestedAction: {
      targetStatus: 'applied',
      eventTitle: 'Application Acknowledged by Microsoft',
      eventDate: '2026-10-26',
      description: 'Record acknowledgment in application timeline and set reminder for 7-day follow-up.',
    },
    reviewStatus: 'approved',
  },
  {
    id: 'em-105',
    senderName: 'Meta Careers Team',
    senderEmail: 'noreply@metacareers.com',
    subject: 'Update on your Software Engineer candidacy at Meta',
    receivedDate: '2026-10-18 09:45',
    snippet: 'Hi Alex, thank you for taking the time to interview with us. While our engineers were impressed with your technical acumen, we have decided not to move forward...',
    body: `Hi Alex,

Thank you for speaking with our team regarding the Software Engineer, Infra Core Systems position.

While our engineering interviewers were impressed with your background in high-concurrency systems, we have made the difficult decision not to move forward due to organizational shifts in team headcount.

We would love to stay in touch for future opportunities as new requisitions open up.

Best wishes in your search,
Meta Recruiting`,
    companyDetected: 'Meta',
    roleDetected: 'Software Engineer, Infra Core Systems',
    category: 'rejection',
    aiConfidence: 97,
    matchedApplicationId: 'app-07',
    suggestedAction: {
      targetStatus: 'rejected',
      eventTitle: 'Rejection Notification Received',
      eventDate: '2026-10-18',
      description: 'Update Meta application status to Rejected and note cooldown period until April 2027.',
    },
    reviewStatus: 'approved',
  },
  {
    id: 'em-106',
    senderName: 'Liam O’Connor (Apex Systems Staffing)',
    senderEmail: 'loconnor@apexsystems.com',
    subject: 'Urgent: Java Microservices Architect role ($95/hr W2 / Contract-to-Hire)',
    receivedDate: '2026-10-30 06:12',
    snippet: 'Hi Alex, came across your profile and your distributed systems work. A Fortune 50 banking client in Charlotte/Remote has an immediate opening for a Java 21 Architect...',
    body: `Hi Alex,

I saw your impressive background building Spring Boot microservices and Kafka streaming architectures. 

My client, a major financial institution, has an urgent requirement for a Java Microservices Architect. 
- Rate: $90 - $100/hr W2 / C2H
- Stack: Java 21, Spring Boot 3, AWS EKS, Kafka, MySQL
- Term: 12-month contract with direct full-time conversion option

Are you available for a brief 10-minute sync this morning or afternoon?

Best,
Liam O’Connor
Senior Technical Recruiter | Apex Systems`,
    companyDetected: 'Apex Systems / Financial Client',
    roleDetected: 'Java Microservices Architect',
    category: 'unmatched',
    aiConfidence: 78,
    suggestedAction: {
      eventTitle: 'Recruiter Outreach from Apex Systems',
      description: 'Unmatched cold outreach. Create new application or match with existing pipeline.',
    },
    reviewStatus: 'pending',
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Interview Tomorrow: Example Technologies',
    message: 'Technical Architecture Round with Marcus Vance at 11:00 AM EST.',
    type: 'interview',
    timestamp: '10 minutes ago',
    read: false,
    relatedEntityType: 'application',
    relatedEntityId: 'app-01',
  },
  {
    id: 'notif-2',
    title: 'Assessment Deadline Approaching',
    message: 'Atlassian 90-min HackerRank challenge must be submitted by Oct 31, 11:59 PM.',
    type: 'assessment',
    timestamp: '1 hour ago',
    read: false,
    relatedEntityType: 'application',
    relatedEntityId: 'app-03',
  },
  {
    id: 'notif-3',
    title: 'New AI Email Detection',
    message: 'Detected interview invitation from Example Technologies. Ready for review.',
    type: 'email_alert',
    timestamp: '2 hours ago',
    read: false,
    relatedEntityType: 'email',
    relatedEntityId: 'em-101',
  },
  {
    id: 'notif-4',
    title: 'Routine Completed: Java DSA',
    message: 'Great streak! You have completed Java DSA practice 14 days in a row.',
    type: 'task_due',
    timestamp: '4 hours ago',
    read: true,
  },
  {
    id: 'notif-5',
    title: 'Offer Decision Reminder',
    message: 'Datadog offer decision deadline is in 6 days (Nov 06).',
    type: 'followup',
    timestamp: 'Yesterday',
    read: true,
    relatedEntityType: 'application',
    relatedEntityId: 'app-06',
  }
];

export const INITIAL_INSIGHTS: DailyInsight[] = [
  {
    id: 'ins-1',
    type: 'priority',
    title: 'High-Impact Interview Alignment',
    description: 'You have your Technical Round with Example Technologies tomorrow at 11:00 AM. 90 minutes of dedicated preparation on Distributed Rate Limiting is recommended before 6:00 PM.',
    actionText: 'Open Prep Task',
    actionPayload: { taskId: 'tsk-101' },
  },
  {
    id: 'ins-2',
    type: 'deadline',
    title: 'Atlassian Assessment Window',
    description: 'Atlassian HackerRank test closes in 28 hours. The best performance slot is your 13:00 scheduled block today after lunch.',
    actionText: 'View Assessment',
    actionPayload: { applicationId: 'app-03' },
  },
  {
    id: 'ins-3',
    type: 'routine_warning',
    title: 'Routine Consistency at 88%',
    description: 'You are on track with Java DSA and Spring Boot development. English speaking practice was skipped yesterday—rescheduling for 13:30 today keeps your 19-day streak intact.',
  },
  {
    id: 'ins-4',
    type: 'tip',
    title: 'Email Assistant Action Required',
    description: '1 high-confidence interview invitation is waiting for one-click approval. Approving it will auto-populate your calendar and create your interview prep checklist.',
    actionText: 'Review Email Alert',
    actionPayload: { emailId: 'em-101' },
  }
];
