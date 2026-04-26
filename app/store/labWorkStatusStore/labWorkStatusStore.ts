import { makeAutoObservable } from "mobx";
import axios from "axios";
import stores from "../stores";

class LabWorkStatusStore {
  statuses: any[] = [];
  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  createLabWorkStatus = async (data: any) => {
    try {
      this.loading = true;
      const response = await axios.post("/lab-work-status", { ...data, company: stores.auth.company });
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };

  getLabWorkStatuses = async (type?: string) => {
    try {
      this.loading = true;
      const params: any = { company: stores.auth.company };
      if (type) params.type = type;

      const response = await axios.get("/lab-work-status", { params });
      if (response.data.status === "success") {
        this.statuses = response.data.data;
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };

  updateLabWorkStatus = async (id: string, data: any) => {
    try {
      this.loading = true;
      const response = await axios.put(`/lab-work-status/${id}`, { ...data, company: stores.auth.company });
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };

  deleteLabWorkStatus = async (id: string) => {
    try {
      this.loading = true;
      const response = await axios.delete(`/lab-work-status/${id}`);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };
}

export default new LabWorkStatusStore();
