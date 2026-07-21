import { makeAutoObservable } from 'mobx';
import axios from 'axios';

class GlobalConfigStore {
  config = {
    paymentQrCode: '',
    globalLogo: '',
    cronTime: '07:00'
  };
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  fetchGlobalConfig = async () => {
    this.isLoading = true;
    try {
      const response = await axios.get('/global-config');
      if (response.data?.success && response.data?.data) {
        this.config = response.data.data;
      }
    } catch (error) {
      console.error('Error fetching global config:', error);
    } finally {
      this.isLoading = false;
    }
  };

  updateGlobalConfig = async (payload: { paymentQrCode?: string; globalLogo?: string; cronTime?: string }) => {
    this.isLoading = true;
    try {
      const response = await axios.put('/global-config', payload);
      if (response.data?.success && response.data?.data) {
        this.config = response.data.data;
        return { success: true, data: response.data.data };
      }
      return { success: false, message: response.data?.message || 'Error updating' };
    } catch (error: any) {
      console.error('Error updating global config:', error);
      return { success: false, message: error?.response?.data?.message || error.message };
    } finally {
      this.isLoading = false;
    }
  };
}

export default GlobalConfigStore;
