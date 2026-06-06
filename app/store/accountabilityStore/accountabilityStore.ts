import { makeAutoObservable } from "mobx";
import axios from "axios";

class AccountabilityStore {
  accountabilities: any = {
    data: [],
    total: 0,
    page: 1,
    totalPages: 0,
  };
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  createAccountability = async (data: any) => {
    try {
      this.loading = true;
      const res = await axios.post("/accountability/create", data);
      return res.data;
    } catch (error: any) {
      return Promise.reject(error?.response?.data || error.message);
    } finally {
      this.loading = false;
    }
  };

  updateAccountability = async (id: string, data: any) => {
    try {
      this.loading = true;
      const res = await axios.put(`/accountability/update/${id}`, data);
      return res.data;
    } catch (error: any) {
      return Promise.reject(error?.response?.data || error.message);
    } finally {
      this.loading = false;
    }
  };

  getAccountabilityList = async (query: any) => {
    try {
      this.loading = true;
      const res = await axios.get("/accountability/list", { params: query });
      if (res.data.status === "success") {
        this.accountabilities = {
          data: res.data.data,
          total: res.data.total,
          page: res.data.page,
          totalPages: res.data.totalPages,
        };
      }
      return res.data;
    } catch (error: any) {
      return Promise.reject(error?.response?.data || error.message);
    } finally {
      this.loading = false;
    }
  };

  updatePayoutStatus = async (id: string, data: any) => {
    try {
      this.loading = true;
      const res = await axios.put(`/accountability/update-payout/${id}`, data);
      return res.data;
    } catch (error: any) {
      return Promise.reject(error?.response?.data || error.message);
    } finally {
      this.loading = false;
    }
  };

  deleteAccountability = async (id: string) => {
    try {
      this.loading = true;
      const res = await axios.delete(`/accountability/delete/${id}`);
      return res.data;
    } catch (error: any) {
      return Promise.reject(error?.response?.data || error.message);
    } finally {
      this.loading = false;
    }
  };

  downloadAccountabilityReport = async (query: any) => {
    try {
      this.loading = true;
      const res = await axios.get("/accountability/generate-payout-report", { params: query });
      if (res.data.status === "success" && res.data.data) {
        const base64Data = res.data.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Payout_Report_${new Date().getTime()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Accountability Download Error:", error);
      throw error;
    } finally {
      this.loading = false;
    }
  };

  getAccountabilityCountByDate = async (query: { company: string; patientId?: string }) => {
    try {
      this.loading = true;
      const res = await axios.get("/accountability/count-by-date", { params: query });
      return res.data;
    } catch (error: any) {
      console.error("Failed to fetch accountability count by date:", error);
      return Promise.reject(error?.response?.data || error.message);
    } finally {
      this.loading = false;
    }
  };

  getAccountabilityGroupedByDate = async (query: { company: string; patientId?: string }) => {
    try {
      this.loading = true;
      const res = await axios.get("/accountability/grouped-by-date", { params: query });
      return res.data;
    } catch (error: any) {
      console.error("Failed to fetch accountability grouped by date:", error);
      return Promise.reject(error?.response?.data || error.message);
    } finally {
      this.loading = false;
    }
  };
}

export default new AccountabilityStore();
