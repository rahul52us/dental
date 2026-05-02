import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

interface WorkDone {
  data: any[];
  totalItems: number;
  totalPages: number;
  loading: boolean;
  message?: string;
}

class WorkDoneStore {
  workDone: WorkDone = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    loading: false,
    message: ""
  };

  patientStats = {
    totalBill: 0,
    patientPending: 0,
    loading: false,
  };

  doctorStats = {
    totalBill: 0,
    collected: 0,
    pending: 0,
    loading: false,
  };

  patientDoctors: any[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  getPatientFinancialStats = async (patientId: string, doctorId?: string) => {
    this.patientStats.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get("/workDone/stats", {
        params: { patientId, company: compId, doctorId }
      });
      if (data.status === "success") {
        this.patientStats = { ...data.data, loading: false };
      }
      return data;
    } catch (err: any) {
      console.error("Error fetching patient stats:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.patientStats.loading = false;
    }
  };

  getDoctorFinancialStats = async (doctorId: string) => {
    this.doctorStats.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get("/workDone/doctor-stats", {
        params: { doctorId, company: compId }
      });
      if (data.status === "success") {
        this.doctorStats = { ...data.data, loading: false };
      }
      return data;
    } catch (err: any) {
      console.error("Error fetching doctor stats:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.doctorStats.loading = false;
    }
  };

  getWorkDone = async (sendData: {
    page?: number;
    limit?: number;
    patientId?: string;
    treatmentId?: string;
    doctorId?: string;
  }) => {
    this.workDone.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const params: any = {
        page: sendData.page || 1,
        limit: sendData.limit || 10,
        company: compId,
        patientId: sendData.patientId,
        treatmentId: sendData.treatmentId,
        doctorId: sendData.doctorId,
      };

      const { data } = await axios.get("/workDone/get", { params });
      if (data.status === "success") {
        const rawItems = data?.data?.data || data?.data || [];
        this.workDone.data = Array.isArray(rawItems) ? rawItems : [];
        this.workDone.message = data.message || "";
        
        const totalItems = data?.data?.totalItems || data?.totalItems || 0;
        this.workDone.totalItems = totalItems;
        this.workDone.totalPages = Math.ceil(totalItems / (sendData.limit || 10)) || 1;
      }

      return data;
    } catch (err: any) {
      console.error("Error fetching work done:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.workDone.loading = false;
    }
  };

  createWorkDone = async (sendData: any) => {
    try {
      const compId = authStore.company?._id || authStore.company;
      const { data } = await axios.post("/workDone/create", { ...sendData, company: compId });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateWorkDone = async (id: string, sendData: any) => {
    try {
      const { data } = await axios.put(`/workDone/${id}`, { ...sendData });
      const index = this.workDone.data.findIndex(item => item._id === id);
      if (index !== -1) {
        this.workDone.data[index] = { ...this.workDone.data[index], ...sendData };
      }
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteWorkDone = async (workDoneId: string) => {
    try {
      const { data } = await axios.delete(`/workDone/${workDoneId}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getPatientDoctors = async (patientId: string) => {
    try {
      const { data } = await axios.get(`/workDone/doctors/${patientId}`);
      if (data.status === "success") {
        this.patientDoctors = data.data;
      }
    } catch (err) {
      console.error(err);
    }
  };
}

export const workDoneStore = new WorkDoneStore();
export default workDoneStore;
