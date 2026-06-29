import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";

interface WorkDone {
  data: any[];
  totalItems: number;
  totalPages: number;
  loading: boolean;
  message?: string;
}

class WorkDoneStore {
  workDone: WorkDone = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    loading: false,
    message: ""
  };

  patientStats = {
    totalBill: 0,
    patientPending: 0,
    loading: false,
  };

  overallStats = {
    totalBill: 0,
    patientPending: 0,
    loading: false,
  };

  doctorStats = {
    totalBill: 0,
    collected: 0,
    pending: 0,
    loading: false,
  };

  patientDoctors: any[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  getPatientFinancialStats = async (patientId: string, doctorId?: string) => {
    this.patientStats.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get("/workDone/stats", {
        params: { patientId, company: compId, doctorId }
      });
      if (data.status === "success") {
        this.patientStats = { ...data.data, loading: false };
      }
      return data;
    } catch (err: any) {
      console.error("Error fetching patient stats:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.patientStats.loading = false;
    }
  };

  getOverallPatientStats = async (patientId: string) => {
    this.overallStats.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get("/workDone/overall-stats", {
        params: { patientId, company: compId }
      });
      if (data.status === "success") {
        this.overallStats = { ...data.data, loading: false };
      }
      return data;
    } catch (err: any) {
      console.error("Error fetching overall stats:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.overallStats.loading = false;
    }
  };

  getDoctorFinancialStats = async (doctorId: string) => {
    this.doctorStats.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get("/workDone/doctor-stats", {
        params: { doctorId, company: compId }
      });
      if (data.status === "success") {
        this.doctorStats = { ...data.data, loading: false };
      }
      return data;
    } catch (err: any) {
      console.error("Error fetching doctor stats:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.doctorStats.loading = false;
    }
  };

  getWorkDone = async (sendData: {
    page?: number;
    limit?: number;
    patientId?: string;
    treatmentId?: string;
    doctorId?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
    search?: string;
    sittingNo?: number;
  }) => {
    this.workDone.loading = true;
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const params: any = {
        page: sendData.page || 1,
        limit: sendData.limit || 10,
        company: compId,
        patientId: sendData.patientId,
        treatmentId: sendData.treatmentId,
        doctorId: sendData.doctorId,
        fromDate: sendData.fromDate,
        toDate: sendData.toDate,
        status: sendData.status,
        search: sendData.search,
        sittingNo: sendData.sittingNo,
      };

      const { data } = await axios.get("/workDone/get", { params });
      if (data.status === "success") {
        const rawItems = data?.data?.data || data?.data || [];
        this.workDone.data = Array.isArray(rawItems) ? rawItems : [];
        this.workDone.message = data.message || "";

        const totalItems = data?.data?.totalItems || data?.totalItems || 0;
        this.workDone.totalItems = totalItems;
        this.workDone.totalPages = Math.ceil(totalItems / (sendData.limit || 10)) || 1;
      }

      return data;
    } catch (err: any) {
      console.error("Error fetching work done:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.workDone.loading = false;
    }
  };

  fetchFilteredTablePDFBase64 = async (patientId: string, params: any) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const response = await axios.get(`/workDone/generate-filtered-table-pdf/${patientId}`, {
        params: { ...params, company: compId }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error generating table PDF");
    }
  };

  createWorkDone = async (sendData: any) => {
    try {
      const compId = authStore.company?._id || authStore.company;
      const { data } = await axios.post("/workDone/create", { ...sendData, company: compId });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateWorkDone = async (id: string, sendData: any) => {
    try {
      const { data } = await axios.put(`/workDone/${id}`, { ...sendData });
      const index = this.workDone.data.findIndex(item => item._id === id);
      if (index !== -1) {
        this.workDone.data[index] = { ...this.workDone.data[index], ...sendData };
      }
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateTotalBillAmount = async (id: string, amount: number) => {
    try {
      const { data } = await axios.put(`/workDone/update-amount/${id}`, { amount });
      const index = this.workDone.data.findIndex(item => item._id === id);
      if (index !== -1) {
        this.workDone.data[index] = { ...this.workDone.data[index], amount };
      }
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteWorkDone = async (workDoneId: string) => {
    try {
      const { data } = await axios.delete(`/workDone/${workDoneId}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  assignSittingNo = async (sendData: { workDoneId: string; sittingNo: number }) => {
    try {
      const { data } = await axios.put(`/workDone/assign-sitting/${sendData.workDoneId}`, { sittingNo: sendData.sittingNo });
      const index = this.workDone.data.findIndex((item) => item._id === sendData.workDoneId);
      if (index !== -1) {
        this.workDone.data[index] = { ...this.workDone.data[index], sittingNo: sendData.sittingNo };
      }
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  getPatientDoctors = async (patientId: string) => {
    try {
      const { data } = await axios.get(`/workDone/doctors/${patientId}`);
      if (data.status === "success") {
        this.patientDoctors = data.data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchGlobalAccountability = async (filters: any = {}) => {
    try {
      this.workDone.loading = true;
      const { data } = await axios.post(`/workDone/global-accountability`, filters);
      if (data.status === "success") {
        this.workDone.loading = false;
        return data.data;
      }
      this.workDone.loading = false;
      return null;
    } catch (err: any) {
      this.workDone.loading = false;
      return Promise.reject(err?.response?.data || err);
    }
  };

  fetchGlobalAccountabilityReportBase64 = async (filters: any = {}) => {
    try {
      const { data } = await axios.post(`/workDone/generate-global-accountability-report`, filters);
      if (data.status === "error") {
        throw new Error(data.message || "Failed to fetch report");
      }
      return data.data; // Base64 string
    } catch (error) {
      console.error("Error fetching global accountability report:", error);
      throw error;
    }
  };

  /**
   * FETCH RECEIPTS LOG BASE64 (FOR PREVIEW)
   */
  fetchReceiptsLogBase64 = async (patientId: string, filters: any = {}) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get(`/workDone/generate-receipts-log/${patientId}`, {
        params: {
          company: compId,
          ...filters
        }
      });
      return data.data; // Base64 string
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  /**
   * FETCH PATIENT STATEMENT BASE64 (FOR PREVIEW)
   */
  fetchPatientStatementBase64 = async (patientId: string, filters: any = {}) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get("/workDone/generate-pdf", {
        params: {
          patientId,
          company: compId,
          ...filters
        }
      });

      if (data.status === "success") {
        return data.data; // Return base64 string
      }
      throw new Error(data.message || "Failed to fetch statement");
    } catch (error: any) {
      console.error("Error fetching patient statement:", error);
      throw error;
    }
  };

  /**
   * DOWNLOAD THE OVERALL PATIENT STATEMENT
   */
  downloadPatientStatement = async (patientId: string, filters: any = {}) => {
    try {
      const base64Data = await this.fetchPatientStatementBase64(patientId, filters);
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
      link.setAttribute("download", `Statement_${patientId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      throw err;
    }
  };

  /**
   * DOWNLOAD A RECEIPT FOR A SINGLE TREATMENT RECORD
   */
  downloadSingleRecordReport = async (workDoneId: string) => {
    try {
      const base64Data = await this.fetchSingleRecordReportBase64(workDoneId);
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
      link.setAttribute("download", `Receipt_${workDoneId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading single record PDF:", err);
      throw err;
    }
  };

  /**
   * FETCH DOCTOR REPORT BASE64 (FOR PREVIEW)
   */
  fetchDoctorReportBase64 = async (filters: any) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get(`/workDone/generate-doctor-report`, {
        params: {
          ...filters,
          company: compId
        }
      });

      if (data.status === "success") {
        return data.data; // Return base64 string
      }
      throw new Error(data.message || "Failed to fetch doctor report");
    } catch (error: any) {
      console.error("Error fetching doctor report:", error);
      throw error;
    }
  };

  /**
   * DOWNLOAD DOCTOR-SPECIFIC WORK DONE REPORT
   * Supports filtering by patient and date range.
   */
  downloadDoctorReport = async (filters: {
    doctorId: string;
    patientId?: string;
    fromDate?: string;
    toDate?: string;
    status?: string;
  }) => {
    try {
      const base64Data = await this.fetchDoctorReportBase64(filters);
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
      link.setAttribute("download", `Doctor_Report_${filters.doctorId}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error("Doctor Report Download Error:", err);
      throw err;
    }
  };

  /**
   * FETCH PAYMENT RECEIPT BASE64 (FOR PREVIEW)
   */
  fetchPaymentReceiptBase64 = async (workDoneId: string, paymentIndex: number) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get(`/workDone/generate-payment-receipt/${workDoneId}/${paymentIndex}`, {
        params: { company: compId }
      });

      if (data.status === "success") {
        return data.data; // Return base64 string
      }
      throw new Error(data.message || "Failed to fetch PDF");
    } catch (error: any) {
      console.error("Error fetching payment receipt:", error);
      throw error;
    }
  };

  /**
   * FETCH SINGLE RECORD REPORT BASE64 (FOR PREVIEW)
   */
  fetchSingleRecordReportBase64 = async (workDoneId: string) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.get(`/workDone/generate-receipt/${workDoneId}`, {
        params: { company: compId }
      });

      if (data.status === "success") {
        return data.data; // Return base64 string
      }
      throw new Error(data.message || "Failed to fetch PDF");
    } catch (error: any) {
      console.error("Error fetching report:", error);
      throw error;
    }
  };

  /**
   * GENERATE BLOB URL FOR PREVIEWING
   */
  generateWorkDoneReportBlob = async (workDoneId: string, params: { prescriptions: any[], topPadding: number, bottomPadding: number, reportType?: string }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.post(`/workDone/generate-workdone-report/${workDoneId}?company=${compId}`, params);

      if (data.status === "success") {
        const base64Data = data.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        return { url, blob };
      }
      return null;
    } catch (err) {
      console.error("Error generating work done report blob:", err);
      throw err;
    }
  };

  downloadWorkDoneReport = async (workDoneId: string, params: { prescriptions: any[], topPadding: number, bottomPadding: number, isPreview?: boolean, reportType?: string }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.post(`/workDone/generate-workdone-report/${workDoneId}?company=${compId}`, params);

      if (data.status === "success") {
        const base64Data = data.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);

        if (params.isPreview) {
          // Open in new tab for preview
          window.open(url, '_blank');
        } else {
          // Regular download
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `WorkDone_Report_${workDoneId}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Note: For preview, we don't revoke the URL immediately as the new tab needs it
        if (!params.isPreview) {
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error("Error downloading work done report PDF:", err);
      throw err;
    }
  };

  /**
   * GENERATE FILTERED REPORT BLOB FOR PREVIEWING
   */
  generateFilteredWorkDoneReportBlob = async (patientId: string, filters: any, params: { prescriptions: any[], topPadding: number, bottomPadding: number }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const queryParams = new URLSearchParams({
        company: compId,
        ...(filters.treatmentId && { treatmentId: filters.treatmentId }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
        ...(filters.doctorId && { doctorId: filters.doctorId }),
        ...(filters.toothNumber && { toothNumber: filters.toothNumber }),
        ...(filters.reportType && { reportType: filters.reportType }),
        ...(filters.sittingNo && { sittingNo: filters.sittingNo }),
      });
      const { data } = await axios.post(`/workDone/generate-filtered-report/${patientId}?${queryParams.toString()}`, params);

      if (data.status === "success") {
        const base64Data = data.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        return { url, blob };
      }
      return null;
    } catch (err) {
      console.error("Error generating filtered report blob:", err);
      throw err;
    }
  };

  /**
   * DOWNLOAD FILTERED WORK DONE REPORT
   */
  downloadFilteredWorkDoneReport = async (patientId: string, filters: any, params: { prescriptions: any[], topPadding: number, bottomPadding: number, isPreview?: boolean }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const queryParams = new URLSearchParams({
        company: compId,
        ...(filters.treatmentId && { treatmentId: filters.treatmentId }),
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
        ...(filters.doctorId && { doctorId: filters.doctorId }),
        ...(filters.toothNumber && { toothNumber: filters.toothNumber }),
        ...(filters.reportType && { reportType: filters.reportType }),
        ...(filters.sittingNo && { sittingNo: filters.sittingNo }),
      });
      const { data } = await axios.post(`/workDone/generate-filtered-report/${patientId}?${queryParams.toString()}`, params);

      if (data.status === "success") {
        const base64Data = data.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);

        if (params.isPreview) {
          window.open(url, '_blank');
        } else {
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `Filtered_Report_${patientId}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        if (!params.isPreview) {
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error("Error downloading filtered report PDF:", err);
      throw err;
    }
  };

  /**
   * DOWNLOAD A RECEIPT FOR A SPECIFIC PAYMENT INSTALLMENT
   */
  downloadPaymentReceipt = async (workDoneId: string, paymentIndex: number) => {
    try {
      const base64Data = await this.fetchPaymentReceiptBase64(workDoneId, paymentIndex);
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
      link.setAttribute("download", `Payment_Receipt_${workDoneId}_${paymentIndex}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading payment receipt PDF:", err);
      throw err;
    }
  };

  /**
   * GENERATE DAILY BULK REPORT BLOB FOR PREVIEW
   */
  generateDailyWorkDoneReportBlob = async (patientId: string, params: { date: string, prescriptions: any[], topPadding: number, bottomPadding: number }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.post(`/workDone/generate-daily-report/${patientId}?company=${compId}&date=${params.date}`, params);

      if (data.status === "success") {
        const base64Data = data.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        return { url, blob };
      }
      return null;
    } catch (err) {
      console.error("Error generating daily report blob:", err);
      throw err;
    }
  };

  /**
   * DOWNLOAD DAILY BULK REPORT PDF
   */
  downloadDailyWorkDoneReport = async (patientId: string, params: { date: string, prescriptions: any[], topPadding: number, bottomPadding: number }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const { data } = await axios.post(`/workDone/generate-daily-report/${patientId}?company=${compId}&date=${params.date}`, params);

      if (data.status === "success") {
        const base64Data = data.data;
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
        link.setAttribute("download", `Daily_Report_${patientId}_${params.date}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error downloading daily report PDF:", err);
      throw err;
    }
  };

  /**
   * FETCH WORK DONE COUNTS GROUPED BY DATE
   */
  getWorkDoneCountByDate = async (sendData: { patientId: any }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const params = {
        company: compId,
        patientId: sendData.patientId,
      };
      const { data } = await axios.get("/workDone/count-by-date", { params });
      return data;
    } catch (err: any) {
      console.error("Failed to fetch work done count by date:", err);
      return Promise.reject(err?.response?.data || err);
    }
  };

  /**
   * FETCH WORK DONE DATA GROUPED BY DATE
   */
  getWorkDoneGroupedByDate = async (sendData: { patientId: any }) => {
    try {
      const companyId = localStorage.getItem("companyId");
      const compId = authStore.company?._id || authStore.company || companyId;
      const params = {
        company: compId,
        patientId: sendData.patientId,
      };
      const { data } = await axios.get("/workDone/grouped-by-date", { params });
      return data;
    } catch (err: any) {
      console.error("Failed to fetch work done grouped by date:", err);
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export const workDoneStore = new WorkDoneStore();
export default workDoneStore;
