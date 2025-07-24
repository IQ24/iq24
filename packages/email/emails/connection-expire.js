"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionExpireEmail = void 0;
const components_1 = require("@react-email/components");
const date_fns_1 = require("date-fns");
const footer_1 = require("../components/footer");
const logo_1 = require("../components/logo");
const ConnectionExpireEmail = ({ fullName = "Viktor Hofte", expiresAt = (0, date_fns_1.addDays)(new Date(), 4).toISOString(), bankName = "Revolut", teamName = "iq24", }) => {
    const firstName = fullName.split(" ").at(0);
    const text = `Hi ${firstName}, We wanted to inform you that our connection to your bank ${bankName} for your team ${teamName} will expire in ${(0, date_fns_1.formatDistance)(new Date(expiresAt), new Date())}.`;
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
        <components_1.Preview>{text}</components_1.Preview>

        <components_1.Body className="bg-[#fff] my-auto mx-auto font-sans">
          <components_1.Container className="border-transparent md:border-[#E8E7E1] my-[40px] mx-auto p-[20px] max-w-[600px]" style={{ borderStyle: "solid", borderWidth: 1 }}>
            <logo_1.Logo />
            <components_1.Heading className="text-[#121212] text-[21px] font-normal text-center p-0 my-[30px] mx-0">
              Bank Connection Expiring Soon
            </components_1.Heading>

            <br />

            <span className="font-medium">Hi {firstName},</span>
            <components_1.Text className="text-[#121212]">
              We hope you're having a great day!
              <br />
              <br />
              We wanted to inform you that our connection to your bank{" "}
              <strong>{bankName}</strong> for your team{" "}
              <strong>{teamName}</strong> will expire in{" "}
              {(0, date_fns_1.formatDistance)(new Date(expiresAt), new Date())}. To ensure that
              iq24 continues to run smoothly, please reconnect your bank.
              <br />
              <br />
              The good news? It only takes 60 seconds to get everything back on
              track!
            </components_1.Text>

            <components_1.Section className="text-center mt-[50px] mb-[50px]">
              <components_1.Button className="bg-transparent text-primary text-[14px] text-[#121212] font-medium no-underline text-center px-6 py-3 border border-solid border-[#121212]" href="https://go.iq24.ai/34Xt7XK">
                Reconnect
              </components_1.Button>
            </components_1.Section>

            <components_1.Text className="text-[#121212]">
              If you have any questions, please don't hesitate to reach out by
              just replying to this email.
            </components_1.Text>

            <br />

            <footer_1.Footer />
          </components_1.Container>
        </components_1.Body>
      </components_1.Tailwind>
    </components_1.Html>);
};
exports.ConnectionExpireEmail = ConnectionExpireEmail;
exports.default = exports.ConnectionExpireEmail;
