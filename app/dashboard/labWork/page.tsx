import { Suspense } from "react";
import LabWorkTable from "./LabWorkTable";

export default function LabWorkPage() {
  return (
    <Suspense fallback={null}>
      <LabWorkTable />
    </Suspense>
  );
}
