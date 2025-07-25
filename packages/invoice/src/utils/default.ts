import { getCountryCode, getLocale, getTimezone } from "@iq24/location";
import { currencies } from "@iq24ocation/currencies";
import { getUser } from "@iq24upabase/cached-queries";

export type Settings = {
  currency: string;
  size: string;
  include_tax: boolean;
  include_vat: boolean;
  include_discount: boolean;
  include_decimals: boolean;
  include_units: boolean;
  include_qr: boolean;
  timezone: string;
  locale: string;
};

export async function getDefaultSettings(): Promise<Settings> {
  const countryCode = getCountryCode();

  const { data: userData } = await getUser();

  const currency =
    userData?.team?.base_currency ??
    currencies[countryCode as keyof typeof currencies] ??
    "USD";

  const timezone = userData?.timezone ?? getTimezone();
  const locale = userData?.locale ?? getLocale();

  // Default to letter size for US/CA, A4 for rest of world
  const size = ["US", "CA"].includes(countryCode) ? "letter" : "a4";

  // Default to include sales tax for countries where it's common
  const include_tax = ["US", "CA", "AU", "NZ", "SG", "MY", "IN"].includes(
    countryCode,
  );

  return {
    currency: currency.toUpperCase(),
    size,
    include_tax,
    include_vat: !include_tax,
    include_discount: false,
    include_decimals: false,
    include_units: false,
    include_qr: true,
    timezone,
    locale,
  };
}
