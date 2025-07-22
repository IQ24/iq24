import { TeamMembers } from "@/components/team-members";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Members | iq24",
};

export default async function Members() {
  return <TeamMembers />;
}
