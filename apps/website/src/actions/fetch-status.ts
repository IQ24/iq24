"use server";

import { getStatus } from "@openstatus/react";

export async function fetchStatus() {
  const res = await getStatus("iq24");

  const { status } = res;

  return status;
}
