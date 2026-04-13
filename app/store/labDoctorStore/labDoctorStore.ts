import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import stores from "../stores";

class LabDoctorStore {
  labDoctors = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  constructor() {
    makeObservable(this, {
      labDoctors: observable,
      getLabDoctors: action,
      createLabDoctor: action,
      updateLabDoctor: action,
      deleteLabDoctor: action,
    });
  }

  createLabDoctor = async (sendData: any) => {
    try {
      const { data } = await axios.post("/lab-doctor/create", { ...sendData, company: stores.auth.company });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateLabDoctor = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/lab-doctor/${sendData?._id}`, { ...sendData, company: stores.auth.company });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteLabDoctor = async (sendData: any) => {
    try {
      const { data } = await axios.delete(`/lab-doctor/${sendData.id || sendData._id}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getLabDoctors = async (sendData: any) => {
    try {
      this.labDoctors.loading = true;
      const { data } = await axios.post(`/lab-doctor/get`, { company: [stores.auth.company] }, { params: { ...sendData } });
      this.labDoctors.data = data?.data?.data || [];
      this.labDoctors.TotalPages = data?.data?.totalPages || 0;
      this.labDoctors.hasFetch = true;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.labDoctors.loading = false;
    }
  };
}

export const labDoctorStore = new LabDoctorStore();
export default LabDoctorStore;
