import { BiCalendarEvent } from "react-icons/bi";
import {
  FaCalendarCheck,
  FaChartPie,
  FaCog,
  FaListAlt,
  FaNotesMedical,
  FaUserAstronaut,
  FaUserMd,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";

import { FaVial } from "react-icons/fa"; // correct icon
import { GiOfficeChair } from "react-icons/gi";
import { MdEventRepeat } from "react-icons/md";
import { RiToothLine } from "react-icons/ri";
import { VscWorkspaceTrusted } from "react-icons/vsc";

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
    role: ["patient", "doctor", "admin"],
  },
  {
    id: 2,
    name: "Patients",
    icon: <FaUsers />,
    url: "/dashboard/patients",
    role: ["admin"],
  },
  {
    id: 3,
    name: "Doctors",
    icon: <FaUserMd />,
    url: "/dashboard/doctors",
    role: ["admin"],
  },
  {
    id: 4,
    name: "Staffs",
    icon: <FaUserTie />,
    url: "/dashboard/staffs",
    role: ["admin"],
  },
  {
    id: 5,
    name: "Labs",
    icon: <FaVial />,
    url: "/dashboard/labs",
    role: ["admin"],
  },
  {
    id: 8,
    name: "Appointments",
    icon: <FaCalendarCheck />,
    url: "/dashboard/appointments",
    role: ["patient", "doctor", "admin"],
  },
  {
    id: 9,
    name: "Recall Appointment",
    icon: <MdEventRepeat />,
    url: "/dashboard/recall-appointment",
    role: ["admin"],
  },
  {
    id: 10,
    name: "Orders",
    icon: <FaNotesMedical />,
    url: "/dashboard/orders",
    role: ["admin", "patient"],
  },
  {
    id: 11,
    name: "Masters",
    icon: <FaListAlt />,
    url: "/dashboard/masters",
    role: ["admin"],
  },
  {
    id: 12,
    name: "Admins",
    icon: <FaUserAstronaut />,
    url: "/dashboard/admins",
    role: ["superAdmin"],
  },
  {
    id: 13,
    name: "Chairs",
    icon: <GiOfficeChair />,
    url: "/dashboard/chairs",
    role: ["superAdmin", "admin"],
  },
  {
    id: 14,
    name: "Work Done",
    icon: <VscWorkspaceTrusted />,
    url: "/dashboard/work-done",
  },
];

export const sidebarFooterData: SidebarItem[] = [
  {
    id: 34,
    name: "Settings",
    icon: <FaCog />,
    url: "/dashboard/profile",
    role: ["admin", "superAdmin", "patient", "doctor"],
  },
];

const getSidebarDataByRole = (role: string[] = ["admin"]): SidebarItem[] => {
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

export { getSidebarDataByRole, sidebarDatas };