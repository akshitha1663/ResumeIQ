package com.resumeiq.backend.config;

import com.resumeiq.backend.model.Job;
import com.resumeiq.backend.model.Role;
import com.resumeiq.backend.model.TargetRole;
import com.resumeiq.backend.model.User;
import com.resumeiq.backend.repository.JobRepository;
import com.resumeiq.backend.repository.TargetRoleRepository;
import com.resumeiq.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Value("${admin.seed.email:}")
    private String seedEmail;

    @Value("${admin.seed.password:}")
    private String seedPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TargetRoleRepository targetRoleRepository;
    private final JobRepository jobRepository;

    public DataSeeder(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      TargetRoleRepository targetRoleRepository,
                      JobRepository jobRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.targetRoleRepository = targetRoleRepository;
        this.jobRepository = jobRepository;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedTargetRoles();
        seedStarterJobs();
    }

    private void seedAdminUser() {
        if (seedEmail == null || seedEmail.isBlank()
                || seedPassword == null || seedPassword.isBlank()) {
            return;
        }

        String email = seedEmail.trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = new User();
        admin.setName("Admin");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(seedPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        System.out.println("[ResumeIQ] Admin account seeded for: " + email);
    }

    private void seedTargetRoles() {
        if (targetRoleRepository.count() > 0) {
            return;
        }

        List<TargetRole> roles = List.of(
            new TargetRole(
                "Java Developer",
                "Software Engineering",
                "Designs and builds server-side enterprise applications, microservices, and robust REST APIs using Java and modern frameworks.",
                "Java, Spring Boot, Hibernate, MySQL, REST API, Git, Maven, Microservices, JUnit",
                "Docker, AWS, Redis, Kafka",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "Full Stack Developer",
                "Software Engineering",
                "Builds end-to-end web applications covering interactive frontends, scalable backend services, and database management.",
                "React, JavaScript, TypeScript, Node.js, Spring Boot, Java, HTML, CSS, SQL, Git",
                "Docker, AWS, Tailwind, GraphQL, MongoDB",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "Frontend Developer",
                "Software Engineering",
                "Specializes in client-side architectures, creating responsive, accessible, high-performance web user interfaces.",
                "React, JavaScript, TypeScript, HTML, CSS, Redux, Tailwind, Vite, REST API",
                "Next.js, Jest, UI/UX, Webpack",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "Backend Developer",
                "Software Engineering",
                "Develops core server logic, data architecture, security layer, and API infrastructure for high-scale applications.",
                "Java, Spring Boot, Python, SQL, PostgreSQL, Docker, Microservices, Git",
                "Redis, Kafka, Kubernetes, CI/CD, AWS",
                "Mid Level"
            ),
            new TargetRole(
                "Python Developer",
                "Software Engineering",
                "Constructs backend systems, automated workflows, and data pipelines using the Python language ecosystem.",
                "Python, Django, Flask, FastAPI, SQL, PostgreSQL, REST API, Git, Docker",
                "Celery, Redis, Pandas, AWS, Linux",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "Data Analyst",
                "Data & Analytics",
                "Transforms raw data into actionable business intelligence through statistical querying, visualization, and reporting.",
                "SQL, Python, Excel, Tableau, Power BI, Pandas, Data Analysis, Statistics",
                "R, Snowflake, BigQuery, ETL",
                "Entry Level"
            ),
            new TargetRole(
                "Data Scientist",
                "Data & Analytics",
                "Applies predictive modeling, machine learning, and statistical algorithms to solve complex business problems.",
                "Python, Machine Learning, Scikit-learn, Pandas, NumPy, Deep Learning, SQL, Statistics",
                "PyTorch, TensorFlow, NLP, Spark, AWS",
                "Mid Level / Senior"
            ),
            new TargetRole(
                "AI/ML Engineer",
                "Artificial Intelligence",
                "Builds, fine-tunes, and deploys scalable machine learning models and generative AI systems into production.",
                "Python, PyTorch, TensorFlow, Machine Learning, Deep Learning, NLP, Docker, API, Git",
                "LangChain, Hugging Face, Kubernetes, MLOps, CUDA",
                "Mid Level"
            ),
            new TargetRole(
                "Software Tester/QA Engineer",
                "Quality Assurance",
                "Ensures software quality, reliability, and performance through automated testing frameworks and thorough QA processes.",
                "Selenium, JUnit, TestNG, Java, Python, Manual Testing, Postman, API, Agile, Jira",
                "Cypress, JMeter, CI/CD, Cucumber",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "DevOps Engineer",
                "Infrastructure & Cloud",
                "Bridges software development and IT operations through continuous integration, automated deployment pipelines, and cloud management.",
                "Docker, Kubernetes, AWS, Linux, CI/CD, Jenkins, Terraform, Git, Bash",
                "Ansible, Prometheus, Grafana, GCP, Azure",
                "Mid Level"
            ),
            new TargetRole(
                "Cybersecurity Analyst",
                "Security",
                "Monitors, detects, and investigates digital security threats while hardening networks and cloud environments.",
                "Linux, Networking, Information Security, Python, Vulnerability Assessment, SIEM, Firewalls",
                "Wireshark, Cryptography, CISSP, AWS Security",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "Cloud Engineer",
                "Infrastructure & Cloud",
                "Architects, maintains, and secures enterprise cloud computing solutions across major public cloud providers.",
                "AWS, Azure, Docker, Kubernetes, Linux, Terraform, Networking, Cloud Architecture",
                "GCP, Python, Serverless, IAM",
                "Mid Level"
            ),
            new TargetRole(
                "UI/UX Designer",
                "Design",
                "Designs intuitive, beautiful, and user-centric interfaces, interactive prototypes, and scalable design systems.",
                "Figma, UI/UX, Wireframing, Prototyping, User Research, HTML, CSS, Design Systems",
                "Adobe XD, Usability Testing, Information Architecture",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "Mobile App Developer",
                "Mobile Engineering",
                "Creates high-performance native or cross-platform mobile experiences for iOS and Android devices.",
                "Flutter, React Native, Swift, Kotlin, Dart, Mobile UI, REST API, Git",
                "Firebase, State Management, App Store Deployment",
                "Entry Level / Mid Level"
            ),
            new TargetRole(
                "Database Administrator",
                "Database & Infrastructure",
                "Manages database integrity, performance tuning, high-availability backups, and enterprise storage architectures.",
                "MySQL, PostgreSQL, Oracle, SQL, Database Administration, Performance Tuning, Linux",
                "Replication, Sharding, MongoDB, Redis",
                "Mid Level / Senior"
            )
        );

        targetRoleRepository.saveAll(roles);
        System.out.println("[ResumeIQ] Seeded " + roles.size() + " industry target roles.");
    }

    private void seedStarterJobs() {
        List<Job> existing = jobRepository.findAll();
        boolean updated = false;
        for (Job j : existing) {
            if (!j.isActive()) {
                j.setActive(true);
                updated = true;
            }
            if (j.getWorkMode() == null || j.getWorkMode().isBlank()) {
                j.setWorkMode("Remote");
                updated = true;
            }
        }
        if (updated) {
            jobRepository.saveAll(existing);
            System.out.println("[ResumeIQ] Activated " + existing.size() + " existing jobs.");
        }

        if (existing.size() >= 5) {
            return;
        }

        List<Job> jobs = List.of(
            new Job(
                "Junior Java Backend Developer",
                "Nexus FinTech Solutions",
                "Bengaluru, India",
                "Full-time",
                "Hybrid",
                "Entry Level",
                "₹6,50,000 - ₹9,00,000 / yr",
                "Java, Spring Boot, MySQL, REST API, Git, JUnit",
                "We are seeking an enthusiastic Junior Java Developer to join our core banking transactions team. You will write clean, well-tested code, design REST endpoints, and participate in code reviews.",
                "https://nexusfintech.example.com/careers/java-jr"
            ),
            new Job(
                "React Frontend Engineer",
                "Nova Cloud Technologies",
                "Remote, India",
                "Full-time",
                "Remote",
                "Mid Level",
                "₹12,00,000 - ₹16,00,000 / yr",
                "React, TypeScript, JavaScript, HTML, CSS, Tailwind, REST API, Vite",
                "Join our SaaS platform team building real-time collaboration tools. Strong experience with modern React, custom hooks, state management, and responsive CSS required.",
                "https://novacloud.example.com/jobs/react-engineer"
            ),
            new Job(
                "Full Stack Web Developer",
                "Aero Digital Innovations",
                "Hyderabad, India",
                "Full-time",
                "Hybrid",
                "Mid Level",
                "₹10,00,000 - ₹14,50,000 / yr",
                "Java, Spring Boot, React, JavaScript, MySQL, Git, Docker",
                "Help us develop innovative logistics and fleet tracking applications. You will work across both our React web app and our high-throughput Spring Boot microservices.",
                "https://aerodigital.example.com/apply/fullstack"
            ),
            new Job(
                "Software Engineering Intern",
                "InnoSphere Labs",
                "Remote, Global",
                "Internship",
                "Remote",
                "Entry Level",
                "₹25,000 - ₹40,000 / mo",
                "Java, Python, JavaScript, HTML, CSS, Git, SQL",
                "A 6-month hands-on paid internship for aspiring engineers. Mentorship provided by senior architects. Work on real features shipped directly to production.",
                "https://innosphere.example.com/internships/software"
            ),
            new Job(
                "Python & AI Backend Developer",
                "Cognitive Matrix Systems",
                "Pune, India",
                "Full-time",
                "On-site",
                "Mid Level",
                "₹14,00,000 - ₹18,00,000 / yr",
                "Python, FastAPI, Machine Learning, PostgreSQL, Docker, Git, REST API",
                "Build AI-powered analytics pipelines and microservices integrating LLM APIs and predictive models. Solid understanding of asynchronous Python and relational databases needed.",
                "https://cogmatrix.example.com/careers/ai-backend"
            ),
            new Job(
                "DevOps & Cloud Engineer",
                "CloudScale Networks",
                "Bengaluru, India",
                "Contract",
                "Remote",
                "Mid Level",
                "₹15,00,000 - ₹20,00,000 / yr",
                "Docker, Kubernetes, AWS, Linux, CI/CD, Jenkins, Terraform, Git",
                "6-month renewable contract to optimize our multi-region AWS Kubernetes clusters, automate deployment pipelines, and enhance zero-downtime release automation.",
                "https://cloudscale.example.com/jobs/devops-contract"
            ),
            new Job(
                "QA Automation Engineer",
                "SecurePay Gateway",
                "Chennai, India",
                "Full-time",
                "Hybrid",
                "Mid Level",
                "₹8,00,000 - ₹12,00,000 / yr",
                "Selenium, Java, TestNG, Postman, API, JUnit, Git, Agile",
                "Design and maintain automated regression suites for payment processing gateways. Test REST APIs with Postman, write Selenium tests in Java, and integrate with CI/CD.",
                "https://securepay.example.com/careers/qa-auto"
            ),
            new Job(
                "Data Analyst Associate",
                "MetricPulse Analytics",
                "Gurugram, India",
                "Full-time",
                "On-site",
                "Entry Level",
                "₹5,50,000 - ₹8,00,000 / yr",
                "SQL, Python, Excel, Tableau, Power BI, Data Analysis, Statistics",
                "Query large relational datasets, create executive KPI dashboards, and deliver operational insights to cross-functional product and marketing teams.",
                "https://metricpulse.example.com/jobs/data-analyst"
            ),
            new Job(
                "Freelance UI/UX Product Designer",
                "DesignCraft Studio",
                "Remote, Global",
                "Freelance",
                "Remote",
                "Mid Level",
                "₹60,000 - ₹90,000 / project",
                "Figma, UI/UX, Wireframing, Prototyping, Design Systems, HTML, CSS",
                "Seeking an independent product designer with a keen eye for modern typography, glassmorphism, and responsive design systems for client web app projects.",
                "https://designcraft.example.com/freelance-design"
            ),
            new Job(
                "Senior Spring Boot Architect",
                "Apex Enterprise Cloud",
                "Bengaluru, India",
                "Full-time",
                "Hybrid",
                "Senior",
                "₹24,00,000 - ₹32,00,000 / yr",
                "Java, Spring Boot, Microservices, Kubernetes, Docker, MySQL, Redis, Kafka, AWS",
                "Architect event-driven enterprise platforms. Lead backend technical design, mentor team members, optimize database latency, and drive high-availability standards.",
                "https://apexcloud.example.com/careers/sr-architect"
            )
        );

        jobRepository.saveAll(jobs);
        System.out.println("[ResumeIQ] Seeded " + jobs.size() + " realistic starter jobs.");
    }
}
