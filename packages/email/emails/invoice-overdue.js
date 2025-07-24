"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceOverdueEmail = void 0;
const components_1 = require("@react-email/components");
const footer_1 = require("../components/footer");
const logo_1 = require("../components/logo");
const InvoiceOverdueEmail = ({ customerName = "Customer", invoiceNumber = "INV-0001", link = "https://app.iq24.ai/invoices?invoiceId=40b25275-258c-48e0-9678-57324cd770a6&type=details", }) => {
    const text = `Invoice ${invoiceNumber} is now overdue`;
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
              Invoice {invoiceNumber} <br />
              is now overdue
            </components_1.Heading>

            <br />

            <components_1.Text className="text-[#121212]">
              Invoice <span className="font-medium">{invoiceNumber}</span> to{" "}
              <span className="font-medium">{customerName}</span> is now
              overdue. We've checked your account but haven't found a matching
              transaction.
              <br />
              <br />
              Please review the invoice details page to verify if payment has
              been made through another method.
              <br />
              <br />
              If needed, you can send a payment reminder to your customer or
              update the invoice status manually if it has already been paid.
              <br />
              <br />
            </components_1.Text>

            <components_1.Section className="text-center mt-[50px] mb-[50px]">
              <components_1.Button className="bg-transparent text-primary text-[14px] text-[#121212] font-medium no-underline text-center px-6 py-3 border border-solid border-[#121212]" href={link}>
                View invoice details
              </components_1.Button>
            </components_1.Section>

            <br />

            <footer_1.Footer />
          </components_1.Container>
        </components_1.Body>
      </components_1.Tailwind>
    </components_1.Html>);
};
exports.InvoiceOverdueEmail = InvoiceOverdueEmail;
exports.default = exports.InvoiceOverdueEmail;
