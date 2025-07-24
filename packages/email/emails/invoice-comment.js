"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCommentEmail = void 0;
const components_1 = require("@react-email/components");
const footer_1 = require("../components/footer");
const logo_1 = require("../components/logo");
const InvoiceCommentEmail = ({ invoiceNumber = "INV-0001", link = "https://app.iq24.ai/i/1234567890", }) => {
    const text = `New comment on Invoice ${invoiceNumber}`;
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
              New comment on Invoice <br /> {invoiceNumber}
            </components_1.Heading>

            <br />

            <components_1.Text className="text-[#121212]">
              Check the latest update on your invoice and respond directly by
              viewing the invoice.
            </components_1.Text>

            <components_1.Section className="text-center mt-[50px] mb-[50px]">
              <components_1.Button className="bg-transparent text-primary text-[14px] text-[#121212] font-medium no-underline text-center px-6 py-3 border border-solid border-[#121212]" href={link}>
                View invoice
              </components_1.Button>
            </components_1.Section>

            <br />

            <footer_1.Footer />
          </components_1.Container>
        </components_1.Body>
      </components_1.Tailwind>
    </components_1.Html>);
};
exports.InvoiceCommentEmail = InvoiceCommentEmail;
exports.default = exports.InvoiceCommentEmail;
