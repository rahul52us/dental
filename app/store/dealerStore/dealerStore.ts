import axios from "axios";
import { action, makeObservable, observable } from "mobx";
import stores from "../stores";

class DealerStore {
  auth : any;
  dealers = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  lineItems = {
    data: [],
    loading: false,
    hasFetch: false,
    currentPage: 1,
    TotalPages: 0,
  };

  constructor() {
    makeObservable(this, {
      dealers: observable,
      lineItems:observable,
      getDealerLineItems:action,
      getDealers: action,
      createDealer: action,
      updateDealer:action,
      updateDealerItem:action,
      deleteDealer:action,
      deleteDealerItem:action
    });
  }

  createDealer = async (sendData: any) => {
    try {
      const { data } = await axios.post("/dealer/create", {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  createDealerItem = async (sendData: any) => {
    try {
      const { data } = await axios.post("/dealer/item/create", {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateDealer = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/dealer/${sendData?._id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateDealerItem = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/dealer/item/${sendData?.id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteDealerItem = async (sendData: any) => {
    try {
      const { data } = await axios.delete(`/dealer/item/${sendData?.id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteDealer = async (sendData: any) => {
    try {
      const { data } = await axios.delete(`/dealer/${sendData.id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getDealers = async (sendData : any) => {
    try {
      this.dealers.loading = true;
      const { data } = await axios.post(`/dealer/get`,{company : [stores.auth.company]},{params : {...sendData}});
      this.dealers.data = data?.data?.data || [];
      this.dealers.TotalPages = data?.data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.dealers.loading = false;
    }
  };

  getDealerLineItems = async (sendData : any) => {
    try {
      this.lineItems.loading = true;
      const { data } = await axios.post(`/dealer/items/get`,{company : [stores.auth.company]},{params : {...sendData}});
      this.lineItems.data = data?.data || [];
      this.lineItems.TotalPages = data?.totalPages || 0;
      return data.data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.lineItems.loading = false;
    }
  }

  updateLineItems = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/dealer/item/${sendData?._id}`, {...sendData,company : stores.auth.company});
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export const dealerStore = new DealerStore();
