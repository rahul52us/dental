import { makeAutoObservable } from "mobx";
import axios from "axios";
import stores from "../stores";

class LabWorkStore {
  labWorks: any[] = [];
  totalCount: number = 0;
  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  createLabWork = async (data: any) => {
    try {
      this.loading = true;
      const response = await axios.post("/lab-work", { ...data, company: stores.auth.company });
      return response.data;
    } catch (error: any) {
      return error.response.data;
    } finally {
      this.loading = false;
    }
  };

  getAllLabWorks = async (query: any = {}) => {
    try {
      this.loading = true;
      const response = await axios.get("/lab-work", { params: { ...query, company: stores.auth.company } });
      if (response.data.status === "success") {
        this.labWorks = response.data.data.data;
        this.totalCount = response.data.data.count;
      }
      return response.data;
    } catch (error: any) {
      return error.response.data;
    } finally {
      this.loading = false;
    }
  };

  getLabWorkById = async (id: string) => {
    try {
      this.loading = true;
      const response = await axios.get(`/lab-work/${id}`);
      return response.data;
    } catch (error: any) {
      return error.response.data;
    } finally {
      this.loading = false;
    }
  };

  updateLabWork = async (id: string, data: any) => {
    try {
      this.loading = true;
      const response = await axios.patch(`/lab-work/${id}`, { ...data, company: stores.auth.company });
      return response.data;
    } catch (error: any) {
      return error.response.data;
    } finally {
      this.loading = false;
    }
  };

  deleteLabWork = async (id: string) => {
    try {
      this.loading = true;
      const response = await axios.delete(`/lab-work/${id}`);
      return response.data;
    } catch (error: any) {
      return error.response.data;
    } finally {
      this.loading = false;
    }
  };
}

export default new LabWorkStore();
