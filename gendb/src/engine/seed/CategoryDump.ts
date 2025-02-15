import {SqlFileAppender} from "../appender.js";
import {installDate} from "../config.js";
import {ProjectCategory} from "../model/ProjectCategory.js";

// ChatBot Hint: This is a freelancing platform between client and freelancer

function populate(): ProjectCategory[] {
  return [new ProjectCategory(1, installDate(), true, 'Web Development', installDate()),
    new ProjectCategory(2, installDate(), true, 'Mobile Development', installDate()),
    new ProjectCategory(3, installDate(), true, 'Desktop Development', installDate()),
    new ProjectCategory(4, installDate(), true, 'Game Development', installDate()),
    new ProjectCategory(5, installDate(), true, 'UI/UX Design', installDate()),
    new ProjectCategory(6, installDate(), true, 'Graphic Design', installDate()),
    new ProjectCategory(7, installDate(), true, 'Digital Marketing', installDate()),
    new ProjectCategory(8, installDate(), true, 'Content Writing', installDate()),
    new ProjectCategory(9, installDate(), true, 'Translation', installDate()),
    new ProjectCategory(10, installDate(), true, 'Video Production', installDate()),
    new ProjectCategory(11, installDate(), true, 'Audio Production', installDate()),
    new ProjectCategory(12, installDate(), true, 'Voice Acting', installDate()),
    new ProjectCategory(13, installDate(), true, 'Animation', installDate()),
    new ProjectCategory(14, installDate(), true, '3D Modeling', installDate()),
    new ProjectCategory(15, installDate(), true, 'Data Entry', installDate()),
    new ProjectCategory(16, installDate(), true, 'Virtual Assistant', installDate()),
    new ProjectCategory(17, installDate(), true, 'Customer Service', installDate()),
    new ProjectCategory(18, installDate(), true, 'Business Consulting', installDate()),
    new ProjectCategory(19, installDate(), true, 'Legal Consulting', installDate()),
    new ProjectCategory(20, installDate(), true, 'Financial Consulting', installDate()),
    new ProjectCategory(21, installDate(), true, 'Data Analysis', installDate()),
    new ProjectCategory(22, installDate(), true, 'Machine Learning', installDate()),
    new ProjectCategory(23, installDate(), true, 'Blockchain Development', installDate()),
    new ProjectCategory(24, installDate(), true, 'DevOps Engineering', installDate()),
    new ProjectCategory(25, installDate(), true, 'Quality Assurance', installDate()),
    new ProjectCategory(26, installDate(), true, 'System Administration', installDate()),
    new ProjectCategory(27, installDate(), true, 'Network Security', installDate()),
    new ProjectCategory(28, installDate(), true, 'Database Administration', installDate()),
    new ProjectCategory(29, installDate(), true, 'Technical Writing', installDate()),
    new ProjectCategory(30, installDate(), true, 'Project Management', installDate())
  ];
}

let categories = populate();

export const ResetCategories = () => {
  categories = populate();
}

export const DumpCategories = () => SqlFileAppender.append('\n' + ProjectCategory.dump(categories));

export const PickCategory = (): ProjectCategory => {
  const randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
};
