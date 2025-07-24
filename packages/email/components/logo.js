"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logo = Logo;
const envs_1 = require("@iq24/utils/envs");
const components_1 = require("@react-email/components");
const baseUrl = (0, envs_1.getEmailUrl)();
function Logo() {
    return (<components_1.Section className="mt-[32px]">
      <components_1.Img src={`${baseUrl}/email/logo.png`} width="45" height="45" alt="iq24" className="my-0 mx-auto block"/>
    </components_1.Section>);
}
