"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeEmail = void 0;
const envs_1 = require("@iq24/utils/envs");
const components_1 = require("@react-email/components");
const footer_1 = require("../components/footer");
const get_started_1 = require("../components/get-started");
const logo_1 = require("../components/logo");
const baseUrl = (0, envs_1.getEmailUrl)();
const WelcomeEmail = ({ fullName = "Viktor Hofte" }) => {
    const firstName = fullName.split(" ").at(0);
    const text = `Hi ${firstName}, Welcome to iq24! I'm Pontus, one of the founders. It's really important to us that you have a great experience ramping up.`;
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
              Welcome to iq24
            </components_1.Heading>

            <br />

            <span className="font-medium">Hi {firstName},</span>
            <components_1.Text className="text-[#121212]">
              Welcome to iq24! I'm Pontus, one of the founders.
              <br />
              <br />
              We've been working on iq24 for the past months, and during this
              time, we've implemented the basic functionality to get started.
              However, with your feedback, we can make the right decisions to
              help run your business smarter.
              <br />
              <br />
              During our beta phase, you may encounter some bugs, but we
              genuinely want all your feedback.
              <br />
              <br />
              Should you have any questions, please don't hesitate to reply
              directly to this email or to{" "}
              <components_1.Link href="https://cal.com/pontus-iq24/15min" className="text-[#121212] underline">
                schedule a call with me
              </components_1.Link>
              .
            </components_1.Text>

            <br />

            <components_1.Img src={`${baseUrl}/email/founders.jpeg`} alt="Founders" className="my-0 mx-auto block w-full"/>

            <components_1.Text className="text-[#707070]">Best regards, founders</components_1.Text>

            <components_1.Img src={`${baseUrl}/email/signature.png`} alt="Signature" className="block w-full w-[143px] h-[20px]"/>

            <br />
            <br />

            <get_started_1.GetStarted />

            <br />

            <footer_1.Footer />
          </components_1.Container>
        </components_1.Body>
      </components_1.Tailwind>
    </components_1.Html>);
};
exports.WelcomeEmail = WelcomeEmail;
exports.default = exports.WelcomeEmail;
