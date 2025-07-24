"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Column = Column;
const components_1 = require("@react-email/components");
function Column({ title, description, footer, imgSrc }) {
    return (<components_1.Section className="text-left p-0 m-0 text-left">
      <components_1.Section className="p-0 m-0 w-full w-full w-[265px] inline-block align-top box-border mb-4 md:mb-0 text-left">
        <components_1.Section className="text-left p-0 m-0 pb-10">
          <components_1.Img src={imgSrc} alt={title} className="w-[245px]"/>
        </components_1.Section>
      </components_1.Section>
      <components_1.Section className="inline-block align-top box-border w-full w-[280px] text-left">
        <components_1.Section className="text-left p-0 m-0">
          <components_1.Text className="pt-0 m-0 font-medium mb-2">{title}</components_1.Text>
          <components_1.Text className="text-[#707070] p-0 m-0">{description}</components_1.Text>
          <components_1.Text className="text-[#707070] p-0 mt-2">{footer}</components_1.Text>
        </components_1.Section>
      </components_1.Section>
    </components_1.Section>);
}
