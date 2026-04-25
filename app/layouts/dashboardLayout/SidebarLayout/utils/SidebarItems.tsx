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
  FaUserClock,
} from "react-icons/fa";

import { FaVial } from "react-icons/fa"; // correct icon
import { GiOfficeChair, GiSofa } from "react-icons/gi";
import { MdEventRepeat } from "react-icons/md";
import WaitingRoomIcon from "../component/WaitingRoomIcon";
import AppointmentIcon from "../component/AppointmentIcon";
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
    id: 21,
    name: "Patients",
    icon: <FaUsers />,
    url: "/dashboard/patients",
    role: ["admin"],
  },
  {
    id: 2,
    name: "Users",
    icon: <FaUsers />,
    url: "/dashboard/users",
    role: ["admin"],
    children: [


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
        id: 30,
        name: "Dealers",
        icon: <FaUserClock />,
        url: "/dashboard/dealers",
        role: ["admin"],
      },
    ],
  },
  {
    id: 32,
    name: "Lab",
    icon: <FaVial />,
    url: "/dashboard/lab",
    role: ["admin"],
    children: [
      {
        id: 35,
        name: "All Lab Sheets",
        icon: <FaNotesMedical />,
        url: "/dashboard/labWork",
        role: ["admin"],
      },
      {
        id: 36,
        name: "In-house Work",
        icon: <FaNotesMedical />,
        url: "/dashboard/labWork?type=in-house",
        role: ["admin"],
      },
      {
        id: 37,
        name: "Outside Work",
        icon: <FaNotesMedical />,
        url: "/dashboard/labWork?type=outside",
        role: ["admin"],
      },
      {
        id: 31,
        name: "Lab Doctors",
        icon: <FaUserMd />,
        url: "/dashboard/labDoctors",
        role: ["admin"],
      },
    ],

  },


  {
    id: 15,
    name: "Book Appointment",
    icon: <AppointmentIcon />,
    url: "/dashboard/appointments/book",
    role: ["patient", "doctor", "admin"],
  },
  {
    id: 16,
    name: "Waiting Room",
    icon: <WaitingRoomIcon />,
    url: "/dashboard/appointments/waiting-room",
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
    id: 13,
    name: "Appointments",
    icon: <AppointmentIcon />,
    url: "/dashboard/appointments",
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
    url: "#",
    role: ["admin"],
    children: [
      {
        id: 110,
        name: "Common Master",
        icon: <FaListAlt />,
        url: "/dashboard/masters",
        role: ["admin"],
      },
      {
        id: 40,
        name: "Procedure Master",
        icon: <RiToothLine />,
        url: "/dashboard/procedure-master",
        role: ["admin"],
      },
      {
        id: 38,
        name: "Lab Hierarchy Master",
        icon: <FaListAlt />,
        url: "/dashboard/labWork-master",
        role: ["admin"],
      },
    ]


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
    name: "Reports",
    icon: <VscWorkspaceTrusted />,
    url: "/dashboard/reports",
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