import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing | iq24",
};

export default async function Billing() {
  return (
    <div className="space-y-12">
      <div>Plan</div>
      <div>Payment Method</div>
      <div>Add-Ons</div>
      <div>Billing Address</div>
    </div>
  );
}
