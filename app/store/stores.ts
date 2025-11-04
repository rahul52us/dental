// store/index.ts
import { authStore } from "./authStore/authStore";
import { blogStore } from "./blogStore/blogStore";
import { CompanyStore } from "./companyStore/companyStore";
import { contactStore } from "./contactStore/contactStore";
import { testimonialStore } from "./testimonialStore/testimonialStore";
import { themeStore } from "./themeStore/themeStore";
import { userStore } from "./userStore/userStore";
import {layoutStore} from './layoutStore/LayoutStore'
import { orderStore } from "./orderStore/orderStore";
import { bookingStore } from "./bookingStore/bookingStore";
import { appointmentStore } from "./appointmentsStore/appointmentStore";
import { dashboardStore } from "./dashboardStore/dashboardStore";
import {EventStore} from './eventStore/eventStore'
import { labStore } from "./labStore/labStore";
import {doctorAppointment} from './doctorAppointmentStore/doctorAppointmentStore'
const stores = {
  auth : authStore,
  dashboardStore : dashboardStore,
  userStore : userStore,
  labStore:labStore,
  appointmentStore : appointmentStore,
  bookingStore : bookingStore,
  themeStore : themeStore,
  layout : layoutStore,
  contactStore : contactStore,
  BlogStore : blogStore,
  companyStore : CompanyStore,
  orderStore : orderStore,
  testimonialStore : testimonialStore,
  EventStore:EventStore,
  DoctorAppointment:doctorAppointment
};

export default stores;