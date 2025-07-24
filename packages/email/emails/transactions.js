"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsEmail = void 0;
const cn_1 = require("@iq24/ui/cn");
const envs_1 = require("@iq24tils/envs");
const components_1 = require("@react-email/components");
const date_fns_1 = require("date-fns");
const footer_1 = require("../components/footer");
const logo_1 = require("../components/logo");
const locales_1 = require("../locales");
const defaultTransactions = [
    {
        id: "1",
        date: new Date().toISOString(),
        amount: -1000,
        currency: "USD",
        name: "Spotify",
    },
    {
        id: "2",
        date: new Date().toISOString(),
        amount: 1000,
        currency: "USD",
        name: "H23504959",
        category: "income",
    },
    {
        id: "3",
        date: new Date().toISOString(),
        amount: -1000,
        currency: "USD",
        name: "Webflow",
    },
    {
        id: "4",
        date: new Date().toISOString(),
        amount: -1000,
        currency: "USD",
        name: "Netflix",
    },
    {
        id: "5",
        date: new Date().toISOString(),
        amount: -2500,
        currency: "USD",
        name: "Adobe Creative Cloud",
    },
    {
        id: "6",
        date: new Date().toISOString(),
        amount: -1499,
        currency: "USD",
        name: "Amazon Prime",
    },
    {
        id: "7",
        date: new Date().toISOString(),
        amount: -999,
        currency: "USD",
        name: "Disney+",
    },
    {
        id: "8",
        date: new Date().toISOString(),
        amount: -1299,
        currency: "USD",
        name: "Microsoft 365",
    },
    {
        id: "9",
        date: new Date().toISOString(),
        amount: -899,
        currency: "USD",
        name: "Apple Music",
    },
    {
        id: "10",
        date: new Date().toISOString(),
        amount: -1599,
        currency: "USD",
        name: "HBO Max",
    },
    {
        id: "11",
        date: new Date().toISOString(),
        amount: -1999,
        currency: "USD",
        name: "Adobe Photoshop",
    },
    {
        id: "12",
        date: new Date().toISOString(),
        amount: -799,
        currency: "USD",
        name: "YouTube Premium",
    },
    {
        id: "13",
        date: new Date().toISOString(),
        amount: -1499,
        currency: "USD",
        name: "Dropbox Plus",
    },
    {
        id: "14",
        date: new Date().toISOString(),
        amount: -999,
        currency: "USD",
        name: "Nintendo Online",
    },
    {
        id: "15",
        date: new Date().toISOString(),
        amount: -1299,
        currency: "USD",
        name: "Slack",
    },
];
const baseAppUrl = (0, envs_1.getAppUrl)();
const TransactionsEmail = ({ fullName = "Viktor Hofte", transactions = defaultTransactions, locale = "en", teamName = "Viktor Hofte AB", }) => {
    const { t } = (0, locales_1.getI18n)({ locale });
    const firstName = fullName.split(" ").at(0);
    const previewText = t("transactions.preview", {
        firstName,
        numberOfTransactions: transactions.length,
    });
    const displayedTransactions = transactions.slice(0, 10);
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
        <components_1.Preview>{previewText}</components_1.Preview>

        <components_1.Body className="bg-[#fff] my-auto mx-auto font-sans">
          <components_1.Container className="border-transparent md:border-[#E8E7E1] my-[40px] mx-auto p-[20px] max-w-[600px]" style={{ borderStyle: "solid", borderWidth: 1 }}>
            <logo_1.Logo />
            <components_1.Heading className="text-[#121212] text-[21px] font-normal text-center p-0 my-[30px] mx-0">
              {t("transactions.title1")}
              <span className="font-semibold">
                {t("transactions.title2", {
            numberOfTransactions: transactions.length,
        })}{" "}
              </span>
            </components_1.Heading>
            <components_1.Text className="text-[#121212] text-[14px] leading-[24px]">
              {t("transactions.description1", { firstName })},
              <br />
              <br />
              {t("transactions.description2")}{" "}
              <span className="font-semibold">
                {t("transactions.description3", {
            numberOfTransactions: transactions.length,
        })}{" "}
              </span>
              {t("transactions.description4", { teamName })}
            </components_1.Text>

            <br />

            <table style={{ width: "100% !important", minWidth: "100%" }} className="border-collapse w-full">
              <thead style={{ width: "100%" }}>
                <tr className="border-0 border-t-[1px] border-b-[1px] border-solid border-[#E8E7E1] h-[45px]">
                  <th align="left">
                    <components_1.Text className="text-[14px] font-semibold m-0 p-0">
                      {t("transactions.date")}
                    </components_1.Text>
                  </th>
                  <th align="left" style={{ width: "50%" }}>
                    <components_1.Text className="text-[14px] font-semibold m-0 p-0">
                      {t("transactions.description")}
                    </components_1.Text>
                  </th>
                  <th align="left">
                    <components_1.Text className="text-[14px] font-semibold m-0 p-0">
                      {t("transactions.amount")}
                    </components_1.Text>
                  </th>
                </tr>
              </thead>

              <tbody style={{ width: "100%", minWidth: "100% !important" }}>
                {displayedTransactions.map((transaction) => (<tr key={transaction.id} className="border-0 border-b-[1px] border-solid border-[#E8E7E1] h-[45px]">
                    <td align="left">
                      <components_1.Text className="text-[14px] m-0 p-0 mt-1 pb-1">
                        {(0, date_fns_1.format)(new Date(transaction.date), "MMM d")}
                      </components_1.Text>
                    </td>
                    <td align="left" style={{ width: "50%" }}>
                      <components_1.Link href={`${baseAppUrl}/transactions?id=${transaction.id}`} className={(0, cn_1.cn)("text-[#121212]", transaction?.category === "income" &&
                "!text-[#00C969]")}>
                        <components_1.Text className="text-[14px] m-0 p-0 mt-1 pb-1 line-clamp-1">
                          {transaction.name}
                        </components_1.Text>
                      </components_1.Link>
                    </td>
                    <td align="left">
                      <components_1.Text className={(0, cn_1.cn)("text-[14px] m-0 p-0 mt-1 pb-1 text-[#121212]", transaction?.category === "income" &&
                "!text-[#00C969]")}>
                        {Intl.NumberFormat(locale, {
                style: "currency",
                currency: transaction.currency,
            }).format(transaction.amount)}
                      </components_1.Text>
                    </td>
                  </tr>))}
              </tbody>
            </table>

            <br />

            <components_1.Section className="text-center mt-[32px] mb-[32px]">
              <components_1.Button className="bg-transparent text-primary text-[14px] text-[#121212] font-medium no-underline text-center px-6 py-3 border border-solid border-[#121212]" href={`${baseAppUrl}/transactions?start=${transactions[transactions.length - 1]?.date}&end=${transactions.at(0)?.date}`}>
                {t("transactions.button")}
              </components_1.Button>
            </components_1.Section>

            <br />
            <footer_1.Footer />
          </components_1.Container>
        </components_1.Body>
      </components_1.Tailwind>
    </components_1.Html>);
};
exports.TransactionsEmail = TransactionsEmail;
exports.default = exports.TransactionsEmail;
