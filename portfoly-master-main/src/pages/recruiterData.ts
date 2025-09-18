export type Student = {
  id: string;
  name: string;
  points: number;
  department: string;
  skills: string[];
};

export type College = {
  slug: string;
  name: string;
  city: string;
  students: Student[];
};

export const colleges: College[] = [
  {
    slug: "bvrit",
    name: "BVRIT",
    city: "Hyderabad",
    students: [
      { id: "b1", name: "Aarav Patel", points: 860, department: "CSE", skills: ["React", "Node", "DSA"] },
      { id: "b2", name: "Ishita Sharma", points: 790, department: "ECE", skills: ["VLSI", "Verilog"] },
      { id: "b3", name: "Rahul Verma", points: 720, department: "ME", skills: ["CAD", "Robotics"] },
      { id: "b4", name: "Sneha Nair", points: 690, department: "CSE", skills: ["ML", "Python"] },
    ],
  },
  {
    slug: "vnr-vjeit",
    name: "VNR VJEIT",
    city: "Hyderabad",
    students: [
      { id: "v1", name: "Aditya Rao", points: 820, department: "IT", skills: ["Fullstack", "SQL"] },
      { id: "v2", name: "Meera Iyer", points: 640, department: "EEE", skills: ["Power", "MATLAB"] },
      { id: "v3", name: "Zoya Khan", points: 610, department: "CIV", skills: ["AutoCAD", "Estimation"] },
      { id: "v4", name: "Vikram Singh", points: 600, department: "CSE", skills: ["Next.js", "DevOps"] },
    ],
  },
  {
    slug: "iit-hyderabad",
    name: "IIT Hyderabad",
    city: "Hyderabad",
    students: [
      { id: "i1", name: "Neha Gupta", points: 910, department: "CSE", skills: ["DL", "NLP"] },
      { id: "i2", name: "Kunal Joshi", points: 880, department: "ECE", skills: ["Embedded", "RF"] },
      { id: "i3", name: "Rohit Jain", points: 835, department: "AI", skills: ["Vision", "Pytorch"] },
      { id: "i4", name: "Sanya Mehta", points: 820, department: "CSE", skills: ["Systems", "Rust"] },
      { id: "i5", name: "Dev Patel", points: 780, department: "ME", skills: ["Robotics", "ROS"] },
    ],
  },
  {
    slug: "greit",
    name: "GREIT",
    city: "Pune",
    students: [
      { id: "g1", name: "Ananya Desai", points: 730, department: "CSE", skills: ["Angular", "Java"] },
      { id: "g2", name: "Harsh Vardhan", points: 705, department: "IT", skills: ["Node", "MongoDB"] },
      { id: "g3", name: "Priya Kulkarni", points: 680, department: "ECE", skills: ["IoT", "C"] },
    ],
  },
];

export const getAveragePoints = (c: College) => {
  if (!c.students.length) return 0;
  return Math.round(c.students.reduce((s, st) => s + st.points, 0) / c.students.length);
};


