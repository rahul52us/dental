import { makeAutoObservable } from "mobx";
import axios from "axios";

class DashboardStore {
  count : any = {
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
}

export const dashboardStore = new DashboardStore();
