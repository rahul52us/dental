import { makeAutoObservable } from "mobx";
import axios from "axios";
// No toast import

class AdvertisementStore {
  advertisements = {
    loading: false,
    data: [] as any[],
    totalPages: 1,
  };
  
  activeAdvertisements = {
    loading: false,
    data: [] as any[],
  };

  createAdvertisementState = {
    loading: false,
  };

  updateAdvertisementState = {
    loading: false,
  };

  deleteAdvertisementState = {
    loading: false,
  };

  constructor() {
    makeAutoObservable(this);
  }

  getAdvertisements = async (page = 1, limit = 10, search = "") => {
    this.advertisements.loading = true;
    try {
      const response = await axios.get(
        `/advertisement?page=${page}&limit=${limit}&search=${search}`
      );
      this.advertisements.data = response.data?.data?.data || [];
      this.advertisements.totalPages = response.data?.data?.totalPages || 1;
    } catch (error: any) {
      console.error(error?.response?.data?.message || "Failed to fetch advertisements");
    } finally {
      this.advertisements.loading = false;
    }
  };

  getActiveAdvertisements = async () => {
    this.activeAdvertisements.loading = true;
    try {
      const response = await axios.get(
        `/advertisement/active`
      );
      this.activeAdvertisements.data = response.data?.data || [];
    } catch (error: any) {
      console.error(error?.response?.data?.message || "Failed to fetch active advertisements");
    } finally {
      this.activeAdvertisements.loading = false;
    }
  };

  createAdvertisement = async (data: any, cb?: () => void) => {
    this.createAdvertisementState.loading = true;
    try {
      const response = await axios.post(
        `/advertisement`,
        data
      );
      console.log(response.data?.message || "Advertisement created successfully");
      if (cb) cb();
      this.getAdvertisements();
    } catch (error: any) {
      console.error(error?.response?.data?.message || "Failed to create advertisement");
    } finally {
      this.createAdvertisementState.loading = false;
    }
  };

  updateAdvertisement = async (id: string, data: any, cb?: () => void) => {
    this.updateAdvertisementState.loading = true;
    try {
      const response = await axios.put(
        `/advertisement/${id}`,
        data
      );
      console.log(response.data?.message || "Advertisement updated successfully");
      if (cb) cb();
      this.getAdvertisements();
    } catch (error: any) {
      console.error(error?.response?.data?.message || "Failed to update advertisement");
    } finally {
      this.updateAdvertisementState.loading = false;
    }
  };

  deleteAdvertisement = async (id: string) => {
    this.deleteAdvertisementState.loading = true;
    try {
      const response = await axios.delete(
        `/advertisement/${id}`
      );
      console.log(response.data?.message || "Advertisement deleted successfully");
      this.getAdvertisements();
    } catch (error: any) {
      console.error(error?.response?.data?.message || "Failed to delete advertisement");
    } finally {
      this.deleteAdvertisementState.loading = false;
    }
  };
}

export const advertisementStore = new AdvertisementStore();
export default advertisementStore;
