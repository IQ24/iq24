import { getEmailUrl } from "@iq24/utils/envs";
import { Img, Section } from "@react-email/components";

const baseUrl = getEmailUrl();

export function Logo() {
  return (
    <Section className="mt-[32px]">
      <Img
        src={`${baseUrl}/email/logo.png`}
        width="45"
        height="45"
        alt="iq24"
        className="my-0 mx-auto block"
      />
    </Section>
  );
}
