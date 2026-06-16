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
  FaPrescription,
  FaClipboardList,
  FaStethoscope,
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
  permission?: {
    module: string;
    action: string;
  };
  children?: SidebarItem[];
}

const sidebarDatas: SidebarItem[] = [
  {
    id: 1,
    name: "Dashboard",
    icon: <FaChartPie />,
    url: "/dashboard",
    role: ["patient", "doctor", "admin", "staff"],
  },
  {
    id: 21,
    name: "Patients",
    icon: <FaUsers />,
    url: "/dashboard/patients",
    role: ["admin", "staff"],
    permission: { module: "patient", action: "sidebar" },
  },
  {
    id: 2,
    name: "Users",
    icon: <FaUsers />,
    url: "/dashboard/users",
    role: ["admin", "staff"],
    children: [


      {
        id: 3,
        name: "Doctors",
        icon: <FaUserMd />,
        url: "/dashboard/doctors",
        role: ["admin", "staff"],
        permission: { module: "doctor", action: "sidebar" },
      },
      {
        id: 4,
        name: "Staffs",
        icon: <FaUserTie />,
        url: "/dashboard/staffs",
        role: ["admin", "staff"],
        permission: { module: "staffs", action: "sidebar" },
      },
      {
        id: 30,
        name: "Dealers",
        icon: <FaUserClock />,
        url: "/dashboard/dealers",
        role: ["admin", "staff"],
        permission: { module: "masters", action: "sidebar" },
      },
    ],
  },
  {
    id: 32,
    name: "Lab",
    icon: <FaVial />,
    url: "#",
    role: ["admin", "staff"],
    children: [
      {
        id: 33,
        name: "Labs",
        icon: <FaVial />,
        url: "/dashboard/labs",
        role: ["admin", "staff"],
        permission: { module: "lab", action: "sidebar" },
      },
      {
        id: 35,
        name: "In-house Lab",
        icon: <FaNotesMedical />,
        url: "/dashboard/labWork?type=in-house",
        role: ["admin", "staff"],
        permission: { module: "inhouse_lab", action: "sidebar" },
      },
      {
        id: 36,
        name: "Outside Lab",
        icon: <FaNotesMedical />,
        url: "/dashboard/labWork?type=outside",
        role: ["admin", "staff"],
        permission: { module: "outside_lab", action: "sidebar" },
      },
      {
        id: 31,
        name: "Lab Doctors",
        icon: <FaUserMd />,
        url: "/dashboard/labDoctors",
        role: ["admin", "staff"],
        permission: { module: "lab_doctors", action: "sidebar" },
      },
    ],
  },

  {
    id: 37,
    name: "Doctor Inventory",
    icon: <FaStethoscope />,
    url: "/dashboard/doctorInventory",
    role: ["admin", "staff"],
    permission: { module: "doctorInventory", action: "sidebar" },
  },


  {
    id: 15,
    name: "Book Appointment",
    icon: <AppointmentIcon />,
    url: "/dashboard/appointments/book",
    role: ["patient", "doctor", "admin", "staff"],
  },
  {
    id: 16,
    name: "Waiting Room",
    icon: <WaitingRoomIcon />,
    url: "/dashboard/appointments/waiting-room",
    role: ["patient", "doctor", "admin", "staff"],
  },
  {
    id: 9,
    name: "Recall Appointment",
    icon: <MdEventRepeat />,
    url: "/dashboard/recall-appointment",
    role: ["admin", "staff"],
    permission: { module: "recall", action: "sidebar" },
  },
  {
    id: 13,
    name: "Appointments",
    icon: <AppointmentIcon />,
    url: "/dashboard/appointments",
    role: ["admin", "staff"],
    permission: { module: "appointment", action: "sidebar" },
  },
  {
    id: 11,
    name: "Masters",
    icon: <FaListAlt />,
    url: "#",
    role: ["admin", "staff"],
    permission: { module: "masters", action: "sidebar" },
    children: [
      {
        id: 110,
        name: "Title master",
        icon: <FaListAlt />,
        url: "/dashboard/masters",
        role: ["admin", "staff"],
        permission: { module: "masters", action: "sidebar" },
      },
      {
        id: 40,
        name: "Treatment Heads Master",
        icon: <RiToothLine />,
        url: "/dashboard/procedure-master",
        role: ["admin", "staff"],
        permission: { module: "masters", action: "sidebar" },
      },
      {
        id: 38,
        name: "Lab Hierarchy Master",
        icon: <FaListAlt />,
        url: "/dashboard/labWork-master",
        role: ["admin", "staff"],
        permission: { module: "masters", action: "sidebar" },
      },
      {
        id: 39,
        name: "Lab Status Master",
        icon: <FaListAlt />,
        url: "/dashboard/labWorkStatus-master",
        role: ["admin", "staff"],
        permission: { module: "masters", action: "sidebar" },
      },
      {
        id: 41,
        name: "Prescription Master",
        icon: <FaPrescription />,
        url: "/dashboard/prescription-master",
        role: ["admin", "staff"],
        permission: { module: "masters", action: "sidebar" },
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
    id: 42,
    name: "Chairs",
    icon: <GiOfficeChair />,
    url: "/dashboard/chairs",
    role: ["superAdmin", "admin", "staff"],
    permission: { module: "chairs", action: "sidebar" },
  },
  {
    id: 14,
    name: "Reports",
    icon: <VscWorkspaceTrusted />,
    url: "/dashboard/reports",
    permission: { module: "reports", action: "sidebar" },
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

const getSidebarDataByRole = (role: string[] = ["admin", "staff"]): SidebarItem[] => {
  const filterByRoleAndPermission = (items: SidebarItem[]): SidebarItem[] => {
    return items
      .filter((item) => {
        // First check role
        const hasRole = !item.role || item.role.some((r) => role.includes(r));
        if (!hasRole) return false;

        // Then check permission
        if (item.permission) {
          const { module, action } = item.permission;
          // Use stores directly or pass it - since it's a utility, we'll import stores
          const stores = require("../../../../store/stores").default;
          return stores.auth.hasPermission(module, action);
        }

        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterByRoleAndPermission(item.children) : undefined,
      }))
      .filter((item) => {
        // If item has children but all were filtered out, hide parent too (unless it's a direct link)
        if (item.children && item.children.length === 0 && item.url === "#") {
          return false;
        }
        return true;
      });
  };
  return filterByRoleAndPermission(sidebarDatas);
};

export { getSidebarDataByRole, sidebarDatas };
