import {SqlFileAppender} from "../appender.js";
import {installDate} from "../config.js";
import {Skill} from "../model/Skill.js";

// ChatBot Hint: This is a freelancing platform between client and freelancer

function populate(): Skill[] {
  return [
    // Web & Programming Skills
    new Skill(1, installDate(), true, 'HTML', installDate()),
    new Skill(2, installDate(), true, 'CSS', installDate()),
    new Skill(3, installDate(), true, 'JavaScript', installDate()),
    new Skill(4, installDate(), true, 'TypeScript', installDate()),
    new Skill(5, installDate(), true, 'React', installDate()),
    new Skill(6, installDate(), true, 'Node.js', installDate()),
    new Skill(7, installDate(), true, 'Python', installDate()),
    new Skill(8, installDate(), true, 'Swift', installDate()),
    new Skill(9, installDate(), true, 'React Native', installDate()),
    new Skill(10, installDate(), true, 'Unity', installDate()),

    // Design Skills
    new Skill(11, installDate(), true, 'Figma', installDate()),
    new Skill(12, installDate(), true, 'Adobe XD', installDate()),
    new Skill(13, installDate(), true, 'Adobe Photoshop', installDate()),
    new Skill(14, installDate(), true, 'Adobe Premiere Pro', installDate()),
    new Skill(15, installDate(), true, 'Blender', installDate()),

    // Technical Skills
    new Skill(16, installDate(), true, 'Docker', installDate()),
    new Skill(17, installDate(), true, 'MySQL', installDate()),
    new Skill(18, installDate(), true, 'TensorFlow', installDate()),
    new Skill(19, installDate(), true, 'Cybersecurity', installDate()),
    new Skill(20, installDate(), true, 'Data Analysis', installDate()),

    // Language Skills
    new Skill(21, installDate(), true, 'English Proficiency', installDate()),
    new Skill(22, installDate(), true, 'Spanish Translation', installDate()),
    new Skill(23, installDate(), true, 'Chinese Translation', installDate()),
    new Skill(24, installDate(), true, 'Technical Writing', installDate()),
    new Skill(25, installDate(), true, 'Content Writing', installDate()),

    // Soft Skills
    new Skill(26, installDate(), true, 'Communication', installDate()),
    new Skill(27, installDate(), true, 'Team Leadership', installDate()),
    new Skill(28, installDate(), true, 'Problem Solving', installDate()),
    new Skill(29, installDate(), true, 'Time Management', installDate()),
    new Skill(30, installDate(), true, 'Critical Thinking', installDate()),
    new Skill(31, installDate(), true, 'Adaptability', installDate()),
    new Skill(32, installDate(), true, 'Emotional Intelligence', installDate()),
    new Skill(33, installDate(), true, 'Conflict Resolution', installDate()),
    new Skill(34, installDate(), true, 'Project Management', installDate()),
    new Skill(35, installDate(), true, 'Negotiation', installDate()),

    // Business Skills
    new Skill(36, installDate(), true, 'Strategic Planning', installDate()),
    new Skill(37, installDate(), true, 'Business Analysis', installDate()),
    new Skill(38, installDate(), true, 'Financial Planning', installDate()),
    new Skill(39, installDate(), true, 'Risk Management', installDate()),
    new Skill(40, installDate(), true, 'Client Relations', installDate()),

    // Marketing Skills
    new Skill(41, installDate(), true, 'SEO', installDate()),
    new Skill(42, installDate(), true, 'Social Media Marketing', installDate()),
    new Skill(43, installDate(), true, 'Content Strategy', installDate()),
    new Skill(44, installDate(), true, 'Email Marketing', installDate()),
    new Skill(45, installDate(), true, 'Market Research', installDate()),

    // Creative Skills
    new Skill(46, installDate(), true, 'Creative Writing', installDate()),
    new Skill(47, installDate(), true, 'Storytelling', installDate()),
    new Skill(48, installDate(), true, 'Video Production', installDate()),
    new Skill(49, installDate(), true, 'Voice Acting', installDate()),
    new Skill(50, installDate(), true, 'Music Production', installDate())
  ]
}

let skills = populate();

export const ResetSkills = () => {
  skills = populate();
}

export const DumpSkills = () => SqlFileAppender.append('\n' + Skill.dump(skills));

export const PickSkill = (): Skill => {
  const randomIndex = Math.floor(Math.random() * skills.length);
  return skills[randomIndex];
};
