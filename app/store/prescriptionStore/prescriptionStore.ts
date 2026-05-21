import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class PrescriptionStore {
  prescriptionsData: any[] = [];
  prescriptionsLoading: boolean = false;
  prescriptionsMetadata: { total: number, page: number, totalPages: number } = { total: 0, page: 1, totalPages: 1 };
  
  types: string[] = [];
  categories: string[] = [];
  brandNames: string[] = [];
  forms: string[] = [];
  companyNames: string[] = [];
  basicSalts: string[] = [];
  suggestionsLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get companyId() {
    return authStore.company?._id || authStore.company || (typeof window !== "undefined" ? localStorage.getItem("companyId") : null);
  }

  getSuggestions = async () => {
    this.suggestionsLoading = true;
    try {
      const res = await axios.get(`/prescription/suggestions`, {
        params: { companyId: this.companyId }
      });
      runInAction(() => {
        this.types = res.data.types || [];
        this.categories = res.data.categories || [];
        this.brandNames = res.data.brandNames || [];
        this.forms = res.data.forms || [];
        this.companyNames = res.data.companyNames || [];
        this.basicSalts = res.data.basicSalts || [];
        this.suggestionsLoading = false;
      });
      return res.data;
    } catch (err: any) {
      runInAction(() => {
        this.suggestionsLoading = false;
      });
      return Promise.reject(err?.response?.data || err);
    }
  };

  getPrescriptions = async (params: any = {}) => {
    this.prescriptionsLoading = true;
    try {
      const res = await axios.get(`/prescription/get`, { 
        params: { 
          ...params, 
          limit: 5000, // Fetch all records at once
          companyId: this.companyId 
        } 
      });
      runInAction(() => {
        this.prescriptionsData = res.data.data || [];
        this.prescriptionsMetadata = {
          total: res.data.total || res.data.data?.length || 0,
          page: res.data.page || 1,
          totalPages: res.data.totalPages || 1
        };
        this.prescriptionsLoading = false;
      });
      return res.data;
    } catch (err: any) {
      runInAction(() => {
        this.prescriptionsLoading = false;
      });
      return Promise.reject(err?.response?.data || err);
    }
  };

  createPrescription = async (data: any) => {
    try {
      const res = await axios.post(`/prescription/create`, {
        ...data,
        company: this.companyId
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

  bulkImportPrescriptions = async (base64Data: string) => {
    try {
      const res = await axios.post(`/prescription/bulk-import`, {
        base64Data,
        companyId: this.companyId,
        userId: authStore.user?._id
      });
      await this.getPrescriptions();
      return res.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getDailyPrescription = async (patientId: string, date: string) => {
    try {
      const res = await axios.get(`/prescription/patient-daily`, {
        params: { patientId, date }
      });
      return res.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  saveDailyPrescription = async (patientId: string, date: string, prescriptions: any[]) => {
    try {
      const res = await axios.post(`/prescription/patient-daily`, {
        patientId,
        date,
        prescriptions,
        company: this.companyId
      });
      return res.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export default new PrescriptionStore();
