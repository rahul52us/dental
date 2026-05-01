import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class PrescriptionStore {
  prescriptions: any = { data: [], total: 0, loading: false };

  constructor() {
    makeAutoObservable(this);
  }

  getPrescriptions = async (params: any = {}) => {
    this.prescriptions.loading = true;
    try {
      const res = await axios.get(`/prescription/get`, { 
        params: { 
          ...params, 
          companyId: authStore.company 
        } 
      });
      runInAction(() => {
        this.prescriptions.data = res.data.data || [];
        this.prescriptions.total = res.data.total || 0;
        this.prescriptions.loading = false;
      });
      return res.data;
    } catch (err: any) {
      runInAction(() => {
        this.prescriptions.loading = false;
      });
      return Promise.reject(err?.response?.data || err);
    }
  };

  createPrescription = async (data: any) => {
    try {
      const res = await axios.post(`/prescription/create`, {
        ...data,
        company: authStore.company
      });
      await this.getPrescriptions();
      return res.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updatePrescription = async (id: string, data: any) => {
    try {
      const res = await axios.put(`/prescription/update/${id}`, data);
      await this.getPrescriptions();
      return res.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deletePrescription = async (id: string) => {
    try {
      const res = await axios.delete(`/prescription/delete/${id}`);
      await this.getPrescriptions();
      return res.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export default new PrescriptionStore();
