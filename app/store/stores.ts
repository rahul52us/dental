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

const stores = {
  auth : authStore,
  dashboardStore : dashboardStore,
  userStore : userStore,
  appointmentStore : appointmentStore,
  bookingStore : bookingStore,
  themeStore : themeStore,
  layout : layoutStore,
  contactStore : contactStore,
  BlogStore : blogStore,
  companyStore : CompanyStore,
  orderStore : orderStore,
  testimonialStore : testimonialStore,
  EventStore:EventStore
};

export default stores;