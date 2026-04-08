// FDI Tooth Numbering
export const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export const TOOTH_TYPES: Record<string, string> = {
    "18": "Molar", "17": "Molar", "16": "Molar",
    "15": "Premolar", "14": "Premolar",
    "13": "Canine",
    "12": "Incisor", "11": "Incisor", "21": "Incisor", "22": "Incisor",
    "23": "Canine",
    "24": "Premolar", "25": "Premolar",
    "26": "Molar", "27": "Molar", "28": "Molar",
    "48": "Molar", "47": "Molar", "46": "Molar",
    "45": "Premolar", "44": "Premolar",
    "43": "Canine",
    "42": "Incisor", "41": "Incisor", "31": "Incisor", "32": "Incisor",
    "33": "Canine",
    "34": "Premolar", "35": "Premolar",
    "36": "Molar", "37": "Molar", "38": "Molar",
};

export const TOOTH_NAMES: Record<string, string> = {
    "11": "Right Upper Central Incisor", "12": "Right Upper Lateral Incisor",
    "13": "Right Upper Canine", "14": "Right Upper First Premolar",
    "15": "Right Upper Second Premolar", "16": "Right Upper First Molar",
    "17": "Right Upper Second Molar", "18": "Right Upper Third Molar",
    "21": "Left Upper Central Incisor", "22": "Left Upper Lateral Incisor",
    "23": "Left Upper Canine", "24": "Left Upper First Premolar",
    "25": "Left Upper Second Premolar", "26": "Left Upper First Molar",
    "27": "Left Upper Second Molar", "28": "Left Upper Third Molar",
    "31": "Left Lower Central Incisor", "32": "Left Lower Lateral Incisor",
    "33": "Left Lower Canine", "34": "Left Lower First Premolar",
    "35": "Left Lower Second Premolar", "36": "Left Lower First Molar",
    "37": "Left Lower Second Molar", "38": "Left Lower Third Molar",
    "41": "Right Lower Central Incisor", "42": "Right Lower Lateral Incisor",
    "43": "Right Lower Canine", "44": "Right Lower First Premolar",
    "45": "Right Lower Second Premolar", "46": "Right Lower First Molar",
    "47": "Right Lower Second Molar", "48": "Right Lower Third Molar",
};

export interface TreatmentCategory {
    name: string;
    subcategories: {
        name: string;
        jobs: { name: string; }[];
    }[];
}

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
    {
        name: "Diagnostic",
        subcategories: [
            {
                name: "Clinical Oral Evaluations", jobs: [
                    { name: "Comprehensive Oral Evaluation" },
                    { name: "Periodic Oral Evaluation" },
                    { name: "Limited Oral Evaluation" },
                ]
            },
            {
                name: "Diagnostic Tests/Models", jobs: [
                    { name: "Diagnostic Casts" },
                    { name: "Pulp Vitality Tests" },
                ]
            },
        ],
    },
    {
        name: "Preventive",
        subcategories: [
            {
                name: "Dental Prophylaxis", jobs: [
                    { name: "Adult Prophylaxis" },
                    { name: "Child Prophylaxis" },
                ]
            },
            {
                name: "Fluoride Treatment", jobs: [
                    { name: "Topical Fluoride Application" },
                ]
            },
        ],
    },
    {
        name: "Restorative",
        subcategories: [
            {
                name: "Amalgam Restorations", jobs: [
                    { name: "One Surface" },
                    { name: "Two Surfaces" },
                    { name: "Three Surfaces" },
                ]
            },
            {
                name: "Composite Restorations - Direct", jobs: [
                    { name: "Anterior - One Surface" },
                    { name: "Anterior - Two Surfaces" },
                    { name: "Posterior - One Surface" },
                    { name: "Posterior - Two Surfaces" },
                    { name: "Crown Composite" },
                ]
            },
            {
                name: "Crowns - Single", jobs: [
                    { name: "Porcelain/Ceramic Crown" },
                    { name: "Metal Crown" },
                    { name: "PFM Crown" },
                ]
            },
            {
                name: "Inlay/Onlay Restorations", jobs: [
                    { name: "Inlay - One Surface" },
                    { name: "Onlay - Two Surfaces" },
                ]
            },
        ],
    },
    {
        name: "Endodontics",
        subcategories: [
            {
                name: "Pulpotomy", jobs: [
                    { name: "Pulpotomy - Removal Of Pulp Coronal" },
                ]
            },
            {
                name: "Root Canal Therapy", jobs: [
                    { name: "Anterior Root Canal" },
                    { name: "Premolar Root Canal" },
                    { name: "Molar Root Canal" },
                ]
            },
            {
                name: "Endodontic Retreatment", jobs: [
                    { name: "Anterior Retreatment" },
                    { name: "Premolar Retreatment" },
                    { name: "Molar Retreatment" },
                ]
            },
        ],
    },
    {
        name: "Periodontics",
        subcategories: [
            {
                name: "Surgical Services", jobs: [
                    { name: "Gingivectomy" },
                    { name: "Flap Surgery" },
                ]
            },
            {
                name: "Non-Surgical Services", jobs: [
                    { name: "Scaling & Root Planing" },
                ]
            },
        ],
    },
    {
        name: "Prosthodontics (Removable)",
        subcategories: [
            {
                name: "Complete Dentures", jobs: [
                    { name: "Complete Upper Denture" },
                    { name: "Complete Lower Denture" },
                ]
            },
            {
                name: "Partial Dentures", jobs: [
                    { name: "Cast Metal Partial" },
                    { name: "Flexible Partial" },
                ]
            },
        ],
    },
    {
        name: "Oral And Maxillofacial Surgery",
        subcategories: [
            {
                name: "Extractions", jobs: [
                    { name: "Simple Extraction" },
                    { name: "Surgical Extraction" },
                    { name: "Impacted Tooth Extraction" },
                ]
            },
        ],
    },
    {
        name: "Implant Services",
        subcategories: [
            {
                name: "Implant Placement", jobs: [
                    { name: "Endosteal Implant" },
                    { name: "Implant Abutment" },
                ]
            },
        ],
    },
    {
        name: "Orthodontics",
        subcategories: [
            {
                name: "Fixed Appliances", jobs: [
                    { name: "Metal Braces - Full" },
                    { name: "Ceramic Braces - Full" },
                ]
            },
            {
                name: "Removable Appliances", jobs: [
                    { name: "Clear Aligners" },
                ]
            },
        ],
    },
];

export const DOCTORS = [
    { id: "1", name: "Dr. Y.K. Virmani" },
    { id: "2", name: "Dr. Rijuta Virmani" },
    { id: "3", name: "Dr. M.S. Virmani" },
];

export type FindingType = "chief_complaint" | "other_findings" | "existing_findings";
export type TreatmentStatus = "Planned" | "Observation" | "Completed" | "Incomplete";

export interface TreatmentEntry {
    id: string;
    date: string;
    toothNumber: number | null;
    findingType: FindingType;
    notes: string;
    doctorId: string;
    treatmentCode: string;
    estimate: number;
    discount: number;
    status: TreatmentStatus;
    sitting: number | null;
    workDoneDate: string | null;
    workDoneNotes: string;
    todayPayment: number;
}

export const SAMPLE_PATIENT = {
    id: "26549874",
    name: "Sushma Sehgal",
    age: 42,
    gender: "Female",
    phone: "9876543210",
    location: "Rohini, Delhi",
    balancePayment: 0,
    medicalHistory: "",
    specialNote: "",
    referredBy: "",
};

// Sample data
export const SAMPLE_TREATMENTS: TreatmentEntry[] = [
    {
        id: "1",
        date: "2024-12-15",
        toothNumber: 11,
        findingType: "chief_complaint",
        notes: "Pain in upper right central incisor",
        doctorId: "1",
        treatmentCode: "Endodontics → Pulpotomy → Pulpotomy - Removal Of Pulp Coronal",
        estimate: 2000,
        discount: 0,
        status: "Completed",
        sitting: 1,
        workDoneDate: "2024-12-18",
        workDoneNotes: "Pulpotomy completed successfully",
        todayPayment: 2000,
    },
    {
        id: "2",
        date: "2024-12-15",
        toothNumber: 11,
        findingType: "chief_complaint",
        notes: "Crown needed after root canal",
        doctorId: "2",
        treatmentCode: "Restorative → Crowns - Single → PFM Crown",
        estimate: 6000,
        discount: 500,
        status: "Planned",
        sitting: 2,
        workDoneDate: null,
        workDoneNotes: "",
        todayPayment: 0,
    },
    {
        id: "3",
        date: "2024-12-20",
        toothNumber: 36,
        findingType: "other_findings",
        notes: "Caries detected during examination",
        doctorId: "1",
        treatmentCode: "Restorative → Composite Restorations - Direct → Posterior - Two Surfaces",
        estimate: 1800,
        discount: 0,
        status: "Planned",
        sitting: 3,
        workDoneDate: null,
        workDoneNotes: "",
        todayPayment: 0,
    },
    {
        id: "4",
        date: "2024-12-20",
        toothNumber: 46,
        findingType: "other_findings",
        notes: "Scaling recommended",
        doctorId: "2",
        treatmentCode: "Periodontics → Non-Surgical Services → Scaling & Root Planing",
        estimate: 2000,
        discount: 200,
        status: "Observation",
        sitting: null,
        workDoneDate: null,
        workDoneNotes: "",
        todayPayment: 0,
    },
    {
        id: "5",
        date: "2024-12-10",
        toothNumber: 26,
        findingType: "existing_findings",
        notes: "Previous amalgam restoration - intact",
        doctorId: "1",
        treatmentCode: "",
        estimate: 0,
        discount: 0,
        status: "Completed",
        sitting: null,
        workDoneDate: null,
        workDoneNotes: "",
        todayPayment: 0,
    },
];
