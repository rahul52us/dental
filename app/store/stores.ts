// store/index.ts
import { authStore } from "./authStore/authStore";
import { CompanyStore } from "./companyStore/companyStore";
import { contactStore } from "./contactStore/contactStore";
import { themeStore } from "./themeStore/themeStore";
import { userStore } from "./userStore/userStore";
import {layoutStore} from './layoutStore/LayoutStore'
import { orderStore } from "./orderStore/orderStore";
import { bookingStore } from "./bookingStore/bookingStore";
import { appointmentStore } from "./appointmentsStore/appointmentStore";
import { dashboardStore } from "./dashboardStore/dashboardStore";
import {EventStore} from './eventStore/eventStore'
import { labStore } from "./labStore/labStore";
import { dealerStore } from "./dealerStore/dealerStore";
import {doctorAppointment} from './doctorAppointmentStore/doctorAppointmentStore'
import { chairsStore } from "./chairsStore/chairsStore";
import {toothTreatmentStore} from './toothTreatmentStore/toothTreatmentStore'
import { recallAppointmentStore } from "./recallAppointment/recallAppointmentStore";
import { reportStore } from "./reportStore/reportStore";
import { labDoctorStore } from "./labDoctorStore/labDoctorStore";
import labWorkStore from "./labWorkStore/labWorkStore";
import { procedureStore } from "./procedureStore/procedureStore";
import labWorkHierarchyStore from "./labWorkHierarchyStore/labWorkHierarchyStore";
import labWorkStatusStore from "./labWorkStatusStore/labWorkStatusStore";
import { workDoneStore } from "./workDoneStore/workDoneStore";
import prescriptionStore from "./prescriptionStore/prescriptionStore";
import accountabilityStore from "./accountabilityStore/accountabilityStore";
import { doctorInventoryStore } from "./doctorInventoryStore/doctorInventoryStore";
import OldDataStore from "./oldDataStore/oldData.store";
import { advertisementStore } from "./advertisementStore/advertisementStore";
import GlobalConfigStore from "./globalConfigStore";

const oldDataStore = new OldDataStore();
const globalConfigStore = new GlobalConfigStore();

const stores = {
  auth : authStore,
  dashboardStore : dashboardStore,
  userStore : userStore,
  labStore: labStore,
  dealerStore: dealerStore,
  appointmentStore : appointmentStore,
  bookingStore : bookingStore,
  themeStore : themeStore,
  layout : layoutStore,
  contactStore : contactStore,
  companyStore : CompanyStore,
  orderStore : orderStore,
  EventStore:EventStore,
  DoctorAppointment:doctorAppointment,
  chairsStore:chairsStore,
  toothTreatmentStore:toothTreatmentStore,
  recallAppointmentStore:recallAppointmentStore,
  reportStore:reportStore,
  labDoctorStore: labDoctorStore,
  labWorkStore: labWorkStore,
  procedureStore: procedureStore,
  labWorkHierarchyStore: labWorkHierarchyStore,
  labWorkStatusStore: labWorkStatusStore,
  workDoneStore: workDoneStore,
  prescriptionStore: prescriptionStore,
  accountabilityStore: accountabilityStore,
  doctorInventoryStore: doctorInventoryStore,
  oldDataStore: oldDataStore,
  advertisementStore: advertisementStore,
  globalConfigStore: globalConfigStore,
};

export default stores;