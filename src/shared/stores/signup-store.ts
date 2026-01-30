import { create } from "zustand";

type UserType = "student" | "owner";
type Gender = "male" | "female";

interface SignupState {
  // Step 1: signup-type.tsx에서 입력
  userType: UserType | null;
  gender: Gender;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  nickname: string; // 학생 전용
  username: string;
  password: string;

  // 점주 전용 (signup-type.tsx)
  ownerEmail: string;
  ownerPhone: string;

  // Step 2 (학생): student-verification.tsx에서 입력
  universityId: number | null;
  universityName: string;
  collegeId: number | null;
  collegeName: string;
  departmentId: number | null;
  departmentName: string;
  studentEmail: string; // 학생 이메일 인증용

  // Step 2 (점주): sign-up-owner.tsx에서 입력
  storeName: string;
  storePhone: string;
  representativeName: string;
  businessNumber: string;
  openDate: string;
  businessImageUri: string;

  // Actions
  setSignupField: <K extends keyof SignupState>(
    field: K,
    value: SignupState[K]
  ) => void;
  setSignupFields: (fields: Partial<SignupState>) => void;
  reset: () => void;
}

const initialState: Omit<SignupState, "setSignupField" | "setSignupFields" | "reset"> = {
  userType: null,
  gender: "male",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  nickname: "",
  username: "",
  password: "",
  ownerEmail: "",
  ownerPhone: "",
  universityId: null,
  universityName: "",
  collegeId: null,
  collegeName: "",
  departmentId: null,
  departmentName: "",
  studentEmail: "",
  storeName: "",
  storePhone: "",
  representativeName: "",
  businessNumber: "",
  openDate: "",
  businessImageUri: "",
};

export const useSignupStore = create<SignupState>((set) => ({
  ...initialState,

  setSignupField: (field, value) =>
    set((state) => ({ ...state, [field]: value })),

  setSignupFields: (fields) =>
    set((state) => ({ ...state, ...fields })),

  reset: () => set(initialState),
}));
