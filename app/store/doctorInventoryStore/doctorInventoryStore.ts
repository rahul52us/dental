import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import stores from "../stores";

class DoctorInventoryStore {
  doctorInventories = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  constructor() {
    makeObservable(this, {
      doctorInventories: observable,
      getDoctorInventories: action,
      createDoctorInventory: action,
      updateDoctorInventory: action,
      deleteDoctorInventory: action,
    });
  }

  createDoctorInventory = async (sendData: any) => {
    try {
      const { data } = await axios.post("/doctor-inventory/create", { ...sendData, company: stores.auth.company });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateDoctorInventory = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/doctor-inventory/update/${sendData?._id || sendData?.id}`, { ...sendData, company: stores.auth.company });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteDoctorInventory = async (sendData: any) => {
    try {
      const { data } = await axios.delete(`/doctor-inventory/delete/${sendData.id || sendData._id}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getDoctorInventories = async (sendData: any) => {
    try {
      this.doctorInventories.loading = true;
      const { data } = await axios.get(`/doctor-inventory/get`, { params: { ...sendData } });
      this.doctorInventories.data = data?.data?.data || [];
      this.doctorInventories.TotalPages = data?.data?.totalPages || 0;
      this.doctorInventories.hasFetch = true;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.doctorInventories.loading = false;
    }
  };
}

export const doctorInventoryStore = new DoctorInventoryStore();
export default DoctorInventoryStore;
