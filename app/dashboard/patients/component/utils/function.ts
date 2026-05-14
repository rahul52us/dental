import { genderOptions, insuranceTypeOptions, vaccinationTypeOptions } from "../../../../config/constant";
import { initialValues, titles } from "./constant";

export const generateIntialValues = (initialData: any = {}) => {

  return {
    ...initialValues,
    ...initialData,
    pic: initialData?.pic?.url
      ? { file: initialData.pic }
      : { file: [] },
    references: Array.isArray(initialData?.references)
      ? initialData.references.map((it: any) => ({
          refrenceBy: it?.refrenceBy && typeof it.refrenceBy === 'object'
            ? { label: it.refrenceBy.label, value: it.refrenceBy.value }
            : it?.refrenceBy 
              ? { label: it.refrenceBy, value: it.refrenceBy } 
              : null,
          refrenceNote: it?.refrenceNote || "",
        }))
      : initialData?.refrenceBy 
        ? [{
            refrenceBy: typeof initialData.refrenceBy === 'object'
              ? { label: initialData.refrenceBy.label, value: initialData.refrenceBy.value }
              : { label: initialData.refrenceBy, value: initialData.refrenceBy },
            refrenceNote: initialData?.refrenceNote || ""
          }]
        : [{ refrenceBy: null, refrenceNote: "" }],
    gender:
      genderOptions.find((it: any) => it.value === initialData?.gender) ||
      genderOptions[0],
    vaccinations: Array.isArray(initialData?.vaccinations)
      ? initialData.vaccinations.map((it: any) => ({
          ...it,
          type:
            vaccinationTypeOptions.find((opt: any) => opt.value === it?.type) ||
            null,
        }))
      : [],
      degreeInfo: Array.isArray(initialData?.degreeInfo)
      ? initialData.degreeInfo.map((it: any) => ({
          ...it,
        }))
      : [],
    insurances: Array.isArray(initialData?.insurances)
      ? initialData.insurances.map((it: any) => ({
          ...it
        }))
      : [],
    title:
     initialData?.title?.value  ?  titles[0] : {label : initialData?.title, value : initialData?.title},
  };
};

