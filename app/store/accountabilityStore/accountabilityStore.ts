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
}

export default new AccountabilityStore();
