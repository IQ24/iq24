"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteEmail = void 0;
const envs_1 = require("@iq24/utils/envs");
const components_1 = require("@react-email/components");
const footer_1 = require("../components/footer");
const logo_1 = require("../components/logo");
const locales_1 = require("../locales");
const baseAppUrl = (0, envs_1.getAppUrl)();
const InviteEmail = ({ invitedByEmail = "bukinoshita@example.com", invitedByName = "Pontus Abrahamsson", email = "pontus@lostisland.co", teamName = "Acme Co", inviteCode = "jnwe9203frnwefl239jweflasn1230oqef", ip = "204.13.186.218", location = "São Paulo, Brazil", locale = "en", }) => {
    const { t } = (0, locales_1.getI18n)({ locale });
    const inviteLink = `${baseAppUrl}/teams/invite/${inviteCode}`;
    return (<components_1.Html>
      <components_1.Tailwind>
        <head>
          <components_1.Font fontFamily="Geist" fallbackFontFamily="Helvetica" webFont={{
            url: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-400-normal.woff2",
            format: "woff2",
        }} fontWeight={400} fontStyle="normal"/>

          <components_1.Font fontFamily="Geist" fallbackFontFamily="Helvetica" webFont={{
            url: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-500-normal.woff2",
            format: "woff2",
        }} fontWeight={500} fontStyle="normal"/>
        </head>
        <components_1.Preview>{t("invite.preview", { teamName })}</components_1.Preview>

        <components_1.Body className="bg-[#fff] my-auto mx-auto font-sans">
          <components_1.Container className="border-transparent md:border-[#E8E7E1] my-[40px] mx-auto p-[20px] max-w-[600px]" style={{ borderStyle: "solid", borderWidth: 1 }}>
            <logo_1.Logo />
            <components_1.Heading className="mx-0 my-[30px] p-0 text-[24px] font-normal text-[#121212] text-center">
              {t("invite.title1")} <strong>{teamName}</strong>{" "}
              {t("invite.title2")} <strong>iq24</strong>
            </components_1.Heading>

            <components_1.Text className="text-[14px] leading-[24px] text-[#121212]">
              {invitedByName} (
              <components_1.Link href={`mailto:${invitedByEmail}`} className="text-[#121212] no-underline">
                {invitedByEmail}
              </components_1.Link>
              ) {t("invite.link1")} <strong>{teamName}</strong>{" "}
              {t("invite.link2")} <strong>iq24</strong>.
            </components_1.Text>
            <components_1.Section className="mb-[42px] mt-[32px] text-center">
              <components_1.Button className="bg-transparent text-primary text-[14px] text-[#121212] font-medium no-underline text-center px-6 py-3 border border-solid border-[#121212]" href={inviteLink}>
                {t("invite.join")}
              </components_1.Button>
            </components_1.Section>

            <components_1.Text className="text-[14px] leading-[24px] text-[#707070] break-all">
              {t("invite.link3")}:{" "}
              <components_1.Link href={inviteLink} className="text-[#707070] underline">
                {inviteLink}
              </components_1.Link>
            </components_1.Text>

            <br />
            <components_1.Section>
              <components_1.Text className="text-[12px] leading-[24px] text-[#666666]">
                {t("invite.footer1")}{" "}
                <span className="text-[#121212] ">{email}</span>.{" "}
                {t("invite.footer2")}{" "}
                <span className="text-[#121212] ">{ip}</span>{" "}
                {t("invite.footer3")}{" "}
                <span className="text-[#121212] ">{location}</span>.{" "}
                {t("invite.footer4")}
              </components_1.Text>
            </components_1.Section>

            <br />

            <footer_1.Footer />
          </components_1.Container>
        </components_1.Body>
      </components_1.Tailwind>
    </components_1.Html>);
};
exports.InviteEmail = InviteEmail;
exports.default = exports.InviteEmail;
