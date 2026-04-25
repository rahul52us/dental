import { makeAutoObservable } from "mobx";
import axios from "axios";
import stores from "../stores";

export interface ILabWorkHierarchy {
  _id?: string;
  name: string;
  parent?: string | null;
  company?: string;
  isTextInput?: boolean;
  isActive?: boolean;
}


class LabWorkHierarchyStore {
  hierarchies: ILabWorkHierarchy[] = [];
  loading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  createHierarchy = async (data: ILabWorkHierarchy) => {
    try {
      this.loading = true;
      const response = await axios.post("/lab-work-hierarchy/create", { 
        ...data, 
        company: stores.auth.company 
      });
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };

  bulkCreateHierarchy = async (items: ILabWorkHierarchy[]) => {
    try {
      this.loading = true;
      const response = await axios.post("/lab-work-hierarchy/bulk", { 
        items,
        company: stores.auth.company 
      });
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };


  getAllHierarchies = async (query: any = {}) => {
    try {
      this.loading = true;
      const response = await axios.get("/lab-work-hierarchy/get", { 
        params: { ...query, company: stores.auth.company } 
      });
      if (response.data.status === "success") {
        this.hierarchies = response.data.data;
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };

  updateHierarchy = async (id: string, data: Partial<ILabWorkHierarchy>) => {
    try {
      this.loading = true;
      const response = await axios.put(`/lab-work-hierarchy/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };

  deleteHierarchy = async (id: string) => {
    try {
      this.loading = true;
      const response = await axios.delete(`/lab-work-hierarchy/delete/${id}`);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { status: "error", message: error.message };
    } finally {
      this.loading = false;
    }
  };

  getTree = () => {
    const buildTree = (parentId: string | null = null): any[] => {
      return this.hierarchies
        .filter(h => (h.parent || null) === parentId)
        .map(h => ({
          ...h,
          children: buildTree(h._id || null)
        }));
    };
    return buildTree();
  };

  getNamePath = (ids: string[]) => {
    if (!ids || ids.length === 0) return "";
    return ids.map(id => {
      if (!id) return null;
      if (id.startsWith("TXT:")) return id.replace("TXT:", "");
      
      const found = this.hierarchies.find(h => h._id === id || h.name === id);
      return found ? found.name : id;
    }).filter(Boolean).join(" > ");
  };

}


export default new LabWorkHierarchyStore();
