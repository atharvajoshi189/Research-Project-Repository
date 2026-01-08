export interface Project {
    id: string;
    title: string;
    authors: string[];
    year: string;
    category: "Final Year Project" | "Research Paper" | "Micro-Project";
    techStack: string[];
    abstract: string;
    status: "IEEE Published" | "Completed" | "Ongoing" | "Submitted";
}

export const projects: Project[] = [
    {
        id: "1",
        title: "AI-Powered Early Disease Detection System",
        authors: ["Rohan Sharma", "Aditi Gupta"],
        year: "2024-2025",
        category: "Final Year Project",
        techStack: ["Python", "TensorFlow", "React", "FastAPI"],
        abstract: "A machine learning based system that analyzes retinal images to detect early signs of diabetic retinopathy with 98% accuracy. The system includes a mobile-friendly frontend for mass screening camps.",
        status: "IEEE Published"
    },
    {
        id: "2",
        title: "Blockchain Based Academic Credential Verification",
        authors: ["Vikram Singh", "Sarah Khan"],
        year: "2024-2025",
        category: "Final Year Project",
        techStack: ["Solidity", "Ethereum", "Next.js", "IPFS"],
        abstract: "A decentralized platform for universities to issue tamper-proof digital degree certificates. Employers can instantly verify credentials without third-party background checks.",
        status: "Completed"
    },
    {
        id: "3",
        title: "Smart Campus Navigation using AR",
        authors: ["Arjun Mehta"],
        year: "2023-2024",
        category: "Micro-Project",
        techStack: ["Unity", "C#", "ARCore"],
        abstract: "An augmented reality application that helps new students navigate the college campus by overlaying directional arrows on the camera feed in real-time.",
        status: "Completed"
    },
    {
        id: "4",
        title: "Optimizing Supply Chain using Genetic Algorithms",
        authors: ["Neha Patel", "Siddharth Rao"],
        year: "2023-2024",
        category: "Research Paper",
        techStack: ["Python", "MATLAB"],
        abstract: "This paper proposes a novel genetic algorithm approach to minimize transportation costs in multi-echelon supply chains. Simulation results show a 15% reduction in logistics overhead.",
        status: "IEEE Published"
    },
    {
        id: "5",
        title: "Automated Code Review Bot",
        authors: ["Dev Kumar"],
        year: "2022-2023",
        category: "Micro-Project",
        techStack: ["Node.js", "GitHub API", "OpenAI"],
        abstract: "A GitHub bot that automatically analyzes Pull Requests for style violations, potential bugs, and security vulnerabilities using LLMs.",
        status: "Completed"
    },
    {
        id: "6",
        title: "IoT Based Smart Irrigation System",
        authors: ["Priya Sharma", "Amit Verma"],
        year: "2024-2025",
        category: "Final Year Project",
        techStack: ["C++", "Arduino", "IoT", "React Native"],
        abstract: "A smart farming solution that monitors soil moisture and weather conditions to automate water supply, saving up to 40% water usage compared to traditional methods.",
        status: "Submitted"
    },
    {
        id: "7",
        title: "Secure Voting System (Micro-Implementation)",
        authors: ["Riya Deshmukh"],
        year: "2023-2024",
        category: "Micro-Project",
        techStack: ["Python", "Cryptography"],
        abstract: "A small-scale prototype demonstrating homomorphic encryption techniques to allow tallying of votes without decrypting individual ballots.",
        status: "Completed"
    },
    {
        id: "8",
        title: "Deep Learning for Sign Language Recognition",
        authors: ["Karan Malhotra", "Sneha Roy"],
        year: "2025-2026",
        category: "Research Paper",
        techStack: ["Python", "PyTorch", "OpenCV"],
        abstract: "Developing a real-time system that translates Indian Sign Language (ISL) gestures into text and speech to assist the hearing impaired.",
        status: "Ongoing"
    },
    {
        id: "9",
        title: "Peer-to-Peer Energy Trading Platform",
        authors: ["Ankit Dubey"],
        year: "2024-2025",
        category: "Final Year Project",
        techStack: ["React", "Node.js", "Blockchain"],
        abstract: "Enabling households with solar panels to sell excess energy directly to neighbors using smart contracts, bypassing the central grid pricing.",
        status: "Submitted"
    },
    {
        id: "10",
        title: "Sentiment Analysis of Social Media Trends",
        authors: ["Meera Reddy"],
        year: "2023-2024",
        category: "Micro-Project",
        techStack: ["Python", "NLTK", "Flask"],
        abstract: "A dashboard that visualizes public sentiment towards major government policies by analyzing millions of tweets in real-time.",
        status: "Completed"
    }
];
