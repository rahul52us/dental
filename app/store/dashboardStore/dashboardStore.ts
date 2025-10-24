import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

class DashboardStore {
  count : any = {
    data: {},
    loading: false,
  };

  masterData : any = {
    data: {},
    loading: false,
  };


  notification : any = {
    data : [],
    loading : false,
    totalPages : 0
  }

  constructor() {
    makeAutoObservable(this);
  }

  getNotifications = async (type?: string | boolean, page: number = 1, limit: number = 10) => {
    this.notification.loading = true;
    try {
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (type !== undefined && type !== "All") {
        params.read = type;
      }

      const { data } = await axios.get("/notification", { params });

      this.notification.data = data?.data || [];
      this.notification.totalPages = data?.totalPages || 0;

      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.notification.loading = false;
    }
  };


  markAsReadNotifications = async (id : any) => {
    try {
      const { data } = await axios.put(`/notification`, {_id : id});
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
    }
  };

  getDashboardCount = async () => {
    this.count.loading = true;
    try {
      const { data } = await axios.get(`/dashboard/counts`);

      this.count.data = data?.data || {};
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.count.loading = false;
    }
  };

  getMasterData = async () => {
    this.masterData.loading = true;
    try {
      const { data } = await axios.post(`/masters`,{company : authStore.company});
      this.masterData.data = data?.data?.masters || [];
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.masterData.loading = false;
    }
  };

  createOrUpdateMasterData = async (sendData : any) => {
    try {
      const { data } = await axios.put(`/masters`, {...sendData,company : authStore.company});
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
    }
  };

  getMasterOptions = (category: string): any=> {
  const masters = this.masterData.data || [];
  const cat = masters.find((c: any) => c.category === category);

  if (!cat) return [];
  return cat.options.map((o: any) => ({
    label: o.optionName || o.label,
    value: o.code || o.value,
  }));
};
}

export const dashboardStore = new DashboardStore();
