
import ResetPasswordTokenClient from "./ResetPasswordTokenClient";

export function generateStaticParams() {
  return [{ token: "static" }];
}

export default function ResetPasswordTokenPage() {
  return <ResetPasswordTokenClient />;
}
