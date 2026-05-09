import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class PrescriptionStore {
  prescriptionsData: any[] = [];
  prescriptionsLoading: boolean = false;
  
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

  getSuggestions = async () => {
    this.suggestionsLoading = true;
    try {
      const res = await axios.get(`/prescription/suggestions`, {
        params: { companyId: authStore.company }
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
          companyId: authStore.company 
        } 
      });
      runInAction(() => {
        this.prescriptionsData = res.data.data || [];
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

  bulkImportPrescriptions = async (base64Data: string) => {
    try {
      const res = await axios.post(`/prescription/bulk-import`, {
        base64Data,
        companyId: authStore.company,
        userId: authStore.user?._id
      });
      await this.getPrescriptions();
      return res.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export default new PrescriptionStore();
