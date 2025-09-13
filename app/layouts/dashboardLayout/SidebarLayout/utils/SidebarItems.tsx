import { FaChartPie, FaUsers, FaUserMd, FaUserTie, FaCog } from "react-icons/fa";
import { FaVials } from "react-icons/fa";


interface SidebarItem {
  id: number;
  name: string;
  icon: any;
  url: string;
  role?: string[];
  children?: SidebarItem[];
}


const sidebarDatas: SidebarItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: <FaChartPie />,
    url: "/dashboard",
    role: ["user"],
  },
  {
    id: 2,
    name: "Patients",
    icon: <FaUsers />, // multiple users icon
    url: "/dashboard/patients",
    role: ["user"],
  },
  {
    id: 3,
    name: "Doctors",
    icon: <FaUserMd />, // doctor icon
    url: "/dashboard/doctors",
    role: ["user"],
  },
  {
    id: 4,
    name: "Staffs",
    icon: <FaUserTie />, // staff / employee icon
    url: "/dashboard/staffs",
    role: ["user"],
  },
  {
    id: 5,
    name: "labs",
    icon: <FaVials />, // staff / employee icon
    url: "/dashboard/labs",
    role: ["user"],
  },
  {
    id: 5,
    name: "masters",
    icon: <FaVials />, // staff / employee icon
    url: "/dashboard/masters",
    role: ["user"],
  },
  // {
  //   id: 5,
  //   name: "Page Sections",
  //   icon: <FaFileAlt />, // content / sections icon
  //   url: "/dashboard/content-section",
  //   role: ["user"],
  // },
  // {
  //   id: 501,
  //   name: "Blogs",
  //   icon: <FaBookOpen />, // blog icon
  //   url: "/dashboard/blogs",
  //   role: ["user", "superadmin", "manager", "admin"],
  //   children: [
  //     {
  //       id: 502,
  //       name: "Index",
  //       icon: <CalendarIcon />,
  //       url: "/dashboard/blogs/index",
  //       role: ["user", "superadmin", "manager", "admin"],
  //     },
  //     {
  //       id: 503,
  //       name: "Create",
  //       icon: <FaFileAlt />,
  //       url: "/dashboard/blogs/create",
  //       role: ["superadmin", "manager", "admin"],
  //     },
  //   ],
  // },
];


export const sidebarFooterData: SidebarItem[] = [
  {
    id: 34,
    name: "Settings",
    icon: <FaCog />,
    url: "/profile",
    role: ["user", "admin", "superadmin", "manager"],
  },
];

const getSidebarDataByRole = (role: string[] = ["user"]): SidebarItem[] => {
  const filterByRole = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter((item) => !item.role || item.role.some((r) => role.includes(r)))
      .map((item) => ({
        ...item,
        children: item.children ? filterByRole(item.children) : undefined,
      }));
  };
  return filterByRole(sidebarDatas);
};

// Example usage
const userRole = ["user"]; // Example role
const sidebarData = getSidebarDataByRole(userRole);

export { sidebarData, getSidebarDataByRole };
