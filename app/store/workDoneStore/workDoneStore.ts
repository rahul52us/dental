import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

interface WorkDone {
  data: any[];
  totalItems: number;
  totalPages: number;
  loading: boolean;
}

class WorkDoneStore {
  workDone: WorkDone = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    loading: false,
  };

  patientStats = {
    totalBill: 0,
    patientPending: 0,
    loading: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  getPatientFinancialStats = async (patientId: string, doctorId?: string) => {
    this.patientStats.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const { data } = await axios.get("/workDone/stats", {
        params: { patientId, company: companyId || authStore.company, doctorId }
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

  getWorkDone = async (sendData: {
    page?: number;
    limit?: number;
    patientId?: string;
    treatmentId?: string;
  }) => {
    this.workDone.loading = true;
    try {
      const params: any = {
        page: sendData.page || 1,
        limit: sendData.limit || 10,
        company: authStore.company,
        patientId: sendData.patientId,
        treatmentId: sendData.treatmentId,
      };

      const { data } = await axios.get("/workDone/get", { params });
      const rawItems = data?.data?.data || data?.data || [];
      this.workDone.data = rawItems;

      const totalItems = data?.data?.totalItems || data?.totalItems || rawItems.length || 0;
      this.workDone.totalItems = totalItems;
      this.workDone.totalPages = Math.ceil(totalItems / (sendData.limit || 10)) || 1;

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
      const { data } = await axios.post("/workDone/create", { ...sendData, company: authStore.company });
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
}

export const workDoneStore = new WorkDoneStore();
export default workDoneStore;
