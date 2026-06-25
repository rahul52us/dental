import { makeAutoObservable } from "mobx";
import axios from "axios";

export default class OldDataStore {
  workComp: any[] = [];
  toothWork: any[] = [];
  transactions: any[] = [];
  workFees: any[] = [];

  totalWorkComp = 0;
  totalToothWork = 0;
  totalTransactions = 0;
  totalWorkFees = 0;

  loading = false;
  detailsLoading = false;
  selectedFullRecord: any = null;
  
  // Pagination & Search State
  workCompPage = 1;
  toothWorkPage = 1;
  transactionPage = 1;
  workFeePage = 1;
  
  searchQuery = "";

  startDate: Date = (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 30); return d; })();
  endDate: Date = new Date();
  appliedStartDate: Date | null = null;
  appliedEndDate: Date | null = null;

  limit = 20;

  constructor() {
    makeAutoObservable(this);
  }

  setSearchQuery(query: string) {
    if (this.searchQuery === query) return;
    this.searchQuery = query;
    // Reset pages when search changes
    this.workCompPage = 1;
    this.toothWorkPage = 1;
    this.transactionPage = 1;
    this.workFeePage = 1;
  }

  setPage(tab: string, page: number) {
    if (tab === "workComp") this.workCompPage = page;
    if (tab === "toothWork") this.toothWorkPage = page;
    if (tab === "transactions") this.transactionPage = page;
    if (tab === "workFees") this.workFeePage = page;
  }

  setStartDate(date: Date) {
    this.startDate = date;
  }

  setEndDate(date: Date) {
    this.endDate = date;
  }

  applyDateFilter(tab: string) {
    this.appliedStartDate = this.startDate;
    this.appliedEndDate = this.endDate;
    this.workCompPage = 1;
    this.toothWorkPage = 1;
    this.transactionPage = 1;
    this.workFeePage = 1;
    
    if (tab === "workComp") this.fetchWorkComp();
    if (tab === "toothWork") this.fetchToothWork();
    if (tab === "transactions") this.fetchTransactions();
    if (tab === "workFees") this.fetchWorkFees();
  }

  resetDateFilter(tab: string) {
    this.appliedStartDate = null;
    this.appliedEndDate = null;
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);
    this.startDate = thirtyYearsAgo;
    this.endDate = new Date();
    this.searchQuery = "";
    
    this.workCompPage = 1;
    this.toothWorkPage = 1;
    this.transactionPage = 1;
    this.workFeePage = 1;
    
    if (tab === "workComp") this.fetchWorkComp();
    if (tab === "toothWork") this.fetchToothWork();
    if (tab === "transactions") this.fetchTransactions();
    if (tab === "workFees") this.fetchWorkFees();
  }

  async fetchWorkComp() {
    try {
      this.loading = true;
      let url = `/old-data/work-comp?page=${this.workCompPage}&limit=${this.limit}&search=${this.searchQuery}`;
      if (this.appliedStartDate && this.appliedEndDate) {
        url += `&startDate=${this.appliedStartDate.toISOString()}&endDate=${this.appliedEndDate.toISOString()}`;
      }
      const res = await axios.get(url);
      this.workComp = res.data.data;
      this.totalWorkComp = res.data.totalCount;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error);
    }
  }

  async fetchToothWork() {
    try {
      this.loading = true;
      let url = `/old-data/tooth-work?page=${this.toothWorkPage}&limit=${this.limit}&search=${this.searchQuery}`;
      if (this.appliedStartDate && this.appliedEndDate) {
        url += `&startDate=${this.appliedStartDate.toISOString()}&endDate=${this.appliedEndDate.toISOString()}`;
      }
      const res = await axios.get(url);
      this.toothWork = res.data.data;
      this.totalToothWork = res.data.totalCount;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error);
    }
  }

  async fetchTransactions() {
    try {
      this.loading = true;
      let url = `/old-data/transactions?page=${this.transactionPage}&limit=${this.limit}&search=${this.searchQuery}`;
      if (this.appliedStartDate && this.appliedEndDate) {
        url += `&startDate=${this.appliedStartDate.toISOString()}&endDate=${this.appliedEndDate.toISOString()}`;
      }
      const res = await axios.get(url);
      this.transactions = res.data.data;
      this.totalTransactions = res.data.totalCount;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error);
    }
  }

  async fetchWorkFees() {
    try {
      this.loading = true;
      let url = `/old-data/work-fees?page=${this.workFeePage}&limit=${this.limit}&search=${this.searchQuery}`;
      if (this.appliedStartDate && this.appliedEndDate) {
        url += `&startDate=${this.appliedStartDate.toISOString()}&endDate=${this.appliedEndDate.toISOString()}`;
      }
      const res = await axios.get(url);
      this.workFees = res.data.data;
      this.totalWorkFees = res.data.totalCount;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error);
    }
  }

  async fetchLegacyRecordDetails(legacyWrkDoneId: string) {
    if (!legacyWrkDoneId) return;
    try {
      this.detailsLoading = true;
      const res = await axios.get(`/old-data/legacy-record-details/${legacyWrkDoneId}`);
      this.selectedFullRecord = res.data.data;
      this.detailsLoading = false;
    } catch (error) {
      this.detailsLoading = false;
      console.error(error);
    }
  }

  clearSelectedRecord() {
    this.selectedFullRecord = null;
  }
}
