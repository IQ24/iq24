"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = Footer;
const envs_1 = require("@iq24/utils/envs");
const components_1 = require("@react-email/components");
const responsive_react_email_1 = require("responsive-react-email");
const baseUrl = (0, envs_1.getEmailUrl)();
function Footer() {
    return (<components_1.Section className="w-full">
      <components_1.Hr />

      <br />

      <components_1.Text className="text-[21px] font-regular">
        Run your business smarter.
      </components_1.Text>

      <br />

      <responsive_react_email_1.TripleColumn pX={0} pY={0} styles={{ textAlign: "left" }} columnOneContent={<components_1.Section className="text-left p-0 m-0">
            <components_1.Row>
              <components_1.Text className="font-medium">Features</components_1.Text>
            </components_1.Row>

            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/bOp4NOx">
                Overview
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/VFcNsmQ">
                Inbox
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/uA06kWO">
                Vault
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/x7Fow9L">
                Tracker
              </components_1.Link>
            </components_1.Row>

            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/fkYXc95">
                Invoice
              </components_1.Link>
            </components_1.Row>

            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/dEnP9h5">
                Pricing
              </components_1.Link>
            </components_1.Row>

            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/E24P3oY">
                Engine
              </components_1.Link>
            </components_1.Row>

            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://iq24.ai/download">
                Download
              </components_1.Link>
            </components_1.Row>
          </components_1.Section>} columnOneStyles={{ paddingRight: 0, paddingLeft: 0, width: 185 }} columnTwoContent={<components_1.Section className="text-left p-0 m-0">
            <components_1.Row>
              <components_1.Text className="font-medium">Resources</components_1.Text>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/fhEy5CL">
                Homepage
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://git.new/iq24">
                Github
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/ZrhEMbR">
                Support
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/rofdWKi">
                Terms of service
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/TJIL5mQ">
                Privacy policy
              </components_1.Link>
            </components_1.Row>

            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/IQ1kcN0">
                Branding
              </components_1.Link>
            </components_1.Row>

            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/x5ohOs7">
                Feature Request
              </components_1.Link>
            </components_1.Row>
          </components_1.Section>} columnTwoStyles={{ paddingRight: 0, paddingLeft: 0, width: 185 }} columnThreeContent={<components_1.Section className="text-left p-0 m-0">
            <components_1.Row>
              <components_1.Text className="font-medium">Company</components_1.Text>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/186swoH">
                Story
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/QWyX8Um">
                Updates
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/Dd7M8cl">
                Open startup
              </components_1.Link>
            </components_1.Row>
            <components_1.Row className="mb-1.5">
              <components_1.Link className="text-[#707070] text-[14px]" href="https://go.iq24.ai/M2Hv420">
                OSS Friends
              </components_1.Link>
            </components_1.Row>
          </components_1.Section>} columnThreeStyles={{ paddingRight: 0, paddingLeft: 0, width: 185 }}/>

      <br />
      <br />

      <components_1.Row>
        <components_1.Column className="align-middle w-[40px]">
          <components_1.Link href="https://go.iq24.ai/lS72Toq">
            <components_1.Img src={`${baseUrl}/email/x.png`} width="22" height="22" alt="iq24 on X"/>
          </components_1.Link>
        </components_1.Column>
        <components_1.Column className="align-middle w-[40px]">
          <components_1.Link href="https://go.iq24.ai/7rhA3rz">
            <components_1.Img src={`${baseUrl}/email/producthunt.png`} width="22" height="22" alt="iq24 on Producthunt"/>
          </components_1.Link>
        </components_1.Column>

        <components_1.Column className="align-middle w-[40px]">
          <components_1.Link href="https://go.iq24.ai/anPiuRx">
            <components_1.Img src={`${baseUrl}/email/discord.png`} width="22" height="22" alt="iq24 on Discord"/>
          </components_1.Link>
        </components_1.Column>

        <components_1.Column className="align-middle">
          <components_1.Link href="https://go.iq24.ai/Ct3xybK">
            <components_1.Img src={`${baseUrl}/email/linkedin.png`} width="22" height="22" alt="iq24 on LinkedIn"/>
          </components_1.Link>
        </components_1.Column>
      </components_1.Row>

      <br />
      <br />

      <components_1.Row>
        <components_1.Text className="text-[#B8B8B8] text-xs">
          iq24 Labs AB - Torsgatan 59 113 37, Stockholm, Sweden.
        </components_1.Text>
      </components_1.Row>

      <components_1.Row>
        <components_1.Link className="text-[#707070] text-[14px]" href="https://app.iq24.ai/settings/notifications" title="Unsubscribe">
          Notification preferences
        </components_1.Link>
      </components_1.Row>

      <br />
      <br />

      <components_1.Row>
        <components_1.Link href="https://go.iq24.ai/FZwOHud">
          <components_1.Img src={`${baseUrl}/email/logo-footer.png`} width="100" alt="iq24" className="block"/>
        </components_1.Link>
      </components_1.Row>
    </components_1.Section>);
}
