import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class ProcedureStore {
  procedures: any = {
    data: [],
    loading: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  getProcedures = async () => {
    this.procedures.loading = true;
    try {
      const { data } = await axios.get("/procedure/get", {
        params: { companyId: authStore.company }
      });
      this.procedures.data = data?.data || [];
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.procedures.loading = false;
    }
  };

  createProcedure = async (procedureData: any) => {
    try {
      const { data } = await axios.post("/procedure/create", {
        ...procedureData,
        company: authStore.company
      });
      await this.getProcedures();
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateProcedure = async (id: string, procedureData: any) => {
    try {
      const { data } = await axios.put(`/procedure/${id}`, procedureData);
      await this.getProcedures();
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteProcedure = async (id: string) => {
    try {
      const { data } = await axios.delete(`/procedure/${id}`);
      await this.getProcedures();
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  bulkCreateProcedures = async (procedures: any[]) => {
    try {
      const { data } = await axios.post("/procedure/bulk-create", {
        procedures,
        company: authStore.company
      });
      await this.getProcedures();
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export const procedureStore = new ProcedureStore();
