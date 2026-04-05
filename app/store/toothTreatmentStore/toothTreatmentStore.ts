import { makeAutoObservable } from "mobx";
import axios from "axios";
import { authStore } from "../authStore/authStore";
import { adultTeeth, childTeeth, getTeethByType } from "../../component/common/TeethModel/DentalChartComponent/utils/teethData";

interface ToothTreatment {
  data: any[];
  totalItems: number;
  totalPages: number;
  loading: boolean;
}

class ToothTreatmentStore {
  toothTreatment: ToothTreatment = {
    data: [],
    totalItems: 0,
    totalPages: 0,
    loading: false,
  };

  lastExaminingDoctor: any = null;

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lastExaminingDoctor");
      if (saved) {
        try {
          this.lastExaminingDoctor = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse lastExaminingDoctor", e);
        }
      }
    }
  }

  setLastExaminingDoctor = (doctor: any) => {
    this.lastExaminingDoctor = doctor;
    if (typeof window !== "undefined") {
      localStorage.setItem("lastExaminingDoctor", JSON.stringify(doctor));
    }
  };

  // Common get with search and pagination support
  getToothTreatmentById = async (sendData: { treatmentId?: string, appointmentId?: string }) => {
    try {
      if (sendData.appointmentId) {
        const { data } = await axios.get("/toothTreatment/get", {
          params: { company: authStore.company, appointmentId: sendData.appointmentId, limit: 1 }
        });
        const rawItems = data?.data?.data || data?.data || [];
        return { status: "success", data: rawItems[0] || null };
      }

      const { data } = await axios.get(`/toothTreatment/${sendData.treatmentId}`, {
        params: { company: authStore.company }
      });
      return data;
    } catch (error) {
      console.error("Error fetching treatment by id:", error);
      throw error;
    }
  };

  getToothTreatments = async (sendData: { page: number, search: string, category?: string, patientId?: any }) => {
    console.log("Fetching tooth treatments with params:", sendData);
    this.toothTreatment.loading = true;
    try {
      const params: any = {
        page: sendData.page,
        limit: 10,
        company: authStore.company,
        patientId: sendData.patientId,
        patient: sendData.patientId,
      };

      if (sendData.search) params.search = sendData.search;
      if (sendData.category && sendData.category !== 'all') {
        params.complaintType = sendData.category;
      }

      const { data } = await axios.get("/toothTreatment/get", { params });

      // Extract items from data.data.data or data.data depending on backend structure
      const rawItems = data?.data?.data || data?.data || [];
      const mappedData = rawItems.map((it: any) => {
        const fdi = it?.tooth || "--";
        const notation = it?.toothNotation || "fdi";
        const dentition = it?.dentitionType || "adult";
        
        // Find tooth object for notation mapping
        const allTeeth = getTeethByType(dentition as any);
        const toothObj = allTeeth.find(t => t.id === fdi);
        
        const toothUniversal = toothObj?.universal || "--";
        const toothPalmer = toothObj?.palmer || "--";

        let toothLabel = `FDI ${fdi}`;
        if (notation === "universal") toothLabel = `U ${toothUniversal}`;
        else if (notation === "palmer") toothLabel = `P ${toothPalmer}`;

        return {
          ...it,
          patientName: it?.patient?.name,
          doctorName: it?.doctor?.name,
          examiningDoctorName: it?.examiningDoctor?.name,
          toothFDI: fdi,
          toothUniversal: toothUniversal,
          toothPalmer: toothPalmer,
          toothName: toothLabel,
        }
      });

      this.toothTreatment.data = mappedData;

      // Extract the total count from the new backend response structure (data.data.totalItems)
      const totalItems = data?.data?.totalItems || data?.totalItems || data?.count || rawItems.length || 0;
      this.toothTreatment.totalItems = totalItems;

      // Ensure totalPages is calculated based on the actual limit (10) used in this request
      this.toothTreatment.totalPages = Math.ceil(totalItems / 10) || 1;

      console.log("Extracted Pagination Metadata:", { totalItems, totalPages: this.toothTreatment.totalPages });

      return data;
    } catch (err: any) {
      console.error("Error fetching treatments:", err);
      return Promise.reject(err?.response?.data || err);
    } finally {
      this.toothTreatment.loading = false;
    }
  };

  // Create Treatment
  createToothTreatment = async (sendData: any) => {
    try {
      const { data } = await axios.post("/toothTreatment/create", { ...sendData, company: authStore.company });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  updateToothTreatment = async (sendData: any) => {
    try {
      const { data } = await axios.put(`/toothTreatment/${sendData.treatmentId}`, { ...sendData, company: authStore.company });
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };

  deleteToothTreatment = async (treatmentId: string) => {
    try {
      const { data } = await axios.delete(`/toothTreatment/${treatmentId}`);
      return data;
    } catch (err: any) {
      return Promise.reject(err?.response?.data || err);
    }
  };
}

export const toothTreatmentStore = new ToothTreatmentStore();
export default toothTreatmentStore;
